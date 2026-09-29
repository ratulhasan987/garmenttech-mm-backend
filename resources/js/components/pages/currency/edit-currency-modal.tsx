import {
    useEffect,
    useState,
    type SubmitEvent,
} from 'react';

import { useForm } from '@inertiajs/react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    FormError,
    FormField,
    FormLabel,
} from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { Switch } from '@/components/ui/form/switch';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

import type { Currency } from '@/types/currency';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const currencySchema = z.object({
    id: z
        .number({
            message: 'Currency ID is required.',
        })
        .nullable()
        .refine(
            (value) => value !== null,
            {
                message: 'Currency ID is required.',
            },
        ),

    currency_code: z
        .string()
        .trim()
        .min(
            1,
            'Currency code is required.',
        )
        .max(
            10,
            'Currency code cannot exceed 10 characters.',
        ),

    currency_name: z
        .string()
        .trim()
        .min(
            1,
            'Currency name is required.',
        )
        .max(
            100,
            'Currency name cannot exceed 100 characters.',
        ),

    symbol: z
        .string()
        .trim()
        .max(
            10,
            'Symbol cannot exceed 10 characters.',
        )
        .nullable(),

    country: z
        .string()
        .trim()
        .max(
            100,
            'Country cannot exceed 100 characters.',
        )
        .nullable(),

    exchange_rate: z
        .number({
            message:
                'Exchange rate must be a valid number.',
        })
        .positive(
            'Exchange rate must be greater than 0.',
        ),

    is_active: z.boolean(),
});

type CurrencyFormData =
    z.input<typeof currencySchema>;

type CurrencyFormErrors =
    Partial<
        Record<
            keyof CurrencyFormData,
            string
        >
    >;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type EditCurrencyModalProps = {
    open: boolean;
    onOpenChange: (
        open: boolean,
    ) => void;
    currency: Currency | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditCurrencyModal({
    open,
    onOpenChange,
    currency,
}: EditCurrencyModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<CurrencyFormData>({
        id: null,
        currency_code: '',
        currency_name: '',
        symbol: null,
        country: null,
        exchange_rate: 1,
        is_active: true,
    });

    const [
        validationErrors,
        setValidationErrors,
    ] =
        useState<CurrencyFormErrors>(
            {},
        );

    /*
    |--------------------------------------------------------------------------
    | Populate Edit Data
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!currency || !open) {
            return;
        }

        setData({
            id: currency.id,

            currency_code:
                currency.currency_code ??
                '',

            currency_name:
                currency.currency_name ??
                '',

            symbol:
                currency.symbol ??
                null,

            country:
                currency.country ??
                null,

            exchange_rate:
                Number(
                    currency.exchange_rate,
                ),

            is_active:
                Boolean(
                    currency.is_active,
                ),
        });

        clearErrors();
        setValidationErrors({});
    }, [
        currency,
        open,
    ]);

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
        setValidationErrors({});

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!currency) {
            return;
        }

        const result =
            currencySchema.safeParse(
                data,
            );

        if (!result.success) {
            const fieldErrors: CurrencyFormErrors =
                {};

            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue
                            .path[0] as keyof CurrencyFormData;

                    if (
                        !fieldErrors[
                        field
                        ]
                    ) {
                        fieldErrors[
                            field
                        ] =
                            issue.message;
                    }
                },
            );

            setValidationErrors(
                fieldErrors,
            );

            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/currency-update', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors(
                    {},
                );

                onOpenChange(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const formErrors: CurrencyFormErrors =
    {
        ...validationErrors,
        ...errors,
    };

    /*
    |--------------------------------------------------------------------------
    | No Currency
    |--------------------------------------------------------------------------
    */

    if (!currency) {
        return null;
    }

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
            title="Edit Currency"
            busy={processing}
            centered={false}
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
                        form="edit-currency-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Updating...'
                            : 'Update Currency'}
                    </Button>
                </>
            }
        >
            <form
                id="edit-currency-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Currency Code */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-currency-code"
                                required
                            >
                                Currency Code
                            </FormLabel>

                            <Input
                                id="edit-currency-code"
                                name="currency_code"
                                value={
                                    data.currency_code
                                }
                                placeholder="e.g. BDT"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.currency_code &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'currency_code',
                                        event
                                            .target
                                            .value
                                            .toUpperCase(),
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.currency_code
                                }
                            />
                        </FormField>
                    </div>

                    {/* Currency Name */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-currency-name"
                                required
                            >
                                Currency Name
                            </FormLabel>

                            <Input
                                id="edit-currency-name"
                                name="currency_name"
                                value={
                                    data.currency_name
                                }
                                placeholder="e.g. Bangladeshi Taka"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.currency_name &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'currency_name',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.currency_name
                                }
                            />
                        </FormField>
                    </div>

                    {/* Symbol */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-currency-symbol"
                            >
                                Symbol
                            </FormLabel>

                            <Input
                                id="edit-currency-symbol"
                                name="symbol"
                                value={
                                    data.symbol ??
                                    ''
                                }
                                placeholder="e.g. ৳"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.symbol &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'symbol',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.symbol
                                }
                            />
                        </FormField>
                    </div>

                    {/* Country */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-currency-country"
                            >
                                Country
                            </FormLabel>

                            <Input
                                id="edit-currency-country"
                                name="country"
                                value={
                                    data.country ??
                                    ''
                                }
                                placeholder="e.g. Bangladesh"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.country &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'country',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.country
                                }
                            />
                        </FormField>
                    </div>

                    {/* Exchange Rate */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="edit-exchange-rate"
                                required
                            >
                                Exchange Rate
                            </FormLabel>

                            <Input
                                type="number"
                                id="edit-exchange-rate"
                                name="exchange_rate"
                                value={
                                    data.exchange_rate
                                }
                                min="0"
                                step="0.0001"
                                placeholder="e.g. 1"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.exchange_rate &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'exchange_rate',
                                        Number(
                                            event
                                                .target
                                                .value,
                                        ),
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.exchange_rate
                                }
                            />
                        </FormField>
                    </div>

                    {/* Active */}

                    <div className="col-12">
                        <FormField>
                            <Switch
                                id="edit-currency-active"
                                label="Active"
                                checked={
                                    data.is_active
                                }
                                disabled={
                                    processing
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'is_active',
                                        event
                                            .target
                                            .checked,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.is_active
                                }
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
