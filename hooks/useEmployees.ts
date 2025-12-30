import { useState, useEffect } from 'react';

interface Employee {
	id: string;
	name: string;
	email: string;
	role: string;
	department: string;
	status: string;
	createdAt: string;
}

interface UseEmployeesProps {
	page: number;
	limit: number;
	search: string;
	department: string;
	refresh: number
}

export function useEmployees({ page, limit, search, department, refresh }: UseEmployeesProps) {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);

		fetch(`/api/employees?page=${page}&limit=${limit}&search=${search}&department=${department}`)
			.then((res) => res.json())
			.then((data) => {
				setEmployees(data.data);
				setLoading(false);
			});
	}, [page , search, department, refresh]);

	return { employees, loading };
}
