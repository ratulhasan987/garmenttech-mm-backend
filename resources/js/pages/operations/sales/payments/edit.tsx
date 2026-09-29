import { Head } from '@inertiajs/react';

import PageTitle from '@/components/page-title';

import SalesPaymentForm from '@/components/pages/sales/sales-payment-form';

import type {
    SalesInvoice,
    SalesPayment,
} from '@/types/sales';

type Props = {
    payment: SalesPayment;

    invoices: SalesInvoice[];
};

export default function EditSalesPayment({
    payment,
    invoices,
}: Props) {
    return (
        <>
            <Head
                title={`Edit Sales Payment ${payment.payment_no}`}
            />

            <PageTitle
                title={`Edit Sales Payment - ${payment.payment_no}`}
            />

            <div className="container-fluid">
                <SalesPaymentForm
                    payment={payment}
                    invoices={invoices}
                />
            </div>
        </>
    );
}