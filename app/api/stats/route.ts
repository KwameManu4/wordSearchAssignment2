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

        return NextResponse.json({
            health: { status: 'ok' },
            totals: { wordLists, words, activitySettings },
            generation: {
                total: generationTotal,
                success: generationSuccess,
                failed: generationFailed,
            },
        }, { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { health: { status: 'error' }, error: 'Failed to fetch stats' },
            { status: 500, headers: corsHeaders },
        );
    }
}
