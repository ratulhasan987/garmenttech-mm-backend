import { useState, type FormEvent } from 'react';
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
import type { MachineCategoryOption } from '@/types/machine-category';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const categorySchema = z.object({
    name: z
        .string()
        .min(1, 'Category name is required.')
        .max(255, 'Category name cannot exceed 255 characters.'),
    parent_id: z
        .string()
        .optional()
        .or(z.literal('')),
    description: z
        .string()
        .optional()
        .or(z.literal('')),
    is_active: z.boolean(),
});

type CategoryFormData = z.input<typeof categorySchema>;
type CategoryFormErrors = Partial<Record<keyof CategoryFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateMachineCategoryModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentOptions: MachineCategoryOption[];
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateMachineCategoryModal({
    open,
    onOpenChange,
    parentOptions,
}: CreateMachineCategoryModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<CategoryFormData>({
        name: '',
        parent_id: '',
        description: '',
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<CategoryFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = categorySchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: CategoryFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CategoryFormData;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/machine-category', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: CategoryFormErrors = {
        ...validationErrors,
        ...errors,
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();
                    return;
                }
                onOpenChange(nextOpen);
            }}
            title="Add New Machine Category"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={processing}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="create-category-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Category'}
                    </Button>
                </>
            }
        >
            <form id="create-category-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Category Name */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Category Name
                            </FormLabel>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. CNC Machines, Pumps"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* Parent Category */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="parent_id">Parent Category</FormLabel>
                            <select
                                id="parent_id"
                                name="parent_id"
                                className={cn(
                                    'form-control',
                                    formErrors.parent_id && 'is-invalid'
                                )}
                                value={data.parent_id}
                                disabled={processing}
                                onChange={(e) => setData('parent_id', e.target.value)}
                            >
                                <option value="">None (Root Category)</option>
                                {parentOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                            <FormError error={formErrors.parent_id} />
                        </FormField>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="description">Description</FormLabel>
                            <textarea
                                id="description"
                                name="description"
                                className={cn(
                                    'form-control',
                                    formErrors.description && 'is-invalid'
                                )}
                                rows={3}
                                placeholder="Enter optional description..."
                                value={data.description}
                                disabled={processing}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <FormError error={formErrors.description} />
                        </FormField>
                    </div>

                    {/* Is Active */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel>Is Active</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="create-is-active"
                                    checked={data.is_active}
                                    disabled={processing}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}