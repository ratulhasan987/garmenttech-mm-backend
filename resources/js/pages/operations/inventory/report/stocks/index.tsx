import PageTitle from '@/components/page-title';

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

type Warehouse = {
    id: number;
    code: string | null;
    name: string;
};

type Product = {
    id: number;
    code: string | null;
    name: string;
    unit: string;
    reorder_level: number;
};

type Props = {
    warehouses: Warehouse[];

    products: Product[];

    reportUrl: string;

    downloadPdfUrl: string;
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function StockReportIndex({
    warehouses,
    products,
    reportUrl,
}: Props) {
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
            behavior:
                'smooth',
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
    | Warehouse Report
    |--------------------------------------------------------------------------
    */

    const [
        warehouseId,
        setWarehouseId,
    ] =
        useState('');

    /*
    |--------------------------------------------------------------------------
    | Product Report
    |--------------------------------------------------------------------------
    */

    const [
        productId,
        setProductId,
    ] =
        useState('');

    /*
    |--------------------------------------------------------------------------
    | Warehouse Submit
    |--------------------------------------------------------------------------
    */

    const handleWarehouseSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        clearError();

        if (
            !warehouseId
        ) {
            event.preventDefault();

            showError(
                'Please select a warehouse.'
            );

            return;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Product Submit
    |--------------------------------------------------------------------------
    */

    const handleProductSubmit = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        clearError();

        if (
            !productId
        ) {
            event.preventDefault();

            showError(
                'Please select a product.'
            );

            return;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | All Stock Submit
    |--------------------------------------------------------------------------
    */

    const handleAllSubmit = () => {
        clearError();
    };

    return (
        <>
            <Head title="Stock Reports" />

            <PageTitle
                title="Stock Reports"
            />

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
                    | Warehouse Wise
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    Warehouse Wise
                                    Stock Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    View current
                                    physical,
                                    reserved and
                                    available stock
                                    for a specific
                                    warehouse.
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
                                                Select
                                                Warehouse
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
                                                No
                                                warehouses
                                                available.
                                            </small>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate
                                        Report
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | Product Wise
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    Product Wise
                                    Stock Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    View a product's
                                    current stock
                                    across all
                                    warehouses.
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
                                        handleProductSubmit
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
                                        value="product"
                                    />

                                    <input
                                        type="hidden"
                                        name="product_id"
                                        value={
                                            productId
                                        }
                                    />

                                    <div className="mb-3">
                                        <label
                                            htmlFor="product_id"
                                            className="form-label"
                                        >
                                            Product{' '}

                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <Select
                                            id="product_id"
                                            value={
                                                productId
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setProductId(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                clearError();
                                            }}
                                        >
                                            <option value="">
                                                Select
                                                Product
                                            </option>

                                            {products.map(
                                                (
                                                    product
                                                ) => (
                                                    <option
                                                        key={
                                                            product.id
                                                        }
                                                        value={
                                                            product.id
                                                        }
                                                    >
                                                        {product.code
                                                            ? `${product.code} - `
                                                            : ''}

                                                        {
                                                            product.name
                                                        }

                                                        {product.unit
                                                            ? ` (${product.unit})`
                                                            : ''}
                                                    </option>
                                                )
                                            )}
                                        </Select>

                                        {products.length ===
                                            0 && (
                                            <small className="text-danger d-block mt-1">
                                                No
                                                products
                                                available.
                                            </small>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate
                                        Report
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/*
                    |--------------------------------------------------------------------------
                    | All Current Stock
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    All Current
                                    Stock Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    View the complete
                                    current stock
                                    position for all
                                    warehouses and
                                    products.
                                </p>
                            </div>

                            <div className="card-body d-flex flex-column">
                                <div className="mb-4">
                                    <div className="alert alert-light border mb-0">
                                        This report
                                        includes
                                        physical
                                        quantity,
                                        reserved
                                        quantity,
                                        available
                                        quantity and
                                        reorder status
                                        for every
                                        existing stock
                                        row.
                                    </div>
                                </div>

                                <form
                                    action={
                                        reportUrl
                                    }
                                    method="POST"
                                    target="_blank"
                                    onSubmit={
                                        handleAllSubmit
                                    }
                                    className="mt-auto"
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
                                        value="all"
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                    >
                                        Generate
                                        Report
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