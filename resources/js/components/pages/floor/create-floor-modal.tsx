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
import type { BuildingOption } from '@/types/floor';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const floorSchema = z.object({
    building_id: z.string().min(1, 'Building is required.'),
    name: z
        .string()
        .min(1, 'Floor name is required.')
        .max(255, 'Floor name cannot exceed 255 characters.'),
    floor_number: z
        .number({ invalid_type_error: 'Floor number is required.' })
        .int('Floor number must be an integer.'),
    line_amount: z
        .number({ invalid_type_error: 'Line amount is required.' })
        .int('Line amount must be an integer.')
        .min(1, 'Line amount must be at least 1.'),
    max_machine_per_line: z
        .number({ invalid_type_error: 'Max machines per line is required.' })
        .int('Max machines per line must be an integer.')
        .min(1, 'Max machines per line must be at least 1.'),
    description: z
        .string()
        .optional()
        .or(z.literal('')),
    is_active: z.boolean(),
});

type FloorFormData = z.input<typeof floorSchema>;
type FloorFormErrors = Partial<Record<keyof FloorFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateFloorModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    buildings: BuildingOption[];
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateFloorModal({
    open,
    onOpenChange,
    buildings,
}: CreateFloorModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<FloorFormData>({
        building_id: '',
        name: '',
        floor_number: 0,
        line_amount: 0,
        max_machine_per_line: 0,
        description: '',
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<FloorFormErrors>({});

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setValidationErrors({});
        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = floorSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: FloorFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof FloorFormData;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/floor', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    const formErrors: FloorFormErrors = {
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
            title="Add New Floor"
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
                        form="create-floor-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Floor'}
                    </Button>
                </>
            }
        >
            <form id="create-floor-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Building Select */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="building_id" required>
                                Building
                            </FormLabel>
                            <select
                                id="building_id"
                                name="building_id"
                                className={cn(
                                    'form-control',
                                    formErrors.building_id && 'is-invalid'
                                )}
                                value={data.building_id}
                                disabled={processing}
                                onChange={(e) => setData('building_id', e.target.value)}
                            >
                                <option value="">Select Building</option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                            <FormError error={formErrors.building_id} />
                        </FormField>
                    </div>

                    {/* Floor Number */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="floor_number" required>
                                Floor Number
                            </FormLabel>
                            <Input
                                type="number"
                                id="floor_number"
                                name="floor_number"
                                value={data.floor_number}
                                placeholder="e.g. 1, 2, -1 for Basement"
                                disabled={processing}
                                className={cn(formErrors.floor_number && 'is-invalid')}
                                onChange={(e) => setData('floor_number', parseInt(e.target.value, 10) || 0)}
                            />
                            <FormError error={formErrors.floor_number} />
                        </FormField>
                    </div>

                    {/* Floor Name */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Floor Name
                            </FormLabel>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. First Floor, Ground Floor"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* Line Amount */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="line_amount" required>
                                Line Amount
                            </FormLabel>
                            <Input
                                type="number"
                                id="line_amount"
                                name="line_amount"
                                value={data.line_amount}
                                placeholder="e.g. 5, 10"
                                disabled={processing}
                                className={cn(formErrors.line_amount && 'is-invalid')}
                                onChange={(e) => setData('line_amount', parseInt(e.target.value, 10) || 0)}
                            />
                            <FormError error={formErrors.line_amount} />
                        </FormField>
                    </div>

                    {/* Max Machine Per Line */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="max_machine_per_line" required>
                                Max Machine Per Line
                            </FormLabel>
                            <Input
                                type="number"
                                id="max_machine_per_line"
                                name="max_machine_per_line"
                                value={data.max_machine_per_line}
                                placeholder="e.g. 10, 20"
                                disabled={processing}
                                className={cn(formErrors.max_machine_per_line && 'is-invalid')}
                                onChange={(e) => setData('max_machine_per_line', parseInt(e.target.value, 10) || 0)}
                            />
                            <FormError error={formErrors.max_machine_per_line} />
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