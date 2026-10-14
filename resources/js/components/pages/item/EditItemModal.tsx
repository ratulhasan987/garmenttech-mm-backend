import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, FormField, FormLabel } from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';

const itemSchema = z.object({
    item_code: z.string().min(1, 'Item code is required.').max(255),
    name: z.string().min(1, 'Item name is required.').max(255),
    item_type_id: z.string().min(1, 'Item type is required.'),
    item_category_id: z.string().optional().or(z.literal('')),
    brand_id: z.string().optional().or(z.literal('')),
    unit_id: z.string().optional().or(z.literal('')),
    part_number: z.string().max(255).optional().or(z.literal('')),
    sku: z.string().max(255).optional().or(z.literal('')),
    barcode: z.string().max(255).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    minimum_stock: z.string().optional().or(z.literal('0')),
    reorder_stock: z.string().optional().or(z.literal('0')),
    status: z.boolean(),
});

type ItemFormData = z.input<typeof itemSchema>;
type ItemFormErrors = Partial<Record<keyof ItemFormData, string>>;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: any | null;
    itemTypes: any[];
    itemCategories: any[];
    brands: any[];
    units: any[];
};

export default function EditItemModal({ open, onOpenChange, item, itemTypes, itemCategories, brands, units }: Props) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm<ItemFormData>({
        item_code: '',
        name: '',
        item_type_id: '',
        item_category_id: '',
        brand_id: '',
        unit_id: '',
        part_number: '',
        sku: '',
        barcode: '',
        description: '',
        minimum_stock: '0',
        reorder_stock: '0',
        status: true,
    });

    const [validationErrors, setValidationErrors] = useState<ItemFormErrors>({});

    useEffect(() => {
        if (open && item) {
            clearErrors();
            setValidationErrors({});
            setData({
                item_code: item.item_code || '',
                name: item.name || '',
                item_type_id: String(item.item_type_id) || '',
                item_category_id: item.item_category_id ? String(item.item_category_id) : '',
                brand_id: item.brand_id ? String(item.brand_id) : '',
                unit_id: item.unit_id ? String(item.unit_id) : '',
                part_number: item.part_number || '',
                sku: item.sku || '',
                barcode: item.barcode || '',
                description: item.description || '',
                minimum_stock: String(item.minimum_stock ?? '0'),
                reorder_stock: String(item.reorder_stock ?? '0'),
                status: item.status ?? true,
            });
        }
    }, [open, item]);

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!item) return;

        const result = itemSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: ItemFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof ItemFormData;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        put(`/item/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: ItemFormErrors = { ...validationErrors, ...errors };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : onOpenChange(nextOpen))}
            title="Edit Item"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button type="button" variant="secondary" appearance="outline" disabled={processing} onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="edit-item-form" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Item'}
                    </Button>
                </>
            }
        >
            <form id="edit-item-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-name" required>Item Name</FormLabel>
                            <Input id="edit-name" name="name" value={data.name} disabled={processing} className={cn(formErrors.name && 'is-invalid')} onChange={(e) => setData('name', e.target.value)} />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-item_code" required>Item Code</FormLabel>
                            <Input id="edit-item_code" name="item_code" value={data.item_code} disabled={processing} className={cn(formErrors.item_code && 'is-invalid')} onChange={(e) => setData('item_code', e.target.value)} />
                            <FormError error={formErrors.item_code} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-item_type_id" required>Item Type</FormLabel>
                            <select id="edit-item_type_id" name="item_type_id" className={cn('form-select', formErrors.item_type_id && 'is-invalid')} value={data.item_type_id} disabled={processing} onChange={(e) => setData('item_type_id', e.target.value)}>
                                <option value="">Select Type</option>
                                {itemTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                            </select>
                            <FormError error={formErrors.item_type_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-item_category_id">Category</FormLabel>
                            <select id="edit-item_category_id" name="item_category_id" className={cn('form-select', formErrors.item_category_id && 'is-invalid')} value={data.item_category_id} disabled={processing} onChange={(e) => setData('item_category_id', e.target.value)}>
                                <option value="">Select Category</option>
                                {itemCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <FormError error={formErrors.item_category_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-brand_id">Brand</FormLabel>
                            <select id="edit-brand_id" name="brand_id" className={cn('form-select', formErrors.brand_id && 'is-invalid')} value={data.brand_id} disabled={processing} onChange={(e) => setData('brand_id', e.target.value)}>
                                <option value="">Select Brand</option>
                                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                            </select>
                            <FormError error={formErrors.brand_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-unit_id">Unit</FormLabel>
                            <select id="edit-unit_id" name="unit_id" className={cn('form-select', formErrors.unit_id && 'is-invalid')} value={data.unit_id} disabled={processing} onChange={(e) => setData('unit_id', e.target.value)}>
                                <option value="">Select Unit</option>
                                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                            </select>
                            <FormError error={formErrors.unit_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel htmlFor="edit-part_number">Part Number</FormLabel>
                            <Input id="edit-part_number" name="part_number" value={data.part_number} disabled={processing} className={cn(formErrors.part_number && 'is-invalid')} onChange={(e) => setData('part_number', e.target.value)} />
                            <FormError error={formErrors.part_number} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel htmlFor="edit-sku">SKU</FormLabel>
                            <Input id="edit-sku" name="sku" value={data.sku} disabled={processing} className={cn(formErrors.sku && 'is-invalid')} onChange={(e) => setData('sku', e.target.value)} />
                            <FormError error={formErrors.sku} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel htmlFor="edit-barcode">Barcode</FormLabel>
                            <Input id="edit-barcode" name="barcode" value={data.barcode} disabled={processing} className={cn(formErrors.barcode && 'is-invalid')} onChange={(e) => setData('barcode', e.target.value)} />
                            <FormError error={formErrors.barcode} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-minimum_stock">Minimum Stock</FormLabel>
                            <Input id="edit-minimum_stock" name="minimum_stock" type="number" value={data.minimum_stock} disabled={processing} className={cn(formErrors.minimum_stock && 'is-invalid')} onChange={(e) => setData('minimum_stock', e.target.value)} />
                            <FormError error={formErrors.minimum_stock} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-reorder_stock">Reorder Stock</FormLabel>
                            <Input id="edit-reorder_stock" name="reorder_stock" type="number" value={data.reorder_stock} disabled={processing} className={cn(formErrors.reorder_stock && 'is-invalid')} onChange={(e) => setData('reorder_stock', e.target.value)} />
                            <FormError error={formErrors.reorder_stock} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-description">Description</FormLabel>
                            <textarea id="edit-description" name="description" className={cn('form-control', formErrors.description && 'is-invalid')} rows={3} value={data.description} disabled={processing} onChange={(e) => setData('description', e.target.value)} />
                            <FormError error={formErrors.description} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel>Is Active</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input className="form-check-input" type="checkbox" role="switch" id="edit-item-status" checked={data.status} disabled={processing} onChange={(e) => setData('status', e.target.checked)} />
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}