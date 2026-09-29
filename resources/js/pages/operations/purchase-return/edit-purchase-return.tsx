import { useMemo, useState, type FormEvent } from 'react';

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

import { Textarea } from '@/components/ui/form/textarea';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Trash } from 'react-feather';

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

type Product = {
    id: number;

    code: string;

    name: string;
};

type PurchaseReturnItem = {
    id: number;

    product_id: number;

    quantity: number;

    unit_price: number;

    tax_amount: number;

    line_total: number;

    product: Product | null;
};

type PurchaseReturn = {
    id: number;

    return_no: string;

    vendor_id: number;

    warehouse_id: number;

    purchase_order_id: number | null;

    return_date: string;

    status: string;

    note: string | null;

    document: string | null;

    vendor: Vendor | null;

    warehouse: Warehouse | null;

    items: PurchaseReturnItem[];
};

type Props = {
    purchaseReturn: PurchaseReturn;
};

type PurchaseReturnItemForm = {
    product_id: number;

    quantity: number;

    unit_price: number;

    tax_amount: number;

    line_total: number;

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    item_id: number;

    code: string;

    name: string;
};

type FormData = {
    vendor_id: number;

    warehouse_id: number;

    return_date: string;

    note: string;

    attachments: File[];

    items: PurchaseReturnItemForm[];
};

const MAX_FILES = 1;

const MAX_TOTAL_FILE_SIZE = 30 * 1024 * 1024;

