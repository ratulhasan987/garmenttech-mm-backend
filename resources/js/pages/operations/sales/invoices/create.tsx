import {
    Head,
} from '@inertiajs/react';

import SalesInvoiceForm, {
    type SalesInvoiceFormOptions,
} from '@/components/pages/sales/sales-invoice-form';

import PageTitle from '@/components/page-title';

export default function CreateSalesInvoicePage(
    props: SalesInvoiceFormOptions,
) {
    return (
        <>
            <Head title="Create Sales Invoice" />

            <PageTitle title="Create Sales Invoice" />

            <div className="container-fluid">
                <SalesInvoiceForm
                    mode="create"
                    {...props}
                />
            </div>
        </>
    );
}