// Employee

export interface SalaryEmployee {
    id: number;
    employee_id: string;
    name: string;
    department_id?: number | null;
}

// Department

export interface SalaryDepartment {
    id: number;
    name: string;
}

// Salary
export type SalaryUser = {
    id: number;
    employee_id: string;
    name: string;
};

export type Salary = {
    id: number;
    user_id: number;

    basic_salary: string | number;
    transport_allowance: string | number;
    family_allowance: string | number;
    others_allowance: string | number;
    overtime: string | number;

    gross_salary: string | number;

    loan_deduction: string | number;
    salary_advance: string | number;

    state_tax: string | number;
    social_security: string | number;

    total_absent: string | null;
    absent_deduction: string | number;

    total_consecutive_late: string | number;
    consecutive_late_deduction: string | number;

    total_late_minutes: string | number;
    late_minutes_deduction: string | number;

    total_remaining_minutes: string | number;
    remaining_minutes_deduction: string | number;

    unpaid_leave: string | number;
    unpaid_leave_deduction: string | number;

    total_deductions: string | number;
    net_salary: string | number;

    status: 'Approved' | 'Hold';

    month: string;

    updated_by: number | null;

    created_at: string;
    updated_at: string;

    user: SalaryUser;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

// Pagination

export interface SalaryPagination<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: SalaryPaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Pagination link

export interface SalaryPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Salary Generate filters

export interface SalaryGenerateFilters {
    department: string;
    month: string;

    consecutive_deduction: boolean;
    late_deduction: boolean;
    absent_deduction: boolean;
    penalty_absent_deduction: boolean;
    remaining_time_deduction: boolean;

    employee?: number | null;
}

export interface SalaryGenerateEmployee {
    id: number;
    employee_id: string;
    name: string;
    department_id?: number | null;
}

export interface SalaryGeneratePageProps {
    departments: SalaryDepartment[];

    employees: SalaryGenerateEmployee[];

    salaries: SalaryPagination<Salary>;

    currentMonth: string;

    numberOfSalaries: number;
}
// Manage Payslip page props

export interface ManagePayslipPageProps {
    salaries: SalaryPagination<Salary>;

    currentMonth: string;

    numberOfSalaries: number;
}

// Salary form

export interface SalaryGenerateForm {
    department: string;
    employee: number | null;
    month: string;
    consecutive_deduction: boolean;
    late_deduction: boolean;
    absent_deduction: boolean;
    penalty_absent_deduction: boolean;
    remaining_time_deduction: boolean;
}

// Salary status response

export interface SalaryStatusResponse {
    success: boolean;
    status: 'Approved' | 'Hold';
}