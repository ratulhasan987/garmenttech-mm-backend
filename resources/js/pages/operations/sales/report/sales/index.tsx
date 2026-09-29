import PageTitle from '@/components/page-title';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Select } from '@/components/ui/form/select';

import { Head } from '@inertiajs/react';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Warehouse = {
    id: number;
    code: string | null;
    name: string;
};

type Customer = {
    id: number;
    client_id?: string | null;
    name: string;
    phone?: string | null;
    company_name?: string | null;
    label?: string;
};

type Props = {
    warehouses: Warehouse[];
};

type CustomerSuggestionProps = {
    value: Customer | null;

    onChange: (customer: Customer | null) => void;

    onError?: (message: string) => void;
};

/*
|--------------------------------------------------------------------------
| Customer Suggestion
|--------------------------------------------------------------------------
*/

function CustomerSuggestion({
    value,
    onChange,
    onError,
}: CustomerSuggestionProps) {
    const [search, setSearch] = useState('');

    const [customers, setCustomers] = useState<Customer[]>([]);

    const [loading, setLoading] = useState(false);

    const [showSuggestions, setShowSuggestions] = useState(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    /*
    |--------------------------------------------------------------------------
    | Search Customers
    |--------------------------------------------------------------------------
    */

    const fetchCustomers = async (keyword: string = '') => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (keyword) {
                params.set('keyword', keyword);
            }

            const response = await fetch(
                `/operations/sales/customers?${params.toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Unable to load customers.');
            }

            const data = await response.json();

            setCustomers(Array.isArray(data) ? data : []);

            setShowSuggestions(true);
        } catch (error) {
            console.error('Customer search failed:', error);

            setCustomers([]);

            setShowSuggestions(false);

            onError?.('Unable to load customers.');
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Search Change
    |--------------------------------------------------------------------------
    */

    const handleSearchChange = (newValue: string) => {
        setSearch(newValue);

        onChange(null);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            void fetchCustomers(newValue.trim());
        }, 300);
    };

    /*
    |--------------------------------------------------------------------------
    | Select Customer
    |--------------------------------------------------------------------------
    */

    const selectCustomer = (customer: Customer) => {
        onChange(customer);

        setSearch(
            customer.label ||
                `${
                    customer.client_id ? `${customer.client_id} - ` : ''
                }${customer.name}`,
        );

        setShowSuggestions(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Outside Click
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div ref={wrapperRef} className="position-relative">
            <input
                type="text"
                className="form-control"
                placeholder="Search customer..."
                value={search}
                autoComplete="off"
                onFocus={() => {
                    void fetchCustomers(search.trim());
                }}
                onChange={(event) => handleSearchChange(event.target.value)}
            />

            {showSuggestions && (
                <div
                    className="dropdown-menu show w-100"
                    style={{
                        maxHeight: '250px',

                        overflowY: 'auto',

                        zIndex: 1050,
                    }}
                >
                    {loading ? (
                        <div className="dropdown-item text-muted">
                            Loading...
                        </div>
                    ) : customers.length > 0 ? (
                        customers.map((customer) => (
                            <button
                                key={customer.id}
                                type="button"
                                className="dropdown-item"
                                onClick={() => selectCustomer(customer)}
                            >
                                <div className="fw-semibold">
                                    {customer.name}
                                </div>

                                <small className="text-muted">
                                    {customer.client_id &&
                                        `#${customer.client_id}`}

                                    {customer.client_id &&
                                        customer.phone &&
                                        ' • '}

                                    {customer.phone ?? ''}
                                </small>
                            </button>
                        ))
                    ) : (
                        <div className="dropdown-item text-muted">
                            No customers found.
                        </div>
                    )}
                </div>
            )}

            {value && (
                <small className="text-success d-block mt-1">
                    Selected: {value.name}
                </small>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getMonthStart = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}-01`;
};

/*
|--------------------------------------------------------------------------
| Sales Report Index
|--------------------------------------------------------------------------
*/

export default function SalesReportIndex({ warehouses }: Props) {
    const today = getToday();

    const monthStart = getMonthStart();

    /*
    |--------------------------------------------------------------------------
    | URLs
    |--------------------------------------------------------------------------
    */

    const reportUrl = '/operations/sales/report';

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    const [error, setError] = useState<string | null>(null);

    const showError = (message: string) => {
        setError(message);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const clearError = () => {
        setError(null);
    };

    /*
    |--------------------------------------------------------------------------
    | CSRF
    |--------------------------------------------------------------------------
    */

    const csrfToken =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';

    /*
    |--------------------------------------------------------------------------
    | Customer Report
    |--------------------------------------------------------------------------
    */

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );

    const [customerStartDate, setCustomerStartDate] = useState(monthStart);

    const [customerEndDate, setCustomerEndDate] = useState(today);

    /*
    |--------------------------------------------------------------------------
    | Warehouse Report
    |--------------------------------------------------------------------------
    */

    const [warehouseId, setWarehouseId] = useState('');

    const [warehouseStartDate, setWarehouseStartDate] = useState(monthStart);

    const [warehouseEndDate, setWarehouseEndDate] = useState(today);

    /*
    |--------------------------------------------------------------------------
    | Date Report
    |--------------------------------------------------------------------------
    */

    const [dateStartDate, setDateStartDate] = useState(monthStart);

    const [dateEndDate, setDateEndDate] = useState(today);

    /*
    |--------------------------------------------------------------------------
    | Customer Validation
    |--------------------------------------------------------------------------
    */

    const handleCustomerSubmit = (event: FormEvent<HTMLFormElement>) => {
        clearError();

        if (!selectedCustomer) {
            event.preventDefault();

            showError('Please select a customer.');

            return;
        }

        if (!customerStartDate || !customerEndDate) {
            event.preventDefault();

            showError('Please select start date and end date.');

            return;
        }

        if (customerStartDate > customerEndDate) {
            event.preventDefault();

            showError('End date must be equal to or after start date.');

            return;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Warehouse Validation
    |--------------------------------------------------------------------------
    */

    const handleWarehouseSubmit = (event: FormEvent<HTMLFormElement>) => {
        clearError();

        if (!warehouseId) {
            event.preventDefault();

            showError('Please select a warehouse.');

            return;
        }

        if (!warehouseStartDate || !warehouseEndDate) {
            event.preventDefault();

            showError('Please select start date and end date.');

            return;
        }

        if (warehouseStartDate > warehouseEndDate) {
            event.preventDefault();

            showError('End date must be equal to or after start date.');

            return;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Date Validation
    |--------------------------------------------------------------------------
    */

    const handleDateSubmit = (event: FormEvent<HTMLFormElement>) => {
        clearError();

        if (!dateStartDate || !dateEndDate) {
            event.preventDefault();

            showError('Please select start date and end date.');

            return;
        }

        if (dateStartDate > dateEndDate) {
            event.preventDefault();

            showError('End date must be equal to or after start date.');

            return;
        }
    };

    return (
        <>
            <Head title="Sales Reports" />

            <PageTitle title="Sales Report" />

            <div className="container-fluid">
                {/*
                |--------------------------------------------------------------------------
                | Error Message
                |--------------------------------------------------------------------------
                */}

                {error && (
                    <div
                        className="alert alert-danger alert-dismissible fade show"
                        role="alert"
                    >
                        <strong>Error:</strong> {error}
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={clearError}
                        />
                    </div>
                )}

                <div className="row">
                    {/*
                    |--------------------------------------------------------------------------
                    | Customer Wise
                    |--------------------------------------------------------------------------
                    */}

                    <div className="col-xl-6 col-lg-6 col-md-12 mb-4">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-1">
                                    Customer Wise Sales Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    Generate approved sales report for a
                                    specific customer.
                                </p>
                            </div>

                            <div className="card-body">
                                <form
                                    action={reportUrl}
                                    method="POST"
                                    target="_blank"
                                    onSubmit={handleCustomerSubmit}
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={csrfToken}
                                    />

                                    <input
                                        type="hidden"
                                        name="report_type"
                                        value="client"
                                    />

                                    <input
                                        type="hidden"
                                        name="client"
                                        value={selectedCustomer?.id ?? ''}
                                    />

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Customer{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>

                                        <CustomerSuggestion
                                            value={selectedCustomer}
                                            onChange={(customer) => {
                                                setSelectedCustomer(customer);

                                                if (customer) {
                                                    clearError();
                                                }
                                            }}
                                            onError={showError}
                                        />
                                    </div>

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
                                                    value={customerStartDate}
                                                    onChange={(value) => {
                                                        setCustomerStartDate(
                                                            value,
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={customerStartDate}
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
                                                    value={customerEndDate}
                                                    onChange={(value) => {
                                                        setCustomerEndDate(
                                                            value,
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={customerEndDate}
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
                                    Warehouse Wise Sales Report
                                </h5>

                                <p className="mb-0 text-muted">
                                    Generate approved sales report for a
                                    specific warehouse.
                                </p>
                            </div>

                            <div className="card-body">
                                <form
                                    action={reportUrl}
                                    method="POST"
                                    target="_blank"
                                    onSubmit={handleWarehouseSubmit}
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={csrfToken}
                                    />

                                    <input
                                        type="hidden"
                                        name="report_type"
                                        value="warehouse"
                                    />

                                    <input
                                        type="hidden"
                                        name="warehouse"
                                        value={warehouseId}
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

                                        {/*
                                        |--------------------------------------------------------------------------
                                        | IMPORTANT:
                                        | Custom Select uses native option children
                                        |--------------------------------------------------------------------------
                                        */}

                                        <Select
                                            id="warehouse_id"
                                            value={warehouseId}
                                            onChange={(event) => {
                                                setWarehouseId(
                                                    event.target.value,
                                                );

                                                clearError();
                                            }}
                                        >
                                            <option value="">
                                                Select Warehouse
                                            </option>

                                            {warehouses.map((warehouse) => (
                                                <option
                                                    key={warehouse.id}
                                                    value={warehouse.id}
                                                >
                                                    {warehouse.code
                                                        ? `${warehouse.code} - `
                                                        : ''}

                                                    {warehouse.name}
                                                </option>
                                            ))}
                                        </Select>

                                        {warehouses.length === 0 && (
                                            <small className="text-danger d-block mt-1">
                                                No warehouses available.
                                            </small>
                                        )}
                                    </div>

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
                                                    value={warehouseStartDate}
                                                    onChange={(value) => {
                                                        setWarehouseStartDate(
                                                            value,
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={warehouseStartDate}
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
                                                    value={warehouseEndDate}
                                                    onChange={(value) => {
                                                        setWarehouseEndDate(
                                                            value,
                                                        );

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={warehouseEndDate}
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
                                <h5 className="mb-1">Date Wise Sales Report</h5>

                                <p className="mb-0 text-muted">
                                    Generate all approved sales invoices within
                                    a selected date range.
                                </p>
                            </div>

                            <div className="card-body">
                                <form
                                    action={reportUrl}
                                    method="POST"
                                    target="_blank"
                                    onSubmit={handleDateSubmit}
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={csrfToken}
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
                                                    value={dateStartDate}
                                                    onChange={(value) => {
                                                        setDateStartDate(value);

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="start_date"
                                                    value={dateStartDate}
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
                                                    value={dateEndDate}
                                                    onChange={(value) => {
                                                        setDateEndDate(value);

                                                        clearError();
                                                    }}
                                                />

                                                <input
                                                    type="hidden"
                                                    name="end_date"
                                                    value={dateEndDate}
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
