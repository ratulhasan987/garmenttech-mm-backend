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
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const taxSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            1,
            'Tax name is required.',
        )
        .max(
            100,
            'Tax name cannot exceed 100 characters.',
        ),

    rate: z
        .number({
            message: 'Rate must be a valid number.',
        })
        .nullable()
        .refine(
            (value) =>
                value !== null,
            {
                message: 'Rate is required.',
            },
        )
        .refine(
            (value) =>
                value === null ||
                value > 0,
            {
                message:
                    'Rate must be greater than 0.',
            },
        ),
});

type TaxFormData =
    z.input<typeof taxSchema>;

type TaxFormErrors =
    Partial<
        Record<
            keyof TaxFormData,
            string
        >
    >;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateTaxModalProps = {
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

export default function CreateTaxModal({
    open,
    onOpenChange,
}: CreateTaxModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<TaxFormData>({
        name: '',
        rate: null,
    });

    const [
        validationErrors,
        setValidationErrors,
    ] =
        useState<TaxFormErrors>(
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
            taxSchema.safeParse(
                data,
            );

        if (!result.success) {
            const fieldErrors: TaxFormErrors =
                {};

            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue
                            .path[0] as keyof TaxFormData;

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

        post('/tax', {
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

    const formErrors: TaxFormErrors = {
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
            title="Add New Tax"
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
                        form="create-tax-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save Tax'}
                    </Button>
                </>
            }
        >
            <form
                id="create-tax-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Name */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="name"
                                required
                            >
                                Name
                            </FormLabel>

                            <Input
                                id="name"
                                name="name"
                                value={
                                    data.name
                                }
                                placeholder="e.g. VAT"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.name &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'name',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.name
                                }
                            />
                        </FormField>
                    </div>

                    {/* Rate */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="rate"
                                required
                            >
                                Rate %
                            </FormLabel>

                            <Input
                                type="number"
                                id="rate"
                                name="rate"
                                value={
                                    data.rate ??
                                    ''
                                }
                                placeholder="e.g. 15"
                                min="0"
                                step="0.01"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.rate &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    const value =
                                        event
                                            .target
                                            .value;

                                    setData(
                                        'rate',

                                        value ===
                                            ''
                                            ? null
                                            : Number(
                                                value,
                                            ),
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.rate
                                }
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
