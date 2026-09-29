import { useCallback, useMemo, useState, type FormEvent } from 'react';

import { Head, router, useForm } from '@inertiajs/react';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { DatePicker } from '@/components/ui/form/date-picker';

import { FileDropzone } from '@/components/ui/form/file-dropzone';

import { Input } from '@/components/ui/form/input';

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
import { Delete, Trash } from 'react-feather';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Vendor = {
    id: number;

    vendor_id: string | null;

    name: string;
};

type Warehouse = {
    id: number;

    name: string;
};

type PurchaseOrderSuggestion = {
    id: number;

    order_id: string;

    label: string;

    secondary: string;

    status: 'Received' | 'Partial';

    order_date: string | null;

    vendor: Vendor | null;

    warehouse: Warehouse | null;
};

type PurchaseReturnItemResponse = {
    purchase_item_id: number;

    product_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    po_quantity: number;

    received_quantity: number;

    returned_quantity: number;

    quantity: number;

    unit_price: number;

    tax_amount: number;

    line_total: number;
};

type PurchaseReturnItemsResponse = {
    meta: {
        id: number;

        order_id: string;

        vendor: Vendor | null;

        warehouse: Warehouse | null;
    };

    items: PurchaseReturnItemResponse[];
};

type PurchaseReturnItemForm = {
    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    */

    product_id: number;

    quantity: number;

    unit_price: number;

    tax_amount: number;

    line_total: number;

    /*
    |--------------------------------------------------------------------------
    | UI Only
    |--------------------------------------------------------------------------
    */

    purchase_item_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    po_quantity: number;

    received_quantity: number;

    returned_quantity: number;

    returnable_quantity: number;
};

type PurchaseReturnFormData = {
    purchase_order_id: number | null;

    return_date: string;

    attachments: File[];

    note: string;

    items: PurchaseReturnItemForm[];
};

const MAX_FILES = 1;

