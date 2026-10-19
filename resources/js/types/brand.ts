export interface Brand {
    id: number;
    name: string;
    country: string | null;
    website: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}