import { Head } from '@inertiajs/react';

import PageTitle from '@/components/page-title';

import SalesReturnForm from '@/components/pages/sales/sales-return-form';

export default function CreateSalesReturn() {
    return (
        <>
            <Head title="Create Sales Return" />

            <PageTitle title="Create Sales Return" />

            <div className="container-fluid">
                <SalesReturnForm mode="create" />
            </div>
        </>
    );
}