import db from '@/models';
import{NextRequest, NextResponse} from 'next/server';
const models = db as any;

const VALID_TYPES = ['wordle', 'wordsearch'];
const VALID_STATUSES = ['success','failed'];

export async function POST(request: NextRequest){
    try {
        const {activityType, status, failureReason, wordListId} = await request.json();

        if (!VALID_TYPES.includes(activityType)){
            return NextResponse.json({error:'Invalid activityType'}, {status:400});
        }
        if (!VALID_STATUSES.includes(status)){
            return NextResponse.json({error:'Invalid status'},{status:400});
        }
        if (status === 'failed') {
            if (typeof failureReason !== 'string' || failureReason.trim() === '' || failureReason.length > 200){
                return NextResponse.json({error: 'A failed event needs a reason'}, {status: 400});

            }
        }
        if (wordListId !== undefined && wordListId !== null){
            if (!Number.isInteger(wordListId)){
                return NextResponse.json({error: 'wordListId must be a whole number'}, {status:400});
            }
            const list = await models.WordList.findByPk(wordListId);
            if (!list){
                return NextResponse.json({error: 'Word list not found'}, {status:400});
            }
        }

        const event = await models.GenerationEvent.create({
            activityType,
            status,
            failureReason: status === 'failed' ? failureReason.trim() : null,
            wordListId: wordListId ?? null,
        });
        return NextResponse.json(event, {status: 201});
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
        }
        console.error(error);
        return NextResponse.json({error: 'Failed to record generation event'}, {status: 500});
    }
}