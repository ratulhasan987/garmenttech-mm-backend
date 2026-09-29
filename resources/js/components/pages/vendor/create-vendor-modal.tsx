import {
    useState,
    type ChangeEvent,
    type SubmitEvent,
} from 'react';

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
];

const vendorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            1,
            'Vendor name is required.',
        )
        .max(
            255,
            'Vendor name cannot exceed 255 characters.',
        ),

    company: z
        .string()
        .trim()
        .max(
            255,
            'Company name cannot exceed 255 characters.',
        )
        .nullable(),

    email: z
        .string()
        .trim()
        .min(
            1,
            'Email is required.',
        )
        .email(
            'Please enter a valid email address.',
        ),

    phone: z
        .string()
        .trim()
        .min(
            1,
            'Phone number is required.',
        )
        .max(
            20,
            'Phone number cannot exceed 20 characters.',
        ),

    state: z
        .string()
        .trim()
        .max(
            255,
            'State cannot exceed 255 characters.',
        )
        .nullable(),

    city: z
        .string()
        .trim()
        .max(
            255,
            'City cannot exceed 255 characters.',
        )
        .nullable(),

    country: z
        .string()
        .trim()
        .max(
            255,
            'Country cannot exceed 255 characters.',
        )
        .nullable(),

    address: z
        .string()
        .trim()
        .nullable(),

    image: z
        .instanceof(File)
        .refine(
            (file) =>
                file.size <= MAX_IMAGE_SIZE,
            'Image size cannot exceed 5 MB.',
        )
        .refine(
            (file) =>
                ALLOWED_IMAGE_TYPES.includes(
                    file.type,
                ),
            'Image must be JPEG, PNG, JPG, or GIF.',
        )
        .nullable(),

    submit_type: z.literal('manual'),

});

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type VendorFormData =
    z.input<typeof vendorSchema>;

