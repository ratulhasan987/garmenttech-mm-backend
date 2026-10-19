import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, FormField, FormLabel } from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

const itemTypeSchema = z.object({
    name: z.string().min(1, 'Item type name is required.').max(255, 'Name cannot exceed 255 characters.'),
    code: z.string().max(255, 'Code cannot exceed 255 characters.').optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    is_consumable: z.boolean(),
    is_serialized: z.boolean(),
    is_active: z.boolean(),
});

type ItemTypeFormData = z.input<typeof itemTypeSchema>;
type ItemTypeFormErrors = Partial<Record<keyof ItemTypeFormData, string>>;

type CreateItemTypeModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function CreateItemTypeModal({ open, onOpenChange }: CreateItemTypeModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ItemTypeFormData>({
        name: '',
        code: '',
        description: '',
        is_consumable: false,
        is_serialized: false,
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<ItemTypeFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = itemTypeSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: ItemTypeFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof ItemTypeFormData;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/item-type', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: ItemTypeFormErrors = { ...validationErrors, ...errors };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : onOpenChange(nextOpen))}
            title="Add New Item Type"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button type="button" variant="secondary" appearance="outline" disabled={processing} onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="create-item-type-form" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Item Type'}
                    </Button>
                </>
            }
        >
            <form id="create-item-type-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="name" required>Item Type Name</FormLabel>
                            <Input id="name" name="name" value={data.name} placeholder="e.g. Consumable, Spare Part" disabled={processing} className={cn(formErrors.name && 'is-invalid')} onChange={(e) => setData('name', e.target.value)} />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="code">Code</FormLabel>
                            <Input id="code" name="code" value={data.code} placeholder="e.g. CONS, SP" disabled={processing} className={cn(formErrors.code && 'is-invalid')} onChange={(e) => setData('code', e.target.value)} />
                            <FormError error={formErrors.code} />
                        </FormField>
                    </div>
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="description">Description</FormLabel>
                            <textarea id="description" name="description" className={cn('form-control', formErrors.description && 'is-invalid')} rows={3} placeholder="Enter optional description..." value={data.description} disabled={processing} onChange={(e) => setData('description', e.target.value)} />
                            <FormError error={formErrors.description} />
                        </FormField>
                    </div>
                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel>Is Consumable</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input className="form-check-input" type="checkbox" role="switch" id="create-is-consumable" checked={data.is_consumable} disabled={processing} onChange={(e) => setData('is_consumable', e.target.checked)} />
                            </div>
                        </FormField>
                    </div>
                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel>Is Serialized</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input className="form-check-input" type="checkbox" role="switch" id="create-is-serialized" checked={data.is_serialized} disabled={processing} onChange={(e) => setData('is_serialized', e.target.checked)} />
                            </div>
                        </FormField>
                    </div>
                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel>Is Active</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input className="form-check-input" type="checkbox" role="switch" id="create-is-active" checked={data.is_active} disabled={processing} onChange={(e) => setData('is_active', e.target.checked)} />
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}