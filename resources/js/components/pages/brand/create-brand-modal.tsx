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

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const brandSchema = z.object({
    name: z
        .string()
        .min(1, 'Brand name is required.')
        .max(255, 'Brand name cannot exceed 255 characters.'),
    country: z
        .string()
        .max(255, 'Country cannot exceed 255 characters.')
        .optional()
        .or(z.literal('')),
    website: z
        .string()
        .max(255, 'Website cannot exceed 255 characters.')
        .optional()
        .or(z.literal('')),
    description: z
        .string()
        .optional()
        .or(z.literal('')),
    is_active: z.boolean(),
});

type BrandFormData = z.input<typeof brandSchema>;
type BrandFormErrors = Partial<Record<keyof BrandFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateBrandModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateBrandModal({
    open,
    onOpenChange,
}: CreateBrandModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<BrandFormData>({
        name: '',
        country: '',
        website: '',
        description: '',
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<BrandFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = brandSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: BrandFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof BrandFormData;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/brand', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: BrandFormErrors = {
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
            title="Add New Brand"
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
                        form="create-brand-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Brand'}
                    </Button>
                </>
            }
        >
            <form id="create-brand-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Brand Name */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Brand Name
                            </FormLabel>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. Siemens, ABB"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* Country */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="country">Country</FormLabel>
                            <Input
                                type="text"
                                id="country"
                                name="country"
                                value={data.country}
                                placeholder="e.g. Germany"
                                disabled={processing}
                                className={cn(formErrors.country && 'is-invalid')}
                                onChange={(e) => setData('country', e.target.value)}
                            />
                            <FormError error={formErrors.country} />
                        </FormField>
                    </div>

                    {/* Website */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="website">Website</FormLabel>
                            <Input
                                type="text"
                                id="website"
                                name="website"
                                value={data.website}
                                placeholder="e.g. https://www.siemens.com"
                                disabled={processing}
                                className={cn(formErrors.website && 'is-invalid')}
                                onChange={(e) => setData('website', e.target.value)}
                            />
                            <FormError error={formErrors.website} />
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