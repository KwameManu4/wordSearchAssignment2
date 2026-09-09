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
    try {
        const id = request.nextUrl.searchParams.get('id');
        if(id){
            const list = await models.WordList.findByPk(id);
            if(!list)  {
                return new NextResponse('Word list not found', {status:404, headers: corsHeaders});
            }
            return NextResponse.json(list, {headers: corsHeaders});
        }
        const lists = await models.WordList.findAll();
        return NextResponse.json(lists,{headers: corsHeaders});
    } catch(error) {
        console.error(error);
        return new NextResponse('Server error', {status: 500, headers: corsHeaders});
    }
}

export async function POST(request: NextRequest){
    try{
        const{name} = await request.json();

        if (!name){
            return new NextResponse('Missing name', {status: 400, headers: corsHeaders});
        }
        const newList = await models.WordList.create({
            name,
        });
        return NextResponse.json(newList,{status: 201, headers: corsHeaders});
    } catch(error) {
        console.error(error);
        return new NextResponse('Invalid request body', {status: 400, headers: corsHeaders});
    }
}

export async function PATCH(request: NextRequest){
    try{
        const id = request.nextUrl.searchParams.get('id');
        if(!id){
            return new NextResponse('Missing ID', {status:400, headers:corsHeaders});
        }
        const list = await models.WordList.findByPk(parseInt(id));
        if(!list){
            return new NextResponse('List not found', {status:404, headers:corsHeaders});
        }
        const{name} = await request.json();
        if(name !== undefined) list.name = name;

        await list.save();
        return NextResponse.json(list, {headers: corsHeaders});
    }catch(error){
        console.error(error);
        return new NextResponse('Invalid request body', {status:400, headers: corsHeaders});
    }
}

export async function DELETE(request: NextRequest){
    try{
        const id = request.nextUrl.searchParams.get('id');
        if(!id){
            return new NextResponse('Missing ID', {status:400, headers:corsHeaders});
        }
        const list = await models.WordList.findByPk(parseInt(id));
        if(!list){
            return new NextResponse('List not found', {status:404, headers:corsHeaders});
        }
        await list.destroy();
        return new NextResponse(null, {status:204, headers:corsHeaders})
    }catch(error){
        console.error(error);
        return new NextResponse('Invalid request body', {status:400, headers: corsHeaders})
    }

}