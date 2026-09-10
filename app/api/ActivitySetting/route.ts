import db from '@/models';
import { NextRequest, NextResponse } from 'next/server';
const models = db as any;

const corsHeaders = {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(){
    return new NextResponse(null, {
        status:204,
        headers:corsHeaders,
    });
}

export async function GET(request:NextRequest){
    try{
        const wordListId = request.nextUrl.searchParams.get('wordListId');
        let activitySettings = [];

        if (wordListId) {
            activitySettings = await models.ActivitySetting.findAll({
                where: { wordListId },
            });
        } else {
            activitySettings = await models.ActivitySetting.findAll();
        }

        return NextResponse.json(activitySettings, { headers: corsHeaders });
            } catch (error) {
                return NextResponse.json(
                    { error: 'Failed to fetch Activity' },
                    { status: 500, headers: corsHeaders },
                );
    }
}

export async function POST(request:NextRequest){
    try{
        const {type, difficulty, hintsEnabled, wordListId, gridSize, maxGuesses} = await request.json();
        const validTypes = ['wordle','wordsearch'];
        const validDifficulty = ['easy','medium','hard'];
        


        if (!validTypes.includes(type)){
            return new NextResponse('Missing type',{status:400,headers:corsHeaders})
        }
        if(!validDifficulty.includes(difficulty)){
            return new NextResponse('Missing Difficulty',{status:400,headers:corsHeaders});
        }
        if (hintsEnabled === undefined){
            return new NextResponse('Missing hintsEnabled',{status:400, headers:corsHeaders});
        }
        

        if(!wordListId || !gridSize || !maxGuesses){
            return new NextResponse('Missing ID, grid size or max guess',{status:400, headers:corsHeaders});
        }
        const newActivitySetting = await models.ActivitySetting.create({
            type, difficulty, hintsEnabled, wordListId, gridSize, maxGuesses,
        });
        return NextResponse.json(newActivitySetting,{status:201, headers:corsHeaders});
    }catch(error){
        console.error(error);
        return new NextResponse('Invalid request body',{status:400, headers:corsHeaders})
    }
}

export async function PATCH(request:NextRequest){
    try{
        const id = request.nextUrl.searchParams.get('id');
        if(!id){
            return new NextResponse('Missing ID',{status:400, headers:corsHeaders});
        }
        const activity = await models.ActivitySetting.findByPk(parseInt(id));
        if(!activity){
            return new NextResponse('Activity not found', {status:404, headers:corsHeaders});
        }
        const {type, difficulty, hintsEnabled, wordListId, gridSize, maxGuesses} = await request.json();
        const validTypes = ['wordle','wordsearch'];
        const validDifficulty = ['easy','medium','hard'];


        if (wordListId !== undefined) activity.wordListId = wordListId;
        if (gridSize !== undefined) activity.gridSize = gridSize;
        if (maxGuesses!== undefined) activity.maxGuesses = maxGuesses;
        if (type !== undefined){
            if (!validTypes.includes(type)){
                return new NextResponse('Invalid type',{status:400, headers:corsHeaders});
                
            }
            activity.type = type;
        }
        if (difficulty !== undefined){
            if (!validDifficulty.includes(difficulty)){
                return new NextResponse('Invalid difficulty', {status:400, headers:corsHeaders});
            }
            activity.difficulty = difficulty;
        }
        if (hintsEnabled !== undefined) activity.hintsEnabled = hintsEnabled;

        await activity.save();
        return NextResponse.json(activity,{headers:corsHeaders});
    }catch(error){
        console.error(error);
        return new NextResponse('Invalid request body', {status:400, headers:corsHeaders});
    }
}

export async function DELETE(request:NextRequest){
    try{
        const id = request.nextUrl.searchParams.get('id');
        if(!id){
            return new NextResponse('Missing ID', {status:400, headers:corsHeaders});
        }
        const activity = await models.ActivitySetting.findByPk(parseInt(id));
        if(!activity){
            return new NextResponse('Activity not found', {status:404, headers:corsHeaders});
        }
        await activity.destroy();
        return new NextResponse(null, {status:204, headers:corsHeaders});
    }catch(error){
        console.error(error);
        return new NextResponse('Invalid request body', {status:400, headers:corsHeaders});
    }
}