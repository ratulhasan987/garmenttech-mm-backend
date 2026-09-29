import {
    useEffect,
    type FormEvent,
} from 'react';

import {
    useForm,
} from '@inertiajs/react';

import dayjs from 'dayjs';

import { Button } from '@/components/ui/button';

import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';

import { DatePicker } from '@/components/ui/form/date-picker';

import { FileDropzone } from '@/components/ui/form/file-dropzone';

import { Input } from '@/components/ui/form/input';

import { AppModal } from '@/components/ui/modal/app-modal';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type BillPaymentData = {
    id: number;

    date:
    | string
    | null;

    pay_amount: number;

    account_id:
    | number
    | null;

    reference:
    | string
    | null;

    description:
    | string
    | null;

    attachment:
    | string
    | null;

    created_at:
    | string
    | null;

    created_by_user:
    | {
        id: number;

        name: string;

        employee_id?:
        | string
        | null;
    }
    | null;
};

type PaymentForm = {
    date: string;

    pay_amount: string;

    account_id: string;

    reference: string;

    description: string;

    attachment:
    | File
    | null;

    remove_attachment:
    boolean;
};

type Props = {
    open: boolean;

    onOpenChange:
    (
        open: boolean,
    ) => void;

    billId: number;

    dueAmount: number;

    payment:
    | BillPaymentData
    | null;

    currencySymbol:
    string;
};

/*
|--------------------------------------------------------------------------
| File URL
|--------------------------------------------------------------------------
*/

