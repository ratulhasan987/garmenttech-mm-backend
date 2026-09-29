import { Head, router, usePage } from '@inertiajs/react';

import { useEffect, useRef, useState } from 'react';

import { Filter, Search, X } from 'react-feather';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';
import { TableEmpty } from '@/components/shared/table-empty';


type Department = {
    id: number;
    name: string;
};

type Designation = {
    id: number;
    name: string;
};

type Employee = {
    id: number;
    employee_id: string;
    name: string;
};

type Salary = {
    id: number;

    employee_id: string;

    name: string;

    basic_salary: number | string;

    transport_allowance: number | string;

    family_allowance: number | string;

    others_allowance: number | string;

    gross_salary: number | string;

    department?: Department | null;

    designation?: Designation | null;
};

type Currency = {
    id: number;

    symbol: string;

    exchange_rate: number | string;
} | null;

type PaginationLink = {
    url: string | null;

    label: string;

    active: boolean;
};

type Pagination<T> = {
    data: T[];

    current_page: number;

    from: number | null;

    to: number | null;

    total: number;

    last_page: number;

    links: PaginationLink[];
};

type SalaryFilters = {
    user?: number | string | null;

    department?: number | string | null;

    designation?: number | string | null;

    sorting?: string | null;

    employee?: Employee | null;
};

type Props = {
    salaries: Pagination<Salary>;

    numberOfSalaries: number;

    departments: Department[];

    designations: Designation[];

    activeCurrency: Currency;

    filters: SalaryFilters;
};

// Inertia Page Props
type SharedPageProps = {
    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };
};

// Helpers
const toNumber = (value: number | string | null | undefined): number => {
    const result = Number(value ?? 0);

    return Number.isFinite(result) ? result : 0;
};

const formatMoney = (value: number | string, exchangeRate: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
    }).format(toNumber(value) * exchangeRate);
};



