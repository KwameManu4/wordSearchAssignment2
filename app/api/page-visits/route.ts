import db from'@/models';
import{NextRequest,NextResponse} from 'next/server';
const models = db as any;
const VALID_PAGES = ['/','/wordle','/wordsearch','/manage','/dashboard','/about'];





export async function POST(request: NextRequest){
    try{
        const body = await request.json();

        
        if (typeof body !== 'object' || body === null){
            return NextResponse.json({error:'Body must be a JSON object'}, {status:400});
        }
        const{page, durationSeconds } = body;

        if (!VALID_PAGES.includes(page)){
            return NextResponse.json({error:'Invalid page'},{status:400});
        }
        if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 1800){
            return NextResponse.json({error:'duration not a number, must be between 0 and 1800 seconds'}, {status:400});
        }
        const visit = await models.PageVisit.create({page,durationSeconds});
        return NextResponse.json(visit,{status:201});
    } catch(error){
        if (error instanceof SyntaxError){
            return NextResponse.json({error:'Invalid JSON body'}, {status:400});
        }
        console.error(error);
        return NextResponse.json({error: 'Failed to record page visits event'}, {status:500});
    }
}