function formatQuantity(value: number) {
    return Number(value ?? 0).toFixed(2);
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EditPurchaseReturn({ purchaseReturn }: Props) {
    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const [fileError, setFileError] = useState<string | null>(null);

    const [itemError, setItemError] = useState<string | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const {
        data,

        setData,

        put,

        processing,

        errors,

        clearErrors,

        transform,
    } = useForm<FormData>({
        vendor_id: purchaseReturn.vendor_id,

        warehouse_id: purchaseReturn.warehouse_id,

        return_date: purchaseReturn.return_date,

        note: purchaseReturn.note ?? '',

        attachments: [],

        items: purchaseReturn.items.map((item) => ({
            product_id: item.product_id,

            quantity: Number(item.quantity),

            unit_price: Number(item.unit_price),

            tax_amount: Number(item.tax_amount),

            line_total: Number(item.line_total),

            item_id: item.product_id,

            code: item.product?.code ?? '',

            name: item.product?.name ?? '',
        })),
    });

    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    const subtotal = useMemo(
        () =>
            data.items.reduce(
                (total, item) => total + Number(item.line_total),

                0,
            ),

        [data.items],
    );

    const totalQuantity = useMemo(
        () =>
            data.items.reduce(
                (total, item) => total + Number(item.quantity),

                0,
            ),

        [data.items],
    ); /*
    |--------------------------------------------------------------------------
    | Update Quantity
    |--------------------------------------------------------------------------
    */

    const updateQuantity = (index: number, value: number) => {
        const items = [...data.items];

        const item = items[index];

        if (!item) {
            return;
        }

        const quantity = Number.isFinite(value) ? value : 0;

        items[index] = {
            ...item,

            quantity,

            line_total: quantity * item.unit_price,
        };

        setData('items', items);

        clearErrors(`items.${index}.quantity`);
    };

    /*
    |--------------------------------------------------------------------------
    | Remove Item
    |--------------------------------------------------------------------------
    */

    const removeItem = (index: number) => {
        const items = data.items.filter((_, itemIndex) => itemIndex !== index);

        setData('items', items);

        clearErrors('items');

        if (items.length === 0) {
            setItemError('Please keep at least one item.');
        }
    };

    /*
    |--------------------------------------------------------------------------
    | File Handler
    |--------------------------------------------------------------------------
    */

    const handleFilesChange = (value: File | File[] | null) => {
        const files = Array.isArray(value) ? value : value ? [value] : [];

        if (files.length > MAX_FILES) {
            setFileError(`Maximum ${MAX_FILES} file allowed.`);

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
    };

    /*
    |--------------------------------------------------------------------------
    | Submit Update
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setItemError(null);

        const selectedItems = data.items.filter(
            (item) => Number(item.quantity) > 0,
        );

        if (selectedItems.length === 0) {
            setItemError('Please add at least one item.');

            return;
        }

        clearErrors();

        transform((formData) => ({
            vendor_id: formData.vendor_id,

            warehouse_id: formData.warehouse_id,

            return_date: formData.return_date,

            note: formData.note,

            attachments: formData.attachments,

            items: selectedItems.map((item) => ({
                product_id: item.product_id,

                quantity: Number(item.quantity),

                unit_price: Number(item.unit_price),

                tax_amount: Number(item.tax_amount),

                line_total: Number(item.line_total),
            })),
        }));

        put(`/purchase-returns/${purchaseReturn.id}`, {
            preserveScroll: true,

            forceFormData: true,
        });
    };
    return (
        <>
            <Head title="Edit Purchase Return" />

            <PageTitle title="Edit Purchase Return" />

            <div className="container-fluid">
                {(itemError || fileError) && (
                    <div className="alert alert-danger">
                        <ul className="mb-0">
                            {itemError && <li>{itemError}</li>}

                            {fileError && <li>{fileError}</li>}
                        </ul>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Edit Purchase Return</h4>

                            <Button
                                type="button"
                                variant="secondary"
                                appearance="outline"
                                onClick={() =>
                                    router.visit('/purchase-returns')
                                }
                            >
                                Back
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel>Vendor</FormLabel>

                                            <Input
                                                value={
                                                    purchaseReturn.vendor
                                                        ?.name ?? ''
                                                }

                                                disabled
                                            />
                                        </FormField>
                                    </div>

                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel>Warehouse</FormLabel>

                                            <Input
                                                value={
                                                    purchaseReturn.warehouse
                                                        ?.name ?? ''
                                                }

                                                disabled
                                            />
                                        </FormField>
                                    </div>

                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel required>
                                                Return Date
                                            </FormLabel>

                                            <DatePicker
                                                mode="single"

                                                value={data.return_date}

                                                disabled={processing}

                                                error={errors.return_date}

                                                onChange={(value) =>
                                                    setData(
                                                        'return_date',
                                                        value,
                                                    )
                                                }
                                            />

                                            <FormError
                                                error={errors.return_date}
                                            />
                                        </FormField>
                                    </div>

                                    <div className="mb-3">
                                        <FormField>
                                            <FormLabel>Note</FormLabel>

                                            <Textarea
                                                rows={4}

                                                value={data.note}

                                                disabled={processing}

                                                onChange={(event) =>
                                                    setData(
                                                        'note',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mt-3">
                                        <FileDropzone
                                            value={data.attachments}

                                            onChange={handleFilesChange}

                                            multiple

                                            maxFiles={MAX_FILES}

                                            showImagePreview

                                            previewInsideDropzone

                                            previewHeight={120}

                                            placeholder="Upload updated document"

                                            disabled={processing}

                                            error={
                                                fileError ?? errors.attachments
                                            }
                                        />
                                    </div>

                                    {purchaseReturn.document && (
                                        <div className="mt-3">
                                            <a
                                                href={`/storage/${purchaseReturn.document}`}

                                                target="_blank"

                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                View Existing Document
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Return Items</h5>

                                <div>
                                    <small className="text-muted d-block">
                                        Quantity:{' '}
                                        {formatQuantity(totalQuantity)}
                                    </small>

                                    <small className="text-muted">
                                        Amount: {subtotal.toFixed(2)}
                                    </small>
                                </div>
                            </div>

                            <Table wrapperClassName="overflow-auto">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SL</TableHead>

                                        <TableHead>Product</TableHead>

                                        <TableHead>Quantity</TableHead>

                                        <TableHead>Unit Price</TableHead>

                                        <TableHead>Total</TableHead>

                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {data.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>
                                                <Textarea
                                                    rows={2}

                                                    value={item.name}

                                                    disabled
                                                />

                                                <small className="text-muted">
                                                    #{item.code}
                                                </small>
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    type="number"

                                                    min="0"

                                                    step="0.01"

                                                    value={item.quantity}

                                                    disabled={processing}

                                                    onChange={(event) =>
                                                        updateQuantity(
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
                                                <Input
                                                    type="number"

                                                    value={item.unit_price}

                                                    disabled
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {Number(
                                                    item.line_total,
                                                ).toFixed(2)}
                                            </TableCell>

                                            <TableCell>
                                                <Button
                                                    type="button"

                                                    variant="danger"

                                                    size="xs"

                                                    disabled={processing}

                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                >
                                                    <Trash size={18} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-4 d-flex justify-content-end">
                                <Button
                                    type="submit"

                                    variant="primary"

                                    disabled={
                                        processing || data.items.length === 0
                                    }
                                >
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Purchase Return'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
