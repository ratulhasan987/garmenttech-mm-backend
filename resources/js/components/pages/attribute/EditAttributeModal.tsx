import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormError, FormField, FormLabel } from '@/components/ui/form/form-field';
import { Input } from '@/components/ui/form/input';
import { AppModal } from '@/components/ui/modal/app-modal';
import { cn } from '@/lib/utils';
import { Plus, X } from 'react-feather';

const attributeSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    type: z.enum(['text', 'number', 'boolean', 'select']),
    options: z.array(z.string()).optional(),
});

type AttributeFormData = z.input<typeof attributeSchema>;

export default function EditAttributeModal({ open, onOpenChange, attribute }: { open: boolean; onOpenChange: (open: boolean) => void; attribute: any | null }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm<AttributeFormData>({
        name: '',
        type: 'text',
        options: [],
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open && attribute) {
            clearErrors();
            setValidationErrors({});
            setData({
                name: attribute.name,
                type: attribute.type,
                options: attribute.options || [],
            });
        }
    }, [open, attribute]);

    const handleClose = () => {
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!attribute) return;
        
        put(`/attribute/${attribute.id}`, {
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    const formErrors = { ...validationErrors, ...errors };

    const handleAddOption = () => setData('options', [...(data.options || []), '']);
    const handleRemoveOption = (index: number) => setData('options', data.options?.filter((_, i) => i !== index) || []);
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(data.options || [])];
        newOptions[index] = value;
        setData('options', newOptions);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(next) => (!next ? handleClose() : onOpenChange(next))}
            title="Edit Attribute"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button type="button" variant="secondary" appearance="outline" disabled={processing} onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="edit-attr-form" disabled={processing}>Update Attribute</Button>
                </>
            }
        >
            <form id="edit-attr-form" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-name" required>Name</FormLabel>
                            <Input id="edit-name" value={data.name} onChange={(e) => setData('name', e.target.value)} className={cn(formErrors.name && 'is-invalid')} />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-type" required>Type</FormLabel>
                            <select id="edit-type" className="form-select" value={data.type} onChange={(e) => setData('type', e.target.value as any)}>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="select">Select</option>
                            </select>
                        </FormField>
                    </div>

                    {data.type === 'select' && (
                        <div className="col-12 mt-2">
                            <FormLabel>Options</FormLabel>
                            {data.options?.map((opt, index) => (
                                <div key={index} className="d-flex gap-2 mb-2">
                                    <Input
                                        value={opt}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    <Button type="button" variant="secondary" appearance="outline" onClick={() => handleRemoveOption(index)} className="text-danger border-danger">
                                        <X size={16} />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" appearance="outline" onClick={handleAddOption}>
                                <Plus size={16} className="me-1" /> Add Option
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </AppModal>
    );
}