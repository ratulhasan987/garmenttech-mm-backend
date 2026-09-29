import {
    Head,
} from '@inertiajs/react';

import ProductForm, {
    type ProductFormOptions,
} from '@/components/pages/inventory/product-form';

import PageTitle from '@/components/page-title';

export default function CreateProductPage(
    props: ProductFormOptions,
) {
    return (
        <>
            <Head title="Create Product" />

            <PageTitle title="Create Product" />

            <div className="container-fluid">
                <ProductForm
                    mode="create"
                    {...props}
                />
            </div>
        </>
    );
}