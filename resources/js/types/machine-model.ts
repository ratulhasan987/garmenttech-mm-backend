export interface MachineModel {
    id: number;
    machine_category_id: number | null;
    brand_id: number | null;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    machine_category?: {
        id: number;
        name: string;
    } | null;
    machine_brand?: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface SimpleOption {
    id: number;
    name: string;
}