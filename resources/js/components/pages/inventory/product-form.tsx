import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useMemo } from 'react';

import { Save } from 'react-feather';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { TaxMultiSelect } from '@/components/ui/form/tax-multi-select';

import { Textarea } from '@/components/ui/form/textarea';

// Types

export type ProductCategoryOption = {
    id: number;
    name: string;
};

export type ProductSubcategoryOption = {
    id: number;
    parent_id: number;
    name: string;
};

export type ProductBrandOption = {
    id: number;
    name: string;
};

export type ProductUnitOption = {
    id: number;
    name: string;
};

export type ProductTaxOption = {
    id: number;

    name: string;

    rate: string | number;
};

export type ProductFormProduct = {
    id: number;

    name: string;

    category_id: number;

    subcategory_id: number | null;

    product_brand_id: number | null;

    unit_id: number;

    reorder_level: string | number;

    purchase_tax_ids: number[];

    sales_tax_ids: number[];

    status: boolean;

    purchase_price: string | number;

    sales_price: string | number;

    description: string | null;
};

export type ProductFormOptions = {
    categories: ProductCategoryOption[];

    subcategories: ProductSubcategoryOption[];

    brands: ProductBrandOption[];

    units: ProductUnitOption[];

    taxes: ProductTaxOption[];
};

type ProductFormProps = ProductFormOptions & {
    mode: 'create' | 'edit';

    product?: ProductFormProduct | null;
};

type ProductFormData = {
    name: string;

    category_id: string;

    subcategory_id: string;

    product_brand_id: string;

    unit_id: string;

    reorder_level: string;

    purchase_tax_ids: number[];

    sales_tax_ids: number[];

    purchase_price: string;

    sales_price: string;

    status: boolean;

    description: string;
};

