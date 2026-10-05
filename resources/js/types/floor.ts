export interface Floor {
    id: number;
    building_id: number;
    name: string;
    floor_number: number;
    code: string;
    description: string | null;
    is_active: boolean;
    building?: {
        id: number;
        name: string;
        code: string;
    } | null;
    created_at: string;
    updated_at: string;
}

// For the dropdown
export interface BuildingOption {
    id: number;
    name: string;
    code: string;
}