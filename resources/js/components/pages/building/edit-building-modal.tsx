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
import type { Building } from '@/types/building';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const buildingSchema = z.object({
    name: z
        .string()
        .min(1, 'Building name is required.')
        .max(255, 'Building name cannot exceed 255 characters.'),

    code: z
        .string()
        .min(1, 'Building code is required.')
        .max(255, 'Building code cannot exceed 255 characters.'),

    address: z
        .string()
        .max(255, 'Address cannot exceed 255 characters.')
        .optional()
        .or(z.literal('')),

    description: z
        .string()
        .optional()
        .or(z.literal('')),

    is_active: z.boolean(),
});

type BuildingFormData = z.input<typeof buildingSchema>;
type BuildingFormErrors = Partial<Record<keyof BuildingFormData, string>>;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type EditBuildingModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    building: Building | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditBuildingModal({
    open,
    onOpenChange,
    building,
}: EditBuildingModalProps) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<BuildingFormData>({
        name: '',
        code: '',
        address: '',
        description: '',
        is_active: true,
    });

    const [validationErrors, setValidationErrors] = useState<BuildingFormErrors>({});

    /*
    |--------------------------------------------------------------------------
    | Prefill data when modal opens
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (open && building) {
            clearErrors();
            setValidationErrors({});
            setData({
                name: building.name || '',
                code: building.code || '',
                address: building.address || '',
                description: building.description || '',
                is_active: building.is_active ?? true,
            });
        }
    }, [open, building]); // Runs whenever modal opens or building changes

    /*
    |--------------------------------------------------------------------------
    | Close - reset everything
    |--------------------------------------------------------------------------
    */
    const handleClose = () => {
        if (processing) return;

        reset();
        clearErrors();
        setValidationErrors({});

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit - validate with zod first, then PUT to building update route
    |--------------------------------------------------------------------------
    */
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!building) return;

        const result = buildingSchema.safeParse(data);

        if (!result.success) {
            const fieldErrors: BuildingFormErrors = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof BuildingFormData;

                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });

            setValidationErrors(fieldErrors);
            return;
        }

        setValidationErrors({});
        clearErrors();

        put(`/building/${building.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors({});
                onOpenChange(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Merge client-side validation errors + server-side errors
    |--------------------------------------------------------------------------
    */
    const formErrors: BuildingFormErrors = {
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
            title="Edit Building"
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
                        form="edit-building-form"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update Building'}
                    </Button>
                </>
            }
        >
            <form id="edit-building-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Building Name */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-name" required>
                                Building Name
                            </FormLabel>

                            <Input
                                type="text"
                                id="edit-name"
                                name="name"
                                value={data.name}
                                placeholder="e.g. Main Building"
                                disabled={processing}
                                className={cn(formErrors.name && 'is-invalid')}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.name} />
                        </FormField>
                    </div>

                    {/* Building Code */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="edit-code" required>
                                Building Code
                            </FormLabel>

                            <Input
                                type="text"
                                id="edit-code"
                                name="code"
                                value={data.code}
                                placeholder="e.g. BLD-01"
                                disabled={processing}
                                className={cn(formErrors.code && 'is-invalid')}
                                onChange={(event) => {
                                    setData('code', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.code} />
                        </FormField>
                    </div>

                    {/* Address */}
                    <div className="col-12">
                        <FormField>
                            <FormLabel htmlFor="edit-address">Address</FormLabel>

                            <Input
                                type="text"
                                id="edit-address"
                                name="address"
                                value={data.address}
                                placeholder="Enter building address"
                                disabled={processing}
                                className={cn(formErrors.address && 'is-invalid')}
                                onChange={(event) => {
                                    setData('address', event.target.value);
                                }}
                            />

                            <FormError error={formErrors.address} />
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
                                    formErrors.description && 'is-invalid',
                                )}
                                rows={3}
                                placeholder="Enter optional description..."
                                value={data.description}
                                disabled={processing}
                                onChange={(event) => {
                                    setData('description', event.target.value);
                                }}
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
                                    onChange={(event) => {
                                        setData('is_active', event.target.checked);
                                    }}
                                />
                            </div>
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}