export default function ProductForm({
    mode,
    product = null,
    categories,
    subcategories,
    brands,
    units,
    taxes,
}: ProductFormProps) {
    const isEditing = mode === 'edit' && product !== null;

    // Form
    const { data, setData, post, put, processing, errors, clearErrors } =
        useForm<ProductFormData>({
            name: product?.name ?? '',

            category_id: product?.category_id
                ? String(product.category_id)
                : '',

            subcategory_id: product?.subcategory_id
                ? String(product.subcategory_id)
                : '',

            product_brand_id: product?.product_brand_id
                ? String(product.product_brand_id)
                : '',

            unit_id: product?.unit_id ? String(product.unit_id) : '',

            reorder_level: String(product?.reorder_level ?? 0),

            purchase_tax_ids: product?.purchase_tax_ids ?? [],

            sales_tax_ids: product?.sales_tax_ids ?? [],

            status: product?.status ?? true,

            purchase_price: String(product?.purchase_price ?? 0),

            sales_price: String(product?.sales_price ?? 0),

            description: product?.description ?? '',
        });

    // Sub categories
    const availableSubcategories = useMemo(() => {
        if (!data.category_id) {
            return [];
        }

        return subcategories.filter(
            (subcategory) =>
                Number(subcategory.parent_id) === Number(data.category_id),
        );
    }, [data.category_id, subcategories]);

    // Category change
    const handleCategoryChange = (value: string) => {
        setData('category_id', value);

        setData('subcategory_id', '');

        clearErrors('category_id', 'subcategory_id');
    };

    // Submit
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEditing && product) {
            put(`/operations/products/${product.id}`, {
                preserveScroll: true,
            });

            return;
        }

        post('/operations/products', {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                        <h4 className="mb-1">
                            {isEditing ? 'Update Product' : 'Create Product'}
                        </h4>

                        <p className="text-muted mb-0">
                            {isEditing
                                ? 'Update product information and settings.'
                                : 'Create a new product.'}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={processing}
                        onClick={() => router.visit('/operations/products')}
                    >
                        Go Back
                    </Button>
                </div>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        {/* Product name */}
                        <div className="col-12 col-lg-6">
                            <FormField>
                                <FormLabel htmlFor="name" required>
                                    Product Name
                                </FormLabel>

                                <Input
                                    id="name"
                                    value={data.name}
                                    disabled={processing}
                                    placeholder="Enter product name"
                                    onChange={(event) => {
                                        setData('name', event.target.value);

                                        clearErrors('name');
                                    }}
                                />

                                <FormError error={errors.name} />
                            </FormField>
                        </div>

                        {/* Category */}
                        <div className="col-12 col-md-6 col-lg-3">
                            <FormField>
                                <FormLabel required>Category</FormLabel>

                                <Select
                                    value={data.category_id}
                                    disabled={processing}
                                    onChange={(event) =>
                                        handleCategoryChange(event.target.value)
                                    }
                                >
                                    <option value="">Select Category</option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>

                                <FormError error={errors.category_id} />
                            </FormField>
                        </div>

                        {/* Sub category */}
                        <div className="col-12 col-md-6 col-lg-3">
                            <FormField>
                                <FormLabel>Sub Category</FormLabel>

                                <Select
                                    value={data.subcategory_id}
                                    disabled={processing || !data.category_id}
                                    onChange={(event) => {
                                        setData(
                                            'subcategory_id',
                                            event.target.value,
                                        );

                                        clearErrors('subcategory_id');
                                    }}
                                >
                                    <option value="">
                                        {data.category_id
                                            ? 'No Sub Category'
                                            : 'Select Category First'}
                                    </option>

                                    {availableSubcategories.map(
                                        (subcategory) => (
                                            <option
                                                key={subcategory.id}
                                                value={subcategory.id}
                                            >
                                                {subcategory.name}
                                            </option>
                                        ),
                                    )}
                                </Select>

                                <FormError error={errors.subcategory_id} />
                            </FormField>
                        </div>

                        {/* Brand */}
                        <div className="col-12 col-sm-6 col-lg-3">
                            <FormField>
                                <FormLabel>Brand</FormLabel>

                                <Select
                                    value={data.product_brand_id}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData(
                                            'product_brand_id',
                                            event.target.value,
                                        );

                                        clearErrors('product_brand_id');
                                    }}
                                >
                                    <option value="">No Brand</option>

                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </Select>

                                <FormError error={errors.product_brand_id} />
                            </FormField>
                        </div>

                        {/* Unit */}
                        <div className="col-12 col-sm-6 col-lg-3">
                            <FormField>
                                <FormLabel required>Unit</FormLabel>

                                <Select
                                    value={data.unit_id}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData('unit_id', event.target.value);

                                        clearErrors('unit_id');
                                    }}
                                >
                                    <option value="">Select Unit</option>

                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </Select>

                                <FormError error={errors.unit_id} />
                            </FormField>
                        </div>

                        {/* Purchase price */}
                        <div className="col-12 col-sm-6 col-lg-4">
                            <FormField>
                                <FormLabel htmlFor="purchase_price" required>
                                    Purchase Price
                                </FormLabel>

                                <Input
                                    id="purchase_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.purchase_price}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData(
                                            'purchase_price',
                                            event.target.value,
                                        );

                                        clearErrors('purchase_price');
                                    }}
                                />

                                <FormError error={errors.purchase_price} />
                            </FormField>
                        </div>

                        {/* Sales price */}
                        <div className="col-12 col-sm-6 col-lg-4">
                            <FormField>
                                <FormLabel htmlFor="sales_price" required>
                                    Sales Price
                                </FormLabel>

                                <Input
                                    id="sales_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.sales_price}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData(
                                            'sales_price',
                                            event.target.value,
                                        );

                                        clearErrors('sales_price');
                                    }}
                                />

                                <FormError error={errors.sales_price} />
                            </FormField>
                        </div>

                        {/* Reorder level */}
                        <div className="col-12 col-sm-6 col-lg-4">
                            <FormField>
                                <FormLabel htmlFor="reorder_level" required>
                                    Reorder Level
                                </FormLabel>

                                <Input
                                    id="reorder_level"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.reorder_level}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData(
                                            'reorder_level',
                                            event.target.value,
                                        );

                                        clearErrors('reorder_level');
                                    }}
                                />

                                <FormError error={errors.reorder_level} />
                            </FormField>
                        </div>

                        {/* Status */}
                        <div className="col-12 col-sm-6 col-lg-3">
                            <FormField>
                                <FormLabel required>Status</FormLabel>

                                <Select
                                    value={data.status ? '1' : '0'}
                                    disabled={processing}
                                    onChange={(event) => {
                                        setData(
                                            'status',
                                            event.target.value === '1',
                                        );

                                        clearErrors('status');
                                    }}
                                >
                                    <option value="1">Active</option>

                                    <option value="0">Inactive</option>
                                </Select>

                                <FormError error={errors.status} />
                            </FormField>
                        </div>

                        {/* Purchase taxes */}
                        <div className="col-12 col-lg-6">
                            <FormField>
                                <FormLabel>Purchase Taxes</FormLabel>

                                <TaxMultiSelect
                                    taxes={taxes}
                                    value={data.purchase_tax_ids}
                                    disabled={processing}
                                    error={errors.purchase_tax_ids}
                                    placeholder="Select purchase taxes"
                                    onChange={(value) => {
                                        setData('purchase_tax_ids', value);

                                        clearErrors('purchase_tax_ids');
                                    }}
                                />

                                <FormError error={errors.purchase_tax_ids} />
                            </FormField>
                        </div>

                        {/* Sales taxes */}
                        <div className="col-12 col-lg-6">
                            <FormField>
                                <FormLabel>Sales Taxes</FormLabel>

                                <TaxMultiSelect
                                    taxes={taxes}
                                    value={data.sales_tax_ids}
                                    disabled={processing}
                                    error={errors.sales_tax_ids}
                                    placeholder="Select sales taxes"
                                    onChange={(value) => {
                                        setData('sales_tax_ids', value);

                                        clearErrors('sales_tax_ids');
                                    }}
                                />

                                <FormError error={errors.sales_tax_ids} />
                            </FormField>
                        </div>

                        {/* Description */}
                        <div className="col-12">
                            <FormField>
                                <FormLabel htmlFor="description">
                                    Description
                                </FormLabel>

                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    disabled={processing}
                                    placeholder="Enter product description..."
                                    onChange={(event) => {
                                        setData(
                                            'description',
                                            event.target.value,
                                        );

                                        clearErrors('description');
                                    }}
                                />

                                <FormError error={errors.description} />
                            </FormField>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            appearance="outline"
                            disabled={processing}
                            onClick={() => router.visit('/operations/products')}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                        >
                            <Save size={16} className="me-1" />

                            {processing
                                ? isEditing
                                    ? 'Updating...'
                                    : 'Saving...'
                                : isEditing
                                  ? 'Update Product'
                                  : 'Save Product'}
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
