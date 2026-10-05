export interface MachineCategory {
    id: number;
    parent_id: number | null;
    name: string;
    description: string | null;
    is_active: boolean;
    parent?: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface MachineCategoryOption {
    id: number;
    name: string;
    parent_id: number | null;
}