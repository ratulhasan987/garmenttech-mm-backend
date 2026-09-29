export type SalaryAdvanceStatus =
    | 'Active'
    | 'In-active'
    | 'Completed';

export type SalaryAdvanceEmployee = {
    id: number;
    employee_id: string;
    name: string;
    label?: string;
};

export type SalaryAdvance = {
    id: number;
    user_id: number;
    amount: string | number;
    month: string;
    status: SalaryAdvanceStatus;
    created_at: string;
    updated_at?: string;
    user?: SalaryAdvanceEmployee;
    updateBy?: {
        id: number;
        name: string;
    } | null;
};

export type SalaryAdvanceFilters = {
    user?: number | string | null;
    status?: SalaryAdvanceStatus | string | null;
    sorting?: 'asc' | 'desc' | string | null;
    start_date?: string | null;
    end_date?: string | null;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

export type SalaryAdvanceIndexProps = {
    advances: PaginatedData<SalaryAdvance>;

    numberOfAdvances: number;

    filters: SalaryAdvanceFilters;

    selectedEmployee?: SalaryAdvanceEmployee | null;
};