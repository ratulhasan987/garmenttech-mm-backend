import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Unit = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    code: string | null;
    name: string;
    unit_id: number | null;
    unit?: Unit | null;
};

type InvoiceItem = {
    id: number;

    product_id: number;

    quantity:
        | number
        | string;

    unit_price:
        | number
        | string;

    discount:
        | number
        | string;

    tax:
        | number
        | string;

    line_total:
        | number
        | string;

    product?: Product | null;
};

type Client = {
    id: number;
    client_id: string | null;
    name: string;
    company_name?: string | null;
    phone?: string | null;
};

type Warehouse = {
    id: number;
    code: string | null;
    name: string;
};

type Invoice = {
    id: number;

    invoice_no: string;

    invoice_date: string;

    subtotal:
        | number
        | string;

    discount:
        | number
        | string;

    tax:
        | number
        | string;

    adjustment_amount:
        | number
        | string;

    grand_total:
        | number
        | string;

    paid_amount:
        | number
        | string;

    due_amount:
        | number
        | string;

    status: string;

    payment_status: string;

    client?: Client | null;

    warehouse?: Warehouse | null;

    items: InvoiceItem[];
};

type Configure = {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
};

type Currency = {
    id?: number;
    name?: string;
    symbol?: string;
};

type Props = {
    invoices: Invoice[];

    start_date: string;
    end_date: string;

    configure: Configure | null;

    activeCurrency: Currency | null;

    report_type:
        | 'client'
        | 'warehouse'
        | 'date';

    client_id: number | null;
    client_name: string;
    client_code: string;
    client_phone: string;

    warehouse_id: number | null;
    warehouse_name: string;
    warehouse_code: string;

    report_index_url: string;
    download_pdf_url: string;
};

/*
|--------------------------------------------------------------------------
| Number
|--------------------------------------------------------------------------
*/

const toNumber = (
    value:
        | number
        | string
        | null
        | undefined
) => {
    const number =
        Number(
            value ?? 0
        );

    return Number.isFinite(
        number
    )
        ? number
        : 0;
};

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const formatDate = (
    value: string
) => {
    if (!value) {
        return '';
    }

    const parts =
        value.split('-');

    if (
        parts.length !== 3
    ) {
        return value;
    }

    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    return date.toLocaleDateString(
        'en-GB',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }
    );
};

/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

