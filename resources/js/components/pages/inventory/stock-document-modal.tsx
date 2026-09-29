import {
    type FormEvent,
} from 'react';

import {
    useForm,
} from '@inertiajs/react';

import {
    Plus,
    Trash,
} from 'react-feather';

import { Button } from '@/components/ui/button';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { Input } from '@/components/ui/form/input';

import {
    AppModal,
} from '@/components/ui/modal/app-modal';

import { cn } from '@/lib/utils';

import type {
    CodedLookupItem,
    StockDirection,
    StockDocumentMode,
} from '@/types/inventory';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type FormItem = {
    product_id: string;

    quantity: string;

    direction:
        StockDirection;
};

type StockDocumentFormData = {
    warehouse_id: string;

    from_warehouse_id: string;

    to_warehouse_id: string;

    receive_date: string;

    issue_date: string;

    adjustment_date: string;

    transfer_date: string;

    remarks: string;

    items: FormItem[];
};

type StockDocumentModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    mode: StockDocumentMode;

    endpoint: string;

    products:
        CodedLookupItem[];

    warehouses:
        CodedLookupItem[];
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function localToday(): string {
    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(2, '0');

    const day =
        String(
            date.getDate(),
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getTitle(
    mode: StockDocumentMode,
): string {
    switch (mode) {
        case 'receive':
            return 'New Stock Receive';

        case 'issue':
            return 'New Stock Issue';

        case 'adjustment':
            return 'New Stock Adjustment';

        case 'transfer':
            return 'New Stock Transfer';
    }
}

function emptyItem(): FormItem {
    return {
        product_id: '',
        quantity: '',
        direction: 'increase',
    };
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function StockDocumentModal({
    open,
    onOpenChange,
    mode,
    endpoint,
    products,
    warehouses,
}: StockDocumentModalProps) {
    const today =
        localToday();

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } =
        useForm<StockDocumentFormData>({
            warehouse_id: '',

            from_warehouse_id: '',
            to_warehouse_id: '',

            receive_date: today,
            issue_date: today,
            adjustment_date: today,
            transfer_date: today,

            remarks: '',

            items: [
                emptyItem(),
            ],
        });

    const serverErrors =
        errors as Record<
            string,
            string | undefined
        >;

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Items
    |--------------------------------------------------------------------------
    */

    const addItem = () => {
        setData(
            'items',
            [
                ...data.items,
                emptyItem(),
            ],
        );
    };

    const removeItem = (
        index: number,
    ) => {
        if (
            data.items.length === 1
        ) {
            return;
        }

        setData(
            'items',
            data.items.filter(
                (_, itemIndex) =>
                    itemIndex !==
                    index,
            ),
        );
    };

    const updateItem = <
        K extends keyof FormItem,
    >(
        index: number,
        field: K,
        value: FormItem[K],
    ) => {
        const nextItems =
            [...data.items];

        nextItems[index] = {
            ...nextItems[index],
            [field]: value,
        };

        setData(
            'items',
            nextItems,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        post(endpoint, {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();

                onOpenChange(false);
            },
        });
    };

    const documentDate =
        mode === 'receive'
            ? data.receive_date
            : mode === 'issue'
              ? data.issue_date
              : mode ===
                  'adjustment'
                ? data.adjustment_date
                : data.transfer_date;

    const setDocumentDate = (
        value: string,
    ) => {
        if (
            mode === 'receive'
        ) {
            setData(
                'receive_date',
                value,
            );

            return;
        }

        if (
            mode === 'issue'
        ) {
            setData(
                'issue_date',
                value,
            );

            return;
        }

        if (
            mode ===
            'adjustment'
        ) {
            setData(
                'adjustment_date',
                value,
            );

            return;
        }

        setData(
            'transfer_date',
            value,
        );
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(
                nextOpen,
            ) => {
                if (!nextOpen) {
                    handleClose();

                    return;
                }

                onOpenChange(
                    nextOpen,
                );
            }}
            title={
                getTitle(mode)
            }
            busy={processing}
            size="xl"
            centered={false}
            scrollable
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={
                            processing
                        }
                        onClick={
                            handleClose
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="stock-document-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save Draft'}
                    </Button>
                </>
            }
        >
            <form
                id="stock-document-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row g-3">
                    {/* Warehouse */}

                    {mode !==
                        'transfer' && (
                        <div className="col-12 col-md-6">
                            <FormField>
                                <FormLabel
                                    required
                                >
                                    Warehouse
                                </FormLabel>

                                <select
                                    className={cn(
                                        'form-select',
                                        serverErrors.warehouse_id &&
                                            'is-invalid',
                                    )}
                                    value={
                                        data.warehouse_id
                                    }
                                    disabled={
                                        processing
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setData(
                                            'warehouse_id',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Select warehouse
                                    </option>

                                    {warehouses.map(
                                        (
                                            warehouse,
                                        ) => (
                                            <option
                                                key={
                                                    warehouse.id
                                                }
                                                value={
                                                    warehouse.id
                                                }
                                            >
                                                {
                                                    warehouse.code
                                                }{' '}
                                                -{' '}
                                                {
                                                    warehouse.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>

                                <FormError
                                    error={
                                        serverErrors.warehouse_id
                                    }
                                />
                            </FormField>
                        </div>
                    )}

                    {/* Transfer Warehouses */}

                    {mode ===
                        'transfer' && (
                        <>
                            <div className="col-12 col-md-6">
                                <FormField>
                                    <FormLabel
                                        required
                                    >
                                        From Warehouse
                                    </FormLabel>

                                    <select
                                        className={cn(
                                            'form-select',
                                            serverErrors.from_warehouse_id &&
                                                'is-invalid',
                                        )}
                                        value={
                                            data.from_warehouse_id
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'from_warehouse_id',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select source warehouse
                                        </option>

                                        {warehouses.map(
                                            (
                                                warehouse,
                                            ) => (
                                                <option
                                                    key={
                                                        warehouse.id
                                                    }
                                                    value={
                                                        warehouse.id
                                                    }
                                                >
                                                    {
                                                        warehouse.code
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        warehouse.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    <FormError
                                        error={
                                            serverErrors.from_warehouse_id
                                        }
                                    />
                                </FormField>
                            </div>

                            <div className="col-12 col-md-6">
                                <FormField>
                                    <FormLabel
                                        required
                                    >
                                        To Warehouse
                                    </FormLabel>

                                    <select
                                        className={cn(
                                            'form-select',
                                            serverErrors.to_warehouse_id &&
                                                'is-invalid',
                                        )}
                                        value={
                                            data.to_warehouse_id
                                        }
                                        disabled={
                                            processing
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setData(
                                                'to_warehouse_id',
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select destination warehouse
                                        </option>

                                        {warehouses.map(
                                            (
                                                warehouse,
                                            ) => (
                                                <option
                                                    key={
                                                        warehouse.id
                                                    }
                                                    value={
                                                        warehouse.id
                                                    }
                                                >
                                                    {
                                                        warehouse.code
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        warehouse.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>

                                    <FormError
                                        error={
                                            serverErrors.to_warehouse_id
                                        }
                                    />
                                </FormField>
                            </div>
                        </>
                    )}

                    {/* Date */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                required
                            >
                                Date
                            </FormLabel>

                            <Input
                                type="date"
                                value={
                                    documentDate
                                }
                                disabled={
                                    processing
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setDocumentDate(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </FormField>
                    </div>

                    {/* Remarks */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel>
                                Remarks
                            </FormLabel>

                            <textarea
                                className="form-control"
                                rows={3}
                                value={
                                    data.remarks
                                }
                                disabled={
                                    processing
                                }
                                placeholder="Optional remarks..."
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'remarks',
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            />
                        </FormField>
                    </div>

                    {/* Items */}

                    <div className="col-12">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                            <div>
                                <h6 className="mb-1">
                                    Products
                                </h6>

                                <small className="text-muted">
                                    Add one or more
                                    products.
                                </small>
                            </div>

                            <Button
                                type="button"
                                onClick={
                                    addItem
                                }
                                disabled={
                                    processing
                                }
                            >
                                <Plus
                                    size={
                                        16
                                    }
                                    className="me-1"
                                />
                                Add Item
                            </Button>
                        </div>

                        <FormError
                            error={
                                serverErrors.items
                            }
                        />

                        <div className="d-flex flex-column gap-3">
                            {data.items.map(
                                (
                                    item,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="border rounded p-3"
                                    >
                                        <div className="row g-3 align-items-end">
                                            {/* Product */}

                                            <div
                                                className={
                                                    mode ===
                                                    'adjustment'
                                                        ? 'col-12 col-lg-5'
                                                        : 'col-12 col-lg-7'
                                                }
                                            >
                                                <FormField>
                                                    <FormLabel
                                                        required
                                                    >
                                                        Product
                                                    </FormLabel>

                                                    <select
                                                        className={cn(
                                                            'form-select',
                                                            serverErrors[
                                                                `items.${index}.product_id`
                                                            ] &&
                                                                'is-invalid',
                                                        )}
                                                        value={
                                                            item.product_id
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateItem(
                                                                index,
                                                                'product_id',
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Select product
                                                        </option>

                                                        {products.map(
                                                            (
                                                                product,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    value={
                                                                        product.id
                                                                    }
                                                                >
                                                                    {
                                                                        product.code
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        product.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>

                                                    <FormError
                                                        error={
                                                            serverErrors[
                                                                `items.${index}.product_id`
                                                            ]
                                                        }
                                                    />
                                                </FormField>
                                            </div>

                                            {/* Direction */}

                                            {mode ===
                                                'adjustment' && (
                                                <div className="col-12 col-md-6 col-lg-3">
                                                    <FormField>
                                                        <FormLabel
                                                            required
                                                        >
                                                            Direction
                                                        </FormLabel>

                                                        <select
                                                            className="form-select"
                                                            value={
                                                                item.direction
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    'direction',
                                                                    event
                                                                        .target
                                                                        .value as StockDirection,
                                                                )
                                                            }
                                                        >
                                                            <option value="increase">
                                                                Increase
                                                            </option>

                                                            <option value="decrease">
                                                                Decrease
                                                            </option>
                                                        </select>
                                                    </FormField>
                                                </div>
                                            )}

                                            {/* Quantity */}

                                            <div
                                                className={
                                                    mode ===
                                                    'adjustment'
                                                        ? 'col-9 col-md-4 col-lg-3'
                                                        : 'col-9 col-md-5 col-lg-4'
                                                }
                                            >
                                                <FormField>
                                                    <FormLabel
                                                        required
                                                    >
                                                        Quantity
                                                    </FormLabel>

                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={
                                                            item.quantity
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                        className={cn(
                                                            serverErrors[
                                                                `items.${index}.quantity`
                                                            ] &&
                                                                'is-invalid',
                                                        )}
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateItem(
                                                                index,
                                                                'quantity',
                                                                event
                                                                    .target
                                                                    .value,
                                                            )
                                                        }
                                                    />

                                                    <FormError
                                                        error={
                                                            serverErrors[
                                                                `items.${index}.quantity`
                                                            ]
                                                        }
                                                    />
                                                </FormField>
                                            </div>

                                            {/* Remove */}

                                            <div className="col-3 col-md-auto">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    title="Remove item"
                                                    disabled={
                                                        processing ||
                                                        data
                                                            .items
                                                            .length ===
                                                            1
                                                    }
                                                    onClick={() =>
                                                        removeItem(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <Trash
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}