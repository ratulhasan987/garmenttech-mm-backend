import type { ReactNode } from 'react';

import dayjs from 'dayjs';

export type LeadProduct = {
    id: number;
    product_id: number;
    code?: string | null;
    name?: string | null;
    unit?: string | null;
    quantity?: number | string | null;
    estimated_price_per_unit?: number | string | null;
    remarks?: string | null;
};

export type LeadDetails = {
    id: number;
    lead_code?: string | null;
    created_by?: string | null;
    created_at?: string | null;

    name?: string | null;
    company_name?: string | null;
    phone?: string | null;
    phone_secondary?: string | null;
    phone_foreign?: string | null;
    email?: string | null;
    address?: string | null;

    area?: string | null;
    sector?: string | null;

    stage?: string | null;
    stage_color?: string | null;
    source?: string | null;
    assigned_to?: string | null;
    profession?: string | null;
    designation?: string | null;

    priority?: string | null;
    interest_level?: string | null;

    last_contacted_at?: string | null;
    next_follow_up_at?: string | null;
    converted_at?: string | null;
    remarks?: string | null;

    products?: LeadProduct[];
};

type ViewLeadModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadDetails | null;
    loading?: boolean;
};

const emptyValue = (value?: string | number | null) =>
    value === null || value === undefined || value === ''
        ? '—'
        : value;

const titleCase = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

function formatDate(value?: string | null) {
    if (!value) {
        return '—';
    }

    return dayjs(value).format('DD MMM, YYYY hh:mm A');
}

function formatMoney(value?: number | string | null) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return `৳ ${Number(value).toLocaleString(
        'en-BD',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    )}`;
}

function formatQuantity(value?: number | string | null) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return Number(value).toLocaleString(
        'en-BD',
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        },
    );
}

function LeadDetailsSkeleton() {
    return (
        <div className="placeholder-glow">
            <div className="row g-3">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div className="col-md-6" key={index}>
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <span
                                    className="placeholder col-4 mb-2"
                                    style={{
                                        height: 12,
                                    }}
                                />

                                <span
                                    className="placeholder col-8 d-block"
                                    style={{
                                        height: 18,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LeadProductsCard({
    products,
}: {
    products?: LeadProduct[];
}) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex align-items-center justify-content-between">
                <h6 className="mb-0 fw-bold">Interested Products</h6>

                <span className="badge bg-primary">
                    {products.length}
                </span>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-bordered mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th
                                    className="text-center"
                                    style={{
                                        width: '60px',
                                    }}
                                >
                                    SL
                                </th>

                                <th>Product</th>

                                <th
                                    style={{
                                        width: '120px',
                                    }}
                                >
                                    Unit
                                </th>

                                <th
                                    className="text-end"
                                    style={{
                                        width: '140px',
                                    }}
                                >
                                    Quantity
                                </th>

                                <th
                                    className="text-end"
                                    style={{
                                        width: '200px',
                                    }}
                                >
                                    Estimated Price / Unit
                                </th>

                                <th
                                    style={{
                                        width: '220px',
                                    }}
                                >
                                    Remarks
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id}>
                                    <td className="text-center">
                                        {index + 1}
                                    </td>

                                    <td>
                                        <div className="fw-semibold">
                                            {emptyValue(product.name)}
                                        </div>

                                        {product.code && (
                                            <small className="text-muted">
                                                Code: {product.code}
                                            </small>
                                        )}
                                    </td>

                                    <td>
                                        {emptyValue(product.unit)}
                                    </td>

                                    <td className="text-end">
                                        {formatQuantity(product.quantity)}
                                    </td>

                                    <td className="text-end">
                                        {formatMoney(
                                            product.estimated_price_per_unit,
                                        )}
                                    </td>

                                    <td>
                                        {emptyValue(product.remarks)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LeadDetailsContent({
    lead,
}: {
    lead: LeadDetails | null;
}) {
    if (!lead) {
        return (
            <div className="text-center text-muted py-5">
                Lead details are unavailable.
            </div>
        );
    }

    return (
        <>
            <LeadInfoCard title="Basic Information">
                <Info label="Name" value={lead.name} />
                <Info label="Primary Phone" value={lead.phone} />
                <Info
                    label="Secondary Phone"
                    value={lead.phone_secondary}
                />
                <Info
                    label="Foreign Phone"
                    value={lead.phone_foreign}
                />
                <Info label="Email" value={lead.email} />
                <Info label="Company" value={lead.company_name} />
                <Info
                    label="Address"
                    value={lead.address}
                    column="col-md-8"
                />
            </LeadInfoCard>

            <LeadInfoCard title="Location Information">
                <Info label="Area" value={lead.area} />
                <Info label="Sector" value={lead.sector} />
            </LeadInfoCard>

            <LeadInfoCard title="Status & Assignment">
                <div className="col-md-3">
                    <label className="text-muted fw-bold">Stage</label>

                    <br />

                    <span
                        className="badge px-3 py-2"
                        style={{
                            backgroundColor:
                                lead.stage_color ?? '#6c757d',
                        }}
                    >
                        {titleCase(lead.stage)}
                    </span>
                </div>

                <Info label="Source" value={lead.source} />
                <Info label="Assigned To" value={lead.assigned_to} />
                <Info label="Profession" value={lead.profession} />
                <Info
                    label="Designation"
                    value={lead.designation}
                />
                <Info
                    label="Priority"
                    value={titleCase(lead.priority)}
                />
                <Info
                    label="Interest Level"
                    value={titleCase(lead.interest_level)}
                />
            </LeadInfoCard>

            <LeadProductsCard products={lead.products} />

            <LeadInfoCard title="Follow-up Information">
                <Info
                    label="Last Contacted"
                    value={formatDate(lead.last_contacted_at)}
                />

                <Info
                    label="Next Follow-up"
                    value={formatDate(lead.next_follow_up_at)}
                />

                <Info
                    label="Converted At"
                    value={formatDate(lead.converted_at)}
                />

                <Info
                    label="Remarks"
                    value={
                        lead.remarks ??
                        'No remarks available.'
                    }
                    column="col-12"
                />
            </LeadInfoCard>
        </>
    );
}

function LeadInfoCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
                <h6 className="mb-0 fw-bold">{title}</h6>
            </div>

            <div className="card-body">
                <div className="row g-3">{children}</div>
            </div>
        </div>
    );
}

function Info({
    label,
    value,
    column = 'col-md-4',
}: {
    label: string;
    value?: string | number | null;
    column?: string;
}) {
    return (
        <div className={column}>
            <label className="text-muted fw-bold">{label}</label>

            <div className="fw-semibold text-break">
                {emptyValue(value)}
            </div>
        </div>
    );
}

export default function ViewLeadModal({
    open,
    onOpenChange,
    lead,
    loading = false,
}: ViewLeadModalProps) {
    return (
        <div
            className={`modal fade ${
                open ? 'show d-block' : ''
            }`}
            tabIndex={-1}
            role="dialog"
            aria-modal={open}
            style={
                open
                    ? {
                          backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      }
                    : undefined
            }
        >
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <div>
                            <h4 className="modal-title">
                                Lead Details -{' '}
                                {lead?.lead_code ?? 'N/A'}
                            </h4>

                            <small className="text-muted">
                                Created by{' '}
                                {lead?.created_by ?? 'N/A'} |{' '}
                                {formatDate(lead?.created_at)}
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                        />
                    </div>

                    <div className="modal-body p-4">
                        {loading ? (
                            <LeadDetailsSkeleton />
                        ) : (
                            <LeadDetailsContent lead={lead} />
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
