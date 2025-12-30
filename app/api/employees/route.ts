import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const department = searchParams.get('department') || '';
		const search = searchParams.get('search') || '';
		let filters = {};

		if(department){
			filters = {
				department : {
					equals : department
				}
			}
		}

		if(search){
			filters = {
				...filters,
				email : {
					contains : String(search),
					mode: "insensitive"
				}
			}
		}
		const skip = (page-1) * limit;

		const employees = await prisma.employee.findMany({
			skip,
			take: limit,
			orderBy: {
				createdAt: 'desc',
			},
			where: filters
		});

		return NextResponse.json({
			data: employees,
			page,
			limit,
		});
	} catch (error) {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}


export async function PATCH(request: Request) {
	try {
		const body = await request.json()
		const {id,status} = body;

		if(!id || !status){
			return NextResponse.json({error: 'Missing body'},{status:400})
		}

		console.log(status)
		await prisma.employee.update({
			where: {
				id
		},
			data: {
				status
			}
		})

		return NextResponse.json({
			message: "Success"
		})

	} catch (error){
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}