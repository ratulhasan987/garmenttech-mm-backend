import {
    Head,
} from '@inertiajs/react';

import SalesInvoiceForm, {
    type SalesInvoiceFormInvoice,
    type SalesInvoiceFormOptions,
} from '@/components/pages/sales/sales-invoice-form';

import PageTitle from '@/components/page-title';

type Props =
    SalesInvoiceFormOptions & {
        invoice:
            SalesInvoiceFormInvoice;
    };

export default function EditSalesInvoicePage({
    invoice,
    ...options
}: Props) {
    return (
        <>
            <Head title="Update Sales Invoice" />

            <PageTitle title="Update Sales Invoice" />

            <div className="container-fluid">
                <SalesInvoiceForm
                    mode="edit"
                    invoice={
                        invoice
                    }
                    {...options}
                />
            </div>
        </>
    );
}