import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
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

import type { Vendor } from '@/types/vendor';

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_SIZE =
    5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
];

const vendorSchema = z.object({
    id: z
        .number({
            message:
                'Vendor ID is required.',
        })
        .positive(
            'Invalid vendor ID.',
        ),

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
        .min(
            1,
            'Company name is required.',
        )
        .max(
            255,
            'Company name cannot exceed 255 characters.',
        ),

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
            255,
            'Phone number cannot exceed 255 characters.',
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
                file.size <=
                MAX_IMAGE_SIZE,
            'Image size cannot exceed 5 MB.',
        )
        .refine(
            (file) =>
                ALLOWED_IMAGE_TYPES.includes(
                    file.type,
                ),
            'Image must be JPEG, JPG, or PNG.',
        )
        .nullable(),
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

type EditVendorModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    vendor: Vendor | null;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getImageUrl(
    image:
        | string
        | null
        | undefined,
) {
    if (!image) {
        return null;
    }

    if (
        image.startsWith(
            'http://',
        ) ||
        image.startsWith(
            'https://',
        )
    ) {
        return image;
    }

    return `/${image.replace(
        /^\/+/,
        '',
    )}`;
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function EditVendorModal({
    open,
    onOpenChange,
    vendor,
}: EditVendorModalProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm<VendorFormData>({
        id: 0,

        name: '',

        company: '',

        email: '',

        phone: '',

        state: null,

        city: null,

        country: null,

        address: null,

        image: null,
    });

    const [
        validationErrors,
        setValidationErrors,
    ] =
        useState<VendorFormErrors>(
            {},
        );

    const [
        imagePreview,
        setImagePreview,
    ] = useState<
        string | null
    >(null);

    /*
    |--------------------------------------------------------------------------
    | Populate Vendor
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !open ||
            !vendor
        ) {
            return;
        }

        setData({
            id:
                vendor.id,

            name:
                vendor.name ??
                '',

            company:
                vendor.company_name ??
                '',

            email:
                vendor.email ??
                '',

            phone:
                vendor.phone ??
                '',

            state:
                vendor.state ??
                null,

            city:
                vendor.city ??
                null,

            country:
                vendor.country ??
                null,

            address:
                vendor.address ??
                null,

            image: null,
        });

        clearErrors();

        setValidationErrors(
            {},
        );

        setImagePreview(
            null,
        );
    }, [
        open,
        vendor,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Image Preview Cleanup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            if (
                imagePreview
            ) {
                URL.revokeObjectURL(
                    imagePreview,
                );
            }
        };
    }, [
        imagePreview,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose =
        () => {
            if (
                processing
            ) {
                return;
            }

            if (
                imagePreview
            ) {
                URL.revokeObjectURL(
                    imagePreview,
                );
            }

            setImagePreview(
                null,
            );

            reset();

            clearErrors();

            setValidationErrors(
                {},
            );

            onOpenChange(
                false,
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Image Change
    |--------------------------------------------------------------------------
    */

    const handleImageChange =
        (
            event: ChangeEvent<HTMLInputElement>,
        ) => {
            const file =
                event.target
                    .files?.[0] ??
                null;

            if (
                imagePreview
            ) {
                URL.revokeObjectURL(
                    imagePreview,
                );
            }

            setData(
                'image',
                file,
            );

            if (file) {
                setImagePreview(
                    URL.createObjectURL(
                        file,
                    ),
                );
            } else {
                setImagePreview(
                    null,
                );
            }

            setValidationErrors(
                (
                    previous,
                ) => ({
                    ...previous,

                    image:
                        undefined,
                }),
            );
        };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit =
        (
            event: FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault();

            if (!vendor) {
                return;
            }

            const result =
                vendorSchema.safeParse(
                    data,
                );

            if (
                !result.success
            ) {
                const fieldErrors: VendorFormErrors =
                    {};

                result.error.issues.forEach(
                    (
                        issue,
                    ) => {
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

            setValidationErrors(
                {},
            );

            clearErrors();

            /*
            |--------------------------------------------------------------------------
            | Transform Request
            |--------------------------------------------------------------------------
            |
            | If a new image is selected:
            |     id
            |     name
            |     company
            |     ...
            |     image
            |
            | If no new image is selected:
            |     image is completely removed from the request.
            |
            */

            transform(
                (
                    formData,
                ) => {
                    const {
                        image,
                        ...rest
                    } =
                        formData;

                    if (
                        image
                    ) {
                        return {
                            ...rest,
                            image,
                        };
                    }

                    return rest;
                },
            );

            /*
            |--------------------------------------------------------------------------
            | Update Vendor
            |--------------------------------------------------------------------------
            */

            post(
                '/vendor-update',
                {
                    preserveScroll:
                        true,

                    forceFormData:
                        true,

                    onSuccess:
                        () => {
                            if (
                                imagePreview
                            ) {
                                URL.revokeObjectURL(
                                    imagePreview,
                                );
                            }

                            setImagePreview(
                                null,
                            );

                            reset();

                            clearErrors();

                            setValidationErrors(
                                {},
                            );

                            onOpenChange(
                                false,
                            );
                        },
                },
            );
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

    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    const existingImage =
        getImageUrl(
            vendor?.image,
        );

    const displayedImage =
        imagePreview ??
        existingImage;

    /*
    |--------------------------------------------------------------------------
    | No Vendor
    |--------------------------------------------------------------------------
    */

    if (!vendor) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AppModal
            open={open}
            onOpenChange={(
                nextOpen,
            ) => {
                if (
                    !nextOpen
                ) {
                    handleClose();

                    return;
                }

                onOpenChange(
                    nextOpen,
                );
            }}
            size="lg"
            title="Edit Vendor"
            busy={
                processing
            }
            centered={
                false
            }
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
                        form="edit-vendor-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Updating...'
                            : 'Update Vendor'}
                    </Button>
                </>
            }
        >
            <form
                id="edit-vendor-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row">
                    {/* Vendor Name */}

                    <div className="col-12 col-md-6">
                        <FormField>
                            <FormLabel
                                htmlFor="edit_vendor_name"
                                required
                            >
                                Vendor
                                Name
                            </FormLabel>

                            <Input
                                id="edit_vendor_name"
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
                                htmlFor="edit_vendor_company"
                                required
                            >
                                Company
                            </FormLabel>

                            <Input
                                id="edit_vendor_company"
                                name="company"
                                value={
                                    data.company
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
                                            .value,
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
                                htmlFor="edit_vendor_email"
                                required
                            >
                                Email
                            </FormLabel>

                            <Input
                                type="email"
                                id="edit_vendor_email"
                                name="email"
                                value={
                                    data.email
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
                                            .value,
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
                                htmlFor="edit_vendor_phone"
                                required
                            >
                                Phone
                            </FormLabel>

                            <Input
                                type="tel"
                                id="edit_vendor_phone"
                                name="phone"
                                value={
                                    data.phone
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
                                            .value,
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
                                htmlFor="edit_vendor_country"
                            >
                                Country
                            </FormLabel>

                            <Input
                                id="edit_vendor_country"
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
                                htmlFor="edit_vendor_state"
                            >
                                State
                            </FormLabel>

                            <Input
                                id="edit_vendor_state"
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
                                htmlFor="edit_vendor_city"
                            >
                                City
                            </FormLabel>

                            <Input
                                id="edit_vendor_city"
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
                                htmlFor="edit_vendor_address"
                            >
                                Address
                            </FormLabel>

                            <textarea
                                id="edit_vendor_address"
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
                                htmlFor="edit_vendor_image"
                            >
                                Vendor
                                Image
                            </FormLabel>

                            {displayedImage && (
                                <div className="mb-3">
                                    <img
                                        src={
                                            displayedImage
                                        }
                                        alt={
                                            vendor.name
                                        }
                                        className="rounded border"
                                        style={{
                                            width: 120,

                                            height: 120,

                                            objectFit:
                                                'cover',
                                        }}
                                    />
                                </div>
                            )}

                            <Input
                                type="file"
                                id="edit_vendor_image"
                                name="image"
                                accept=".jpeg,.jpg,.png,image/jpeg,image/png"
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
                                Leave
                                empty to
                                keep the
                                current
                                image.
                                Allowed:
                                JPEG, JPG,
                                PNG.
                                Maximum
                                size: 5
                                MB.
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
