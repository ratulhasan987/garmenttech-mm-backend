import { Head } from '@inertiajs/react';

import PageTitle from '@/components/page-title';

import SalesPaymentForm from '@/components/pages/sales/sales-payment-form';

import type {
    SalesInvoice,
} from '@/types/sales';

type Props = {
    invoices: SalesInvoice[];
};

export default function CreateSalesPayment({
    invoices,
}: Props) {
    return (
        <>
            <Head title="Create Sales Payment" />

            <PageTitle title="Create Sales Payment" />

            <div className="container-fluid">
                <SalesPaymentForm
                    invoices={invoices}
                />
            </div>
        </>
    );
}