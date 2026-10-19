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
import type { SimpleOption } from '@/types/machine-model';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const modelSchema = z.object({
    name: z
        .string()
        .min(1, 'Model name is required.')
        .max(255, 'Model name cannot exceed 255 characters.'),
    code: z
        .string()
        .min(1, 'Model code is required.')
        .max(255, 'Model code cannot exceed 255 characters.'),
    machine_category_id: z
        .string()
        .optional()
        .or(z.literal('')),
    brand_id: z
        .string()
        .optional()
        .or(z.literal('')),
    description: z
        .string()
        .optional()
        .or(z.literal('')),
    is_active: z.boolean(),
});

type ModelFormData = z.input<typeof modelSchema>;
type ModelFormErrors = Partial<Record<keyof ModelFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateMachineModelModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: SimpleOption[];
    brands: SimpleOption[];
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateMachineModelModal({
    open,
    onOpenChange,
    categories,
    brands,
}: CreateMachineModelModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<ModelFormData>({
        name: '',
        code: '',
        machine_category_id: '',
        brand_id: '',
        description: '',
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<ModelFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = modelSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: ModelFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof ModelFormData;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/machine-model', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: ModelFormErrors = {
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
            title="Add New Machine Model"
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
                        form="create-model-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Model'}
                    </Button>
                </>
            }
        >
            <form id="create-model-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Model Name */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Model Name
                            </FormLabel>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. CNC-X500"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* Model Code */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="code" required>
                                Model Code
                            </FormLabel>
                            <Input
                                type="text"
                                id="code"
                                name="code"
                                value={data.code}
                                placeholder="e.g. MOD-001"
                                disabled={processing}
                                className={cn(formErrors.code && 'is-invalid')}
                                onChange={(e) => setData('code', e.target.value)}
                            />
                            <FormError error={formErrors.code} />
                        </FormField>
                    </div>

                    {/* Machine Category */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="machine_category_id">Machine Category</FormLabel>
                            <select
                                id="machine_category_id"
                                name="machine_category_id"
                                className={cn(
                                    'form-control',
                                    formErrors.machine_category_id && 'is-invalid'
                                )}
                                value={data.machine_category_id}
                                disabled={processing}
                                onChange={(e) => setData('machine_category_id', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                            <FormError error={formErrors.machine_category_id} />
                        </FormField>
                    </div>

                    {/* Brand */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="brand_id">Brand</FormLabel>
                            <select
                                id="brand_id"
                                name="brand_id"
                                className={cn(
                                    'form-control',
                                    formErrors.brand_id && 'is-invalid'
                                )}
                                value={data.brand_id}
                                disabled={processing}
                                onChange={(e) => setData('brand_id', e.target.value)}
                            >
                                <option value="">Select Brand</option>
                                {brands.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                            <FormError error={formErrors.brand_id} />
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