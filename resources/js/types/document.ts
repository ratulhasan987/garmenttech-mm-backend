export interface DocumentUser {
    id: number;
    name: string;
    employee_id: string;
    image: string | null;
    status: string;
    department_id: number | null;
    designation_id: number | null;
}

export interface DocumentDepartment {
    id: number;
    name: string;
}

export interface DocumentDesignation {
    id: number;
    name: string;
}

export interface DocumentItem {
    id: number;
    user_id: number;
    user: DocumentUser;
    department: DocumentDepartment | null;
    designation: DocumentDesignation | null;
    progress: number;
    // ...other document fields
}

export interface DocumentFilters {
    user?: string | number;
    department?: string | number;
    designation?: string | number;
    status?: string;
}

export interface SelectedEmployee {
    id: number;
    name: string;
    employee_id: string;
}