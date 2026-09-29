import type { ReactNode } from 'react';

import dayjs from 'dayjs';

type Suggestion = {
    id: number;
    name: string;
};

export type CustomerData = {
    id: number;
    client_no: string;
    name: string;
    phone: string;
    email: string | null;

    nid_no: string | null;
    passport_no: string | null;
    tin_no: string | null;
    date_of_birth: string | null;
    gender: string | null;
    marital_status: string | null;

    profession_id: number | null;
    lead_designation_id: number | null;
    company_name: string | null;

    present_address: string | null;
    permanent_address: string | null;
    area_id: number | null;
    sector_id: number | null;

    image: string | null;
    status: string;

    lead_id: number | null;
    created_by: number | string | null;
    updated_by: number | string | null;

    profession: Suggestion | null;
    area: Suggestion | null;
    designation?: Suggestion | null;
    leadDesignation?: Suggestion | null;
    sector: Suggestion | null;

    created_at: string;
    updated_at: string;
};

type ViewCustomerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: CustomerData | null;
    loading?: boolean;
};

const emptyValue = (
    value?: string | number | null,
) => {
    return value === null || value === undefined || value === ''
        ? '—'
        : value;
};

const relationValue = (
    value?: Suggestion | string | number | null,
) => {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (typeof value === 'object') {
        return value.name || '—';
    }

    return value;
};

const titleCase = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

function formatDateTime(value?: string | null) {
    if (!value) {
        return '—';
    }

    return dayjs(value).format('DD MMM, YYYY hh:mm A');
}

function formatDate(value?: string | null) {
    if (!value) {
        return '—';
    }

    return dayjs(value).format('DD MMM, YYYY');
}

function CustomerDetailsSkeleton() {
    return (
        <div className="placeholder-glow">
            <div className="row g-3">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div className="col-md-6" key={index}>
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <span
                                    className="placeholder col-4 mb-2"
                                    style={{ height: 12 }}
                                />

                                <span
                                    className="placeholder col-8 d-block"
                                    style={{ height: 18 }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CustomerDetailsContent({
    customer,
}: {
    customer: CustomerData | null;
}) {
    if (!customer) {
        return (
            <div className="text-center text-muted py-5">
                Customer details are unavailable.
            </div>
        );
    }

    const designation =
        customer.leadDesignation ??
        customer.designation ??
        null;

    return (
        <>
            <CustomerInfoCard title="Basic Information">
                <Info
                    label="Client No."
                    value={customer.client_no}
                />

                <Info
                    label="Customer Name"
                    value={customer.name}
                />

                <Info
                    label="Phone"
                    value={customer.phone}
                />

                <Info
                    label="Email"
                    value={customer.email}
                />

                <Info
                    label="Company"
                    value={customer.company_name}
                />

                <Info
                    label="Status"
                    value={titleCase(customer.status)}
                />
            </CustomerInfoCard>

            <CustomerInfoCard title="Identity & Personal Information">
                <Info
                    label="NID No."
                    value={customer.nid_no}
                />

                <Info
                    label="Passport No."
                    value={customer.passport_no}
                />

                <Info
                    label="TIN No."
                    value={customer.tin_no}
                />

                <Info
                    label="Date of Birth"
                    value={formatDate(customer.date_of_birth)}
                />

                <Info
                    label="Gender"
                    value={titleCase(customer.gender)}
                />

                <Info
                    label="Marital Status"
                    value={titleCase(customer.marital_status)}
                />
            </CustomerInfoCard>

            <CustomerInfoCard title="Occupation & Location">
                <Info
                    label="Profession"
                    value={customer.profession}
                />

                <Info
                    label="Lead Designation"
                    value={designation}
                />

                <Info
                    label="Area"
                    value={customer.area}
                />

                <Info
                    label="Sector"
                    value={customer.sector}
                />

                <Info
                    label="Related Lead ID"
                    value={customer.lead_id}
                />
            </CustomerInfoCard>

            <CustomerInfoCard title="Address Information">
                <Info
                    label="Present Address"
                    value={customer.present_address}
                    column="col-md-6"
                />

                <Info
                    label="Permanent Address"
                    value={customer.permanent_address}
                    column="col-md-6"
                />
            </CustomerInfoCard>

            <CustomerInfoCard title="Audit Information">
                <Info
                    label="Created By"
                    value={customer.created_by}
                />

                <Info
                    label="Created At"
                    value={formatDateTime(customer.created_at)}
                />

                <Info
                    label="Updated By"
                    value={customer.updated_by}
                />

                <Info
                    label="Last Updated"
                    value={formatDateTime(customer.updated_at)}
                />
            </CustomerInfoCard>
        </>
    );
}

function CustomerInfoCard({
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
    value?: Suggestion | string | number | null;
    column?: string;
}) {
    return (
        <div className={column}>
            <label className="text-muted fw-bold">{label}</label>

            <div className="fw-semibold text-break">
                {relationValue(value)}
            </div>
        </div>
    );
}

export default function ViewCustomerModal({
    open,
    onOpenChange,
    customer,
    loading = false,
}: ViewCustomerModalProps) {
    return (
        <div
            className={`modal fade ${open ? 'show d-block' : ''}`}
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
                                Customer Details -{' '}
                                {customer?.client_no ?? 'N/A'}
                            </h4>

                            <small className="text-muted">
                                Created by{' '}
                                {customer?.created_by ?? 'N/A'} |{' '}
                                {formatDateTime(customer?.created_at)}
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
                            <CustomerDetailsSkeleton />
                        ) : (
                            <CustomerDetailsContent
                                customer={customer}
                            />
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
