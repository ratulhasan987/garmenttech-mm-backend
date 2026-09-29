import type { PaginatedData } from './pagination';

export type Party = {
    id: number;
    client_id?: string | null;
    vendor_id?: string | null;
    name: string;
    phone?: string | null;
    address?: string | null;
};
export type FinanceTransaction = {
    id: number;
    transaction_no: string;
    transaction_date: string;
    direction: 'inflow' | 'outflow';
    transaction_type: string;
    amount: string;
    payment_method: string | null;
    reference: string | null;
    remarks: string | null;
    receivable?: { id: number; document_no: string } | null;
    payable?: { id: number; document_no: string } | null;
    created_by?: { id: number; name: string } | null;
};
export type FinanceAccount = {
    id: number;
    document_no: string;
    document_date: string;
    due_date: string;
    amount: string;
    balance: string;
    status: 'open' | 'partial' | 'closed';
    paid_amount?: string;
    received_amount?: string;
    source_type?: 'sales_invoice' | 'purchase_return';
    source_id?: number;
    bill_id?: number;
    client?: Party | null;
    vendor?: Party | null;
    transactions?: FinanceTransaction[];
};
export type FinancePage = PaginatedData<FinanceAccount>;
export type TransactionPage = PaginatedData<FinanceTransaction>;
