import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
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

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Vendor = {
    id: number;

    vendor_id:
        | string
        | null;

    name: string;
};

type Warehouse = {
    id: number;

    name: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;

    status: string;

    vendor:
        | Vendor
        | null;

    warehouse:
        | Warehouse
        | null;
};

type TaxSnapshot = {
    tax_id:
        | number
        | null;

    name: string;

    rate: number;

    tax_amount?: number;
};

type GrnExistingItem = {
    id: number;

    purchase_item_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    quantity: number;

    unit_price: number;

    taxes: TaxSnapshot[];

    tax_amount: number;
};

type GoodsReceivedNote = {
    id: number;

    grn_no: string;

    purchase_order_id: number;

    warehouse_id:
        | number
        | null;

    received_date:
        | string
        | null;

    status:
        | 'Pending'
        | 'Approved'
        | 'Rejected';

    attachments: string[];

    note:
        | string
        | null;

    purchase_order:
        | PurchaseOrder
        | null;

    warehouse:
        | Warehouse
        | null;

    items: GrnExistingItem[];
};

type PurchaseOrderItemResponse = {
    purchase_item_id: number;

    item_id: number;

    code: string;

    name: string;

    unit: string;

    po_quantity: number;

    already_received: number;

    remaining_quantity: number;

    quantity: number;

    unit_price: number;

    taxes: TaxSnapshot[];

    tax_amount: number;

    line_total: number;
};

type PurchaseOrderItemsResponse = {
    meta: {
        id: number;

        order_id: string;

        status: string;

        vendor:
            | Vendor
            | null;

        warehouse:
            | Warehouse
            | null;
    };

    items: PurchaseOrderItemResponse[];
};

type GrnItemForm = {
    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    */

    purchase_item_id: number;

    quantity: number;

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    item_id: number;

    code: string;

    name: string;

    unit: string;

    po_quantity: number;

    already_received: number;

    remaining_quantity: number;

    unit_price: number;

    taxes: TaxSnapshot[];
};

type GrnFormData = {
    purchase_order_id: number;

    received_date: string;

    /*
    |--------------------------------------------------------------------------
    | Only newly selected files
    |--------------------------------------------------------------------------
    */

    attachments: File[];

    /*
    |--------------------------------------------------------------------------
    | Existing attachment paths selected for removal
    |--------------------------------------------------------------------------
    */

    remove_attachments: string[];

    note: string;

    items: GrnItemForm[];
};

type Props = {
    grn: GoodsReceivedNote;

    activeCurrency?: {
        id: number;

        symbol:
            | string
            | null;

        exchange_rate:
            | string
            | number
            | null;
    } | null;
};

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const MAX_FILES =
    5;

const MAX_TOTAL_FILE_SIZE =
    30 *
    1024 *
    1024;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatQuantity(
    value: number,
) {
    return Number(
        value ?? 0,
    ).toFixed(2);
}

function getAttachmentUrl(
    path: string,
) {
    if (
        path.startsWith(
            'http://',
        ) ||
        path.startsWith(
            'https://',
        )
    ) {
        return path;
    }

    return `/${path.replace(
        /^\/+/,
        '',
    )}`;
}

