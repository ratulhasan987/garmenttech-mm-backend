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
    ip_address: z
        .string()
        .trim()
        .min(
            1,
            'IP address is required.',
        )
        .max(
            100,
            'IP address cannot exceed 100 characters.',
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

export default function CreateWifiIPModal({
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
        ip_address: '',
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

        post('/wifi-ips', {
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
            title="Add New IP Address"
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
                        form="create-wifi-ips-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save IP Address'}
                    </Button>
                </>
            }
        >
            <form
                id="create-wifi-ips-form"
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
                                IP Address
                            </FormLabel>

                            <Input
                                id="ip_address"
                                name="ip_address"
                                value={
                                    data.ip_address
                                }
                                placeholder="e.g. 192.168.1.1"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.ip_address &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'ip_address',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.ip_address
                                }
                            />
                        </FormField>
                    </div>


                </div>
            </form>
        </AppModal>
    );
}
