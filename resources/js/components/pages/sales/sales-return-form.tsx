import { FormEvent, useEffect, useMemo, useState } from 'react';

import { router } from '@inertiajs/react';

import { Plus, Trash2, Search } from 'react-feather';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import { Input } from '@/components/ui/form/input';

import { Textarea } from '@/components/ui/form/textarea';

import { DatePicker } from '@/components/ui/form/date-picker';

import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { NumberInput } from '@/components/ui/form/number-input';

type Mode = 'create' | 'edit';

type Client = {
    id: number;
    name: string;
    client_id?: string | null;
    company_name?: string | null;
    phone?: string | null;
    address?: string | null;
};

type Warehouse = {
    id: number;
    code?: string | null;
    name: string;
};

type ReturnableItem = {
    id: number;
    product_id: number;

    product?: {
        id: number;
        code?: string | null;
        name: string;
    } | null;

    sold_quantity: number;
    returned_quantity: number;
    available_quantity: number;
    unit_price: number;
    unit?: string | null;
};

type InvoiceSuggestion = {
    id: number;
    invoice_no: string;
    invoice_date?: string | null;

    warehouse_id: number;

    client?: Client | null;

    warehouse?: Warehouse | null;

    label: string;

    items: ReturnableItem[];
};

type SelectedItem = {
    sales_invoice_item_id: number;
    product_id: number;

    product_code: string;
    product_name: string;

    unit: string;

    sold_quantity: number;
    returned_quantity: number;
    available_quantity: number;

    return_quantity: number;

    unit_price: number;
    line_total: number;
};

type ExistingReturn = {
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

        client?: Client | null;

        warehouse?: Warehouse | null;
    } | null;

    warehouse?: Warehouse | null;

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
    mode: Mode;

    salesReturn?: ExistingReturn | null;
};