const MAX_TOTAL_FILE_SIZE = 30 * 1024 * 1024;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatQuantity(value: number) {
    return Number(value ?? 0).toFixed(2);
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CreatePurchaseReturn() {
    /*
    |--------------------------------------------------------------------------
    | Selected Purchase Order
    |--------------------------------------------------------------------------
    */

    const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
        useState<PurchaseOrderSuggestion | null>(null);

    const [poSearchKey, setPoSearchKey] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [loadingItems, setLoadingItems] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const [itemError, setItemError] = useState<string | null>(null);

    const [fileError, setFileError] = useState<string | null>(null);

    const [purchaseOrderError, setPurchaseOrderError] = useState<string | null>(
        null,
    );

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const {
        data,

        setData,

        post,

        processing,

        errors,

        clearErrors,

        transform,
    } = useForm<PurchaseReturnFormData>({
        purchase_order_id: null,

        return_date: '',

        attachments: [],

        note: '',

        items: [],
    });

    /*
    |--------------------------------------------------------------------------
    | Field Errors
    |--------------------------------------------------------------------------
    */

    const fieldErrors = errors as Record<string, string>;

    const getError = (key: string) => fieldErrors[key];

    /*
    |--------------------------------------------------------------------------
    | Validation Summary
    |--------------------------------------------------------------------------
    */

    const errorMessages = useMemo(
        () => Array.from(new Set(Object.values(fieldErrors).filter(Boolean))),

        [fieldErrors],
    );
    /*
    |--------------------------------------------------------------------------
    | Purchase Order Search
    |--------------------------------------------------------------------------
    */

    const searchPurchaseOrders = useCallback(
        async (
            query: string,
            signal?: AbortSignal,
        ): Promise<PurchaseOrderSuggestion[]> => {
            const params = new URLSearchParams();

            params.set('keyword', query);

            const response = await fetch(
                `/purchase-return-search-po?${params.toString()}`,
                {
                    signal,

                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to search Purchase Orders.');
            }

            return (await response.json()) as PurchaseOrderSuggestion[];
        },

        [],
    );

    /*
    |--------------------------------------------------------------------------
    | Load Purchase Return Items
    |--------------------------------------------------------------------------
    */

    const loadPurchaseOrderItems = async (purchaseOrderId: number) => {
        setLoadingItems(true);

        setItemError(null);

        try {
            const params = new URLSearchParams();

            params.set('purchase_order_id', String(purchaseOrderId));

            const response = await fetch(
                `/purchase-return-search-po-items?${params.toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ?? 'Failed to load Purchase Order items.',
                );
            }

            const responseData = result as PurchaseReturnItemsResponse;

            if (responseData.items.length === 0) {
                setData('items', []);

                setItemError('This Purchase Order has no returnable quantity.');

                return;
            }

            /*
                |--------------------------------------------------------------------------
                | Map API Response
                |--------------------------------------------------------------------------
                */

            const items: PurchaseReturnItemForm[] = responseData.items.map(
                (item) => {
                    const quantity = Number(item.quantity);

                    const unitPrice = Number(item.unit_price);

                    return {
                        purchase_item_id: item.purchase_item_id,

                        product_id: item.product_id,

                        item_id: item.item_id,

                        code: item.code,

                        name: item.name,

                        unit: item.unit,

                        po_quantity: Number(item.po_quantity),

                        received_quantity: Number(item.received_quantity),

                        returned_quantity: Number(item.returned_quantity),

                        returnable_quantity: quantity,

                        /*
                                |--------------------------------------------------------------------------
                                | Default return full available quantity
                                |--------------------------------------------------------------------------
                                */

                        quantity,

                        unit_price: unitPrice,

                        tax_amount: Number(item.tax_amount ?? 0),

                        line_total: quantity * unitPrice,
                    };
                },
            );

            setData('items', items);

            clearErrors('items');
        } catch (error) {
            console.error(error);

            setData('items', []);

            setItemError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load Purchase Order items.',
            );
        } finally {
            setLoadingItems(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Purchase Order Selected
    |--------------------------------------------------------------------------
    */

    const handlePurchaseOrderSelect = (
        purchaseOrder: PurchaseOrderSuggestion,
    ) => {
        setSelectedPurchaseOrder(purchaseOrder);

        setData('purchase_order_id', purchaseOrder.id);

        setData('items', []);

        setItemError(null);

        setPurchaseOrderError(null);

        clearErrors('purchase_order_id');

        clearErrors('items');

        void loadPurchaseOrderItems(purchaseOrder.id);
    };

    /*
    |--------------------------------------------------------------------------
    | Clear Selected Purchase Order
    |--------------------------------------------------------------------------
    */

    const clearPurchaseOrder = () => {
        setSelectedPurchaseOrder(null);

        setData('purchase_order_id', null);

        setData('items', []);

        setItemError(null);

        setPurchaseOrderError(null);

        setPoSearchKey((current) => current + 1);
    };

    /*
    |--------------------------------------------------------------------------
    | Return Date
    |--------------------------------------------------------------------------
    */

    const handleReturnDateChange = (value: string) => {
        setData('return_date', value);

        clearErrors('return_date');
    };

    /*
    |--------------------------------------------------------------------------
    | Update Return Quantity
    |--------------------------------------------------------------------------
    */

    const updateReturnQuantity = (index: number, value: number) => {
        const items = [...data.items];

        const item = items[index];

        if (!item) {
            return;
        }

        let quantity = Number.isFinite(value) ? value : 0;

        if (quantity < 0) {
            quantity = 0;
        }

        /*
            |--------------------------------------------------------------------------
            | Cannot exceed returnable quantity
            |--------------------------------------------------------------------------
            */

        if (quantity > item.returnable_quantity) {
            quantity = item.returnable_quantity;
        }

        items[index] = {
            ...item,

            quantity,

            line_total: quantity * item.unit_price,
        };

        setData('items', items);

        setItemError(null);

        clearErrors(`items.${index}.quantity`);
    };
    /*
    |--------------------------------------------------------------------------
    | Files
    |--------------------------------------------------------------------------
    */

    const handleFilesChange = (value: File | File[] | null) => {
        const files = Array.isArray(value) ? value : value ? [value] : [];

        if (files.length > MAX_FILES) {
            setFileError(`Maximum ${MAX_FILES} files allowed.`);

            return;
        }

        const totalSize = files.reduce(
            (total, file) => total + file.size,

            0,
        );

        if (totalSize > MAX_TOTAL_FILE_SIZE) {
            setFileError('Total file size cannot exceed 30 MB.');

            return;
        }

        setFileError(null);

        setData('attachments', files);

        clearErrors('attachments');
    };

    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    const selectedItemCount = useMemo(
        () => data.items.filter((item) => Number(item.quantity) > 0).length,

        [data.items],
    );

    const totalReturnQuantity = useMemo(
        () =>
            data.items.reduce(
                (total, item) => {
                    return (
                        total +
                        (Number(item.quantity) > 0 ? Number(item.quantity) : 0)
                    );
                },

                0,
            ),

        [data.items],
    );

    const subtotal = useMemo(
        () =>
            data.items.reduce(
                (total, item) => total + (Number(item.line_total) || 0),

                0,
            ),

        [data.items],
    );

    /*
|--------------------------------------------------------------------------
| Remove Return Item
|--------------------------------------------------------------------------
*/

    const removeReturnItem = (index: number) => {
        const items = data.items.filter((_, itemIndex) => itemIndex !== index);

        setData('items', items);

        clearErrors('items');

        if (items.length === 0) {
            setItemError('Please select at least one return item.');
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setItemError(null);

        setPurchaseOrderError(null);

        /*
            |--------------------------------------------------------------------------
            | Purchase Order
            |--------------------------------------------------------------------------
            */

        if (!data.purchase_order_id) {
            setPurchaseOrderError('Please select a Purchase Order.');

            return;
        }

        /*
            |--------------------------------------------------------------------------
            | Return Date
            |--------------------------------------------------------------------------
            */

        if (!data.return_date) {
            return;
        }

        /*
            |--------------------------------------------------------------------------
            | Items
            |--------------------------------------------------------------------------
            */

        const selectedItems = data.items.filter(
            (item) => Number(item.quantity) > 0,
        );

        if (selectedItems.length === 0) {
            setItemError('Please enter return quantity for at least one item.');

            return;
        }

        /*
            |--------------------------------------------------------------------------
            | Quantity Validation
            |--------------------------------------------------------------------------
            */

        const invalidItem = selectedItems.find(
            (item) => Number(item.quantity) > Number(item.returnable_quantity),
        );

        if (invalidItem) {
            setItemError(
                `Return quantity for "${invalidItem.name}" cannot exceed available return quantity ${formatQuantity(
                    invalidItem.returnable_quantity,
                )}.`,
            );

            return;
        }

        clearErrors();

        /*
            |--------------------------------------------------------------------------
            | Prepare Payload
            |--------------------------------------------------------------------------
            */

        transform((formData) => ({
            purchase_order_id: formData.purchase_order_id,

            vendor_id: selectedPurchaseOrder?.vendor?.id ?? null,

            warehouse_id: selectedPurchaseOrder?.warehouse?.id ?? null,

            return_date: formData.return_date,

            attachments: formData.attachments,

            note: formData.note,

            items: selectedItems.map((item) => ({
                product_id: item.product_id,

                quantity: Number(item.quantity),

                unit_price: Number(item.unit_price),

                tax_amount: Number(item.tax_amount),

                line_total: Number(item.line_total),
            })),
        }));

        post('/purchase-returns', {
            preserveScroll: true,

            forceFormData: true,
        });
    }; /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Create Purchase Return" />

            <PageTitle title="Create Purchase Return" />

            <div className="container-fluid">
                {(errorMessages.length > 0 ||
                    fileError ||
                    itemError ||
                    purchaseOrderError) && (
                    <div className="alert alert-danger">
                        <strong>
                            There were some problems with your input:
                        </strong>

                        <ul className="mb-0 mt-2">
                            {errorMessages.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}

                            {purchaseOrderError && (
                                <li>{purchaseOrderError}</li>
                            )}

                            {itemError && <li>{itemError}</li>}

                            {fileError && <li>{fileError}</li>}
                        </ul>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-2">
                            <h4 className="mb-0">Create Purchase Return</h4>

                            <Button
                                type="button"
                                variant="primary"
                                appearance="outline"
                                disabled={processing}
                                onClick={() =>
                                    router.visit('/purchase-returns')
                                }
                            >
                                Go Back
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                {/* LEFT SIDE */}

                                <div className="col-md-6">
                                    <div
                                        className="mb-3"
                                        style={{
                                            borderRight: '1px solid #ddd',
                                        }}
                                    >
                                        {/* Purchase Order */}

                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Purchase Order
                                                </FormLabel>

                                                {!selectedPurchaseOrder ? (
                                                    <SuggestionSearchInput<PurchaseOrderSuggestion>
                                                        key={poSearchKey}

                                                        searchFn={
                                                            searchPurchaseOrders
                                                        }

                                                        idKey="id"

                                                        labelKey="label"

                                                        secondaryLabelKey="secondary"

                                                        placeholder="Search Purchase Order"

                                                        showSearchIcon={false}

                                                        clearOnFocus={false}

                                                        emptyLabel="No returnable Purchase Order found."

                                                        onSelect={
                                                            handlePurchaseOrderSelect
                                                        }
                                                    />
                                                ) : (
                                                    <div className="d-flex gap-2">
                                                        <Input
                                                            value={
                                                                selectedPurchaseOrder.order_id
                                                            }

                                                            readOnly

                                                            disabled
                                                        />

                                                        <Button
                                                            type="button"

                                                            variant="secondary"

                                                            appearance="outline"

                                                            onClick={
                                                                clearPurchaseOrder
                                                            }
                                                        >
                                                            Change
                                                        </Button>
                                                    </div>
                                                )}

                                                <FormError
                                                    error={
                                                        errors.purchase_order_id ??
                                                        purchaseOrderError ??
                                                        ''
                                                    }
                                                />
                                            </FormField>
                                        </div>

                                        {/* Vendor */}

                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel>Vendor</FormLabel>

                                                <Input
                                                    value={
                                                        selectedPurchaseOrder
                                                            ?.vendor?.name ?? ''
                                                    }

                                                    readOnly

                                                    disabled

                                                    placeholder="Vendor will load from PO"
                                                />
                                            </FormField>
                                        </div>

                                        {/* Warehouse */}

                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel>Warehouse</FormLabel>

                                                <Input
                                                    value={
                                                        selectedPurchaseOrder
                                                            ?.warehouse?.name ??
                                                        ''
                                                    }

                                                    readOnly

                                                    disabled

                                                    placeholder="Warehouse will load from PO"
                                                />
                                            </FormField>
                                        </div>

                                        {/* Return Date */}

                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Return Date
                                                </FormLabel>

                                                <DatePicker
                                                    mode="single"

                                                    value={data.return_date}

                                                    placeholder="Select return date"

                                                    disabled={processing}

                                                    error={errors.return_date}

                                                    onChange={
                                                        handleReturnDateChange
                                                    }
                                                />

                                                <FormError
                                                    error={errors.return_date}
                                                />
                                            </FormField>
                                        </div>

                                        {/* Note */}

                                        <div className="mb-3">
                                            <FormField>
                                                <FormLabel>Note</FormLabel>

                                                <Textarea
                                                    rows={4}

                                                    value={data.note}

                                                    disabled={processing}

                                                    placeholder="Write return note..."

                                                    onChange={(event) => {
                                                        setData(
                                                            'note',
                                                            event.target.value,
                                                        );
                                                    }}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                {/* FILE */}

                                <div className="col-md-6">
                                    <div className="mt-4">
                                        <FileDropzone
                                            value={data.attachments}

                                            onChange={handleFilesChange}

                                            multiple

                                            maxFiles={MAX_FILES}

                                            showImagePreview

                                            previewInsideDropzone

                                            previewHeight={120}

                                            placeholder="Drop purchase return documents here."

                                            disabled={processing}

                                            error={
                                                fileError ?? errors.attachments
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* ITEMS TABLE */}

                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <h5>Return Items</h5>

                                    {selectedPurchaseOrder && (
                                        <Button
                                            onClick={() =>
                                                loadPurchaseOrderItems(selectedPurchaseOrder.id)
                                            }
                                        >
                                            Load All
                                        </Button>
                                    )}
                                </div>

                                {loadingItems && (
                                    <div className="alert alert-info py-2">
                                        Loading Purchase Order items...
                                    </div>
                                )}

                                <Table wrapperClassName="overflow-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SL</TableHead>

                                            <TableHead>Product</TableHead>

                                            <TableHead>Unit</TableHead>

                                            <TableHead className="text-end">
                                                Received
                                            </TableHead>

                                            <TableHead className="text-end">
                                                Returned
                                            </TableHead>

                                            <TableHead className="text-end">
                                                Available
                                            </TableHead>

                                            <TableHead>Return Qty</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {data.items.map((item, index) => (
                                            <TableRow
                                                key={item.purchase_item_id}
                                            >
                                                <TableCell>
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <Textarea
                                                        rows={2}

                                                        value={item.name}

                                                        readOnly

                                                        disabled
                                                    />

                                                    <small className="text-muted">
                                                        #{item.code}
                                                    </small>
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        value={item.unit}

                                                        disabled
                                                    />
                                                </TableCell>

                                                <TableCell className="text-end">
                                                    {formatQuantity(
                                                        item.received_quantity,
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-end">
                                                    {formatQuantity(
                                                        item.returned_quantity,
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-end">
                                                    <strong>
                                                        {formatQuantity(
                                                            item.returnable_quantity,
                                                        )}
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"

                                                        min="0"

                                                        max={
                                                            item.returnable_quantity
                                                        }

                                                        step="0.01"

                                                        value={item.quantity}

                                                        disabled={processing}

                                                        onChange={(event) =>
                                                            updateReturnQuantity(
                                                                index,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"

                                                        variant="danger"

                                                        size="xs"
                                                        className="px-4 py-1"

                                                        disabled={processing}

                                                        onClick={() =>
                                                            removeReturnItem(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash size={20} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-4 d-flex justify-content-end">
                                <Button
                                    type="submit"

                                    variant="primary"

                                    disabled={
                                        processing ||
                                        loadingItems ||
                                        data.items.length === 0
                                    }
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Purchase Return'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
