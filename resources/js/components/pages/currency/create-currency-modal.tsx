import {
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

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const currencySchema = z.object({
    currency_code: z
        .string()
        .trim()
        .min(
            3,
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

type CreateCurrencyModalProps = {
    open: boolean;
    onOpenChange: (
        open: boolean,
    ) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateCurrencyModal({
    open,
    onOpenChange,
}: CreateCurrencyModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<CurrencyFormData>({
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

        post('/currency', {
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
            title="Add New Currency"
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
                        form="create-currency-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save Currency'}
                    </Button>
                </>
            }
        >
            <form
                id="create-currency-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Currency Code */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="currency_code"
                                required
                            >
                                Currency
                                Code (3 letters)
                            </FormLabel>

                            <Input
                                id="currency_code"
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
                                htmlFor="currency_name"
                                required
                            >
                                Currency
                                Name
                            </FormLabel>

                            <Input
                                id="currency_name"
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
                                htmlFor="symbol"
                            >
                                Symbol
                            </FormLabel>

                            <Input
                                id="symbol"
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
                                htmlFor="country"
                            >
                                Country
                            </FormLabel>

                            <Input
                                id="country"
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
                                htmlFor="exchange_rate"
                                required
                            >
                                Exchange
                                Rate
                            </FormLabel>

                            <Input
                                type="number"
                                id="exchange_rate"
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
                                id="is_active"
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
