export interface MachineLocation {
    id: number;
    floor_id: number;
    sl_no: string;
    assigned_at: string;
    remarks: string | null;
    floor?: {
        id: number;
        name: string;
        floor_number: number;
        building?: {
            id: number;
            name: string;
        } | null;
    } | null;
}

export interface Machine {
    id: number;
    machine_id: string;
    model_id: number;
    code: string;
    notes: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    model?: {
        id: number;
        name: string;
        code: string;
    } | null;
    current_location?: MachineLocation | null;
}

export interface MachineModelOption {
    id: number;
    name: string;
    code: string;
}

export interface FloorOption {
    id: number;
    name: string;
    floor_number: number;
    building?: {
        id: number;
        name: string;
    } | null;
}