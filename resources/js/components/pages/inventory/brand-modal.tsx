import {
    useEffect,
    type FormEvent,
} from 'react';

import { useForm } from '@inertiajs/react';

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
    ProductBrand,
} from '@/types/inventory';

type BrandFormData = {
    name: string;
};

type BrandModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    brand?:
        | ProductBrand
        | null;
};

export default function BrandModal({
    open,
    onOpenChange,
    brand = null,
}: BrandModalProps) {
    const isEditing =
        brand !== null;

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } =
        useForm<BrandFormData>({
            name: '',
        });

    useEffect(() => {
        if (!open) {
            return;
        }

        if (brand) {
            setData({
                name:
                    brand.name,
            });

            clearErrors();

            return;
        }

        reset();
        clearErrors();
    }, [
        open,
        brand,
    ]);

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();

        onOpenChange(false);
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                clearErrors();

                onOpenChange(false);
            },
        };

        if (brand) {
            put(
                `/operations/product-brands/${brand.id}`,
                options,
            );

            return;
        }

        post(
            '/operations/product-brands',
            options,
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
                isEditing
                    ? 'Edit Brand'
                    : 'Add New Brand'
            }
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
                        form="brand-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : isEditing
                              ? 'Update Brand'
                              : 'Save Brand'}
                    </Button>
                </>
            }
        >
            <form
                id="brand-form"
                onSubmit={
                    handleSubmit
                }
            >
                <FormField>
                    <FormLabel
                        htmlFor="brand-name"
                        required
                    >
                        Brand Name
                    </FormLabel>

                    <Input
                        id="brand-name"
                        value={
                            data.name
                        }
                        placeholder="e.g. Samsung"
                        disabled={
                            processing
                        }
                        className={cn(
                            errors.name &&
                                'is-invalid',
                        )}
                        onChange={(
                            event,
                        ) =>
                            setData(
                                'name',
                                event
                                    .target
                                    .value,
                            )
                        }
                    />

                    <FormError
                        error={
                            errors.name
                        }
                    />
                </FormField>
            </form>
        </AppModal>
    );
}