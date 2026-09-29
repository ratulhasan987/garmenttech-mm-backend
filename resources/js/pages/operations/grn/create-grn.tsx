import {
    useCallback,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import {
    Head,
    router,
    useForm,
} from '@inertiajs/react';

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

type PurchaseOrderSuggestion = {
    id: number;

    order_id: string;

    label: string;

    secondary: string;

    status:
    | 'Approved'
    | 'Partial';

    order_date:
    | string
    | null;

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

    items:
    PurchaseOrderItemResponse[];
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
    | UI Only
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
    purchase_order_id:
    | number
    | null;

    received_date: string;

    /*
    |--------------------------------------------------------------------------
    | Multiple files
    |--------------------------------------------------------------------------
    |
    | Database still has:
    |
    | document VARCHAR / STRING
    |
    | Backend uploads these files then stores:
    |
    | ["GRN/file1.pdf","GRN/file2.jpg"]
    |
    | as a JSON encoded string.
    |
    */

    attachments: File[];

    note: string;

    items: GrnItemForm[];
};


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

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function CreateGrnPage() {
    /*
    |--------------------------------------------------------------------------
    | Selected PO
    |--------------------------------------------------------------------------
    */

    const [
        selectedPurchaseOrder,
        setSelectedPurchaseOrder,
    ] =
        useState<
            PurchaseOrderSuggestion | null
        >(null);

    /*
    |--------------------------------------------------------------------------
    | Purchase Order Search Reset
    |--------------------------------------------------------------------------
    */

    const [
        poSearchKey,
        setPoSearchKey,
    ] =
        useState(
            0,
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
            false,
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
        >(null);

    const [
        fileError,
        setFileError,
    ] =
        useState<
            string | null
        >(null);

    const [
        purchaseOrderError,
        setPurchaseOrderError,
    ] =
        useState<
            string | null
        >(null);

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
                null,

            received_date:
                '',

            attachments:
                [],

            note:
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
    | Purchase Order Search
    |--------------------------------------------------------------------------
    */

    const searchPurchaseOrders =
        useCallback(
            async (
                query: string,
                signal?: AbortSignal,
            ): Promise<
                PurchaseOrderSuggestion[]
            > => {
                const params =
                    new URLSearchParams();

                params.set(
                    'keyword',
                    query,
                );

                const response =
                    await fetch(
                        `/grn-get-purchase-orders?${params.toString()}`,
                        {
                            signal,

                            headers: {
                                Accept:
                                    'application/json',
                            },
                        },
                    );

                if (
                    !response.ok
                ) {
                    throw new Error(
                        'Failed to search Purchase Orders.',
                    );
                }

                return (
                    await response.json()
                ) as PurchaseOrderSuggestion[];
            },
            [],
        );

    /*
    |--------------------------------------------------------------------------
    | Load PO Items
    |--------------------------------------------------------------------------
    */

    const loadPurchaseOrderItems =
        async (
            purchaseOrderId: number,
        ) => {
            setLoadingItems(
                true,
            );

            setItemError(
                null,
            );

            setPurchaseOrderError(
                null,
            );

            try {
                const params =
                    new URLSearchParams();

                params.set(
                    'purchase_order_id',
                    String(
                        purchaseOrderId,
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
                        'message' in result
                            ? result.message ??
                            'Failed to load Purchase Order items.'
                            : 'Failed to load Purchase Order items.',
                    );
                }

                const responseData =
                    result as PurchaseOrderItemsResponse;

                /*
                |--------------------------------------------------------------------------
                | No Remaining Items
                |--------------------------------------------------------------------------
                */

                if (
                    responseData.items
                        .length ===
                    0
                ) {
                    setData(
                        'items',
                        [],
                    );

                    setItemError(
                        'This Purchase Order has no remaining quantity to receive.',
                    );

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Convert API items into form items
                |--------------------------------------------------------------------------
                */

                const items:
                    GrnItemForm[] =
                    responseData.items.map(
                        (
                            item,
                        ) => ({
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
                            | Default Receive Qty = Remaining
                            |--------------------------------------------------------------------------
                            */

                            quantity:
                                Number(
                                    item.remaining_quantity,
                                ),

                            unit_price:
                                Number(
                                    item.unit_price,
                                ),

                            taxes:
                                item.taxes ??
                                [],
                        }),
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
        };

    /*
    |--------------------------------------------------------------------------
    | PO Selected
    |--------------------------------------------------------------------------
    */

    const handlePurchaseOrderSelect =
        (
            purchaseOrder:
                PurchaseOrderSuggestion,
        ) => {
            setSelectedPurchaseOrder(
                purchaseOrder,
            );

            setData(
                'purchase_order_id',
                purchaseOrder.id,
            );

            /*
            |--------------------------------------------------------------------------
            | Reset existing items first
            |--------------------------------------------------------------------------
            */

            setData(
                'items',
                [],
            );

            setItemError(
                null,
            );

            setPurchaseOrderError(
                null,
            );

            clearErrors(
                'purchase_order_id',
            );

            clearErrors(
                'items',
            );

            void loadPurchaseOrderItems(
                purchaseOrder.id,
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Clear Selected PO
    |--------------------------------------------------------------------------
    */

    const clearPurchaseOrder =
        () => {
            setSelectedPurchaseOrder(
                null,
            );

            setData(
                'purchase_order_id',
                null,
            );

            setData(
                'items',
                [],
            );

            setItemError(
                null,
            );

            setPurchaseOrderError(
                null,
            );

            setPoSearchKey(
                (
                    current,
                ) =>
                    current +
                    1,
            );
        };

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
    | Update Receive Quantity
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
                items[index];

            if (!item) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Allow 0 to skip this line
            |--------------------------------------------------------------------------
            */

            let quantity =
                Number.isFinite(
                    value,
                )
                    ? value
                    : 0;

            if (
                quantity <
                0
            ) {
                quantity =
                    0;
            }

            /*
            |--------------------------------------------------------------------------
            | Do not allow frontend quantity > remaining
            |--------------------------------------------------------------------------
            |
            | Backend validates this again.
            |
            */

            if (
                quantity >
                item.remaining_quantity
            ) {
                quantity =
                    item.remaining_quantity;
            }

            items[index] = {
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
    | Files
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
            | Maximum File Count
            |--------------------------------------------------------------------------
            */

            if (
                files.length >
                MAX_FILES
            ) {
                setFileError(
                    `Maximum ${MAX_FILES} files allowed.`,
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Total File Size
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
                    'Total file size cannot exceed 30 MB.',
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
    | Totals
    |--------------------------------------------------------------------------
    |
    | These are for UI reference only.
    |
    | GRN itself does not store pricing.
    | The actual Bill is generated on GRN approval from PO values.
    |
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

    const totalReceiveQuantity =
        useMemo(
            () =>
                data.items.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        (
                            Number(
                                item.quantity,
                            ) >
                                0
                                ? Number(
                                    item.quantity,
                                )
                                : 0
                        ),
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

            setPurchaseOrderError(
                null,
            );

            /*
            |--------------------------------------------------------------------------
            | Purchase Order
            |--------------------------------------------------------------------------
            */

            if (
                !data.purchase_order_id
            ) {
                setPurchaseOrderError(
                    'Please select a Purchase Order.',
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Received Date
            |--------------------------------------------------------------------------
            */

            if (
                !data.received_date
            ) {
                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Items
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
                    `Receive quantity for "${invalidItem.name}" cannot exceed remaining quantity ${formatQuantity(
                        invalidItem.remaining_quantity,
                    )}.`,
                );

                return;
            }

            clearErrors();

            /*
            |--------------------------------------------------------------------------
            | IMPORTANT
            |--------------------------------------------------------------------------
            |
            | Send "attachments", not "document".
            |
            */

            transform(
                (
                    formData,
                ) => ({
                    purchase_order_id:
                        formData.purchase_order_id,

                    received_date:
                        formData.received_date,

                    attachments:
                        formData.attachments,

                    note:
                        formData.note,

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
                '/grn',
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
            <Head title="Create GRN" />

            <PageTitle title="Create GRN" />

            <div className="container-fluid">
                {/*
                |--------------------------------------------------------------------------
                | Validation Summary
                |--------------------------------------------------------------------------
                */}

                {(errorMessages.length >
                    0 ||
                    fileError ||
                    itemError ||
                    purchaseOrderError) && (
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

                                {purchaseOrderError && (
                                    <li>
                                        {
                                            purchaseOrderError
                                        }
                                    </li>
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
                                Create GRN
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
                                            | Purchase Order
                                            |--------------------------------------------------------------------------
                                            */}

                                            <div className="mb-3">
                                                <FormField>
                                                    <FormLabel
                                                        required
                                                    >
                                                        Purchase
                                                        Order
                                                    </FormLabel>

                                                    {!selectedPurchaseOrder ? (
                                                        <SuggestionSearchInput<PurchaseOrderSuggestion>
                                                            key={
                                                                poSearchKey
                                                            }
                                                            searchFn={
                                                                searchPurchaseOrders
                                                            }
                                                            idKey="id"
                                                            labelKey="label"
                                                            secondaryLabelKey="secondary"
                                                            placeholder="Search Purchase Order"
                                                            showSearchIcon={
                                                                false
                                                            }
                                                            clearOnFocus={
                                                                false
                                                            }
                                                            emptyLabel="No receivable Purchase Order found."
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
                                                                disabled={
                                                                    processing ||
                                                                    loadingItems
                                                                }
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
                                                            undefined
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
                                                            selectedPurchaseOrder
                                                                ?.vendor
                                                                ?.name ??
                                                            ''
                                                        }
                                                        placeholder="Vendor will be selected from PO"
                                                        readOnly
                                                        disabled
                                                    />

                                                    {selectedPurchaseOrder
                                                        ?.vendor
                                                        ?.vendor_id && (
                                                            <small className="text-muted">
                                                                #
                                                                {
                                                                    selectedPurchaseOrder
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
                                                            selectedPurchaseOrder
                                                                ?.warehouse
                                                                ?.name ??
                                                            ''
                                                        }
                                                        placeholder="Warehouse will be selected from PO"
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
                                | Documents
                                |--------------------------------------------------------------------------
                                */}

                                <div className="col-md-6">
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
                                            placeholder="Drop GRN documents here or click to select."
                                            description={
                                                <>
                                                    (
                                                    You
                                                    can
                                                    upload
                                                    up to{' '}
                                                    {
                                                        MAX_FILES
                                                    }{' '}
                                                    files,
                                                    max
                                                    30 MB
                                                    total.
                                                    Files
                                                    will
                                                    be
                                                    stored
                                                    in the
                                                    single
                                                    document
                                                    field.
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
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/*
                            |--------------------------------------------------------------------------
                            | Purchase Order Items
                            |--------------------------------------------------------------------------
                            */}

                            <div className="mt-4">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                                    <div>
                                        <h5 className="mb-1">
                                            Receive
                                            Items
                                        </h5>

                                        {selectedPurchaseOrder && (
                                            <small className="text-muted">
                                                PO #
                                                {
                                                    selectedPurchaseOrder.order_id
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
                                | Item Error
                                |--------------------------------------------------------------------------
                                */}

                                {itemError && (
                                    <div className="alert alert-danger py-2">
                                        {
                                            itemError
                                        }
                                    </div>
                                )}

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
                                                Remaining
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
                                                    {data.purchase_order_id
                                                        ? 'No remaining items available for this Purchase Order.'
                                                        : 'Select a Purchase Order to load items.'}
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
                                                        | PO Quantity
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell className="text-end">
                                                            {formatQuantity(
                                                                item.po_quantity,
                                                            )}
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Already Received
                                                        |--------------------------------------------------------------------------
                                                        */}

                                                        <TableCell className="text-end">
                                                            {formatQuantity(
                                                                item.already_received,
                                                            )}
                                                        </TableCell>

                                                        {/*
                                                        |--------------------------------------------------------------------------
                                                        | Remaining
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
                                                        | Receive Quantity
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
                                        !data.purchase_order_id ||
                                        data.items
                                            .length ===
                                        0
                                    }
                                >
                                    {processing
                                        ? 'Saving...'
                                        : 'Save GRN'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}