function getAttachmentName(
    path: string,
) {
    const normalized =
        path.replace(
            /\\/g,
            '/',
        );

    const parts =
        normalized.split(
            '/',
        );

    return (
        parts[
            parts.length -
                1
        ] ||
        'Attachment'
    );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function EditGrnPage({
    grn,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Existing Attachments
    |--------------------------------------------------------------------------
    */

    const existingAttachments =
        useMemo(
            () =>
                Array.isArray(
                    grn.attachments,
                )
                    ? grn.attachments.filter(
                          Boolean,
                      )
                    : [],
            [
                grn.attachments,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Existing Quantity Map
    |--------------------------------------------------------------------------
    |
    | Used after loading PO items.
    |
    | purchase_item_id => current GRN quantity
    |
    */

    const existingQuantityMap =
        useMemo(
            () =>
                new Map<
                    number,
                    number
                >(
                    grn.items.map(
                        (
                            item,
                        ) => [
                            item.purchase_item_id,
                            Number(
                                item.quantity,
                            ),
                        ],
                    ),
                ),
            [
                grn.items,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [
        loadingItems,
        setLoadingItems,
    ] =
        useState(
            true,
        );

    /*
    |--------------------------------------------------------------------------
    | Local Errors
    |--------------------------------------------------------------------------
    */

    const [
        itemError,
        setItemError,
    ] =
        useState<
            string | null
        >(
            null,
        );

    const [
        fileError,
        setFileError,
    ] =
        useState<
            string | null
        >(
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
    } =
        useForm<GrnFormData>({
            purchase_order_id:
                grn.purchase_order_id,

            received_date:
                grn.received_date ??
                '',

            /*
            |--------------------------------------------------------------------------
            | New files only
            |--------------------------------------------------------------------------
            */

            attachments:
                [],

            /*
            |--------------------------------------------------------------------------
            | Existing paths removed by user
            |--------------------------------------------------------------------------
            */

            remove_attachments:
                [],

            note:
                grn.note ??
                '',

            items:
                [],
        });

    /*
    |--------------------------------------------------------------------------
    | Error Helpers
    |--------------------------------------------------------------------------
    */

    const fieldErrors =
        errors as Record<
            string,
            string
        >;

    const getError = (
        key: string,
    ) =>
        fieldErrors[
            key
        ];

    /*
    |--------------------------------------------------------------------------
    | Validation Summary
    |--------------------------------------------------------------------------
    */

    const errorMessages =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        Object.values(
                            fieldErrors,
                        ).filter(
                            Boolean,
                        ),
                    ),
                ),
            [
                fieldErrors,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Attachments Remaining
    |--------------------------------------------------------------------------
    */

    const remainingExistingAttachments =
        useMemo(
            () =>
                existingAttachments.filter(
                    (
                        attachment,
                    ) =>
                        !data.remove_attachments.includes(
                            attachment,
                        ),
                ),
            [
                existingAttachments,
                data.remove_attachments,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Total Attachment Count
    |--------------------------------------------------------------------------
    */

    const totalAttachmentCount =
        remainingExistingAttachments.length +
        data.attachments.length;

    /*
    |--------------------------------------------------------------------------
    | Load PO Items
    |--------------------------------------------------------------------------
    |
    | exclude_grn_id is critical.
    |
    | Example:
    |
    | PO                  = 100
    | Current GRN         = 60
    | Other GRNs          = 20
    |
    | Edit maximum should = 80
    |
    | Current GRN's own 60 must not be counted against itself.
    |
    */

    const loadPurchaseOrderItems =
        useCallback(
            async () => {
                setLoadingItems(
                    true,
                );

                setItemError(
                    null,
                );

                try {
                    const params =
                        new URLSearchParams();

                    params.set(
                        'purchase_order_id',
                        String(
                            grn.purchase_order_id,
                        ),
                    );

                    params.set(
                        'exclude_grn_id',
                        String(
                            grn.id,
                        ),
                    );

                    const response =
                        await fetch(
                            `/grn-get-po-items-for-grn?${params.toString()}`,
                            {
                                headers: {
                                    Accept:
                                        'application/json',
                                },
                            },
                        );

                    const result =
                        (await response.json()) as
                            | PurchaseOrderItemsResponse
                            | {
                                  message?: string;
                              };

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            'message' in
                                result
                                ? result.message ??
                                      'Failed to load Purchase Order items.'
                                : 'Failed to load Purchase Order items.',
                        );
                    }

                    const responseData =
                        result as PurchaseOrderItemsResponse;

                    /*
                    |--------------------------------------------------------------------------
                    | Build Editable Items
                    |--------------------------------------------------------------------------
                    |
                    | Existing GRN lines keep their existing quantity.
                    |
                    | Other PO lines begin at 0.
                    |
                    */

                    const items:
                        GrnItemForm[] =
                        responseData.items.map(
                            (
                                item,
                            ) => {
                                const existingQuantity =
                                    existingQuantityMap.get(
                                        item.purchase_item_id,
                                    );

                                return {
                                    purchase_item_id:
                                        item.purchase_item_id,

                                    item_id:
                                        item.item_id,

                                    code:
                                        item.code,

                                    name:
                                        item.name,

                                    unit:
                                        item.unit,

                                    po_quantity:
                                        Number(
                                            item.po_quantity,
                                        ),

                                    already_received:
                                        Number(
                                            item.already_received,
                                        ),

                                    remaining_quantity:
                                        Number(
                                            item.remaining_quantity,
                                        ),

                                    /*
                                    |--------------------------------------------------------------------------
                                    | Current saved quantity
                                    |--------------------------------------------------------------------------
                                    |
                                    | If this product was not originally in GRN:
                                    | quantity = 0
                                    |
                                    */

                                    quantity:
                                        existingQuantity !==
                                        undefined
                                            ? Number(
                                                  existingQuantity,
                                              )
                                            : 0,

                                    unit_price:
                                        Number(
                                            item.unit_price,
                                        ),

                                    taxes:
                                        item.taxes ??
                                        [],
                                };
                            },
                        );

                    setData(
                        'items',
                        items,
                    );

                    clearErrors(
                        'items',
                    );
                } catch (
                    error
                ) {
                    console.error(
                        error,
                    );

                    setData(
                        'items',
                        [],
                    );

                    setItemError(
                        error instanceof
                            Error
                            ? error.message
                            : 'Failed to load Purchase Order items.',
                    );
                } finally {
                    setLoadingItems(
                        false,
                    );
                }
            },
            [
                clearErrors,
                existingQuantityMap,
                grn.id,
                grn.purchase_order_id,
                setData,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Initial Load
    |--------------------------------------------------------------------------
    */

    useEffect(
        () => {
            void loadPurchaseOrderItems();
        },
        [
            loadPurchaseOrderItems,
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Received Date
    |--------------------------------------------------------------------------
    */

    const handleReceivedDateChange =
        (
            value: string,
        ) => {
            setData(
                'received_date',
                value,
            );

            clearErrors(
                'received_date',
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Receive Quantity
    |--------------------------------------------------------------------------
    */

    const updateReceiveQuantity =
        (
            index: number,
            value: number,
        ) => {
            const items =
                [
                    ...data.items,
                ];

            const item =
                items[
                    index
                ];

            if (!item) {
                return;
            }

            let quantity =
                Number.isFinite(
                    value,
                )
                    ? value
                    : 0;

            /*
            |--------------------------------------------------------------------------
            | Minimum
            |--------------------------------------------------------------------------
            */

            if (
                quantity <
                0
            ) {
                quantity =
                    0;
            }

            /*
            |--------------------------------------------------------------------------
            | Maximum Available For This GRN
            |--------------------------------------------------------------------------
            */

            if (
                quantity >
                item.remaining_quantity
            ) {
                quantity =
                    item.remaining_quantity;
            }

            items[
                index
            ] = {
                ...item,

                quantity,
            };

            setData(
                'items',
                items,
            );

            setItemError(
                null,
            );

            clearErrors(
                `items.${index}.quantity`,
            );
        };

    /*
    |--------------------------------------------------------------------------
    | New Attachments
    |--------------------------------------------------------------------------
    */

    const handleFilesChange =
        (
            value:
                | File
                | File[]
                | null,
        ) => {
            const files =
                Array.isArray(
                    value,
                )
                    ? value
                    : value
                      ? [
                            value,
                        ]
                      : [];

            /*
            |--------------------------------------------------------------------------
            | Existing Kept + New
            |--------------------------------------------------------------------------
            */

            if (
                remainingExistingAttachments.length +
                    files.length >
                MAX_FILES
            ) {
                setFileError(
                    `Maximum ${MAX_FILES} attachments are allowed in total.`,
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | New Upload Size
            |--------------------------------------------------------------------------
            */

            const totalSize =
                files.reduce(
                    (
                        total,
                        file,
                    ) =>
                        total +
                        file.size,
                    0,
                );

            if (
                totalSize >
                MAX_TOTAL_FILE_SIZE
            ) {
                setFileError(
                    'Total new attachment size cannot exceed 30 MB.',
                );

                return;
            }

            setFileError(
                null,
            );

            setData(
                'attachments',
                files,
            );

            clearErrors(
                'attachments',
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Remove Existing Attachment
    |--------------------------------------------------------------------------
    */

    const removeExistingAttachment =
        (
            attachment: string,
        ) => {
            if (
                data.remove_attachments.includes(
                    attachment,
                )
            ) {
                return;
            }

            setData(
                'remove_attachments',
                [
                    ...data.remove_attachments,
                    attachment,
                ],
            );

            setFileError(
                null,
            );

            clearErrors(
                'remove_attachments',
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Selected Items
    |--------------------------------------------------------------------------
    */

    const selectedItemCount =
        useMemo(
            () =>
                data.items.filter(
                    (
                        item,
                    ) =>
                        Number(
                            item.quantity,
                        ) >
                        0,
                ).length,
            [
                data.items,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Total Receive Quantity
    |--------------------------------------------------------------------------
    */

    const totalReceiveQuantity =
        useMemo(
            () =>
                data.items.reduce(
                    (
                        total,
                        item,
                    ) => {
                        const quantity =
                            Number(
                                item.quantity,
                            );

                        return (
                            total +
                            (
                                quantity >
                                0
                                    ? quantity
                                    : 0
                            )
                        );
                    },
                    0,
                ),
            [
                data.items,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit =
        (
            event:
                FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault();

            setItemError(
                null,
            );

            setFileError(
                null,
            );

            /*
            |--------------------------------------------------------------------------
            | Date
            |--------------------------------------------------------------------------
            */

            if (
                !data.received_date
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Selected Items
            |--------------------------------------------------------------------------
            */

            const selectedItems =
                data.items.filter(
                    (
                        item,
                    ) =>
                        Number(
                            item.quantity,
                        ) >
                        0,
                );

            if (
                selectedItems.length ===
                0
            ) {
                setItemError(
                    'Please enter received quantity for at least one item.',
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Quantity Validation
            |--------------------------------------------------------------------------
            */

            const invalidItem =
                selectedItems.find(
                    (
                        item,
                    ) =>
                        Number(
                            item.quantity,
                        ) >
                        Number(
                            item.remaining_quantity,
                        ),
                );

            if (
                invalidItem
            ) {
                setItemError(
                    `Receive quantity for "${invalidItem.name}" cannot exceed available quantity ${formatQuantity(
                        invalidItem.remaining_quantity,
                    )}.`,
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Attachments
            |--------------------------------------------------------------------------
            */

            if (
                totalAttachmentCount >
                MAX_FILES
            ) {
                setFileError(
                    `Maximum ${MAX_FILES} attachments are allowed.`,
                );

                return;
            }

            clearErrors();

            /*
            |--------------------------------------------------------------------------
            | Transform
            |--------------------------------------------------------------------------
            |
            | We submit POST and spoof PUT.
            |
            | This is safer for multipart/form-data file uploads in Laravel.
            |
            */

            transform(
                (
                    formData,
                ) => ({
                    _method:
                        'PUT',

                    purchase_order_id:
                        formData.purchase_order_id,

                    received_date:
                        formData.received_date,

                    /*
                    |--------------------------------------------------------------------------
                    | New Files
                    |--------------------------------------------------------------------------
                    */

                    attachments:
                        formData.attachments,

                    /*
                    |--------------------------------------------------------------------------
                    | Existing Paths To Remove
                    |--------------------------------------------------------------------------
                    */

                    remove_attachments:
                        formData.remove_attachments,

                    note:
                        formData.note,

                    /*
                    |--------------------------------------------------------------------------
                    | Only Qty > 0
                    |--------------------------------------------------------------------------
                    */

                    items:
                        selectedItems.map(
                            (
                                item,
                            ) => ({
                                purchase_item_id:
                                    item.purchase_item_id,

                                quantity:
                                    Number(
                                        item.quantity,
                                    ),
                            }),
                        ),
                }),
            );

            post(
                `/grn/edit/${grn.id}`,
                {
                    preserveScroll:
                        true,

                    forceFormData:
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
            <Head title="Edit GRN" />

            <PageTitle title="Edit GRN" />

            <div className="container-fluid">
                {/*
                |--------------------------------------------------------------------------
                | Validation Summary
                |--------------------------------------------------------------------------
                */}

                {(errorMessages.length >
                    0 ||
                    fileError ||
                    itemError) && (
                    <div className="alert alert-danger">
                        <strong>
                            There were some
                            problems with your
                            input:
                        </strong>

                        <ul className="mb-0 mt-2">
                            {errorMessages.map(
                                (
                                    error,
                                    index,
                                ) => (
                                    <li
                                        key={
                                            index
                                        }
                                    >
                                        {
                                            error
                                        }
                                    </li>
                                ),
                            )}

                            {itemError && (
                                <li>
                                    {
                                        itemError
                                    }
                                </li>
                            )}

                            {fileError && (
                                <li>
                                    {
                                        fileError
                                    }
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <Card>
                    {/*
                    |--------------------------------------------------------------------------
                    | Header
                    |--------------------------------------------------------------------------
                    */}

                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-2">
                            <h4 className="mb-0">
                                Edit GRN
                            </h4>

                            <Button
                                type="button"
                                variant="primary"
                                appearance="outline"
                                disabled={
                                    processing
                                }
                                onClick={() =>
                                    router.visit(
                                        '/grn',
                                    )
                                }
                            >
                                Go Back
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            {/*
                            |--------------------------------------------------------------------------
                            | Header Section
                            |--------------------------------------------------------------------------
                            */}

                            <div className="row">
                                {/*
                                |--------------------------------------------------------------------------
                                | Left
                                |--------------------------------------------------------------------------
                                */}

                                <div className="col-md-6">
                                    <div className="row mb-3">
                                        <div
                                            className="col-12"
                                            style={{
                                                borderRight:
                                                    '1px solid #ddd',
                                            }}
                                        >
                                            {/*
                                            |--------------------------------------------------------------------------
                                            | GRN No
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel>
                                                        GRN
                                                        No.
                                                    </FormLabel>

                                                    <Input
                                                        value={
                                                            grn.grn_no
                                                        }
                                                        readOnly
                                                        disabled
                                                    />
                                                </FormField>
                                            </div>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Purchase Order
                                            |--------------------------------------------------------------------------
                                            |
                                            | Keep PO fixed when editing GRN.
                                            |
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel
                                                        required
                                                    >
                                                        Purchase
                                                        Order
                                                    </FormLabel>

                                                    <Input
                                                        value={
                                                            grn
                                                                .purchase_order
                                                                ?.order_id ??
                                                            ''
                                                        }
                                                        placeholder="Purchase Order"
                                                        readOnly
                                                        disabled
                                                    />

                                                    <FormError
                                                        error={
                                                            errors.purchase_order_id
                                                        }
                                                    />
                                                </FormField>
                                            </div>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Vendor
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel>
                                                        Vendor
                                                    </FormLabel>

                                                    <Input
                                                        value={
                                                            grn
                                                                .purchase_order
                                                                ?.vendor
                                                                ?.name ??
                                                            ''
                                                        }
                                                        placeholder="Vendor"
                                                        readOnly
                                                        disabled
                                                    />

                                                    {grn
                                                        .purchase_order
                                                        ?.vendor
                                                        ?.vendor_id && (
                                                        <small className="text-muted">
                                                            #
                                                            {
                                                                grn
                                                                    .purchase_order
                                                                    .vendor
                                                                    .vendor_id
                                                            }
                                                        </small>
                                                    )}
                                                </FormField>
                                            </div>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Warehouse
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel>
                                                        Warehouse
                                                    </FormLabel>

                                                    <Input
                                                        value={
                                                            grn
                                                                .purchase_order
                                                                ?.warehouse
                                                                ?.name ??
                                                            grn
                                                                .warehouse
                                                                ?.name ??
                                                            ''
                                                        }
                                                        placeholder="Warehouse"
                                                        readOnly
                                                        disabled
                                                    />
                                                </FormField>
                                            </div>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Received Date
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel
                                                        htmlFor="received_date"
                                                        required
                                                    >
                                                        Received
                                                        Date
                                                    </FormLabel>

                                                    <DatePicker
                                                        id="received_date"
                                                        mode="single"
                                                        value={
                                                            data.received_date
                                                        }
                                                        placeholder="Select received date"
                                                        disabled={
                                                            processing
                                                        }
                                                        error={
                                                            errors.received_date
                                                        }
                                                        onChange={
                                                            handleReceivedDateChange
                                                        }
                                                    />

                                                    <FormError
                                                        error={
                                                            errors.received_date
                                                        }
                                                    />
                                                </FormField>
                                            </div>

                                            {/*
                                            |--------------------------------------------------------------------------
                                            | Note
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel>
                                                        Note
                                                    </FormLabel>

                                                    <Textarea
                                                        rows={
                                                            4
                                                        }
                                                        value={
                                                            data.note
                                                        }
                                                        placeholder="Write note..."
                                                        disabled={
                                                            processing
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) => {
                                                            setData(
                                                                'note',
                                                                event
                                                                    .target
                                                                    .value,
                                                            );

                                                            clearErrors(
                                                                'note',
                                                            );
                                                        }}
                                                    />

                                                    <FormError
                                                        error={
                                                            errors.note
                                                        }
                                                    />
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Attachments
                                |--------------------------------------------------------------------------
                                */}

                                <div className="col-md-6">
                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Existing Attachments
                                    |--------------------------------------------------------------------------
                                    */}

                                    {remainingExistingAttachments.length >
                                        0 && (
                                        <div className="mb-3">
                                            <FormLabel>
                                                Existing
                                                Attachments
                                            </FormLabel>

                                            <div className="d-flex flex-column gap-2 mt-2">
                                                {remainingExistingAttachments.map(
                                                    (
                                                        attachment,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={`${attachment}-${index}`}
                                                            className="border rounded p-2 d-flex align-items-center justify-content-between gap-2"
                                                        >
                                                            <a
                                                                href={getAttachmentUrl(
                                                                    attachment,
                                                                )}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="d-flex align-items-center gap-2 text-decoration-none overflow-hidden"
                                                            >
                                                                <FileText
                                                                    size={
                                                                        18
                                                                    }
                                                                />

                                                                <span
                                                                    className="text-truncate"
                                                                    style={{
                                                                        maxWidth:
                                                                            '350px',
                                                                    }}
                                                                >
                                                                    {getAttachmentName(
                                                                        attachment,
                                                                    )}
                                                                </span>
                                                            </a>

                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="danger"
                                                                disabled={
                                                                    processing
                                                                }
                                                                onClick={() =>
                                                                    removeExistingAttachment(
                                                                        attachment,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </Button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | New Attachments
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="mt-4">
                                        <FileDropzone
                                            value={
                                                data.attachments
                                            }
                                            onChange={
                                                handleFilesChange
                                            }
                                            multiple
                                            maxFiles={
                                                MAX_FILES
                                            }
                                            showImagePreview
                                            previewInsideDropzone
                                            previewHeight={
                                                120
                                            }
                                            accept={{
                                                'image/jpeg':
                                                    [
                                                        '.jpg',
                                                        '.jpeg',
                                                    ],

                                                'image/png':
                                                    [
                                                        '.png',
                                                    ],

                                                'application/pdf':
                                                    [
                                                        '.pdf',
                                                    ],

                                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                                    [
                                                        '.xlsx',
                                                    ],

                                                'application/vnd.ms-excel':
                                                    [
                                                        '.xls',
                                                    ],

                                                'application/msword':
                                                    [
                                                        '.doc',
                                                    ],

                                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                                    [
                                                        '.docx',
                                                    ],
                                            }}
                                            placeholder="Drop new GRN attachments here or click to select."
                                            description={
                                                <>
                                                    (
                                                    {
                                                        totalAttachmentCount
                                                    }
                                                    /
                                                    {
                                                        MAX_FILES
                                                    }{' '}
                                                    attachments
                                                    selected.
                                                    Maximum
                                                    30 MB
                                                    new
                                                    upload
                                                    size.
                                                    )
                                                </>
                                            }
                                            disabled={
                                                processing
                                            }
                                            error={
                                                fileError ??
                                                errors.attachments
                                            }
                                        />

                                        <FormError
                                            error={
                                                errors.attachments
                                            }
                                        />

                                        <FormError
                                            error={
                                                getError(
                                                    'remove_attachments',
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/*
                            |--------------------------------------------------------------------------
                            | Items
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-4">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                    <div>
                                        <h5 className="mb-1">
                                            Receive
                                            Items
                                        </h5>

                                        {grn
                                            .purchase_order
                                            ?.order_id && (
                                            <small className="text-muted">
                                                PO #
                                                {
                                                    grn
                                                        .purchase_order
                                                        .order_id
                                                }
                                            </small>
                                        )}
                                    </div>

                                    {data.items.length >
                                        0 && (
                                        <div className="text-end">
                                            <small className="text-muted d-block">
                                                Items:{' '}
                                                {
                                                    selectedItemCount
                                                }
                                            </small>

                                            <small className="text-muted">
                                                Total
                                                Receive
                                                Qty:{' '}
                                                {formatQuantity(
                                                    totalReceiveQuantity,
                                                )}
                                            </small>
                                        </div>
                                    )}
                                </div>

                                {/*
                                |--------------------------------------------------------------------------
                                | Loading
                                |--------------------------------------------------------------------------
                                */}

                                {loadingItems && (
                                    <div className="alert alert-info py-2">
                                        Loading
                                        Purchase
                                        Order
                                        items...
                                    </div>
                                )}

                                {/*
                                |--------------------------------------------------------------------------
                                | Error
                                |--------------------------------------------------------------------------
                                */}

                                {itemError && (
                                    <div className="alert alert-danger py-2">
                                        {
                                            itemError
                                        }
                                    </div>
                                )}

                                {/*
                                |--------------------------------------------------------------------------
                                | Table
                                |--------------------------------------------------------------------------
                                */}

                                <Table wrapperClassName="overflow-auto">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                style={{
                                                    width:
                                                        '5%',
                                                }}
                                            >
                                                SL
                                            </TableHead>

                                            <TableHead>
                                                Product
                                            </TableHead>

                                            <TableHead
                                                style={{
                                                    width:
                                                        '12%',
                                                }}
                                            >
                                                Unit
                                            </TableHead>

                                            <TableHead
                                                className="text-end"
                                                style={{
                                                    width:
                                                        '13%',
                                                }}
                                            >
                                                PO Qty
                                            </TableHead>

                                            <TableHead
                                                className="text-end"
                                                style={{
                                                    width:
                                                        '15%',
                                                }}
                                            >
                                                Already
                                                Received
                                            </TableHead>

                                            <TableHead
                                                className="text-end"
                                                style={{
                                                    width:
                                                        '13%',
                                                }}
                                            >
                                                Available
                                            </TableHead>

                                            <TableHead
                                                style={{
                                                    width:
                                                        '18%',
                                                }}
                                            >
                                                Receive
                                                Qty
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {!loadingItems &&
                                        data.items.length ===
                                            0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={
                                                        7
                                                    }
                                                    className="text-center py-5 text-muted"
                                                >
                                                    No
                                                    receivable
                                                    items
                                                    found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data.items.map(
                                                (
                                                    item,
                                                    index,
                                                ) => (
                                                    <TableRow
                                                        key={
                                                            item.purchase_item_id
                                                        }
                                                    >
                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | SL
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell>
                                                            {index +
                                                                1}
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Product
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell
                                                            style={{
                                                                minWidth:
                                                                    '240px',
                                                            }}
                                                        >
                                                            <Textarea
                                                                rows={
                                                                    2
                                                                }
                                                                value={
                                                                    item.name
                                                                }
                                                                readOnly
                                                                disabled
                                                            />

                                                            {item.code && (
                                                                <small className="text-muted">
                                                                    #
                                                                    {
                                                                        item.code
                                                                    }
                                                                </small>
                                                            )}

                                                            <FormError
                                                                error={getError(
                                                                    `items.${index}.purchase_item_id`,
                                                                )}
                                                            />
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Unit
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell
                                                            style={{
                                                                minWidth:
                                                                    '110px',
                                                            }}
                                                        >
                                                            <Input
                                                                value={
                                                                    item.unit
                                                                }
                                                                readOnly
                                                                disabled
                                                            />
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | PO Qty
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell className="text-end">
                                                            {formatQuantity(
                                                                item.po_quantity,
                                                            )}
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Other Pending / Approved GRNs
                                                        |--------------------------------------------------------------------------
                                                        |
                                                        | Current GRN is excluded.
                                                        |
                                                        */}

                                                        <TableCell className="text-end">
                                                            {formatQuantity(
                                                                item.already_received,
                                                            )}
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Maximum Available To This GRN
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell className="text-end">
                                                            <strong>
                                                                {formatQuantity(
                                                                    item.remaining_quantity,
                                                                )}
                                                            </strong>
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Quantity
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell
                                                            style={{
                                                                minWidth:
                                                                    '160px',
                                                            }}
                                                        >
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={
                                                                    item.remaining_quantity
                                                                }
                                                                step="0.01"
                                                                value={
                                                                    item.quantity
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateReceiveQuantity(
                                                                        index,
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                            />

                                                            <FormError
                                                                error={getError(
                                                                    `items.${index}.quantity`,
                                                                )}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/*
                            |--------------------------------------------------------------------------
                            | Submit
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-4 d-flex justify-content-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={
                                        processing ||
                                        loadingItems ||
                                        data.items
                                            .length ===
                                            0
                                    }
                                >
                                    {processing
                                        ? 'Updating...'
                                        : 'Update GRN'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
