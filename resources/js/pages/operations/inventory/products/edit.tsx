import {
    Head,
} from '@inertiajs/react';

import ProductForm, {
    type ProductFormOptions,
    type ProductFormProduct,
} from '@/components/pages/inventory/product-form';

import PageTitle from '@/components/page-title';

type Props =
    ProductFormOptions & {
        product:
            ProductFormProduct;
    };

export default function EditProductPage({
    product,
    ...options
}: Props) {
    return (
        <>
            <Head
                title={`Update ${product.name}`}
            />

            <PageTitle title="Update Product" />

            <div className="container-fluid">
                <ProductForm
                    mode="edit"
                    product={
                        product
                    }
                    {...options}
                />
            </div>
        </>
    );
}