type VendorFormErrors =
    Partial<
        Record<
            keyof VendorFormData,
            string
        >
    >;

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type CreateVendorModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateVendorModal({
    open,
    onOpenChange,
}: CreateVendorModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<VendorFormData>({
        name: '',
        company: null,
        email: "",
        phone: "",
        state: null,
        city: null,
        country: null,
        address: null,
        image: null,
        submit_type: 'manual'

    });

    const [
        validationErrors,
        setValidationErrors,
    ] =
        useState<VendorFormErrors>(
            {},
        );

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();
        setValidationErrors({});

        onOpenChange(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target.files?.[0] ??
            null;

        setData('image', file);

        setValidationErrors(
            (previous) => ({
                ...previous,
                image: undefined,
            }),
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const result =
            vendorSchema.safeParse(
                data,
            );

        if (!result.success) {
            const fieldErrors: VendorFormErrors =
                {};

            result.error.issues.forEach(
                (issue) => {
                    const field =
                        issue
                            .path[0] as keyof VendorFormData;

                    if (
                        !fieldErrors[
                        field
                        ]
                    ) {
                        fieldErrors[
                            field
                        ] =
                            issue.message;
                    }
                },
            );

            setValidationErrors(
                fieldErrors,
            );

            return;
        }

        setValidationErrors({});
        clearErrors();

        post('/vendor', {
            preserveScroll: true,

            forceFormData: true,

            onSuccess: () => {
                reset();
                clearErrors();
                setValidationErrors(
                    {},
                );

                onOpenChange(false);
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Errors
    |--------------------------------------------------------------------------
    */

    const formErrors: VendorFormErrors =
    {
        ...validationErrors,
        ...errors,
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(
                nextOpen,
            ) => {
                if (!nextOpen) {
                    handleClose();

                    return;
                }

                onOpenChange(
                    nextOpen,
                );
            }}
            size="lg"
            title="Add New Vendor"
            busy={processing}
            centered={false}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        disabled={
                            processing
                        }
                        onClick={
                            handleClose
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="create-vendor-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : 'Save Vendor'}
                    </Button>
                </>
            }
        >
            <form
                id="create-vendor-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Name */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="name"
                                required
                            >
                                Vendor Name
                            </FormLabel>

                            <Input
                                id="name"
                                name="name"
                                value={
                                    data.name
                                }
                                placeholder="Enter vendor name"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.name &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'name',
                                        event
                                            .target
                                            .value,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.name
                                }
                            />
                        </FormField>
                    </div>

                    {/* Company */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="company"
                            >
                                Company
                            </FormLabel>

                            <Input
                                id="company"
                                name="company"
                                value={
                                    data.company ??
                                    ''
                                }
                                placeholder="Enter company name"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.company &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'company',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.company
                                }
                            />
                        </FormField>
                    </div>

                    {/* Email */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="email"
                                required
                            >
                                Email
                            </FormLabel>

                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={
                                    data.email ??
                                    ''
                                }
                                placeholder="vendor@example.com"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.email &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'email',
                                        event
                                            .target
                                            .value ||
                                        "",
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.email
                                }
                            />
                        </FormField>
                    </div>

                    {/* Phone */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="phone"
                                required
                            >
                                Phone
                            </FormLabel>

                            <Input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={
                                    data.phone ??
                                    ''
                                }
                                placeholder="Enter phone number"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.phone &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'phone',
                                        event
                                            .target
                                            .value ||
                                        "",
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.phone
                                }
                            />
                        </FormField>
                    </div>

                    {/* Country */}

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel
                                htmlFor="country"
                            >
                                Country
                            </FormLabel>

                            <Input
                                id="country"
                                name="country"
                                value={
                                    data.country ??
                                    ''
                                }
                                placeholder="Enter country"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.country &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'country',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.country
                                }
                            />
                        </FormField>
                    </div>

                    {/* State */}

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel
                                htmlFor="state"
                            >
                                State
                            </FormLabel>

                            <Input
                                id="state"
                                name="state"
                                value={
                                    data.state ??
                                    ''
                                }
                                placeholder="Enter state"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.state &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'state',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.state
                                }
                            />
                        </FormField>
                    </div>

                    {/* City */}

                    <div className="col-12 col-md-4">
                        <FormField>
                            <FormLabel
                                htmlFor="city"
                            >
                                City
                            </FormLabel>

                            <Input
                                id="city"
                                name="city"
                                value={
                                    data.city ??
                                    ''
                                }
                                placeholder="Enter city"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.city &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'city',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.city
                                }
                            />
                        </FormField>
                    </div>

                    {/* Address */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="address"
                            >
                                Address
                            </FormLabel>

                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                value={
                                    data.address ??
                                    ''
                                }
                                placeholder="Enter vendor address"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    'form-control',
                                    formErrors.address &&
                                    'is-invalid',
                                )}
                                onChange={(
                                    event,
                                ) => {
                                    setData(
                                        'address',
                                        event
                                            .target
                                            .value ||
                                        null,
                                    );
                                }}
                            />

                            <FormError
                                error={
                                    formErrors.address
                                }
                            />
                        </FormField>
                    </div>

                    {/* Image */}

                    <div className="col-12">
                        <FormField>
                            <FormLabel
                                htmlFor="image"
                            >
                                Vendor Image
                            </FormLabel>

                            <Input
                                type="file"
                                id="image"
                                name="image"
                                accept=".jpeg,.jpg,.png,.gif,image/jpeg,image/png,image/gif"
                                disabled={
                                    processing
                                }
                                className={cn(
                                    formErrors.image &&
                                    'is-invalid',
                                )}
                                onChange={
                                    handleImageChange
                                }
                            />

                            <div className="form-text">
                                Allowed:
                                JPEG, JPG,
                                PNG, GIF.
                                Maximum size:
                                5 MB.
                            </div>

                            <FormError
                                error={
                                    formErrors.image
                                }
                            />
                        </FormField>
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
