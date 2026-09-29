import {
    FormEvent,
    useMemo,
} from 'react';

import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';

import {
    FileText,
    Trash2,
} from 'react-feather';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import {
    Card,
    CardBody,
    CardHeader,
} from '@/components/ui/card';

import {
    DatePicker,
} from '@/components/ui/form/date-picker';

import {
    FileDropzone,
} from '@/components/ui/form/file-dropzone';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PaymentStatus =
    | 'Paid'
    | 'Due'
    | 'Partial-paid';

type Vendor = {
    id: number;

    vendor_id:
    | string
    | null;

    name: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;
};

type GoodsReceivedNote = {
    id: number;

    grn_no: string;
};

type BillItem = {
    id: number;

    code: string;

    name: string;

    unit:
    | string
    | null;

    quantity: number;

    unit_price: number;

    total_tax: number;

    discount: number;

    total_amount: number;
};

type Bill = {
    id: number;

    bill_no: string;

    bill_date:
    | string
    | null;

    due_date:
    | string
    | null;

    attachments:
    | string
    | null;

    sub_total: number;

    total_tax: number;

    total_discount: number;

    shipping_cost: number;

    grand_total: number;

    paid_amount: number;

    due_amount: number;

    payment_status:
    PaymentStatus;

    vendor:
    | Vendor
    | null;

    purchase_order:
    | PurchaseOrder
    | null;

    goods_received_note:
    | GoodsReceivedNote
    | null;

    items:
    BillItem[];
};

type Currency = {
    symbol?:
    | string
    | null;

    exchange_rate?:
    | string
    | number
    | null;
};

type Props = {
    bill:
    Bill;

    activeCurrency:
    | Currency
    | null;
};

