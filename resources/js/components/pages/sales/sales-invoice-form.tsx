import { useCallback, useMemo, useState, type FormEvent } from 'react';

import { router, useForm } from '@inertiajs/react';

import { Check, Save, Trash2, X } from 'react-feather';

import { searchCustomers } from '@/lib/sales';

import type { CustomerSuggestion } from '@/types/sales';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import { DatePicker } from '@/components/ui/form/date-picker';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { Input } from '@/components/ui/form/input';

import { Select } from '@/components/ui/form/select';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

import { Textarea } from '@/components/ui/form/textarea';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { NumberInput } from '@/components/ui/form/number-input';

// Warehouse

export type SalesInvoiceWarehouse = {
    id: number;
    code: string;
    name: string;
};

// Category

export type SalesInvoiceCategory = {
    id: number;
    name: string;
};

// Sub category

export type SalesInvoiceSubcategory = {
    id: number;
    parent_id: number;
    name: string;
};

// Brand

export type SalesInvoiceBrand = {
    id: number;
    name: string;
};

// Tax

export type SalesInvoiceTax = {
    id: number;
    name: string;
    rate: number | string;
};

// Invoice item

export type SalesInvoiceFormItem = {
    product_id: number;
    product_code: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax_ids: number[];
    available_stock: number;
};

// Invoice

export type SalesInvoiceFormInvoice = {
    id: number;

    client_id: number;

    client: CustomerSuggestion | null;

    invoice_date: string;

    discount: number;

    tax_ids: number[];

    adjustment_amount: number;

    remarks: string | null;

    items: SalesInvoiceFormItem[];
};

// Form options

export type SalesInvoiceFormOptions = {
    warehouse: SalesInvoiceWarehouse | null;

    categories: SalesInvoiceCategory[];

    subcategories: SalesInvoiceSubcategory[];

    brands: SalesInvoiceBrand[];

    taxes: SalesInvoiceTax[];
};

// Product search result

type ProductSuggestion = Record<string, unknown> & {
    id: number;

    code: string;

    name: string;

    unit: string | null;

    sales_price: number;

    available_stock: number;

    sales_tax_ids: number[];
};

// Draft product

type DraftItem = {
    product_id: number | null;

    product_code: string;

    product_name: string;

    quantity: number;

    unit_price: number;

    discount: number;

    tax_ids: number[];

    available_stock: number;
};

// Props

type Props = SalesInvoiceFormOptions & {
    mode: 'create' | 'edit';

    invoice?: SalesInvoiceFormInvoice | null;
};

// Form data

type FormData = {
    client_id: number | null;

    invoice_date: string;

    discount: number;

    tax_ids: number[];

    adjustment_amount: number;

    remarks: string;

    items: SalesInvoiceFormItem[];
};

// Local date

function localDate(): string {
    const date = new Date();

    const offset = date.getTimezoneOffset() * 60 * 1000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

// Empty product

function emptyDraft(): DraftItem {
    return {
        product_id: null,

        product_code: '',

        product_name: '',

        quantity: 1,

        unit_price: 0,

        discount: 0,

        tax_ids: [],

        available_stock: 0,
    };
}

// Currency

function money(value: number): string {
    return Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
    });
}

