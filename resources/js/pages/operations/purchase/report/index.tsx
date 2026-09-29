import { DatePicker } from '@/components/ui/form/date-picker';
import { Select } from '@/components/ui/form/select';

import { Head } from '@inertiajs/react';

import {
    FormEvent,
    useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Vendor = {
    id: number;
    vendor_id: string | null;
    name: string;
};

type Warehouse = {
    id: number;
    code: string | null;
    name: string;
};

type Props = {
    vendors: Vendor[];

    warehouses: Warehouse[];

    reportUrl: string;

    downloadPdfUrl: string;
};

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const getToday = () => {
    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );

    return `${year}-${month}-${day}`;
};

const getMonthStart = () => {
    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

    return `${year}-${month}-01`;
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PurchaseReportIndex({
    vendors,
    warehouses,
    reportUrl,
}: Props) {
    const today =
        getToday();

    const monthStart =
        getMonthStart();

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null
        );

    const showError = (
        message: string
    ) => {
        setError(
            message
        );

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const clearError = () => {
        setError(
            null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CSRF
    |--------------------------------------------------------------------------
    */

    const csrfToken =
        document
            .querySelector(
                'meta[name="csrf-token"]'
            )
            ?.getAttribute(
                'content'
            ) || '';

    /*
    |--------------------------------------------------------------------------
    | Vendor Report
    |--------------------------------------------------------------------------
    */

    const [
        vendorId,
        setVendorId,
    ] =
        useState('');

    const [
        vendorStartDate,
        setVendorStartDate,
    ] =
        useState(
            monthStart
        );

    const [
        vendorEndDate,
        setVendorEndDate,
    ] =
        useState(
            today
        );

    /*
    |--------------------------------------------------------------------------
    | Warehouse Report
    |--------------------------------------------------------------------------
    */

    const [
        warehouseId,
        setWarehouseId,
    ] =
        useState('');

    const [
        warehouseStartDate,
        setWarehouseStartDate,
    ] =
        useState(
            monthStart
        );

    const [
        warehouseEndDate,
        setWarehouseEndDate,
    ] =
        useState(
            today
        );

    /*
    |--------------------------------------------------------------------------
    | Date Report
    |--------------------------------------------------------------------------
    */

    const [
        dateStartDate,
        setDateStartDate,
    ] =
        useState(
            monthStart
        );

    const [
        dateEndDate,
        setDateEndDate,
    ] =
        useState(
            today
        );

    /*
    |--------------------------------------------------------------------------
    | Vendor Validation
    |--------------------------------------------------------------------------
    */

    const handleVendorSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        clearError();

        if (!vendorId) {
            event.preventDefault();

            showError(
                'Please select a vendor.'
            );

            return;
        }

        if (
            !vendorStartDate ||
            !vendorEndDate
        ) {
            event.preventDefault();

            showError(
                'Please select start date and end date.'
            );

            return;
        }

        if (
            vendorStartDate >
            vendorEndDate
        ) {
            event.preventDefault();

            showError(
                'End date must be equal to or after start date.'
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Warehouse Validation
    |--------------------------------------------------------------------------
    */

    const handleWarehouseSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        clearError();

        if (!warehouseId) {
            event.preventDefault();

            showError(
                'Please select a warehouse.'
            );

            return;
        }

        if (
            !warehouseStartDate ||
            !warehouseEndDate
        ) {
            event.preventDefault();

            showError(
                'Please select start date and end date.'
            );

            return;
        }

        if (
            warehouseStartDate >
            warehouseEndDate
        ) {
            event.preventDefault();

            showError(
                'End date must be equal to or after start date.'
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Date Validation
    |--------------------------------------------------------------------------
    */

    const handleDateSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        clearError();

        if (
            !dateStartDate ||
            !dateEndDate
        ) {
            event.preventDefault();

            showError(
                'Please select start date and end date.'
            );

            return;
        }

        if (
            dateStartDate >
            dateEndDate
        ) {
            event.preventDefault();

            showError(
                'End date must be equal to or after start date.'
            );
        }
    };

    return (
        <>
            <Head title="Purchase Reports" />

            <div className="container-fluid">
                {/* Error */}

                {error && (
                    <div
                        className="alert alert-danger alert-dismissible fade show"
                        role="alert"
                    >
                        <strong>
                            Error:
                        </strong>{' '}

                        {error}

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={
                                clearError
                            }
                        />
                    </div>
                )}

                <div className="row">
                    {/*
                    |--------------------------------------------------------------------------
                    | Vendor Wise
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    Vendor Wise Purchase Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    Generate approved purchase orders
                                    for a specific vendor.
                                </p>
                            </div>

                            <div className="card-body">
                                <form
                                    action={
                                        reportUrl
                                    }
                                    method="POST"
                                    target="_blank"
                                    onSubmit={
                                        handleVendorSubmit
                                    }
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            csrfToken
                                        }
                                    />

                                    <input
                                        type="hidden"
                                        name="report_type"
                                        value="vendor"
                                    />

                                    <input
                                        type="hidden"
                                        name="vendor_id"
                                        value={
                                            vendorId
                                        }
                                    />

                                    {/* Vendor */}

                                    <div className="mb-3">
                                        <label
                                            htmlFor="vendor_id"
                                            className="form-label"
                                        >
                                            Vendor{' '}

                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <Select
                                            id="vendor_id"
                                            value={
                                                vendorId
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setVendorId(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                clearError();
                                            }}
                                        >
                                            <option value="">
                                                Select Vendor
                                            </option>

                                            {vendors.map(
                                                (
                                                    vendor
                                                ) => (
                                                    <option
                                                        key={
                                                            vendor.id
                                                        }
                                                        value={
                                                            vendor.id
                                                        }
                                                    >
                                                        {vendor.vendor_id
                                                            ? `${vendor.vendor_id} - `
                                                            : ''}

                                                        {
                                                            vendor.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </Select>

                                        {vendors.length ===
                                            0 && (
                                            <small className="text-danger d-block mt-1">
                                                No vendors available.
                                            </small>
                                        )}
                                    </div>

                                    {/* Dates */}

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Start Date{' '}

                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        vendorStartDate
                                                    }
                                                    onChange={(
                                                        value
                                                    ) => {
                                                        setVendorStartDate(
                                                            value
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={
                                                        vendorStartDate
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    End Date{' '}

                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        vendorEndDate
                                                    }
                                                    onChange={(
                                                        value
                                                    ) => {
                                                        setVendorEndDate(
                                                            value
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={
                                                        vendorEndDate
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate Report
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Warehouse Wise
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    Warehouse Wise Purchase Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    Generate approved purchase orders
                                    for a specific warehouse.
                                </p>
                            </div>

                            <div className="card-body">
                                <form
                                    action={
                                        reportUrl
                                    }
                                    method="POST"
                                    target="_blank"
                                    onSubmit={
                                        handleWarehouseSubmit
                                    }
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            csrfToken
                                        }
                                    />

                                    <input
                                        type="hidden"
                                        name="report_type"
                                        value="warehouse"
                                    />

                                    <input
                                        type="hidden"
                                        name="warehouse_id"
                                        value={
                                            warehouseId
                                        }
                                    />

                                    {/* Warehouse */}

                                    <div className="mb-3">
                                        <label
                                            htmlFor="warehouse_id"
                                            className="form-label"
                                        >
                                            Warehouse{' '}

                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <Select
                                            id="warehouse_id"
                                            value={
                                                warehouseId
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setWarehouseId(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                clearError();
                                            }}
                                        >
                                            <option value="">
                                                Select Warehouse
                                            </option>

                                            {warehouses.map(
                                                (
                                                    warehouse
                                                ) => (
                                                    <option
                                                        key={
                                                            warehouse.id
                                                        }
                                                        value={
                                                            warehouse.id
                                                        }
                                                    >
                                                        {warehouse.code
                                                            ? `${warehouse.code} - `
                                                            : ''}

                                                        {
                                                            warehouse.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </Select>

                                        {warehouses.length ===
                                            0 && (
                                            <small className="text-danger d-block mt-1">
                                                No warehouses available.
                                            </small>
                                        )}
                                    </div>

                                    {/* Dates */}

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Start Date{' '}

                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        warehouseStartDate
                                                    }
                                                    onChange={(
                                                        value
                                                    ) => {
                                                        setWarehouseStartDate(
                                                            value
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={
                                                        warehouseStartDate
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    End Date{' '}

                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        warehouseEndDate
                                                    }
                                                    onChange={(
                                                        value
                                                    ) => {
                                                        setWarehouseEndDate(
                                                            value
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={
                                                        warehouseEndDate
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate Report
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Date Wise
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    Date Wise Purchase Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    Generate all approved purchase orders
                                    within a selected date range.
                                </p>
                            </div>

                            <div className="card-body">
                                <form
                                    action={
                                        reportUrl
                                    }
                                    method="POST"
                                    target="_blank"
                                    onSubmit={
                                        handleDateSubmit
                                    }
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={
                                            csrfToken
                                        }
                                    />

                                    <input
                                        type="hidden"
                                        name="report_type"
                                        value="date"
                                    />

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Start Date{' '}

                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        dateStartDate
                                                    }
                                                    onChange={(
                                                        value
                                                    ) => {
                                                        setDateStartDate(
                                                            value
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={
                                                        dateStartDate
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    End Date{' '}

                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <DatePicker
                                                    value={
                                                        dateEndDate
                                                    }
                                                    onChange={(
                                                        value
                                                    ) => {
                                                        setDateEndDate(
                                                            value
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={
                                                        dateEndDate
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate Report
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}