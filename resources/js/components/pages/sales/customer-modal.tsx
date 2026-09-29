import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useForm,
} from '@inertiajs/react';

import {
    User,
} from 'react-feather';

import {
    Button,
} from '@/components/ui/button';

import {
    AppModal,
} from '@/components/ui/modal/app-modal';

import type {
    Customer,
} from '@/types/sales';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type CustomerFormData = {
    name: string;

    client_id: string;

    company_name: string;

    email: string;

    phone: string;

    address: string;

    state: string;

    city: string;

    country: string;

    image:
        | File
        | null;
};

type Props = {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;

    customer?:
        | Customer
        | null;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CustomerModal({
    open,
    onOpenChange,
    customer = null,
}: Props) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } =
        useForm<CustomerFormData>({
            name: '',

            client_id: '',

            company_name: '',

            email: '',

            phone: '',

            address: '',

            state: '',

            city: '',

            country: '',

            image: null,
        });

    const [
        imagePreview,
        setImagePreview,
    ] =
        useState<string | null>(
            null
        );

    /*
    |--------------------------------------------------------------------------
    | Populate Form
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open) {
            return;
        }

        setData({
            name:
                customer?.name ??
                '',

            client_id:
                customer?.client_id ??
                '',

            company_name:
                customer?.company_name ??
                '',

            email:
                customer?.email ??
                '',

            phone:
                customer?.phone ??
                '',

            address:
                customer?.address ??
                '',

            state:
                customer?.state ??
                '',

            city:
                customer?.city ??
                '',

            country:
                customer?.country ??
                '',

            image: null,
        });

        clearErrors();

        setImagePreview(
            customer?.image
                ? `/storage/${customer.image}`
                : null
        );
    }, [
        open,
        customer,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Handle Image
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (
        file:
            | File
            | null
    ) => {
        setData(
            'image',
            file
        );

        if (!file) {
            setImagePreview(
                customer?.image
                    ? `/storage/${customer.image}`
                    : null
            );

            return;
        }

        const preview =
            URL.createObjectURL(
                file
            );

        setImagePreview(
            preview
        );
    };

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

        setImagePreview(
            null
        );

        onOpenChange(
            false
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        transform(
            (
                values
            ) => {
                if (
                    customer
                ) {
                    return {
                        ...values,

                        _method:
                            'put',
                    };
                }

                return values;
            }
        );

        const url =
            customer
                ? `/operations/sales/customers/${customer.id}`
                : '/operations/sales/customers';

        post(
            url,
            {
                preserveScroll:
                    true,

                forceFormData:
                    true,

                onSuccess:
                    () => {
                        handleClose();
                    },
            }
        );
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(
                nextOpen
            ) => {
                if (
                    !nextOpen
                ) {
                    handleClose();
                }
            }}
            title={
                customer
                    ? 'Edit Customer'
                    : 'Add Customer'
            }
            size="lg"
            centered
            busy={
                processing
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
                        form="customer-form"
                        disabled={
                            processing
                        }
                    >
                        {processing
                            ? 'Saving...'
                            : customer
                              ? 'Update Customer'
                              : 'Save Customer'}
                    </Button>
                </>
            }
        >
            <form
                id="customer-form"
                onSubmit={
                    handleSubmit
                }
            >
                <div className="row g-3">
                    {/*
                    |--------------------------------------------------------------------------
                    | Customer Image
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-12">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="
                                    d-flex
                                    align-items-center
                                    justify-content-center
                                    rounded-circle
                                    border
                                    overflow-hidden
                                    bg-light
                                "
                                style={{
                                    width: 80,
                                    height: 80,
                                }}
                            >
                                {imagePreview ? (
                                    <img
                                        src={
                                            imagePreview
                                        }
                                        alt="Customer"
                                        className="w-100 h-100"
                                        style={{
                                            objectFit:
                                                'cover',
                                        }}
                                    />
                                ) : (
                                    <User
                                        size={
                                            32
                                        }
                                        className="text-muted"
                                    />
                                )}
                            </div>

                            <div className="flex-grow-1">
                                <label className="form-label">
                                    Customer
                                    Image
                                </label>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className={`form-control ${
                                        errors.image
                                            ? 'is-invalid'
                                            : ''
                                    }`}
                                    onChange={(
                                        event
                                    ) =>
                                        handleImageChange(
                                            event
                                                .target
                                                .files?.[
                                                0
                                            ] ??
                                                null
                                        )
                                    }
                                />

                                {errors.image && (
                                    <div className="invalid-feedback">
                                        {
                                            errors.image
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Name
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            Customer
                            Name

                            <span className="text-danger ms-1">
                                *
                            </span>
                        </label>

                        <input
                            type="text"
                            className={`form-control ${
                                errors.name
                                    ? 'is-invalid'
                                    : ''
                            }`}
                            value={
                                data.name
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'name',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />

                        {errors.name && (
                            <div className="invalid-feedback">
                                {
                                    errors.name
                                }
                            </div>
                        )}
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Customer Code
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            Customer
                            Code
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. CUST-001"
                            value={
                                data.client_id
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'client_id',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />

                        {errors.client_id && (
                            <div className="text-danger small mt-1">
                                {
                                    errors.client_id
                                }
                            </div>
                        )}
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Company
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            Company
                            Name
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                data.company_name
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'company_name',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Phone
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            Phone
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                data.phone
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'phone',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Email
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            Email
                        </label>

                        <input
                            type="email"
                            className={`form-control ${
                                errors.email
                                    ? 'is-invalid'
                                    : ''
                            }`}
                            value={
                                data.email
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'email',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />

                        {errors.email && (
                            <div className="invalid-feedback">
                                {
                                    errors.email
                                }
                            </div>
                        )}
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Country
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            Country
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                data.country
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'country',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | State
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            State
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                data.state
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'state',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | City
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-md-6">
                        <label className="form-label">
                            City
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                data.city
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'city',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Address
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-12">
                        <label className="form-label">
                            Address
                        </label>

                        <textarea
                            rows={3}
                            className="form-control"
                            value={
                                data.address
                            }
                            onChange={(
                                event
                            ) =>
                                setData(
                                    'address',
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                    </div>
                </div>
            </form>
        </AppModal>
    );
}