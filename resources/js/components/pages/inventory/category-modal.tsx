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
    LookupItem,
    ProductCategory,
} from '@/types/inventory';

type CategoryFormData = {
    name: string;

    parent_id: string;
};

type CategoryModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    category?:
        | ProductCategory
        | null;

    parents: LookupItem[];
};

export default function CategoryModal({
    open,
    onOpenChange,
    category = null,
    parents,
}: CategoryModalProps) {
    const isEditing =
        category !== null;

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
        useForm<CategoryFormData>({
            name: '',
            parent_id: '',
        });

    useEffect(() => {
        if (!open) {
            return;
        }

        if (category) {
            setData({
                name:
                    category.name,

                parent_id:
                    category.parent_id
                        ? String(
                              category.parent_id,
                          )
                        : '',
            });

            clearErrors();

            return;
        }

        reset();
        clearErrors();
    }, [
        open,
        category,
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

        if (
            category &&
            isEditing
        ) {
            put(
                `/operations/product-categories/${category.id}`,
                options,
            );

            return;
        }

        post(
            '/operations/product-categories',
            options,
        );
    };

    const availableParents =
        parents.filter(
            (parent) =>
                parent.id !==
                category?.id,
        );

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
                    ? 'Edit Category'
                    : 'Add New Category'
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
                        form="category-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : isEditing
                              ? 'Update Category'
                              : 'Save Category'}
                    </Button>
                </>
            }
        >
            <form
                id="category-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row g-3">
                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="category-name"
                                required
                            >
                                Category Name
                            </FormLabel>

                            <Input
                                id="category-name"
                                value={
                                    data.name
                                }
                                placeholder="e.g. Electronics"
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
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="parent-category"
                            >
                                Parent Category
                            </FormLabel>

                            <select
                                id="parent-category"
                                className={cn(
                                    'form-select',
                                    errors.parent_id &&
                                        'is-invalid',
                                )}
                                value={
                                    data.parent_id
                                }
                                disabled={
                                    processing
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'parent_id',
                                        event
                                            .target
                                            .value,
                                    )
                                }
                            >
                                <option value="">
                                    Root Category
                                </option>

                                {availableParents.map(
                                    (parent) => (
                                        <option
                                            key={
                                                parent.id
                                            }
                                            value={
                                                parent.id
                                            }
                                        >
                                            {
                                                parent.name
                                            }
                                        </option>
                                    ),
                                )}
                            </select>

                            <FormError
                                error={
                                    errors.parent_id
                                }
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}