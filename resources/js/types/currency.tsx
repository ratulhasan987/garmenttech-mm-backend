
export type Currency = {
    id: number;
    currency_code: string;
    currency_name: string;
    symbol: string | null;
    country: string | null;
    exchange_rate: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};