type BillFormData = {
    _method:
    'put';

    bill_date:
    string;

    due_date:
    string;

    attachment:
    | File
    | null;

    remove_attachment:
    boolean;
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EditBillPage({
    bill,
    activeCurrency,
}: Props) {
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
    } =
        useForm<BillFormData>({
            _method:
                'put',

            bill_date:
                bill.bill_date ??
                '',

            due_date:
                bill.due_date ??
                '',

            attachment:
                null,

            remove_attachment:
                false,
        });

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const symbol =
        activeCurrency
            ?.symbol ??
        '$';

    const exchangeRate =
        Number(
            activeCurrency
                ?.exchange_rate ??
            1,
        ) || 1;

    const formatMoney =
        (
            amount: number,
        ) =>
            `${symbol} ${(
                Number(
                    amount ?? 0,
                ) *
                exchangeRate
            ).toLocaleString(
                'en-US',
                {
                    minimumFractionDigits:
                        2,

                    maximumFractionDigits:
                        2,
                },
            )}`;

    /*
    |--------------------------------------------------------------------------
    | Existing Attachment
    |--------------------------------------------------------------------------
    */

    const existingAttachmentUrl =
        useMemo(
            () => {
                if (
                    !bill.attachments
                ) {
                    return null;
                }

                if (
                    bill.attachments.startsWith(
                        'http://',
                    ) ||
                    bill.attachments.startsWith(
                        'https://',
                    )
                ) {
                    return bill.attachments;
                }

                return `/${bill.attachments.replace(
                    /^\/+/,
                    '',
                )}`;
            },
            [
                bill.attachments,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Attachment Change
    |--------------------------------------------------------------------------
    */

    const handleAttachmentChange =
        (
            value:
                | File
                | File[]
                | null,
        ) => {
            const file =
                Array.isArray(
                    value,
                )
                    ? value[
                    0
                    ] ??
                    null
                    : value;

            setData(
                'attachment',
                file,
            );

            if (file) {
                setData(
                    'remove_attachment',
                    false,
                );
            }

            clearErrors(
                'attachment',
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event:
            FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        post(
            `/bill/${bill.id}/edit`,
            {
                forceFormData:
                    true,

                preserveScroll:
                    true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Edit Bill" />

            <PageTitle title="Edit Bill" />

            <div className="container-fluid">
                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="row">
                        {/*
                        |--------------------------------------------------------------------------
                        | Main
                        |--------------------------------------------------------------------------
                        */}

                        <div className="col-lg-8">
                            <Card>
                                <CardHeader>
                                    <div>
                                        <h5 className="mb-1">
                                            Edit Bill{' '}
                                            {
                                                bill.bill_no
                                            }
                                        </h5>

                                        <p className="text-muted small mb-0">
                                            GRN, PO, vendor, items and financial amounts are locked because this bill was generated from an approved GRN.
                                        </p>
                                    </div>
                                </CardHeader>

                                <CardBody>
                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Source Information
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="row mb-4">
                                        <div className="col-md-4">
                                            <label className="form-label text-muted">
                                                Purchase Order
                                            </label>

                                            <div className="fw-semibold">
                                                {bill
                                                    .purchase_order
                                                    ?.order_id ??
                                                    '—'}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label text-muted">
                                                GRN
                                            </label>

                                            <div className="fw-semibold">
                                                {bill
                                                    .goods_received_note
                                                    ?.grn_no ??
                                                    '—'}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label text-muted">
                                                Vendor
                                            </label>

                                            <div className="fw-semibold">
                                                {bill.vendor
                                                    ?.name ??
                                                    '—'}
                                            </div>
                                        </div>
                                    </div>

                                    <hr />

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Dates
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <FormField>
                                                <FormLabel required>
                                                    Bill Date
                                                </FormLabel>

                                                <DatePicker
                                                    disabled
                                                    value={
                                                        data.bill_date
                                                    }
                                                    error={
                                                        errors.bill_date
                                                    }
                                                    onChange={(
                                                        value,
                                                    ) => {
                                                        setData(
                                                            'bill_date',
                                                            value,
                                                        );

                                                        clearErrors(
                                                            'bill_date',
                                                        );
                                                    }}
                                                />

                                                <FormError
                                                    error={
                                                        errors.bill_date
                                                    }
                                                />
                                            </FormField>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <FormField>
                                                <FormLabel>
                                                    Due Date
                                                </FormLabel>

                                                <DatePicker
                                                    value={
                                                        data.due_date
                                                    }
                                                    minDate={
                                                        data.bill_date ||
                                                        undefined
                                                    }
                                                    error={
                                                        errors.due_date
                                                    }
                                                    onChange={(
                                                        value,
                                                    ) => {
                                                        setData(
                                                            'due_date',
                                                            value,
                                                        );

                                                        clearErrors(
                                                            'due_date',
                                                        );
                                                    }}
                                                />

                                                <FormError
                                                    error={
                                                        errors.due_date
                                                    }
                                                />
                                            </FormField>
                                        </div>
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Existing Attachment
                                    |--------------------------------------------------------------------------
                                    */}

                                    {existingAttachmentUrl &&
                                        !data.remove_attachment && (
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Current Attachment
                                                </label>

                                                <div className="border rounded p-3 d-flex justify-content-between align-items-center gap-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FileText
                                                            size={
                                                                22
                                                            }
                                                        />

                                                        <a
                                                            href={
                                                                existingAttachmentUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            View current attachment
                                                        </a>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        disabled={
                                                            processing
                                                        }
                                                        onClick={() =>
                                                            setData(
                                                                'remove_attachment',
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={
                                                                15
                                                            }
                                                            className="me-1"
                                                        />

                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    {data.remove_attachment &&
                                        bill.attachments && (
                                            <div className="alert alert-warning py-2">
                                                Current attachment will be removed when you save.

                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link ms-2 p-0"
                                                    onClick={() =>
                                                        setData(
                                                            'remove_attachment',
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Undo
                                                </button>
                                            </div>
                                        )}

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | New Attachment
                                    |--------------------------------------------------------------------------
                                    */}

                                    <FormField>
                                        <FormLabel>
                                            {bill.attachments
                                                ? 'Replace Attachment'
                                                : 'Attachment'}
                                        </FormLabel>

                                        <FileDropzone
                                            value={
                                                data.attachment
                                            }
                                            onChange={
                                                handleAttachmentChange
                                            }
                                            disabled={
                                                processing
                                            }
                                            maxFiles={
                                                1
                                            }
                                            maxSize={
                                                5 *
                                                1024 *
                                                1024
                                            }
                                            accept={{
                                                'application/pdf': [
                                                    '.pdf',
                                                ],

                                                'image/jpeg': [
                                                    '.jpg',
                                                    '.jpeg',
                                                ],

                                                'image/png': [
                                                    '.png',
                                                ],
                                            }}
                                            showImagePreview
                                            previewInsideDropzone
                                            previewHeight={
                                                120
                                            }
                                            error={
                                                errors.attachment
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.attachment
                                            }
                                        />
                                    </FormField>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Items - Read Only
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="mt-4">
                                        <h5 className="mb-3">
                                            Bill Items
                                        </h5>

                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>
                                                            SL
                                                        </th>

                                                        <th>
                                                            Product
                                                        </th>

                                                        <th>
                                                            Unit
                                                        </th>

                                                        <th className="text-end">
                                                            Qty
                                                        </th>

                                                        <th className="text-end">
                                                            Price
                                                        </th>

                                                        <th className="text-end">
                                                            Amount
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {bill.items.map(
                                                        (
                                                            item,
                                                            index,
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    item.id
                                                                }
                                                            >
                                                                <td>
                                                                    {index +
                                                                        1}
                                                                </td>

                                                                <td>
                                                                    <strong>
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </strong>

                                                                    {item.code && (
                                                                        <small className="d-block text-muted">
                                                                            {
                                                                                item.code
                                                                            }
                                                                        </small>
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {item.unit ??
                                                                        '—'}
                                                                </td>

                                                                <td className="text-end">
                                                                    {Number(
                                                                        item.quantity,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </td>

                                                                <td className="text-end">
                                                                    {formatMoney(
                                                                        item.unit_price,
                                                                    )}
                                                                </td>

                                                                <td className="text-end">
                                                                    <strong>
                                                                        {formatMoney(
                                                                            item.total_amount,
                                                                        )}
                                                                    </strong>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Actions
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            appearance="outline"
                                            disabled={
                                                processing
                                            }
                                            onClick={() =>
                                                router.visit(
                                                    `/bill/${bill.id}`,
                                                )
                                            }
                                        >
                                            Back
                                        </Button>

                                        <Button
                                            type="submit"
                                            disabled={
                                                processing
                                            }
                                        >
                                            {processing
                                                ? 'Updating...'
                                                : 'Update Bill'}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Summary
                        |--------------------------------------------------------------------------
                        */}

                        <div className="col-lg-4">
                            <Card>
                                <CardHeader>
                                    <h5 className="mb-0">
                                        Bill Summary
                                    </h5>
                                </CardHeader>

                                <CardBody>
                                    <table className="table mb-0">
                                        <tbody>
                                            <tr>
                                                <th>
                                                    Sub Total
                                                </th>

                                                <td className="text-end">
                                                    {formatMoney(
                                                        bill.sub_total,
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>
                                                    Tax
                                                </th>

                                                <td className="text-end">
                                                    {formatMoney(
                                                        bill.total_tax,
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>
                                                    Discount
                                                </th>

                                                <td className="text-end">
                                                    {formatMoney(
                                                        bill.total_discount,
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>
                                                    Shipping
                                                </th>

                                                <td className="text-end">
                                                    {formatMoney(
                                                        bill.shipping_cost,
                                                    )}
                                                </td>
                                            </tr>

                                            <tr className="table-light">
                                                <th>
                                                    Grand Total
                                                </th>

                                                <td className="text-end fw-bold">
                                                    {formatMoney(
                                                        bill.grand_total,
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th className="text-success">
                                                    Paid
                                                </th>

                                                <td className="text-end text-success fw-semibold">
                                                    {formatMoney(
                                                        bill.paid_amount,
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <th className="text-danger">
                                                    Due
                                                </th>

                                                <td className="text-end text-danger fw-semibold">
                                                    {formatMoney(
                                                        bill.due_amount,
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
