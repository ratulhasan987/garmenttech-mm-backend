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

type CreateBuildingModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateBuildingModal({
    open,
    onOpenChange,
}: CreateBuildingModalProps) {
    const {
        data,
        setData,
        post,
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
    | Close - reset everything when modal closes
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
    | Submit - validate with zod first, then post to building store route
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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

        post('/building', {
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
                    return;
                }

                onOpenChange(nextOpen);
            }}
            title="Add New Building"
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
                        form="create-building-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Building'}
                    </Button>
                </>
            }
        >
            <form id="create-building-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Building Name */}
                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel htmlFor="name" required>
                                Building Name
                            </FormLabel>

                            <Input
                                type="text"
                                id="name"
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
                            <FormLabel htmlFor="code" required>
                                Building Code
                            </FormLabel>

                            <Input
                                type="text"
                                id="code"
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
                            <FormLabel htmlFor="address">Address</FormLabel>

                            <Input
                                type="text"
                                id="address"
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
                            <FormLabel htmlFor="description">Description</FormLabel>

                            <textarea
                                id="description"
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
                                    id="create-is-active"
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