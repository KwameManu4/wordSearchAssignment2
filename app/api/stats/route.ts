import db from '@/models';
import {NextRequest, NextResponse} from 'next/server';
const models = db as any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(){
    try {
        
        const [
            wordLists,
            words,
            activitySettings,
            generationTotal,
            generationSuccess,
            generationFailed,
        ] = await Promise.all([
            models.WordList.count(),
            models.Word.count(),
            models.ActivitySetting.count(),
            models.GenerationEvent.count(),
            models.GenerationEvent.count({ where: { status: 'success' } }),
            models.GenerationEvent.count({ where: { status: 'failed' } }),
        ]);

        const {fn, col} = models.Sequelize;

        const byType = await models.GenerationEvent.findAll({
            attributes: ['activityType', [fn('COUNT', col('id')), 'count']],
            group: ['activityType'],
            raw: true,
        });

        const visit = await models.PageVisit.findOne({
            attributes: [[fn('AVG', col('durationSeconds')), 'avg']],
            raw: true,
        });

        // AVG over zero rows is NULL, so "no visits yet" stays null (not 0)
        const averageSeconds: number | null =
            visit?.avg == null ? null : Math.round(Number(visit.avg) * 10) / 10;

        // Both activity types are always present (0 when unused), so the dashboard
        // and tests can read generation.byType.wordle without checking for a key.
        const generationByType: Record<'wordle' | 'wordsearch', number> = { wordle: 0, wordsearch: 0 };
        for (const row of byType as { activityType: 'wordle' | 'wordsearch'; count: number }[]) {
            if (row.activityType in generationByType) {
                generationByType[row.activityType] = Number(row.count);
            }
        }

        // highest count wins; a tie (or no events yet) has no single answer, so null
        const rankedTypes = Object.entries(generationByType).sort(([, a], [, b]) => b - a);
        const mostUsedType: string | null =
            rankedTypes[0][1] === 0 || rankedTypes[0][1] === rankedTypes[1][1]
                ? null
                : rankedTypes[0][0];

        // Only ids are needed from the children: we just check whether any exist.
        const [listRows, wordRows, failureRows] = await Promise.all([
            models.WordList.findAll({
                attributes: ['id', 'name'],
                include: [{ model: models.Word, attributes: ['id'] }],
                order: [['id', 'ASC']],
            }),
            models.Word.findAll({
                attributes: ['id', 'english', 'wordListId'],
                include: [
                    { model: models.Phoneme, attributes: ['id'] },
                    { model: models.WordList, attributes: ['id', 'name'] },
                ],
                order: [['id', 'ASC']],
            }),
            models.GenerationEvent.findAll({
                where: { status: 'failed' },
                order: [['createdAt', 'DESC']],
                limit: 5,
                include: [{ model: models.WordList, attributes: ['id', 'name'] }],
            }),
        ]);

        // 1. word lists with no words
        const emptyWordLists = listRows
            .filter((l: any) => l.Words.length === 0)
            .map((l: any) => ({ id: l.id, name: l.name }));

        // 2. words with no phonemes (can't be placed in a puzzle)
        const wordsWithoutPhonemes = wordRows
            .filter((w: any) => w.Phonemes.length === 0)
            .map((w: any) => ({
                id: w.id,
                english: w.english,
                wordListId: w.wordListId,
                wordListName: w.WordList?.name ?? null,
            }));

        // 3. the 5 most recent failed generations. wordListId is null if the list
        //    was deleted since (the column is ON DELETE SET NULL).
        const recentFailures = failureRows.map((e: any) => ({
            id: e.id,
            activityType: e.activityType,
            failureReason: e.failureReason,
            wordListId: e.wordListId,
            wordListName: e.WordList?.name ?? null,
            createdAt: e.createdAt,
        }));

        return NextResponse.json({
            health: { status: 'ok' },
            totals: { wordLists, words, activitySettings },
            generation: {
                total: generationTotal,
                success: generationSuccess,
                failed: generationFailed,
                byType: generationByType,
                mostUsedType,
            },
            timeOnPage: { averageSeconds },
            warnings: { emptyWordLists, wordsWithoutPhonemes, recentFailures },
        }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { health: { status: 'error' }, error: 'Failed to fetch stats' },
            { status: 500, headers: corsHeaders },
        );
    }
}