export default function SalesReport({
    invoices,

    start_date,
    end_date,

    configure,

    activeCurrency,

    report_type,

    client_id,
    client_name,
    client_code,
    client_phone,

    warehouse_id,
    warehouse_name,
    warehouse_code,

    report_index_url,
    download_pdf_url,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const currencySymbol =
        activeCurrency?.symbol ||
        '৳';

    const money = (
        value:
            | number
            | string
            | null
            | undefined
    ) =>
        `${currencySymbol} ${toNumber(
            value
        ).toLocaleString(
            'en-US',
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2,
            }
        )}`;

    /*
    |--------------------------------------------------------------------------
    | Report Title
    |--------------------------------------------------------------------------
    */

    const reportTitle =
        report_type ===
        'client'
            ? 'Customer Wise Sales Report'
            : report_type ===
                'warehouse'
              ? 'Warehouse Wise Sales Report'
              : 'Date Wise Sales Report';

    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    const totalSubtotal =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.subtotal
                ),
            0
        );

    const totalDiscount =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.discount
                ),
            0
        );

    const totalTax =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.tax
                ),
            0
        );

    const totalAdjustment =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.adjustment_amount
                ),
            0
        );

    const totalGrand =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.grand_total
                ),
            0
        );

    const totalPaid =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.paid_amount
                ),
            0
        );

    const totalDue =
        invoices.reduce(
            (
                total,
                invoice
            ) =>
                total +
                toNumber(
                    invoice.due_amount
                ),
            0
        );

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
    | Payment Badge
    |--------------------------------------------------------------------------
    */

    const paymentBadge = (
        status: string
    ) => {
        const normalized =
            status
                ?.toLowerCase()
                ?.trim();

        if (
            normalized ===
            'paid'
        ) {
            return 'badge bg-success';
        }

        if (
            [
                'partial',
                'partial-paid',
                'partially-paid',
            ].includes(
                normalized
            )
        ) {
            return 'badge bg-warning text-dark';
        }

        return 'badge bg-danger';
    };

    /*
    |--------------------------------------------------------------------------
    | Footer Colspan
    |--------------------------------------------------------------------------
    */

    const summaryColSpan =
        report_type ===
        'date'
            ? 9
            : 8;

    const emptyColSpan =
        report_type ===
        'date'
            ? 13
            : 12;

    return (
        <AppLayout>
            <Head
                title={
                    reportTitle
                }
            />

            <div className="container-fluid">
                {/* Actions */}

                <div className="row mb-3">
                    <div className="col-12">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <Link
                                href={
                                    report_index_url
                                }
                                className="btn btn-light"
                            >
                                <i className="fa fa-arrow-left me-2" />

                                Back to
                                Reports
                            </Link>

                            {/* PDF */}

                            <form
                                action={
                                    download_pdf_url
                                }
                                method="POST"
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
                                    value={
                                        report_type
                                    }
                                />

                                <input
                                    type="hidden"
                                    name="start_date"
                                    value={
                                        start_date
                                    }
                                />

                                <input
                                    type="hidden"
                                    name="end_date"
                                    value={
                                        end_date
                                    }
                                />

                                {report_type ===
                                    'client' &&
                                    client_id && (
                                        <input
                                            type="hidden"
                                            name="client"
                                            value={
                                                client_id
                                            }
                                        />
                                    )}

                                {report_type ===
                                    'warehouse' &&
                                    warehouse_id && (
                                        <input
                                            type="hidden"
                                            name="warehouse"
                                            value={
                                                warehouse_id
                                            }
                                        />
                                    )}

                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                >
                                    <i className="fa fa-file-pdf-o me-2" />

                                    Download
                                    PDF
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Report */}

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                {/* Company */}

                                <div className="text-center border-bottom pb-4 mb-4">
                                    <h3 className="mb-2">
                                        {configure?.name ||
                                            'Biztek ERP'}
                                    </h3>

                                    {configure?.address && (
                                        <p className="mb-1 text-muted">
                                            <strong>
                                                Address:{' '}
                                            </strong>

                                            {
                                                configure.address
                                            }
                                        </p>
                                    )}

                                    {(configure?.phone ||
                                        configure?.email) && (
                                        <p className="mb-0 text-muted">
                                            {configure?.phone && (
                                                <>
                                                    <strong>
                                                        Phone:{' '}
                                                    </strong>

                                                    {
                                                        configure.phone
                                                    }
                                                </>
                                            )}

                                            {configure?.phone &&
                                                configure?.email &&
                                                ' | '}

                                            {configure?.email && (
                                                <>
                                                    <strong>
                                                        Email:{' '}
                                                    </strong>

                                                    {
                                                        configure.email
                                                    }
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Title */}

                                <div className="text-center mb-4">
                                    <h4 className="mb-1">
                                        {
                                            reportTitle
                                        }
                                    </h4>

                                    <p className="text-muted mb-0">
                                        Approved
                                        Sales
                                        Invoices
                                    </p>
                                </div>

                                {/* Information */}

                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>
                                                From:{' '}
                                            </strong>

                                            {formatDate(
                                                start_date
                                            )}
                                        </p>

                                        <p className="mb-2">
                                            <strong>
                                                To:{' '}
                                            </strong>

                                            {formatDate(
                                                end_date
                                            )}
                                        </p>

                                        <p className="mb-0">
                                            <strong>
                                                Total
                                                Invoices:{' '}
                                            </strong>

                                            {
                                                invoices.length
                                            }
                                        </p>
                                    </div>

                                    <div className="col-md-6 text-md-end mt-3 mt-md-0">
                                        {report_type ===
                                            'client' && (
                                            <>
                                                <p className="mb-2">
                                                    <strong>
                                                        Customer:{' '}
                                                    </strong>

                                                    {client_name ||
                                                        'N/A'}
                                                </p>

                                                <p className="mb-2">
                                                    <strong>
                                                        Customer
                                                        ID:{' '}
                                                    </strong>

                                                    {client_code ||
                                                        'N/A'}
                                                </p>

                                                {client_phone && (
                                                    <p className="mb-0">
                                                        <strong>
                                                            Phone:{' '}
                                                        </strong>

                                                        {
                                                            client_phone
                                                        }
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {report_type ===
                                            'warehouse' && (
                                            <>
                                                <p className="mb-2">
                                                    <strong>
                                                        Warehouse:{' '}
                                                    </strong>

                                                    {warehouse_name ||
                                                        'N/A'}
                                                </p>

                                                <p className="mb-0">
                                                    <strong>
                                                        Code:{' '}
                                                    </strong>

                                                    {warehouse_code ||
                                                        'N/A'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Table */}

                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped align-middle">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Invoice
                                                    /
                                                    Date
                                                </th>

                                                {report_type !==
                                                    'client' && (
                                                    <th>
                                                        Customer
                                                    </th>
                                                )}

                                                {report_type !==
                                                    'warehouse' && (
                                                    <th>
                                                        Warehouse
                                                    </th>
                                                )}

                                                <th>
                                                    Product
                                                </th>

                                                <th>
                                                    Qty
                                                </th>

                                                <th>
                                                    Unit
                                                    Price
                                                </th>

                                                <th>
                                                    Discount
                                                </th>

                                                <th>
                                                    Tax
                                                </th>

                                                <th>
                                                    Line
                                                    Total
                                                </th>

                                                <th>
                                                    Grand
                                                    Total
                                                </th>

                                                <th>
                                                    Paid
                                                </th>

                                                <th>
                                                    Due
                                                </th>

                                                <th>
                                                    Payment
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {invoices.length ===
                                            0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={
                                                            emptyColSpan
                                                        }
                                                        className="text-center py-4 text-muted"
                                                    >
                                                        No
                                                        approved
                                                        sales
                                                        invoices
                                                        found
                                                        for
                                                        the
                                                        selected
                                                        period.
                                                    </td>
                                                </tr>
                                            ) : (
                                                invoices.flatMap(
                                                    (
                                                        invoice
                                                    ) => {
                                                        /*
                                                        |--------------------------------------------------------------------------
                                                        | No Items
                                                        |--------------------------------------------------------------------------
                                                        */

                                                        if (
                                                            !invoice
                                                                .items
                                                                ?.length
                                                        ) {
                                                            return [
                                                                <tr
                                                                    key={
                                                                        invoice.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        <strong>
                                                                            {
                                                                                invoice.invoice_no
                                                                            }
                                                                        </strong>

                                                                        <br />

                                                                        <small className="text-muted">
                                                                            {formatDate(
                                                                                invoice.invoice_date
                                                                            )}
                                                                        </small>
                                                                    </td>

                                                                    {report_type !==
                                                                        'client' && (
                                                                        <td>
                                                                            {invoice
                                                                                .client
                                                                                ?.name ||
                                                                                'N/A'}
                                                                        </td>
                                                                    )}

                                                                    {report_type !==
                                                                        'warehouse' && (
                                                                        <td>
                                                                            {invoice
                                                                                .warehouse
                                                                                ?.name ||
                                                                                'N/A'}
                                                                        </td>
                                                                    )}

                                                                    <td
                                                                        colSpan={
                                                                            6
                                                                        }
                                                                        className="text-center text-muted"
                                                                    >
                                                                        No
                                                                        items
                                                                        found
                                                                    </td>

                                                                    <td>
                                                                        {money(
                                                                            invoice.grand_total
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        {money(
                                                                            invoice.paid_amount
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        {money(
                                                                            invoice.due_amount
                                                                        )}
                                                                    </td>

                                                                    <td>
                                                                        <span
                                                                            className={paymentBadge(
                                                                                invoice.payment_status
                                                                            )}
                                                                        >
                                                                            {
                                                                                invoice.payment_status
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                </tr>,
                                                            ];
                                                        }

                                                        /*
                                                        |--------------------------------------------------------------------------
                                                        | Items
                                                        |--------------------------------------------------------------------------
                                                        */

                                                        return invoice.items.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <tr
                                                                    key={`${invoice.id}-${item.id}`}
                                                                >
                                                                    {index ===
                                                                        0 && (
                                                                        <>
                                                                            <td
                                                                                rowSpan={
                                                                                    invoice
                                                                                        .items
                                                                                        .length
                                                                                }
                                                                            >
                                                                                <strong>
                                                                                    {
                                                                                        invoice.invoice_no
                                                                                    }
                                                                                </strong>

                                                                                <br />

                                                                                <small className="text-muted">
                                                                                    {formatDate(
                                                                                        invoice.invoice_date
                                                                                    )}
                                                                                </small>
                                                                            </td>

                                                                            {report_type !==
                                                                                'client' && (
                                                                                <td
                                                                                    rowSpan={
                                                                                        invoice
                                                                                            .items
                                                                                            .length
                                                                                    }
                                                                                >
                                                                                    <strong>
                                                                                        {invoice
                                                                                            .client
                                                                                            ?.name ||
                                                                                            'N/A'}
                                                                                    </strong>

                                                                                    <br />

                                                                                    <small className="text-muted">
                                                                                        {invoice
                                                                                            .client
                                                                                            ?.client_id ||
                                                                                            ''}
                                                                                    </small>
                                                                                </td>
                                                                            )}

                                                                            {report_type !==
                                                                                'warehouse' && (
                                                                                <td
                                                                                    rowSpan={
                                                                                        invoice
                                                                                            .items
                                                                                            .length
                                                                                    }
                                                                                >
                                                                                    <strong>
                                                                                        {invoice
                                                                                            .warehouse
                                                                                            ?.name ||
                                                                                            'N/A'}
                                                                                    </strong>

                                                                                    <br />

                                                                                    <small className="text-muted">
                                                                                        {invoice
                                                                                            .warehouse
                                                                                            ?.code ||
                                                                                            ''}
                                                                                    </small>
                                                                                </td>
                                                                            )}
                                                                        </>
                                                                    )}

                                                                    {/* Product */}

                                                                    <td>
                                                                        <strong>
                                                                            {item
                                                                                .product
                                                                                ?.name ||
                                                                                'N/A'}
                                                                        </strong>

                                                                        {item
                                                                            .product
                                                                            ?.code && (
                                                                            <>
                                                                                <br />

                                                                                <small className="text-muted">
                                                                                    {
                                                                                        item
                                                                                            .product
                                                                                            .code
                                                                                    }
                                                                                </small>
                                                                            </>
                                                                        )}
                                                                    </td>

                                                                    {/* Qty */}

                                                                    <td>
                                                                        {toNumber(
                                                                            item.quantity
                                                                        ).toLocaleString(
                                                                            'en-US',
                                                                            {
                                                                                minimumFractionDigits:
                                                                                    2,
                                                                                maximumFractionDigits:
                                                                                    2,
                                                                            }
                                                                        )}

                                                                        {item
                                                                            .product
                                                                            ?.unit
                                                                            ?.name
                                                                            ? ` ${item.product.unit.name}`
                                                                            : ''}
                                                                    </td>

                                                                    {/* Price */}

                                                                    <td>
                                                                        {money(
                                                                            item.unit_price
                                                                        )}
                                                                    </td>

                                                                    {/* Discount */}

                                                                    <td>
                                                                        {money(
                                                                            item.discount
                                                                        )}
                                                                    </td>

                                                                    {/* Tax */}

                                                                    <td>
                                                                        {money(
                                                                            item.tax
                                                                        )}
                                                                    </td>

                                                                    {/* Line */}

                                                                    <td>
                                                                        {money(
                                                                            item.line_total
                                                                        )}
                                                                    </td>

                                                                    {/* Invoice totals */}

                                                                    {index ===
                                                                        0 && (
                                                                        <>
                                                                            <td
                                                                                rowSpan={
                                                                                    invoice
                                                                                        .items
                                                                                        .length
                                                                                }
                                                                            >
                                                                                <strong>
                                                                                    {money(
                                                                                        invoice.grand_total
                                                                                    )}
                                                                                </strong>
                                                                            </td>

                                                                            <td
                                                                                rowSpan={
                                                                                    invoice
                                                                                        .items
                                                                                        .length
                                                                                }
                                                                            >
                                                                                {money(
                                                                                    invoice.paid_amount
                                                                                )}
                                                                            </td>

                                                                            <td
                                                                                rowSpan={
                                                                                    invoice
                                                                                        .items
                                                                                        .length
                                                                                }
                                                                            >
                                                                                {money(
                                                                                    invoice.due_amount
                                                                                )}
                                                                            </td>

                                                                            <td
                                                                                rowSpan={
                                                                                    invoice
                                                                                        .items
                                                                                        .length
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={paymentBadge(
                                                                                        invoice.payment_status
                                                                                    )}
                                                                                >
                                                                                    {
                                                                                        invoice.payment_status
                                                                                    }
                                                                                </span>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            )
                                                        );
                                                    }
                                                )
                                            )}
                                        </tbody>

                                        {invoices.length >
                                            0 && (
                                            <tfoot>
                                                <tr>
                                                    <th
                                                        colSpan={
                                                            summaryColSpan
                                                        }
                                                        className="text-end"
                                                    >
                                                        Total
                                                        Summary
                                                    </th>

                                                    <th>
                                                        {money(
                                                            totalGrand
                                                        )}
                                                    </th>

                                                    <th>
                                                        {money(
                                                            totalPaid
                                                        )}
                                                    </th>

                                                    <th>
                                                        {money(
                                                            totalDue
                                                        )}
                                                    </th>

                                                    <th />
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>

                                {/* Summary */}

                                <div className="row justify-content-end mt-4">
                                    <div className="col-xl-4 col-lg-5 col-md-6">
                                        <div className="table-responsive">
                                            <table className="table table-bordered mb-0">
                                                <tbody>
                                                    <tr>
                                                        <th>
                                                            Subtotal
                                                        </th>

                                                        <td className="text-end">
                                                            {money(
                                                                totalSubtotal
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Discount
                                                        </th>

                                                        <td className="text-end">
                                                            {money(
                                                                totalDiscount
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Tax
                                                        </th>

                                                        <td className="text-end">
                                                            {money(
                                                                totalTax
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Adjustment
                                                        </th>

                                                        <td className="text-end">
                                                            {money(
                                                                totalAdjustment
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr className="table-light">
                                                        <th>
                                                            Grand
                                                            Total
                                                        </th>

                                                        <td className="text-end fw-bold">
                                                            {money(
                                                                totalGrand
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Paid
                                                        </th>

                                                        <td className="text-end text-success fw-bold">
                                                            {money(
                                                                totalPaid
                                                            )}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Due
                                                        </th>

                                                        <td className="text-end text-danger fw-bold">
                                                            {money(
                                                                totalDue
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Action */}

                                <div className="d-flex justify-content-end mt-4">
                                    <form
                                        action={
                                            download_pdf_url
                                        }
                                        method="POST"
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
                                            value={
                                                report_type
                                            }
                                        />

                                        <input
                                            type="hidden"
                                            name="start_date"
                                            value={
                                                start_date
                                            }
                                        />

                                        <input
                                            type="hidden"
                                            name="end_date"
                                            value={
                                                end_date
                                            }
                                        />

                                        {report_type ===
                                            'client' &&
                                            client_id && (
                                                <input
                                                    type="hidden"
                                                    name="client"
                                                    value={
                                                        client_id
                                                    }
                                                />
                                            )}

                                        {report_type ===
                                            'warehouse' &&
                                            warehouse_id && (
                                                <input
                                                    type="hidden"
                                                    name="warehouse"
                                                    value={
                                                        warehouse_id
                                                    }
                                                />
                                            )}

                                        <button
                                            type="submit"
                                            className="btn btn-danger"
                                        >
                                            <i className="fa fa-file-pdf-o me-2" />

                                            Download
                                            PDF
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}