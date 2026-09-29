export type Commission = {
    id: number;
    user_id: number;
    commission_type: string;
    commission_rate: number;
    status: string;
    note: string | null;
    created_by: number;
    user: {
        id: number;
        employee_id: string;
        name: string;
    };
    createdBy: {
        id: number;
        employee_id: string;
        name: string;
    };
};