export default function SalesInvoiceForm({
    mode,
    invoice = null,
    warehouse,
    categories,
    subcategories,
    brands,
    taxes,
}: Props) {
    const isEditing = mode === 'edit' && invoice !== null;

    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

    const [brandId, setBrandId] = useState<number | null>(null);

    const [draftItem, setDraftItem] = useState<DraftItem>(emptyDraft);

    const [draftError, setDraftError] = useState<string | null>(null);

    const [productSearchKey, setProductSearchKey] = useState(0);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        clearErrors,
        transform,
    } = useForm<FormData>({
        client_id: invoice?.client_id ?? null,

        invoice_date: invoice?.invoice_date ?? localDate(),

        discount: Number(invoice?.discount ?? 0),

        tax_ids: invoice?.tax_ids ?? [],

        adjustment_amount: Number(invoice?.adjustment_amount ?? 0),

        remarks: invoice?.remarks ?? '',

        items: invoice?.items ?? [],
    });

    const fieldErrors = errors as Record<string, string>;

    // Tax lookup

    const taxMap = useMemo(
        () => new Map(taxes.map((tax) => [tax.id, tax])),

        [taxes],
    );

    // Selected products

    const selectedProductIds = useMemo(
        () => new Set(data.items.map((item) => item.product_id)),

        [data.items],
    );

    // Original quantities

    const originalQuantityMap = useMemo(
        () =>
            new Map(
                (invoice?.items ?? []).map((item) => [
                    item.product_id,
                    item.quantity,
                ]),
            ),

        [invoice],
    );

    // Sub categories

    const availableSubcategories = useMemo(() => {
        if (categoryId === null) {
            return [];
        }

        return subcategories.filter(
            (subcategory) => Number(subcategory.parent_id) === categoryId,
        );
    }, [categoryId, subcategories]);

    // Gross amount

    const grossAmount = (item: DraftItem | SalesInvoiceFormItem) => {
        return Number(item.quantity || 0) * Number(item.unit_price || 0);
    };

    // Taxable amount

    const taxableAmount = (item: DraftItem | SalesInvoiceFormItem) => {
        return Math.max(
            0,

            grossAmount(item) - Number(item.discount || 0),
        );
    };

    // Product tax amount

    const taxAmount = (item: DraftItem | SalesInvoiceFormItem) => {
        const rate = item.tax_ids.reduce(
            (total, taxId) => total + Number(taxMap.get(taxId)?.rate ?? 0),

            0,
        );

        return (taxableAmount(item) * rate) / 100;
    };

    // Line total

    const lineTotal = (item: DraftItem | SalesInvoiceFormItem) => {
        return taxableAmount(item) + taxAmount(item);
    };

    // Product tax toggle

    const toggleItemTax = (itemIndex: number, taxId: number) => {
        setData(
            'items',

            data.items.map((item, index) => {
                if (index !== itemIndex) {
                    return item;
                }

                const exists = item.tax_ids.includes(taxId);

                return {
                    ...item,

                    tax_ids: exists
                        ? item.tax_ids.filter((id) => id !== taxId)
                        : [...item.tax_ids, taxId],
                };
            }),
        );
    };

    // Subtotal

    const subtotal = useMemo(
        () =>
            data.items.reduce(
                (total, item) => total + grossAmount(item),

                0,
            ),

        [data.items],
    );

    // Item discount

    const itemDiscount = useMemo(
        () =>
            data.items.reduce(
                (total, item) => total + Number(item.discount || 0),

                0,
            ),

        [data.items],
    );

    // Product tax

    const itemTax = useMemo(
        () =>
            data.items.reduce(
                (total, item) => total + taxAmount(item),

                0,
            ),

        [data.items, taxMap],
    );

    // Invoice tax rate

    const invoiceTaxRate = useMemo(
        () =>
            data.tax_ids.reduce(
                (total, taxId) => total + Number(taxMap.get(taxId)?.rate ?? 0),

                0,
            ),

        [data.tax_ids, taxMap],
    );

    // Invoice tax amount

    const invoiceTaxAmount = useMemo(
        () => (subtotal * invoiceTaxRate) / 100,

        [subtotal, invoiceTaxRate],
    );

    // Invoice totals

    const totals = useMemo(() => {
        const itemsTotal = data.items.reduce(
            (total, item) => total + lineTotal(item),

            0,
        );

        const invoiceDiscount = Number(data.discount || 0);

        const adjustment = Number(data.adjustment_amount || 0);

        const grandTotal = Math.max(
            0,

            itemsTotal - invoiceDiscount + invoiceTaxAmount + adjustment,
        );

        return {
            subtotal,

            itemDiscount,

            itemTax,

            invoiceTaxAmount,

            invoiceTaxRate,

            grandTotal,
        };
    }, [
        data.items,
        data.discount,
        data.adjustment_amount,
        subtotal,
        itemDiscount,
        itemTax,
        invoiceTaxAmount,
        invoiceTaxRate,
    ]);

    // Reset product

    const resetProduct = () => {
        setDraftItem(emptyDraft());

        setDraftError(null);

        setProductSearchKey((current) => current + 1);
    };

    // Product search

    const searchProducts = useCallback(
        async (
            query: string,
            signal?: AbortSignal,
        ): Promise<ProductSuggestion[]> => {
            const params = new URLSearchParams();

            params.set('keyword', query);

            if (warehouse) {
                params.set('warehouse_id', String(warehouse.id));
            }

            if (categoryId !== null) {
                params.set('category_id', String(categoryId));
            }

            if (subcategoryId !== null) {
                params.set('subcategory_id', String(subcategoryId));
            }

            if (brandId !== null) {
                params.set('brand_id', String(brandId));
            }

            const response = await fetch(
                `/operations/products/search?${params.toString()}`,

                {
                    signal,

                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to search products.');
            }

            const products = (await response.json()) as ProductSuggestion[];

            return products

                .filter((product) => !selectedProductIds.has(product.id))

                .map((product) => ({
                    ...product,

                    available_stock:
                        Number(product.available_stock) +
                        Number(originalQuantityMap.get(product.id) ?? 0),
                }));
        },

        [
            warehouse,
            categoryId,
            subcategoryId,
            brandId,
            selectedProductIds,
            originalQuantityMap,
        ],
    );

    // Product selected

    const handleProductSelect = (product: ProductSuggestion) => {
        const productTaxIds = (product.sales_tax_ids ?? [])
            .map(Number)
            .filter((taxId) => taxMap.has(taxId));

        setDraftItem({
            product_id: product.id,

            product_code: product.code,

            product_name: product.name,

            quantity: 1,

            unit_price: Number(product.sales_price ?? 0),

            discount: 0,

            // Auto select product taxes

            tax_ids: productTaxIds,

            available_stock: Number(product.available_stock ?? 0),
        });

        setDraftError(null);
    };

    // Add item

    const addItem = () => {
        if (!draftItem.product_id) {
            setDraftError('Please select a product.');

            return;
        }

        if (draftItem.available_stock <= 0) {
            setDraftError('This product is out of stock.');

            return;
        }

        if (draftItem.quantity <= 0) {
            setDraftError('Quantity must be greater than zero.');

            return;
        }

        if (draftItem.quantity > draftItem.available_stock) {
            setDraftError(
                `Only ${draftItem.available_stock} available in stock.`,
            );

            return;
        }

        if (draftItem.discount > grossAmount(draftItem)) {
            setDraftError('Discount cannot exceed item amount.');

            return;
        }

        setData(
            'items',

            [
                ...data.items,

                {
                    product_id: draftItem.product_id,

                    product_code: draftItem.product_code,

                    product_name: draftItem.product_name,

                    quantity: draftItem.quantity,

                    unit_price: draftItem.unit_price,

                    discount: draftItem.discount,

                    tax_ids: [...draftItem.tax_ids],

                    available_stock: draftItem.available_stock,
                },
            ],
        );

        resetProduct();
    };

    // Update item

    const updateItem = (
        index: number,
        values: Partial<SalesInvoiceFormItem>,
    ) => {
        const items = [...data.items];

        items[index] = {
            ...items[index],

            ...values,
        };

        setData('items', items);
    };

    // Remove item

    const removeItem = (index: number) => {
        setData(
            'items',

            data.items.filter((_, itemIndex) => itemIndex !== index),
        );

        setProductSearchKey((current) => current + 1);
    };

    // Validate stock

    const validateStock = () => {
        for (const item of data.items) {
            if (Number(item.quantity) > Number(item.available_stock)) {
                setDraftError(
                    `${item.product_name} only has ${item.available_stock} available.`,
                );

                return false;
            }

            if (Number(item.quantity) <= 0) {
                setDraftError(
                    `${item.product_name} quantity must be greater than zero.`,
                );

                return false;
            }
        }

        return true;
    };

    // Submit

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setDraftError(null);

        if (!warehouse) {
            setDraftError('No default warehouse is configured.');

            return;
        }

        if (!data.client_id) {
            setDraftError('Please select a customer.');

            return;
        }

        if (data.items.length === 0) {
            setDraftError('Please add at least one product.');

            return;
        }

        if (!validateStock()) {
            return;
        }

        transform((formData) => ({
            client_id: formData.client_id,

            invoice_date: formData.invoice_date,

            discount: formData.discount,

            tax_ids: formData.tax_ids,

            adjustment_amount: formData.adjustment_amount,

            remarks: formData.remarks || null,

            items: formData.items.map((item) => ({
                product_id: item.product_id,

                quantity: item.quantity,

                unit_price: item.unit_price,

                discount: item.discount,

                tax_ids: item.tax_ids,
            })),
        }));

        if (isEditing && invoice) {
            put(
                `/operations/sales/invoices/${invoice.id}`,

                {
                    preserveScroll: true,
                },
            );

            return;
        }

        post(
            '/operations/sales/invoices',

            {
                preserveScroll: true,
            },
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div>
                        <h4 className="mb-1">
                            {isEditing
                                ? 'Update Sales Invoice'
                                : 'Create Sales Invoice'}
                        </h4>

                        <p className="text-muted mb-0">
                            Stock is validated from the default warehouse.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        onClick={() =>
                            router.visit('/operations/sales/invoices')
                        }
                    >
                        Go Back
                    </Button>
                </div>
            </CardHeader>

            <CardBody>
                <form onSubmit={handleSubmit}>
                    {/* Invoice information */}

                    <div className="row g-3">
                        <div className="col-12 col-lg-4">
                            <SuggestionSearchInput<CustomerSuggestion>
                                searchFn={searchCustomers}

                                idKey="id"

                                labelKey="label"

                                label="Customer"

                                required

                                placeholder="Search customer..."

                                disabled={processing}

                                clearOnFocus={false}

                                defaultSelectedItem={
                                    invoice?.client ?? undefined
                                }

                                onSelect={(customer) => {
                                    setData('client_id', customer.id);

                                    clearErrors('client_id');
                                }}

                                onClear={() => setData('client_id', null)}
                            />

                            <FormError error={errors.client_id} />
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <FormField>
                                <FormLabel required>Invoice Date</FormLabel>

                                <DatePicker
                                    value={data.invoice_date}

                                    disabled={processing}

                                    onChange={(value) =>
                                        setData('invoice_date', value)
                                    }
                                />

                                <FormError error={errors.invoice_date} />
                            </FormField>
                        </div>

                        <div className="col-12 col-md-6 col-lg-4">
                            <FormField>
                                <FormLabel>Default Warehouse</FormLabel>

                                <Input
                                    value={
                                        warehouse
                                            ? `${warehouse.code} - ${warehouse.name}`
                                            : 'No default warehouse'
                                    }

                                    disabled

                                    readOnly
                                />
                            </FormField>
                        </div>
                    </div>

                    <hr />

                    {/* Product filters */}

                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <FormField>
                                <FormLabel>Category</FormLabel>

                                <Select
                                    value={categoryId ?? ''}

                                    onChange={(event) => {
                                        const value = event.target.value;

                                        setCategoryId(
                                            value ? Number(value) : null,
                                        );

                                        setSubcategoryId(null);

                                        resetProduct();
                                    }}
                                >
                                    <option value="">All Categories</option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </div>

                        <div className="col-12 col-md-4">
                            <FormField>
                                <FormLabel>Sub Category</FormLabel>

                                <Select
                                    value={subcategoryId ?? ''}

                                    disabled={!categoryId}

                                    onChange={(event) => {
                                        setSubcategoryId(
                                            event.target.value
                                                ? Number(event.target.value)
                                                : null,
                                        );

                                        resetProduct();
                                    }}
                                >
                                    <option value="">All Sub Categories</option>

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
                            </FormField>
                        </div>

                        <div className="col-12 col-md-4">
                            <FormField>
                                <FormLabel>Brand</FormLabel>

                                <Select
                                    value={brandId ?? ''}

                                    onChange={(event) => {
                                        setBrandId(
                                            event.target.value
                                                ? Number(event.target.value)
                                                : null,
                                        );

                                        resetProduct();
                                    }}
                                >
                                    <option value="">All Brands</option>

                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </div>
                    </div>

                    {/* Product search */}

                    <div className="row mt-3">
                        <div className="col-12 col-lg-6">
                            <SuggestionSearchInput<ProductSuggestion>
                                key={productSearchKey}

                                searchFn={searchProducts}

                                idKey="id"

                                labelKey="name"

                                secondaryLabelKey="code"

                                label="Product"

                                placeholder="Search product name or code..."

                                disabled={processing}

                                clearOnFocus={false}

                                onSelect={handleProductSelect}

                                onClear={resetProduct}

                                renderOption={(product) => (
                                    <div>
                                        <div className="fw-semibold">
                                            {product.code}

                                            {' - '}

                                            {product.name}
                                        </div>

                                        <small
                                            className={
                                                Number(
                                                    product.available_stock,
                                                ) > 0
                                                    ? 'text-muted'
                                                    : 'text-danger'
                                            }
                                        >
                                            Stock: {product.available_stock}
                                            {' • '}
                                            Sales Price:{' '}
                                            {money(Number(product.sales_price))}
                                        </small>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {draftError && (
                        <div className="alert alert-danger mt-3 py-2">
                            {draftError}
                        </div>
                    )}

                    {/* Product table */}

                    <div className="mt-3">
                        <Table wrapperClassName="overflow-auto">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>

                                    <TableHead>Available</TableHead>

                                    <TableHead>Qty</TableHead>

                                    <TableHead>Unit Price</TableHead>

                                    <TableHead>Discount</TableHead>

                                    <TableHead>Product Taxes</TableHead>

                                    <TableHead>Total</TableHead>

                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {/* Draft product */}

                                <TableRow>
                                    <TableCell
                                        style={{
                                            minWidth: 220,
                                        }}
                                    >
                                        {draftItem.product_id
                                            ? `${draftItem.product_code} - ${draftItem.product_name}`
                                            : 'Select product'}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={
                                                draftItem.available_stock > 0
                                                    ? 'text-success fw-semibold'
                                                    : 'text-danger fw-semibold'
                                            }
                                        >
                                            {draftItem.available_stock}
                                        </span>
                                    </TableCell>

                                    <TableCell
                                        style={{
                                            minWidth: 110,
                                        }}
                                    >
                                        <NumberInput
                                            min={0.01}
                                            step={0.01}
                                            value={draftItem.quantity}
                                            zeroAsEmpty={true}
                                            onValueChange={(value) =>
                                                setDraftItem((current) => ({
                                                    ...current,
                                                    quantity: value,
                                                }))
                                            }
                                        />
                                    </TableCell>

                                    <TableCell
                                        style={{
                                            minWidth: 130,
                                        }}
                                    >
                                        <NumberInput
                                            min={0}
                                            step={0.01}
                                            value={draftItem.unit_price}
                                            zeroAsEmpty={true}
                                            onValueChange={(value) =>
                                                setDraftItem((current) => ({
                                                    ...current,
                                                    unit_price: value,
                                                }))
                                            }
                                        />
                                    </TableCell>

                                    <TableCell
                                        style={{
                                            minWidth: 120,
                                        }}
                                    >
                                        <NumberInput
                                            min={0}
                                            step={0.01}
                                            value={draftItem.discount}
                                            zeroAsEmpty={true}
                                            onValueChange={(value) =>
                                                setDraftItem((current) => ({
                                                    ...current,
                                                    discount: value,
                                                }))
                                            }
                                        />
                                    </TableCell>

                                    {/* Draft product taxes */}

                                    <TableCell
                                        style={{
                                            minWidth: 250,
                                        }}
                                    >
                                        <ProductTaxSelector
                                            taxes={taxes}

                                            selectedTaxIds={draftItem.tax_ids}

                                            onAdd={(taxId) =>
                                                setDraftItem((current) => ({
                                                    ...current,

                                                    tax_ids:
                                                        current.tax_ids.includes(
                                                            taxId,
                                                        )
                                                            ? current.tax_ids
                                                            : [
                                                                  ...current.tax_ids,
                                                                  taxId,
                                                              ],
                                                }))
                                            }

                                            onRemove={(taxId) =>
                                                setDraftItem((current) => ({
                                                    ...current,

                                                    tax_ids:
                                                        current.tax_ids.filter(
                                                            (id) =>
                                                                id !== taxId,
                                                        ),
                                                }))
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>
                                        {money(lineTotal(draftItem))}
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            type="button"

                                            size="sm"

                                            disabled={
                                                !draftItem.product_id ||
                                                processing
                                            }

                                            onClick={addItem}
                                        >
                                            <Check size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                {/* Invoice items */}

                                {data.items.map((item, index) => (
                                    <TableRow key={item.product_id}>
                                        <TableCell>
                                            <div className="fw-semibold">
                                                {item.product_name}
                                            </div>

                                            <small className="text-muted">
                                                {item.product_code}
                                            </small>
                                        </TableCell>

                                        <TableCell>
                                            <span
                                                className={
                                                    item.quantity >
                                                    item.available_stock
                                                        ? 'text-danger fw-semibold'
                                                        : 'text-success'
                                                }
                                            >
                                                {item.available_stock}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <Input
                                                type="number"

                                                min="0.01"

                                                max={item.available_stock}

                                                step="0.01"

                                                value={item.quantity}

                                                onChange={(event) =>
                                                    updateItem(index, {
                                                        quantity: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />

                                            <FormError
                                                error={
                                                    fieldErrors[
                                                        `items.${index}.quantity`
                                                    ]
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Input
                                                type="number"

                                                min="0"

                                                step="0.01"

                                                value={item.unit_price}

                                                onChange={(event) =>
                                                    updateItem(index, {
                                                        unit_price: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Input
                                                type="number"

                                                min="0"

                                                step="0.01"

                                                value={item.discount}

                                                onChange={(event) =>
                                                    updateItem(index, {
                                                        discount: Number(
                                                            event.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </TableCell>

                                        {/* Existing product taxes */}

                                        <TableCell
                                            style={{
                                                minWidth: 250,
                                            }}
                                        >
                                            <ProductTaxSelector
                                                taxes={taxes}

                                                selectedTaxIds={item.tax_ids}

                                                onAdd={(taxId) =>
                                                    toggleItemTax(index, taxId)
                                                }

                                                onRemove={(taxId) =>
                                                    toggleItemTax(index, taxId)
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <strong>
                                                {money(lineTotal(item))}
                                            </strong>
                                        </TableCell>

                                        <TableCell>
                                            <Button
                                                type="button"

                                                size="sm"

                                                variant="danger"

                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <hr />

                    <div className="row g-3">
                        {/* Remarks */}

                        <div className="col-12 col-lg-7">
                            <FormField>
                                <FormLabel>Remarks</FormLabel>

                                <Textarea
                                    rows={5}

                                    value={data.remarks}

                                    onChange={(event) =>
                                        setData('remarks', event.target.value)
                                    }
                                />
                            </FormField>
                        </div>

                        {/* Summary */}

                        <div className="col-12 col-lg-5">
                            <div className="border rounded p-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal</span>

                                    <strong>{money(totals.subtotal)}</strong>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Product Discount</span>

                                    <span>{money(totals.itemDiscount)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Product Tax</span>

                                    <span>{money(totals.itemTax)}</span>
                                </div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Invoice Tax</span>

                                    <span>
                                        {money(totals.invoiceTaxAmount)}
                                    </span>
                                </div>

                                <FormField>
                                    <FormLabel>Invoice Discount</FormLabel>
                                    <NumberInput
                                        min={0}
                                        step={0.01}
                                        value={data.discount}
                                        zeroAsEmpty={true}
                                        onValueChange={(value) =>
                                            setData('discount', value)
                                        }
                                    />
                                </FormField>

                                {/* Invoice taxes */}

                                <div className="mt-3">
                                    <FormField>
                                        <FormLabel>Invoice Taxes</FormLabel>

                                        <Select
                                            value=""

                                            onChange={(event) => {
                                                const taxId = Number(
                                                    event.target.value,
                                                );

                                                if (
                                                    !taxId ||
                                                    data.tax_ids.includes(taxId)
                                                ) {
                                                    return;
                                                }

                                                setData(
                                                    'tax_ids',

                                                    [...data.tax_ids, taxId],
                                                );
                                            }}
                                        >
                                            <option value="">
                                                Select Invoice Tax
                                            </option>

                                            {taxes.map((tax) => (
                                                <option
                                                    key={tax.id}

                                                    value={tax.id}

                                                    disabled={data.tax_ids.includes(
                                                        tax.id,
                                                    )}
                                                >
                                                    {tax.name} (
                                                    {Number(tax.rate)}
                                                    %)
                                                </option>
                                            ))}
                                        </Select>
                                    </FormField>

                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {data.tax_ids.map((taxId) => {
                                            const tax = taxMap.get(taxId);

                                            if (!tax) {
                                                return null;
                                            }

                                            return (
                                                <span
                                                    key={taxId}

                                                    className="
                                                            badge
                                                            bg-light
                                                            text-dark
                                                            border
                                                            d-flex
                                                            align-items-center
                                                            gap-1
                                                        "
                                                >
                                                    {tax.name}{' '}
                                                    {Number(tax.rate)}%
                                                    <button
                                                        type="button"

                                                        className="
                                                                border-0
                                                                bg-transparent
                                                                text-danger
                                                                p-0
                                                                d-flex
                                                                align-items-center
                                                            "

                                                        onClick={() =>
                                                            setData(
                                                                'tax_ids',

                                                                data.tax_ids.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        taxId,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Adjustment */}

                                <div className="mt-3">
                                    <FormField>
                                        <FormLabel>Adjustment Amount</FormLabel>

                                        <NumberInput
                                            step={0.01}
                                            value={data.adjustment_amount}
                                            zeroAsEmpty={true}
                                            onValueChange={(value) =>
                                                setData(
                                                    'adjustment_amount',
                                                    value,
                                                )
                                            }
                                        />
                                    </FormField>

                                    <small className="text-muted">
                                        Positive amount increases the total.
                                        Negative amount decreases the total.
                                    </small>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between align-items-center">
                                    <strong>Grand Total</strong>

                                    <strong className="fs-5">
                                        {money(totals.grandTotal)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}

                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                        <Button
                            type="button"

                            variant="secondary"

                            appearance="outline"

                            disabled={processing}

                            onClick={() =>
                                router.visit('/operations/sales/invoices')
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"

                            variant="primary"

                            disabled={processing || data.items.length === 0}
                        >
                            <Save size={16} className="me-1" />

                            {processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update Invoice'
                                  : 'Save Invoice'}
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}

// Product tax selector

function ProductTaxSelector({
    taxes,
    selectedTaxIds,
    onAdd,
    onRemove,
}: {
    taxes: SalesInvoiceTax[];

    selectedTaxIds: number[];

    onAdd: (taxId: number) => void;

    onRemove: (taxId: number) => void;
}) {
    return (
        <div>
            <Select
                value=""

                onChange={(event) => {
                    const taxId = Number(event.target.value);

                    if (!taxId || selectedTaxIds.includes(taxId)) {
                        return;
                    }

                    onAdd(taxId);
                }}
            >
                <option value="">Select Product Tax</option>

                {taxes.map((tax) => (
                    <option
                        key={tax.id}

                        value={tax.id}

                        disabled={selectedTaxIds.includes(tax.id)}
                    >
                        {tax.name} ({Number(tax.rate)}
                        %)
                    </option>
                ))}
            </Select>

            {/* Selected product taxes */}

            <div className="d-flex flex-wrap gap-2 mt-2">
                {selectedTaxIds.map((taxId) => {
                    const tax = taxes.find((item) => item.id === taxId);

                    if (!tax) {
                        return null;
                    }

                    return (
                        <span
                            key={taxId}

                            className="
                                    badge
                                    bg-light
                                    text-dark
                                    border
                                    d-inline-flex
                                    align-items-center
                                    gap-1
                                "
                        >
                            {tax.name} {Number(tax.rate)}%
                            <button
                                type="button"

                                className="
                                        border-0
                                        bg-transparent
                                        text-danger
                                        p-0
                                        d-flex
                                        align-items-center
                                    "

                                title="Remove tax"

                                onClick={() => onRemove(taxId)}
                            >
                                <X size={13} />
                            </button>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
