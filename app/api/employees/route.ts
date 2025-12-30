import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, EmployeeStatus } from '@prisma/client';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const department = searchParams.get('department') || '';

		const skip = (page - 1) * limit;

		const where: Prisma.EmployeeWhereInput = {};

		if (department && department !== 'all' && department !== '') {
			where.department = department;
		}

		if (search) {
			where.OR = [
				{
					name: {
						contains: search,
						mode: 'insensitive',
					},
				},
				{
					email: {
						contains: search,
						mode: 'insensitive',
					},
				},
			];
		}

		const employees = await prisma.employee.findMany({
			where,
			skip,
			take: limit,
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({
			data: employees,
			page,
			limit,
		});
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const body = await request.json();
		const { id, status } = body;

		if (!id) {
			return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
		}

		if (!status || (status !== 'ACTIVE' && status !== 'INACTIVE')) {
			return NextResponse.json({ error: 'Status must be either ACTIVE or INACTIVE' }, { status: 400 });
		}

		const employee = await prisma.employee.update({
			where: { id },
			data: { status: status as EmployeeStatus },
		});

		return NextResponse.json({
			data: employee,
			message: 'Employee status updated successfully',
		});
	} catch {
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