export default function SalaryIndex({
    salaries,
    numberOfSalaries,
    departments,
    designations,
    activeCurrency,
    filters,
}: Props) {
   
    const { processing } = usePage<SharedPageProps>();

    const [employeeSearch, setEmployeeSearch] = useState<string>(
        filters.employee
            ? `${filters.employee.name} - ${filters.employee.employee_id}`
            : '',
    );

    const [employeeId, setEmployeeId] = useState<string>(
        filters.user ? String(filters.user) : '',
    );


    const [departmentId, setDepartmentId] = useState<string>(
        filters.department ? String(filters.department) : '',
    );


    const [designationId, setDesignationId] = useState<string>(
        filters.designation ? String(filters.designation) : '',
    );

    const [sorting, setSorting] = useState<string>(filters.sorting ?? '');


    const [employees, setEmployees] = useState<Employee[]>([]);

    const [showEmployees, setShowEmployees] = useState<boolean>(false);

    const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);


    const employeeRef = useRef<HTMLDivElement>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const employeeAbortRef = useRef<AbortController | null>(null);

    const currencySymbol = activeCurrency?.symbol ?? '৳';

    const exchangeRate = toNumber(activeCurrency?.exchange_rate ?? 1) || 1;



    const hasFilters = Boolean(
        employeeId || departmentId || designationId || sorting,
    );


    const searchEmployees = async (keyword = ''): Promise<void> => {

       // Cancel Previous Request
        employeeAbortRef.current?.abort();

        const controller = new AbortController();

        employeeAbortRef.current = controller;

        setLoadingEmployees(true);

        try {
            const params = new URLSearchParams();

            params.set('keyword', keyword);

            const response = await fetch(
                `/get-employees?${params.toString()}`,
                {
                    signal: controller.signal,

                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                setEmployees([]);

                return;
            }

            const data = (await response.json()) as Employee[];

            setEmployees(data);

            setShowEmployees(true);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error('Employee search failed:', error);

            setEmployees([]);
        } finally {
            if (!controller.signal.aborted) {
                setLoadingEmployees(false);
            }
        }
    };

    // Employee Input
    const handleEmployeeInput = (value: string): void => {
        setEmployeeSearch(value);

        // Remove Selected Employee
        setEmployeeId('');

        // Clear Previous Debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Empty Search
        if (!value.trim()) {
            setEmployees([]);

            setShowEmployees(true);

            return;
        }

        // Debounced Search
        debounceRef.current = setTimeout(() => {
            void searchEmployees(value.trim());
        }, 300);
    };

    // Select Employee
    const selectEmployee = (employee: Employee): void => {
        setEmployeeSearch(`${employee.name} - ${employee.employee_id}`);

        setEmployeeId(String(employee.id));

        setShowEmployees(false);
    };

    //  Clear Employee
    const clearEmployee = (): void => {
        setEmployeeSearch('');

        setEmployeeId('');

        setEmployees([]);

        setShowEmployees(false);
    };

    // Apply Filters
    const applyFilter = (): void => {
        router.get(
            '/hr/salary-overview',
            {
                user: employeeId || undefined,

                department: departmentId || undefined,

                designation: designationId || undefined,

                sorting: sorting || undefined,
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    // Clear All Filters

    const clearFilters = (): void => {
        setEmployeeSearch('');

        setEmployeeId('');

        setDepartmentId('');

        setDesignationId('');

        setSorting('');

        setEmployees([]);

        setShowEmployees(false);

        router.get(
            '/hr/salary-overview',
            {},
            {
                preserveState: false,

                preserveScroll: false,

                replace: true,
            },
        );
    };

    // Click Outside Employee Search
    useEffect(() => {
        const handler = (event: MouseEvent): void => {
            if (
                employeeRef.current &&
                !employeeRef.current.contains(event.target as Node)
            ) {
                setShowEmployees(false);
            }
        };

        document.addEventListener('mousedown', handler);

        return () => {
            document.removeEventListener('mousedown', handler);
        };
    }, []);



    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            employeeAbortRef.current?.abort();
        };
    }, []);

    /*
    | Sync Server Filters
    | After an Inertia request completes,
    | keep the local filter controls synced
    | with the server values.
    |
    */

    useEffect(() => {
        setDepartmentId(filters.department ? String(filters.department) : '');

        setDesignationId(
            filters.designation ? String(filters.designation) : '',
        );

        setSorting(filters.sorting ?? '');

        setEmployeeId(filters.user ? String(filters.user) : '');

        if (filters.employee) {
            setEmployeeSearch(
                `${filters.employee.name} - ${filters.employee.employee_id}`,
            );
        } else if (!filters.user) {
            setEmployeeSearch('');
        }
    }, [
        filters.department,
        filters.designation,
        filters.sorting,
        filters.user,
        filters.employee,
    ]);



    const goToPage = (url: string | null): void => {
        if (!url) {
            return;
        }

        router.get(
            url,
            {},
            {
                preserveState: true,

                preserveScroll: true,
            },
        );
    };



    return (
        <>
            <Head title="Employee Salary" />

            <PageTitle title="Employee Salary" />

            <div className="container-fluid">
                <Card>
                    {/* Filter Header */}
                    <CardHeader className="px-3 py-3">
                        <div className="d-flex flex-wrap gap-2 align-items-center">

                            {/* Employee Search */}
                            <div
                                ref={employeeRef}
                                className="position-relative flex-grow-1"
                                style={{
                                    minWidth: 220,
                                }}
                            >
                                <div className="position-relative">
                                    <Search
                                        size={16}
                                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                                    />

                                    <input
                                        type="text"
                                        className="form-control ps-5 pe-5"
                                        placeholder="Search employees"
                                        value={employeeSearch}
                                        autoComplete="off"
                                        onFocus={() => {
                                            void searchEmployees(
                                                employeeSearch.trim(),
                                            );
                                        }}
                                        onChange={(event) =>
                                            handleEmployeeInput(
                                                event.target.value,
                                            )
                                        }
                                    />

                                    {employeeSearch && (
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-3 text-muted"
                                            onClick={clearEmployee}
                                            aria-label="Clear employee"
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* Employee Suggestions */}
                                {showEmployees && (
                                    <div
                                        className="position-absolute bg-white border rounded shadow-sm w-100 mt-1"
                                        style={{
                                            zIndex: 1050,
                                            maxHeight: 240,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {loadingEmployees ? (
                                            <div className="px-3 py-3 text-muted small">
                                                Searching employees...
                                            </div>
                                        ) : employees.length > 0 ? (
                                            employees.map((employee) => (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    className="dropdown-item py-2 px-3"
                                                    onClick={() =>
                                                        selectEmployee(employee)
                                                    }
                                                >
                                                    <div className="fw-semibold">
                                                        {employee.name}
                                                    </div>

                                                    <div className="small text-muted">
                                                        {employee.employee_id}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-3 text-muted small">
                                                No employees found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Department */}
                            <select
                                className="form-select flex-grow-1"
                                style={{
                                    minWidth: 180,
                                }}
                                value={departmentId}
                                onChange={(event) =>
                                    setDepartmentId(event.target.value)
                                }
                            >
                                <option value="">All Department</option>

                                {departments.map((department) => (
                                    <option
                                        key={department.id}
                                        value={department.id}
                                    >
                                        {department.name}
                                    </option>
                                ))}
                            </select>

                            {/* Designation */}
                            <select
                                className="form-select flex-grow-1"
                                style={{
                                    minWidth: 180,
                                }}
                                value={designationId}
                                onChange={(event) =>
                                    setDesignationId(event.target.value)
                                }
                            >
                                <option value="">All Designation</option>

                                {designations.map((designation) => (
                                    <option
                                        key={designation.id}
                                        value={designation.id}
                                    >
                                        {designation.name}
                                    </option>
                                ))}
                            </select>

                            {/* Sorting */}
                            <select
                                className="form-select flex-grow-1"
                                style={{
                                    minWidth: 180,
                                }}
                                value={sorting}
                                onChange={(event) =>
                                    setSorting(event.target.value)
                                }
                            >
                                <option value="">-- Sort By Date --</option>

                                <option value="asc">Oldest First</option>

                                <option value="desc">Newest First</option>
                            </select>

                            {/* Filter */}
                            <Button
                                type="button"
                                variant="primary"
                                leftIcon={<Filter size={15} />}
                                disabled={processing}
                                onClick={applyFilter}
                            >
                                {processing ? 'Filtering...' : 'Filter'}
                            </Button>

                            {/* Clear */}
                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    leftIcon={<X size={15} />}
                                    disabled={processing}
                                    onClick={clearFilters}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardHeader>


                    {/* Table */}
                    <CardBody>
                        <div className="table-responsive">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sl</TableHead>

                                        <TableHead>Full Name</TableHead>

                                        <TableHead>Designation</TableHead>

                                        <TableHead>Department</TableHead>

                                        <TableHead>Basic</TableHead>

                                        <TableHead>Transport</TableHead>

                                        <TableHead>Family</TableHead>

                                        <TableHead>Others</TableHead>

                                        <TableHead>Gross Salary</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {salaries.data.length > 0 ? (
                                        salaries.data.map((salary, index) => (
                                            <TableRow key={salary.id}>

                                                {/* Serial */}
                                                <TableCell>
                                                    {(salaries.from ?? 1) +
                                                        index}
                                                </TableCell>

                                                {/* Employee */}
                                                <TableCell>
                                                    <div className="fw-semibold">
                                                        {salary.name}
                                                    </div>

                                                    <div className="small text-muted">
                                                        #{salary.employee_id}
                                                    </div>
                                                </TableCell>

                                                {/* Designation */}
                                                <TableCell>
                                                    {salary.designation?.name ??
                                                        '-'}
                                                </TableCell>

                                                {/* Department */}
                                                <TableCell>
                                                    {salary.department?.name ??
                                                        '-'}
                                                </TableCell>

                                                {/* Basic */}
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {formatMoney(
                                                        salary.basic_salary,
                                                        exchangeRate,
                                                    )}
                                                </TableCell>

                                                {/* Transport */}
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {formatMoney(
                                                        salary.transport_allowance,
                                                        exchangeRate,
                                                    )}
                                                </TableCell>

                                                {/* Family */}
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {formatMoney(
                                                        salary.family_allowance,
                                                        exchangeRate,
                                                    )}
                                                </TableCell>

                                                {/* Others */}
                                                <TableCell>
                                                    {currencySymbol}{' '}
                                                    {formatMoney(
                                                        salary.others_allowance,
                                                        exchangeRate,
                                                    )}
                                                </TableCell>

                                                {/* Gross */}
                                                <TableCell>
                                                    <strong>
                                                        {currencySymbol}{' '}
                                                        {formatMoney(
                                                            salary.gross_salary,
                                                            exchangeRate,
                                                        )}
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableEmpty colSpan={11} />
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">

                            {/* Result Information */}
                            <div className="text-muted small">
                                Showing <strong>{salaries.from ?? 0}</strong> to{' '}
                                <strong>{salaries.to ?? 0}</strong> of{' '}
                                <strong>{numberOfSalaries}</strong> employees
                            </div>

                            {/* Pagination */}
                            {salaries.last_page > 1 && (
                                <div className="d-flex gap-1 flex-wrap">
                                    {salaries.links.map((link, index) => (
                                        <button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            disabled={!link.url || processing}
                                            className={cn(
                                                'btn btn-sm',
                                                link.active
                                                    ? 'btn-primary'
                                                    : 'btn-light',
                                                !link.url && 'disabled',
                                            )}
                                            onClick={() => goToPage(link.url)}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
