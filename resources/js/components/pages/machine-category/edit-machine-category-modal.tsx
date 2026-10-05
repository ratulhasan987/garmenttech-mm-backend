import { useEffect, useState, type FormEvent } from 'react';
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
import type { MachineCategory, MachineCategoryOption } from '@/types/machine-category';

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

type EditMachineCategoryModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: MachineCategory | null;
    parentOptions: MachineCategoryOption[];
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditMachineCategoryModal({
    open,
    onOpenChange,
    category,
    parentOptions,
}: EditMachineCategoryModalProps) {
    const {
        data,
        setData,
        put,
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

    useEffect(() => {
        if (open && category) {
            clearErrors();
            setValidationErrors({});
            setData({
                name: category.name || '',
                parent_id: category.parent_id ? String(category.parent_id) : '',
                description: category.description || '',
                is_active: category.is_active ?? true,
            });
        }
    }, [open, category]);

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!category) return;

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

        put(`/machine-category/${category.id}`, {
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
                } else {
                    onOpenChange(nextOpen);
                }
            }}
            title="Edit Machine Category"
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
                        form="edit-category-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Category'}
                    </Button>
                </>
            }
        >
            <form id="edit-category-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Category Name */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-name" required>
                                Category Name
                            </FormLabel>
                            <Input
                                type="text"
                                id="edit-name"
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
                            <FormLabel htmlFor="edit-parent_id">Parent Category</FormLabel>
                            <select
                                id="edit-parent_id"
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
                                {parentOptions
                                    .filter((opt) => opt.id !== category?.id) // Prevent self-parenting
                                    .map((opt) => (
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
                            <FormLabel htmlFor="edit-description">Description</FormLabel>
                            <textarea
                                id="edit-description"
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
                                    id="edit-is-active"
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