import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, FormField, FormLabel } from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

const itemCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required.').max(255),
    code: z.string().max(255).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    parent_id: z.string().optional().or(z.literal('')),
    item_type_id: z.string().optional().or(z.literal('')),
    is_active: z.boolean(),
});

type ItemCategoryFormData = z.input<typeof itemCategorySchema>;
type ItemCategoryFormErrors = Partial<Record<keyof ItemCategoryFormData, string>>;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemTypes: any[];
    parentCategories: any[];
};

export default function CreateItemCategoryModal({ open, onOpenChange, itemTypes, parentCategories }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ItemCategoryFormData>({
        name: '',
        code: '',
        description: '',
        parent_id: '',
        item_type_id: '',
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<ItemCategoryFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = itemCategorySchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: ItemCategoryFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof ItemCategoryFormData;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/item-category', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: ItemCategoryFormErrors = { ...validationErrors, ...errors };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : onOpenChange(nextOpen))}
            title="Add New Item Category"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button type="button" variant="secondary" appearance="outline" disabled={processing} onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="create-item-category-form" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Category'}
                    </Button>
                </>
            }
        >
            <form id="create-item-category-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="name" required>Category Name</FormLabel>
                            <Input id="name" name="name" value={data.name} placeholder="e.g. Bearings, Belts" disabled={processing} className={cn(formErrors.name && 'is-invalid')} onChange={(e) => setData('name', e.target.value)} />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="code">Code</FormLabel>
                            <Input id="code" name="code" value={data.code} placeholder="e.g. BRG, BLT" disabled={processing} className={cn(formErrors.code && 'is-invalid')} onChange={(e) => setData('code', e.target.value)} />
                            <FormError error={formErrors.code} />
                        </FormField>
                    </div>
                    
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="item_type_id">Item Type</FormLabel>
                            <select id="item_type_id" name="item_type_id" className={cn('form-select', formErrors.item_type_id && 'is-invalid')} value={data.item_type_id} disabled={processing} onChange={(e) => setData('item_type_id', e.target.value)}>
                                <option value="">Select Type</option>
                                {itemTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            <FormError error={formErrors.item_type_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="parent_id">Parent Category</FormLabel>
                            <select id="parent_id" name="parent_id" className={cn('form-select', formErrors.parent_id && 'is-invalid')} value={data.parent_id} disabled={processing} onChange={(e) => setData('parent_id', e.target.value)}>
                                <option value="">None (Root Category)</option>
                                {parentCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <FormError error={formErrors.parent_id} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="description">Description</FormLabel>
                            <textarea id="description" name="description" className={cn('form-control', formErrors.description && 'is-invalid')} rows={3} placeholder="Enter optional description..." value={data.description} disabled={processing} onChange={(e) => setData('description', e.target.value)} />
                            <FormError error={formErrors.description} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel>Is Active</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input className="form-check-input" type="checkbox" role="switch" id="create-cat-is-active" checked={data.is_active} disabled={processing} onChange={(e) => setData('is_active', e.target.checked)} />
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}