const money = (value: number) =>
    value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function SalesReturnForm({ mode, salesReturn = null }: Props) {
    const isEdit = mode === 'edit';

    const [invoice, setInvoice] = useState<InvoiceSuggestion | null>(null);

    const [items, setItems] = useState<SelectedItem[]>([]);

    const [returnDate, setReturnDate] = useState(
        salesReturn?.return_date ?? new Date().toISOString().slice(0, 10),
    );

    const [remarks, setRemarks] = useState(salesReturn?.remarks ?? '');

    const [loadingInvoice, setLoadingInvoice] = useState(false);

    const [processing, setProcessing] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isEdit || !salesReturn?.invoice) {
            return;
        }

        const existingInvoice = salesReturn.invoice;

        const existingItems = salesReturn.items ?? [];

        setInvoice({
            id: existingInvoice.id,

            invoice_no: existingInvoice.invoice_no,

            invoice_date: existingInvoice.invoice_date ?? null,

            warehouse_id:
                existingInvoice.warehouse?.id ?? salesReturn.warehouse_id,

            client: existingInvoice.client ?? null,

            warehouse:
                existingInvoice.warehouse ?? salesReturn.warehouse ?? null,

            label: existingInvoice.invoice_no,

            items: [],
        });

        const mappedItems = existingItems.map((item) => {
            const quantity = Number(item.quantity);

            const unitPrice = Number(item.unit_price);

            return {
                sales_invoice_item_id: item.sales_invoice_item_id,

                product_id: item.product_id,

                product_code: item.product?.code ?? '',

                product_name: item.product?.name ?? 'Unknown Product',

                unit: item.product?.unit?.name ?? '',

                sold_quantity: Number(item.invoice_item?.quantity ?? quantity),

                returned_quantity: 0,

                available_quantity: quantity,

                return_quantity: quantity,

                unit_price: unitPrice,

                line_total: Number(item.line_total ?? quantity * unitPrice),
            };
        });

        setItems(mappedItems);
    }, [isEdit, salesReturn]);

    const total = useMemo(
        () =>
            items.reduce((sum, item) => sum + Number(item.line_total || 0), 0),
        [items],
    );

    const searchInvoices = async (
        keyword: string,
        signal?: AbortSignal,
    ): Promise<InvoiceSuggestion[]> => {
        const search = keyword.trim();

        try {
            const params = new URLSearchParams();

            params.set('keyword', search);

            const response = await fetch(
                `/operations/sales/returns/search-invoices?${params.toString()}`,
                {
                    method: 'GET',

                    headers: {
                        Accept: 'application/json',

                        'X-Requested-With': 'XMLHttpRequest',
                    },

                    credentials: 'same-origin',

                    signal,
                },
            );

            if (!response.ok) {
                console.error(
                    'Sales invoice search failed:',
                    response.status,
                    response.statusText,
                );

                return [];
            }

            const data = await response.json();

            console.log('Sales return invoice results:', data);

            if (!Array.isArray(data)) {
                console.error('Invalid sales invoice search response:', data);

                return [];
            }

            return data as InvoiceSuggestion[];
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return [];
            }

            console.error('Sales invoice search error:', error);

            return [];
        }
    };

    const selectInvoice = (selected: InvoiceSuggestion | null) => {
        if (!selected) {
            return;
        }

        setInvoice(selected);

        const mapped = selected.items.map((item) => {
            const available = Number(item.available_quantity ?? 0);

            const unitPrice = Number(item.unit_price ?? 0);

            return {
                sales_invoice_item_id: Number(item.id),

                product_id: Number(item.product_id),

                product_code: item.product?.code ?? '',

                product_name: item.product?.name ?? 'Unknown Product',

                unit: item.unit ?? '',

                sold_quantity: Number(item.sold_quantity ?? 0),

                returned_quantity: Number(item.returned_quantity ?? 0),

                available_quantity: available,

                return_quantity: available,

                unit_price: unitPrice,

                line_total: available * unitPrice,
            };
        });

        setItems(mapped);

        setErrors((previous) => {
            const next = {
                ...previous,
            };

            delete next.sales_invoice_id;
            delete next.items;

            return next;
        });
    };

    const updateQuantity = (index: number, value: string) => {
        const quantity = Number(value);

        setItems((previous) =>
            previous.map((item, itemIndex) => {
                if (itemIndex !== index) {
                    return item;
                }

                const safeQuantity = Number.isFinite(quantity)
                    ? Math.max(0, Math.min(quantity, item.available_quantity))
                    : 0;

                return {
                    ...item,

                    return_quantity: safeQuantity,

                    line_total: safeQuantity * item.unit_price,
                };
            }),
        );
    };

    const removeItem = (index: number) => {
        setItems((previous) =>
            previous.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const addItem = () => {
        if (!invoice) {
            return;
        }

        const availableItems = invoice.items.filter(
            (invoiceItem) =>
                invoiceItem.available_quantity > 0 &&
                !items.some(
                    (item) => item.sales_invoice_item_id === invoiceItem.id,
                ),
        );

        if (availableItems.length === 0) {
            return;
        }

        const item = availableItems[0];

        const available = Number(item.available_quantity);

        const unitPrice = Number(item.unit_price);

        setItems((previous) => [
            ...previous,

            {
                sales_invoice_item_id: item.id,

                product_id: item.product_id,

                product_code: item.product?.code ?? '',

                product_name: item.product?.name ?? 'Unknown Product',

                unit: item.unit ?? '',

                sold_quantity: Number(item.sold_quantity),

                returned_quantity: Number(item.returned_quantity),

                available_quantity: available,

                return_quantity: available,

                unit_price: unitPrice,

                line_total: available * unitPrice,
            },
        ]);
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!invoice) {
            nextErrors.sales_invoice_id = 'Please select a sales invoice.';
        }

        if (!returnDate) {
            nextErrors.return_date = 'Return date is required.';
        }

        if (items.length === 0) {
            nextErrors.items = 'Please add at least one product.';
        }

        items.forEach((item, index) => {
            if (item.return_quantity <= 0) {
                nextErrors[`items.${index}.return_quantity`] =
                    'Quantity must be greater than zero.';
            }

            if (item.return_quantity > item.available_quantity) {
                nextErrors[`items.${index}.return_quantity`] =
                    `Maximum return quantity is ${item.available_quantity}.`;
            }
        });

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const payload = {
            sales_invoice_id: invoice!.id,

            return_date: returnDate,

            remarks: remarks.trim() || null,

            items: items.map((item) => ({
                sales_invoice_item_id: item.sales_invoice_item_id,

                return_quantity: item.return_quantity,
            })),
        };

        setProcessing(true);

        if (isEdit && salesReturn) {
            router.put(`/operations/sales/returns/${salesReturn.id}`, payload, {
                preserveScroll: true,

                onError: (serverErrors) => {
                    setErrors(serverErrors as Record<string, string>);
                },

                onFinish: () => {
                    setProcessing(false);
                },
            });

            return;
        }

        router.post('/operations/sales/returns', payload, {
            preserveScroll: true,

            onError: (serverErrors) => {
                setErrors(serverErrors as Record<string, string>);
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <form onSubmit={submit}>
            <div className="row g-3">
                <div className="col-lg-8">
                    <Card>
                        <CardHeader>
                            <h5 className="mb-0">
                                {isEdit
                                    ? 'Edit Sales Return'
                                    : 'Create Sales Return'}
                            </h5>
                        </CardHeader>

                        <CardBody>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Sales Invoice
                                        <span className="text-danger"> *</span>
                                    </label>

                                    <SuggestionSearchInput<InvoiceSuggestion>
                                        searchFn={searchInvoices}
                                        idKey="id"
                                        labelKey="label"
                                        secondaryLabelKey="invoice_no"
                                        placeholder="Search invoice number or customer..."
                                        disabled={isEdit}
                                        clearOnFocus={false}
                                        showSearchIcon
                                        emptyLabel="No sales invoices found."
                                        loadingLabel="Searching invoices..."
                                        onSelect={selectInvoice}
                                        onClear={() => {
                                            setInvoice(null);
                                            setItems([]);
                                        }}
                                        renderOption={(invoice) => (
                                            <div>
                                                <div className="f-w-500">
                                                    {invoice.invoice_no}
                                                    {' - '}
                                                    {invoice.client?.name ??
                                                        'No customer'}
                                                </div>

                                                <small className="f-light d-block">
                                                    {invoice.client?.client_id
                                                        ? `Customer: ${invoice.client.client_id}`
                                                        : 'Customer: -'}
                                                    {' • '}
                                                    {invoice.items.length}{' '}
                                                    returnable item
                                                    {invoice.items.length !== 1
                                                        ? 's'
                                                        : ''}
                                                </small>
                                            </div>
                                        )}
                                    />

                                    {errors.sales_invoice_id && (
                                        <div className="text-danger small mt-1">
                                            {errors.sales_invoice_id}
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Return Date
                                        <span className="text-danger"> *</span>
                                    </label>
                                    <DatePicker
                                        value={returnDate}
                                        onChange={(value) =>
                                            setReturnDate(value)
                                        }
                                        dateFormat="Y-m-d"
                                        allowInput
                                        required
                                    />

                                    {errors.return_date && (
                                        <div className="text-danger small mt-1">
                                            {errors.return_date}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {invoice && (
                                <div className="border rounded p-3 mt-4">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">
                                                Invoice
                                            </small>

                                            <strong>
                                                {invoice.invoice_no}
                                            </strong>
                                        </div>

                                        <div className="col-md-4">
                                            <small className="text-muted d-block">
                                                Customer
                                            </small>

                                            <strong>
                                                {invoice.client?.name ?? '-'}
                                            </strong>
                                        </div>

                                        <div className="col-md-4">
                                            <small className="text-muted d-block">
                                                Warehouse
                                            </small>

                                            <strong>
                                                {invoice.warehouse?.name ?? '-'}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                                <div>
                                    <h6 className="mb-1">Return Products</h6>

                                    <small className="text-muted">
                                        Reduce or remove quantities before
                                        submitting.
                                    </small>
                                </div>

                                {/* {!isEdit && invoice && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="primary"
                                        appearance="outline"
                                        onClick={addItem}
                                    >
                                        <Plus size={15} className="me-1" />
                                        Add Product
                                    </Button>
                                )} */}
                            </div>

                            {errors.items && (
                                <div className="alert alert-danger py-2">
                                    {errors.items}
                                </div>
                            )}

                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead>
                                        <tr>
                                            <th>Product</th>

                                            <th>Sold</th>

                                            <th>Returned</th>

                                            <th>Available</th>

                                            <th>Return Qty</th>

                                            <th>Unit Price</th>

                                            <th>Total</th>

                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.length > 0 ? (
                                            items.map((item, index) => (
                                                <tr
                                                    key={
                                                        item.sales_invoice_item_id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {item.product_name}
                                                        </strong>

                                                        <small className="d-block text-muted">
                                                            {item.product_code}
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {money(
                                                            item.sold_quantity,
                                                        )}
                                                    </td>

                                                    <td>
                                                        {money(
                                                            item.returned_quantity,
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {money(
                                                                item.available_quantity,
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td
                                                        style={{
                                                            minWidth: 130,
                                                        }}
                                                    >
                                                        <NumberInput
                                                            min={0}
                                                            max={
                                                                item.available_quantity
                                                            }
                                                            step={0.01}
                                                            value={
                                                                item.return_quantity
                                                            }
                                                            zeroAsEmpty={true}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateQuantity(
                                                                    index,
                                                                    String(
                                                                        value,
                                                                    ),
                                                                )
                                                            }
                                                        />

                                                        {errors[
                                                            `items.${index}.return_quantity`
                                                        ] && (
                                                            <small className="text-danger">
                                                                {
                                                                    errors[
                                                                        `items.${index}.return_quantity`
                                                                    ]
                                                                }
                                                            </small>
                                                        )}
                                                    </td>

                                                    <td>
                                                        {money(item.unit_price)}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {money(
                                                                item.line_total,
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="danger"
                                                            appearance="outline"
                                                            title="Remove"
                                                            onClick={() =>
                                                                removeItem(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={15} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="text-center text-muted py-4"
                                                >
                                                    <Search
                                                        size={22}
                                                        className="mb-2"
                                                    />

                                                    <div>
                                                        Select a sales invoice
                                                        to load returnable
                                                        products.
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="col-lg-4">
                    <Card>
                        <CardHeader>
                            <h5 className="mb-0">Return Summary</h5>
                        </CardHeader>

                        <CardBody>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Products</span>

                                <strong>{items.length}</strong>
                            </div>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Total Quantity</span>

                                <strong>
                                    {money(
                                        items.reduce(
                                            (sum, item) =>
                                                sum + item.return_quantity,
                                            0,
                                        ),
                                    )}
                                </strong>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between">
                                <span>Return Amount</span>

                                <h5 className="mb-0">{money(total)}</h5>
                            </div>

                            <div className="mt-3">
                                <label className="form-label">Remarks</label>

                                <Textarea
                                    rows={5}
                                    value={remarks}
                                    placeholder="Enter remarks..."
                                    onChange={(event) =>
                                        setRemarks(event.target.value)
                                    }
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    disabled={processing}
                                    onClick={() =>
                                        router.visit(
                                            '/operations/sales/returns',
                                        )
                                    }
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={processing || loadingInvoice}
                                >
                                    {processing
                                        ? isEdit
                                            ? 'Updating...'
                                            : 'Saving...'
                                        : isEdit
                                          ? 'Update Return'
                                          : 'Save Return'}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </form>
    );
}
