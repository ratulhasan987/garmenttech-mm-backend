export interface Building {
    id: number;
    name: string;
    code: string;
    address: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}