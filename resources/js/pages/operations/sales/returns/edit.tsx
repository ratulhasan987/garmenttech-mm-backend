import { Head } from '@inertiajs/react';

import PageTitle from '@/components/page-title';
import SalesReturnForm from '@/components/pages/sales/sales-return-form';


type SalesReturn = {
    id: number;
    return_no: string;
    sales_invoice_id: number;
    warehouse_id: number;
    return_date: string;
    total_amount: number | string;
    status: string;
    remarks?: string | null;

    invoice?: {
        id: number;
        invoice_no: string;
        invoice_date?: string | null;

        client?: {
            id: number;
            name: string;
            client_id?: string | null;
            company_name?: string | null;
            phone?: string | null;
            address?: string | null;
        } | null;

        warehouse?: {
            id: number;
            code?: string | null;
            name: string;
        } | null;
    } | null;

    warehouse?: {
        id: number;
        code?: string | null;
        name: string;
    } | null;

    items?: Array<{
        id: number;
        sales_invoice_item_id: number;
        product_id: number;
        quantity: number | string;
        unit_price: number | string;
        line_total: number | string;

        product?: {
            id: number;
            code?: string | null;
            name: string;

            unit?: {
                name: string;
            } | null;
        } | null;

        invoice_item?: {
            id: number;
            quantity: number | string;
        } | null;
    }>;
};

type Props = {
    salesReturn: SalesReturn;
    invoice?: unknown;
};

export default function EditSalesReturn({
    salesReturn,
}: Props) {
    return (
        <>
            <Head
                title={`Edit ${salesReturn.return_no}`}
            />

            <PageTitle
                title={`Edit Sales Return - ${salesReturn.return_no}`}
            />

            <div className="container-fluid">
                <SalesReturnForm
                    mode="edit"
                    salesReturn={
                        salesReturn
                    }
                />
            </div>
        </>
    );
}