'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export default function EmployeesPage() {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [search, setSearch] = useState('');
	const [department, setDepartment] = useState('');

	const { employees, loading } = useEmployees({ page, limit, search, department });
	const [nEmployees, setnEmployees] = useState(employees);

	useEffect(() => {
		setPage(1);
	}, [search, department]);

	useEffect(() => {
		setnEmployees(employees);
	}, [employees]);

	const handleStatusToggle = async (employeeId: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
		const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

		setnEmployees((prevEmployees) =>
			prevEmployees.map((employee) => (employee.id === employeeId ? { ...employee, status: newStatus } : employee))
		);

		try {
			const response = await fetch('/api/employees', {
				method: 'PATCH',
				body: JSON.stringify({
					id: employeeId,
					status: newStatus,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Legal'];

	return (
		<div className='container mx-auto space-y-8 py-10'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<h1 className='text-3xl font-bold'>Employees</h1>
				<div className='flex flex-col gap-4 md:flex-row md:items-center'>
					<Input
						placeholder='Search employees...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='w-full md:w-[300px]'
					/>
					<Select value={department || 'all'} onValueChange={(value) => setDepartment(value === 'all' ? '' : value)}>
						<SelectTrigger className='w-full md:w-[200px]'>
							<SelectValue placeholder='All Departments' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Departments</SelectItem>
							{departments.map((dept) => (
								<SelectItem key={dept} value={dept}>
									{dept}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Department</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Joined</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className='h-4 w-[150px]' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-[200px]' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-[100px]' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-[100px]' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-[50px]' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-[100px]' />
									</TableCell>
								</TableRow>
							))
						) : nEmployees.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className='h-24 text-center'>
									No results.
								</TableCell>
							</TableRow>
						) : (
							nEmployees.map((employee) => (
								<TableRow key={employee.id}>
									<TableCell>{employee.name}</TableCell>
									<TableCell>{employee.email}</TableCell>
									<TableCell>{employee.role}</TableCell>
									<TableCell>{employee.department}</TableCell>
									<TableCell>
										<Switch
											checked={employee.status === 'ACTIVE'}
											onCheckedChange={() => handleStatusToggle(employee.id, employee.status)}
										/>
									</TableCell>
									<TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<div className='flex items-center justify-end space-x-2'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1 || loading}
				>
					Previous
				</Button>
				<span className='text-muted-foreground text-sm'>Page {page}</span>
				<Button
					variant='outline'
					size='sm'
					onClick={() => setPage((p) => p + 1)}
					disabled={loading || employees.length < limit}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
