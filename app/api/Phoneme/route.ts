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
        headers: corsHeaders,
    });
}



export async function GET(request: NextRequest){
    try{
        const wordId = request.nextUrl.searchParams.get('wordId');
        let phonemes = []
        if(wordId){
            phonemes = await models.Phoneme.findAll({
                where: {wordId},
                order: [['position','ASC']],

            });
        }else {
            phonemes = await models.Phoneme.findAll({
                order: [['position', 'ASC']]
            }
                
            );
            
        }

        return NextResponse.json(phonemes, {headers:corsHeaders});
    }catch(error) {
        return NextResponse.json(
            {error: 'Failed to fetch phonemes'},
            {status:500, headers:corsHeaders},
        );
    }
}

export async function POST(request: NextRequest){
    try{
        const{wordId, position, symbol} = await request.json();

        if(!wordId || !position || !symbol){
            return new NextResponse('Missing id, position or symbol',{status:400, headers:corsHeaders})
        }
        const newPhoneme = await models.Phoneme.create({
            wordId, position, symbol
        });
        return NextResponse.json(newPhoneme, {status: 201, headers:corsHeaders});
    }catch(error) {
        console.error(error);
        return new NextResponse('Invalid request body',{status:400, headers:corsHeaders})
    }
}

export async function PATCH(request:NextRequest){
    try{
        const id = request.nextUrl.searchParams.get('id');
        if(!id){
            return new NextResponse('Missing ID', {status:400,headers:corsHeaders});
        }
        const phoneme = await models.Phoneme.findByPk(parseInt(id));
        if(!phoneme){
            return new NextResponse('Phoneme not found', {status:404, headers:corsHeaders});
        }
        const {wordId, position, symbol} = await request.json();
        if(wordId!== undefined) phoneme.wordId = wordId;
        if(position !== undefined) phoneme.position = position;
        if(symbol !== undefined) phoneme.symbol = symbol;
        await phoneme.save()
        return NextResponse.json(phoneme, {headers:corsHeaders}); 
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
        const phoneme = await models.Phoneme.findByPk(parseInt(id));
        if(!phoneme){
            return new NextResponse('Phoneme not found', {status:404, headers:corsHeaders});
        }
        await phoneme.destroy();
        return new NextResponse(null, {status:204, headers:corsHeaders});
    }catch(error){
        console.error(error);
        return new NextResponse('Invalid request body',{status:400, headers:corsHeaders})
    }
}

