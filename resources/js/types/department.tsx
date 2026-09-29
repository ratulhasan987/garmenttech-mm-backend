export type DepartmentStatus = "default" | 'actionable'

export type Department = {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: DepartmentStatus
};