function getFileUrl(
    path:
        | string
        | null
        | undefined,
) {
    if (!path) {
        return null;
    }

    if (
        path.startsWith(
            'http://'
        ) ||
        path.startsWith(
            'https://'
        )
    ) {
        return path;
    }

    return `/${path.replace(
        /^\/+/,
        '',
    )}`;
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function BillPaymentModal({
    open,
    onOpenChange,
    billId,
    dueAmount,
    payment,
    currencySymbol,
}: Props) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } =
        useForm<PaymentForm>({
            date:
                dayjs()
                    .format(
                        'YYYY-MM-DD'
                    ),

            pay_amount:
                '',

            account_id:
                '',

            reference:
                '',

            description:
                '',

            attachment:
                null,

            remove_attachment:
                false,
        });

    /*
    |--------------------------------------------------------------------------
    | Edit Data
    |--------------------------------------------------------------------------
    */

    useEffect(
        () => {
            if (
                !open
            ) {
                return;
            }

            clearErrors();

            if (
                payment
            ) {
                setData({
                    date:
                        payment.date ??
                        dayjs()
                            .format(
                                'YYYY-MM-DD'
                            ),

                    pay_amount:
                        String(
                            payment
                                .pay_amount
                        ),

                    account_id:
                        payment
                            .account_id
                            ? String(
                                payment
                                    .account_id
                            )
                            : '',

                    reference:
                        payment
                            .reference ??
                        '',

                    description:
                        payment
                            .description ??
                        '',

                    attachment:
                        null,

                    remove_attachment:
                        false,
                });

                return;
            }

            setData({
                date:
                    dayjs()
                        .format(
                            'YYYY-MM-DD'
                        ),

                pay_amount:
                    '',

                account_id:
                    '',

                reference:
                    '',

                description:
                    '',

                attachment:
                    null,

                remove_attachment:
                    false,
            });
        },
        [
            open,
            payment,
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Maximum Amount
    |--------------------------------------------------------------------------
    |
    | When editing, the current payment is already included in paid_amount.
    |
    | Therefore:
    |
    | editable max = current due + current payment
    |
    */

    const maximumAmount =
        payment
            ? Number(
                dueAmount
            ) +
            Number(
                payment
                    .pay_amount
            )
            : Number(
                dueAmount
            );

    /*
    |--------------------------------------------------------------------------
    | Existing Attachment
    |--------------------------------------------------------------------------
    */

    const existingAttachmentUrl =
        !data.remove_attachment
            ? getFileUrl(
                payment
                    ?.attachment
            )
            : null;

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose =
        () => {
            if (
                processing
            ) {
                return;
            }

            reset();

            clearErrors();

            onOpenChange(
                false
            );
        };

    /*
    |--------------------------------------------------------------------------
    | File
    |--------------------------------------------------------------------------
    */

    const handleFileChange =
        (
            value:
                | File
                | File[]
                | null
        ) => {
            const file =
                Array.isArray(
                    value
                )
                    ? value[
                    0
                    ] ??
                    null
                    : value;

            setData(
                'attachment',
                file
            );

            if (
                file
            ) {
                setData(
                    'remove_attachment',
                    false
                );
            }

            clearErrors(
                'attachment'
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit =
        (
            event:
                FormEvent<HTMLFormElement>
        ) => {
            event.preventDefault();

            const url =
                payment
                    ? `/bill/${billId}/payments/${payment.id}/update`
                    : `/bill/${billId}/payments`;

            post(
                url,
                {
                    preserveScroll:
                        true,

                    forceFormData:
                        true,

                    onSuccess:
                        () => {
                            reset();

                            clearErrors();

                            onOpenChange(
                                false
                            );
                        },
                }
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppModal
            open={
                open
            }
            onOpenChange={(
                nextOpen,
            ) => {
                if (
                    !nextOpen
                ) {
                    handleClose();

                    return;
                }

                onOpenChange(
                    nextOpen
                );
            }}
            title={
                payment
                    ? 'Edit Bill Payment'
                    : 'Add Bill Payment'
            }
            size="lg"
            busy={
                processing
            }
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
                        form="bill-payment-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? (
                                payment
                                    ? 'Updating...'
                                    : 'Saving...'
                            )
                            : (
                                payment
                                    ? 'Update Payment'
                                    : 'Save Payment'
                            )}
                    </Button>
                </>
            }
        >
            <form
                id="bill-payment-form"
                onSubmit={
                    handleSubmit
                }
            >
                {/*
                |--------------------------------------------------------------------------
                | Payable Information
                |--------------------------------------------------------------------------
                */}

                <div className="alert alert-light border mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>
                            Maximum Payable
                        </span>

                        <strong>
                            {currencySymbol}{' '}
                            {maximumAmount
                                .toLocaleString(
                                    'en-US',
                                    {
                                        minimumFractionDigits:
                                            2,

                                        maximumFractionDigits:
                                            2,
                                    }
                                )}
                        </strong>
                    </div>
                </div>

                <div className="row">
                    {/*
                    |--------------------------------------------------------------------------
                    | Payment Date
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6 mb-3">
                        <FormField>
                            <FormLabel
                                required
                            >
                                Payment Date
                            </FormLabel>

                            <DatePicker
                                value={
                                    data.date
                                }
                                error={
                                    errors.date
                                }
                                onChange={(
                                    value
                                ) => {
                                    setData(
                                        'date',
                                        value
                                    );

                                    clearErrors(
                                        'date'
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    errors.date
                                }
                            />
                        </FormField>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Amount
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6 mb-3">
                        <FormField>
                            <FormLabel
                                required
                            >
                                Payment Amount
                            </FormLabel>

                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                max={
                                    maximumAmount
                                }
                                value={
                                    data
                                        .pay_amount
                                }
                                disabled={
                                    processing
                                }
                                error={
                                    errors
                                        .pay_amount
                                }
                                onChange={(
                                    event
                                ) => {
                                    setData(
                                        'pay_amount',
                                        event
                                            .target
                                            .value
                                    );

                                    clearErrors(
                                        'pay_amount'
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    errors
                                        .pay_amount
                                }
                            />
                        </FormField>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Account
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6 mb-3">
                        <FormField>
                            <FormLabel>
                                Account ID
                            </FormLabel>

                            <Input
                                type="number"
                                min="1"
                                value={
                                    data
                                        .account_id
                                }
                                disabled={
                                    processing
                                }
                                error={
                                    errors
                                        .account_id
                                }
                                placeholder="Optional"
                                onChange={(
                                    event
                                ) => {
                                    setData(
                                        'account_id',
                                        event
                                            .target
                                            .value
                                    );

                                    clearErrors(
                                        'account_id'
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    errors
                                        .account_id
                                }
                            />
                        </FormField>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Reference
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6 mb-3">
                        <FormField>
                            <FormLabel>
                                Reference
                            </FormLabel>

                            <Input
                                value={
                                    data
                                        .reference
                                }
                                disabled={
                                    processing
                                }
                                error={
                                    errors
                                        .reference
                                }
                                placeholder="Cheque / transaction / voucher reference"
                                onChange={(
                                    event
                                ) => {
                                    setData(
                                        'reference',
                                        event
                                            .target
                                            .value
                                    );

                                    clearErrors(
                                        'reference'
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    errors
                                        .reference
                                }
                            />
                        </FormField>
                    </div>
                </div>

                {/*
                |--------------------------------------------------------------------------
                | Description
                |--------------------------------------------------------------------------
                */}

                <div className="mb-3">
                    <FormField>
                        <FormLabel>
                            Description
                        </FormLabel>

                        <textarea
                            className={`form-control ${errors.description
                                    ? 'is-invalid'
                                    : ''
                                }`}
                            rows={
                                3
                            }
                            value={
                                data
                                    .description
                            }
                            disabled={
                                processing
                            }
                            placeholder="Payment note..."
                            onChange={(
                                event
                            ) => {
                                setData(
                                    'description',
                                    event
                                        .target
                                        .value
                                );

                                clearErrors(
                                    'description'
                                );
                            }}
                        />

                        <FormError
                            error={
                                errors
                                    .description
                            }
                        />
                    </FormField>
                </div>

                {/*
                |--------------------------------------------------------------------------
                | Existing Attachment
                |--------------------------------------------------------------------------
                */}

                {existingAttachmentUrl && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center border rounded p-3">
                            <div>
                                <strong>
                                    Current Attachment
                                </strong>

                                <div className="mt-1">
                                    <a
                                        href={
                                            existingAttachmentUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View attachment
                                    </a>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="danger"
                                appearance="outline"
                                disabled={
                                    processing
                                }
                                onClick={
                                    () => {
                                        setData(
                                            'remove_attachment',
                                            true
                                        );

                                        setData(
                                            'attachment',
                                            null
                                        );
                                    }
                                }
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                )}

                {data.remove_attachment &&
                    payment
                        ?.attachment && (
                        <div className="alert alert-warning py-2">
                            Existing attachment will be removed.

                            <button
                                type="button"
                                className="btn btn-link btn-sm p-0 ms-2"
                                disabled={
                                    processing
                                }
                                onClick={
                                    () =>
                                        setData(
                                            'remove_attachment',
                                            false
                                        )
                                }
                            >
                                Undo
                            </button>
                        </div>
                    )}

                {/*
                |--------------------------------------------------------------------------
                | Attachment
                |--------------------------------------------------------------------------
                */}

                <FormField>
                    <FormLabel>
                        {payment
                            ?.attachment
                            ? 'Replace Attachment'
                            : 'Attachment'}
                    </FormLabel>

                    <FileDropzone
                        value={
                            data
                                .attachment
                        }
                        onChange={
                            handleFileChange
                        }
                        multiple={
                            false
                        }
                        maxFiles={
                            1
                        }
                        maxSize={
                            5 *
                            1024 *
                            1024
                        }
                        showImagePreview
                        previewInsideDropzone
                        previewHeight={
                            120
                        }
                        disabled={
                            processing
                        }
                        error={
                            errors
                                .attachment
                        }
                        accept={{
                            'image/jpeg': [
                                '.jpg',
                                '.jpeg',
                            ],

                            'image/png': [
                                '.png',
                            ],

                            'application/pdf': [
                                '.pdf',
                            ],
                        }}
                        placeholder="Drop payment attachment here or click to select."
                    />

                    <FormError
                        error={
                            errors
                                .attachment
                        }
                    />
                </FormField>
            </form>
        </AppModal>
    );
}