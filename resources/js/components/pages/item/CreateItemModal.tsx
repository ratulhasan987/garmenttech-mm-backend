import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormError, FormField, FormLabel } from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';
import { Plus, Trash } from 'react-feather';

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
    attributes: z.array(z.object({
        id: z.string().optional().or(z.literal('')),
        value: z.string().optional().or(z.literal('')),
    })).optional(),
});

type ItemFormData = z.input<typeof itemSchema>;
type ItemFormErrors = Partial<Record<keyof ItemFormData, string>>;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemTypes: any[];
    itemCategories: any[];
    brands: any[];
    units: any[];
    attributes: any[]; // Passed from Controller
};

export default function CreateItemModal({ open, onOpenChange, itemTypes, itemCategories, brands, units, attributes }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ItemFormData>({
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
        attributes: [], // Initialize empty array for dynamic attributes
    });

    const [validationErrors, setValidationErrors] = useState<ItemFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Filter out empty attributes before submitting
        const cleanedData = {
            ...data,
            attributes: data.attributes?.filter(attr => attr.id && attr.value !== '') || []
        };

        const result = itemSchema.safeParse(cleanedData);
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

        post('/item', {
            preserveScroll: true,
            onSuccess: () => handleClose(),
            data: cleanedData, // Send cleaned data
        });
    };

    const formErrors: ItemFormErrors = { ...validationErrors, ...errors };

    // --- Dynamic Attribute Handlers ---
    const handleAddAttribute = () => {
        setData('attributes', [...(data.attributes || []), { id: '', value: '' }]);
    };

    const handleRemoveAttribute = (index: number) => {
        setData('attributes', data.attributes?.filter((_, i) => i !== index) || []);
    };

    const handleAttributeChange = (index: number, field: 'id' | 'value', value: string) => {
        const newAttrs = [...(data.attributes || [])];
        newAttrs[index] = { ...newAttrs[index], [field]: value };

        // Reset value if changing the attribute ID to avoid type mismatch
        if (field === 'id') {
            newAttrs[index].value = '';
        }
        setData('attributes', newAttrs);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : onOpenChange(nextOpen))}
            title="Add New Item"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button type="button" variant="secondary" appearance="outline" disabled={processing} onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="create-item-form" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Item'}
                    </Button>
                </>
            }
        >
            <form id="create-item-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Core fields (same as before) */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="name" required>Item Name</FormLabel>
                            <Input id="name" name="name" value={data.name} disabled={processing} className={cn(formErrors.name && 'is-invalid')} onChange={(e) => setData('name', e.target.value)} />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="item_code" required>Item Code</FormLabel>
                            <Input id="item_code" name="item_code" value={data.item_code} disabled={processing} className={cn(formErrors.item_code && 'is-invalid')} onChange={(e) => setData('item_code', e.target.value)} />
                            <FormError error={formErrors.item_code} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="item_type_id" required>Item Type</FormLabel>
                            <select id="item_type_id" name="item_type_id" className={cn('form-select', formErrors.item_type_id && 'is-invalid')} value={data.item_type_id} disabled={processing} onChange={(e) => setData('item_type_id', e.target.value)}>
                                <option value="">Select Type</option>
                                {itemTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                            </select>
                            <FormError error={formErrors.item_type_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="item_category_id">Category</FormLabel>
                            <select id="item_category_id" name="item_category_id" className={cn('form-select', formErrors.item_category_id && 'is-invalid')} value={data.item_category_id} disabled={processing} onChange={(e) => setData('item_category_id', e.target.value)}>
                                <option value="">Select Category</option>
                                {itemCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <FormError error={formErrors.item_category_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="brand_id">Brand</FormLabel>
                            <select id="brand_id" name="brand_id" className={cn('form-select', formErrors.brand_id && 'is-invalid')} value={data.brand_id} disabled={processing} onChange={(e) => setData('brand_id', e.target.value)}>
                                <option value="">Select Brand</option>
                                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                            </select>
                            <FormError error={formErrors.brand_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="unit_id">Unit</FormLabel>
                            <select id="unit_id" name="unit_id" className={cn('form-select', formErrors.unit_id && 'is-invalid')} value={data.unit_id} disabled={processing} onChange={(e) => setData('unit_id', e.target.value)}>
                                <option value="">Select Unit</option>
                                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                            </select>
                            <FormError error={formErrors.unit_id} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel htmlFor="part_number">Part Number</FormLabel>
                            <Input id="part_number" name="part_number" value={data.part_number} disabled={processing} className={cn(formErrors.part_number && 'is-invalid')} onChange={(e) => setData('part_number', e.target.value)} />
                            <FormError error={formErrors.part_number} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel htmlFor="sku">SKU</FormLabel>
                            <Input id="sku" name="sku" value={data.sku} disabled={processing} className={cn(formErrors.sku && 'is-invalid')} onChange={(e) => setData('sku', e.target.value)} />
                            <FormError error={formErrors.sku} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel htmlFor="barcode">Barcode</FormLabel>
                            <Input id="barcode" name="barcode" value={data.barcode} disabled={processing} className={cn(formErrors.barcode && 'is-invalid')} onChange={(e) => setData('barcode', e.target.value)} />
                            <FormError error={formErrors.barcode} />
                        </FormField>
                    </div>

                    {/* DYNAMIC ATTRIBUTES SECTION */}
                    <div className="col-12 mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <FormLabel>Custom Attributes</FormLabel>
                            <Button type="button" variant="secondary" appearance="outline" onClick={handleAddAttribute} disabled={processing}>
                                <Plus size={16} className="me-1" /> Add Attribute
                            </Button>
                        </div>

                        {data.attributes?.map((attr, index) => {

                            // const selectedAttr = attributes.find(a => String(a.id) === String(attr.id));

                            const selectedAttr = (attributes || []).find(a => String(a.id) === String(attr.id));
                            return (
                                <div key={index} className="d-flex gap-2 mb-2 align-items-center">
                                    {/* Attribute Name Select */}
                                    <select
                                        className="form-select"
                                        value={attr.id}
                                        onChange={(e) => handleAttributeChange(index, 'id', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="">Select Attribute</option>

                                        {(attributes || []).map((opt) => (

                                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                                        ))}
                                    </select>

                                    {/* Attribute Value Input (Changes based on type) */}
                                    {selectedAttr?.type === 'select' ? (
                                        <select
                                            className="form-select"
                                            value={attr.value}
                                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                            disabled={processing}
                                        >
                                            <option value="">Select Value</option>
                                            {selectedAttr.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : selectedAttr?.type === 'boolean' ? (
                                        <select
                                            className="form-select"
                                            value={attr.value}
                                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                            disabled={processing}
                                        >
                                            <option value="">Select Value</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    ) : (
                                        <Input
                                            type={selectedAttr?.type === 'number' ? 'number' : 'text'}
                                            placeholder="Enter Value"
                                            value={attr.value}
                                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                            disabled={processing}
                                        />
                                    )}

                                    <Button type="button" variant="secondary" appearance="outline" onClick={() => handleRemoveAttribute(index)} className="text-danger border-danger" disabled={processing}>
                                        <Trash size={16} />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="col-12 mt-2">
                        <FormField>
                            <FormLabel htmlFor="description">Description</FormLabel>
                            <textarea id="description" name="description" className={cn('form-control', formErrors.description && 'is-invalid')} rows={3} value={data.description} disabled={processing} onChange={(e) => setData('description', e.target.value)} />
                            <FormError error={formErrors.description} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="minimum_stock">Minimum Stock</FormLabel>
                            <Input id="minimum_stock" name="minimum_stock" type="number" value={data.minimum_stock} disabled={processing} className={cn(formErrors.minimum_stock && 'is-invalid')} onChange={(e) => setData('minimum_stock', e.target.value)} />
                            <FormError error={formErrors.minimum_stock} />
                        </FormField>
                    </div>

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="reorder_stock">Reorder Stock</FormLabel>
                            <Input id="reorder_stock" name="reorder_stock" type="number" value={data.reorder_stock} disabled={processing} className={cn(formErrors.reorder_stock && 'is-invalid')} onChange={(e) => setData('reorder_stock', e.target.value)} />
                            <FormError error={formErrors.reorder_stock} />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField>
                            <FormLabel>Is Active</FormLabel>
                            <div className="form-check form-switch mt-1">
                                <input className="form-check-input" type="checkbox" role="switch" id="create-item-status" checked={data.status} disabled={processing} onChange={(e) => setData('status', e.target.checked)} />
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}

// import { useState, type FormEvent } from 'react';
// import { useForm } from '@inertiajs/react';
// import { z } from 'zod';

// import { Button } from '@/components/ui/button';
// import { FormError, FormField, FormLabel } from '@/components/ui/form/form-field';
// import { Input } from '@/components/ui/form/input';
// import { AppModal } from '@/components/ui/modal/app-modal';
// import { cn } from '@/lib/utils';

// const itemSchema = z.object({
//     item_code: z.string().min(1, 'Item code is required.').max(255),
//     name: z.string().min(1, 'Item name is required.').max(255),
//     item_type_id: z.string().min(1, 'Item type is required.'),
//     item_category_id: z.string().optional().or(z.literal('')),
//     brand_id: z.string().optional().or(z.literal('')),
//     unit_id: z.string().optional().or(z.literal('')),
//     part_number: z.string().max(255).optional().or(z.literal('')),
//     sku: z.string().max(255).optional().or(z.literal('')),
//     barcode: z.string().max(255).optional().or(z.literal('')),
//     description: z.string().optional().or(z.literal('')),
//     minimum_stock: z.string().optional().or(z.literal('0')),
//     reorder_stock: z.string().optional().or(z.literal('0')),
//     status: z.boolean(),
// });

// type ItemFormData = z.input<typeof itemSchema>;
// type ItemFormErrors = Partial<Record<keyof ItemFormData, string>>;

// type Props = {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     itemTypes: any[];
//     itemCategories: any[];
//     brands: any[];
//     units: any[];
// };

// export default function CreateItemModal({ open, onOpenChange, itemTypes, itemCategories, brands, units }: Props) {
//     const { data, setData, post, processing, errors, reset, clearErrors } = useForm<ItemFormData>({
//         item_code: '',
//         name: '',
//         item_type_id: '',
//         item_category_id: '',
//         brand_id: '',
//         unit_id: '',
//         part_number: '',
//         sku: '',
//         barcode: '',
//         description: '',
//         minimum_stock: '0',
//         reorder_stock: '0',
//         status: true,
//     });

//     const [validationErrors, setValidationErrors] = useState<ItemFormErrors>({});

//     const handleClose = () => {
//         if (processing) return;
//         reset();
//         clearErrors();
//         setValidationErrors({});
//         onOpenChange(false);
//     };

//     const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         const result = itemSchema.safeParse(data);

//         if (!result.success) {
//             const fieldErrors: ItemFormErrors = {};
//             result.error.issues.forEach((issue) => {
//                 const field = issue.path[0] as keyof ItemFormData;
//                 if (!fieldErrors[field]) fieldErrors[field] = issue.message;
//             });
//             setValidationErrors(fieldErrors);
//             return;
//         }

//         setValidationErrors({});
//         clearErrors();

//         post('/item', {
//             preserveScroll: true,
//             onSuccess: () => {
//                 reset();
//                 clearErrors();
//                 setValidationErrors({});
//                 onOpenChange(false);
//             },
//         });
//     };

//     const formErrors: ItemFormErrors = { ...validationErrors, ...errors };

//     return (
//         <AppModal
//             open={open}
//             onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : onOpenChange(nextOpen))}
//             title="Add New Item"
//             busy={processing}
//             centered={false}
//             footer={
//                 <>
//                     <Button type="button" variant="secondary" appearance="outline" disabled={processing} onClick={handleClose}>Cancel</Button>
//                     <Button type="submit" form="create-item-form" disabled={processing}>
//                         {processing ? 'Saving...' : 'Save Item'}
//                     </Button>
//                 </>
//             }
//         >
//             <form id="create-item-form" onSubmit={handleSubmit}>
//                 <div className="row">
//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="name" required>Item Name</FormLabel>
//                             <Input id="name" name="name" value={data.name} disabled={processing} className={cn(formErrors.name && 'is-invalid')} onChange={(e) => setData('name', e.target.value)} />
//                             <FormError error={formErrors.name} />
//                         </FormField>
//                     </div>
//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="item_code" required>Item Code</FormLabel>
//                             <Input id="item_code" name="item_code" value={data.item_code} disabled={processing} className={cn(formErrors.item_code && 'is-invalid')} onChange={(e) => setData('item_code', e.target.value)} />
//                             <FormError error={formErrors.item_code} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="item_type_id" required>Item Type</FormLabel>
//                             <select id="item_type_id" name="item_type_id" className={cn('form-select', formErrors.item_type_id && 'is-invalid')} value={data.item_type_id} disabled={processing} onChange={(e) => setData('item_type_id', e.target.value)}>
//                                 <option value="">Select Type</option>
//                                 {itemTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
//                             </select>
//                             <FormError error={formErrors.item_type_id} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="item_category_id">Category</FormLabel>
//                             <select id="item_category_id" name="item_category_id" className={cn('form-select', formErrors.item_category_id && 'is-invalid')} value={data.item_category_id} disabled={processing} onChange={(e) => setData('item_category_id', e.target.value)}>
//                                 <option value="">Select Category</option>
//                                 {itemCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
//                             </select>
//                             <FormError error={formErrors.item_category_id} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="brand_id">Brand</FormLabel>
//                             <select id="brand_id" name="brand_id" className={cn('form-select', formErrors.brand_id && 'is-invalid')} value={data.brand_id} disabled={processing} onChange={(e) => setData('brand_id', e.target.value)}>
//                                 <option value="">Select Brand</option>
//                                 {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
//                             </select>
//                             <FormError error={formErrors.brand_id} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="unit_id">Unit</FormLabel>
//                             <select id="unit_id" name="unit_id" className={cn('form-select', formErrors.unit_id && 'is-invalid')} value={data.unit_id} disabled={processing} onChange={(e) => setData('unit_id', e.target.value)}>
//                                 <option value="">Select Unit</option>
//                                 {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
//                             </select>
//                             <FormError error={formErrors.unit_id} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-4">
//                         <FormField>
//                             <FormLabel htmlFor="part_number">Part Number</FormLabel>
//                             <Input id="part_number" name="part_number" value={data.part_number} disabled={processing} className={cn(formErrors.part_number && 'is-invalid')} onChange={(e) => setData('part_number', e.target.value)} />
//                             <FormError error={formErrors.part_number} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-4">
//                         <FormField>
//                             <FormLabel htmlFor="sku">SKU</FormLabel>
//                             <Input id="sku" name="sku" value={data.sku} disabled={processing} className={cn(formErrors.sku && 'is-invalid')} onChange={(e) => setData('sku', e.target.value)} />
//                             <FormError error={formErrors.sku} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-4">
//                         <FormField>
//                             <FormLabel htmlFor="barcode">Barcode</FormLabel>
//                             <Input id="barcode" name="barcode" value={data.barcode} disabled={processing} className={cn(formErrors.barcode && 'is-invalid')} onChange={(e) => setData('barcode', e.target.value)} />
//                             <FormError error={formErrors.barcode} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="minimum_stock">Minimum Stock</FormLabel>
//                             <Input id="minimum_stock" name="minimum_stock" type="number" value={data.minimum_stock} disabled={processing} className={cn(formErrors.minimum_stock && 'is-invalid')} onChange={(e) => setData('minimum_stock', e.target.value)} />
//                             <FormError error={formErrors.minimum_stock} />
//                         </FormField>
//                     </div>

//                     <div className="col-12 col-md-6">
//                         <FormField>
//                             <FormLabel htmlFor="reorder_stock">Reorder Stock</FormLabel>
//                             <Input id="reorder_stock" name="reorder_stock" type="number" value={data.reorder_stock} disabled={processing} className={cn(formErrors.reorder_stock && 'is-invalid')} onChange={(e) => setData('reorder_stock', e.target.value)} />
//                             <FormError error={formErrors.reorder_stock} />
//                         </FormField>
//                     </div>

//                     <div className="col-12">
//                         <FormField>
//                             <FormLabel htmlFor="description">Description</FormLabel>
//                             <textarea id="description" name="description" className={cn('form-control', formErrors.description && 'is-invalid')} rows={3} value={data.description} disabled={processing} onChange={(e) => setData('description', e.target.value)} />
//                             <FormError error={formErrors.description} />
//                         </FormField>
//                     </div>

//                     <div className="col-12">
//                         <FormField>
//                             <FormLabel>Is Active</FormLabel>
//                             <div className="form-check form-switch mt-1">
//                                 <input className="form-check-input" type="checkbox" role="switch" id="create-item-status" checked={data.status} disabled={processing} onChange={(e) => setData('status', e.target.checked)} />
//                             </div>
//                         </FormField>
//                     </div>
//                 </div>
//             </form>
//         </AppModal>
//     );
// }