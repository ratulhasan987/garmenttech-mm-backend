import { type FormEvent, useMemo, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableHead, TableRow } from '@/components/ui/table';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Checkbox } from '@/components/ui/form/checkbox';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import ViewLeadModal from './view-lead';
import PageTitle from '@/components/page-title';
import { DatePicker } from '@/components/ui/form/date-picker';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import dayjs from 'dayjs';
import { AlertCircle } from 'react-feather';
import { useFilters } from '@/hooks/use-filters';
import Tooltip from '@/components/ui/tooltip';

type LeadSuggestion = {
    id: number;
    name: string;
    company_name?: string;
};

type EmployeeSuggestion = {
    id: number;
    name: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

type User = {
    id: number;
    name: string;
    employee_id: string | null;
};

type LeadOption = {
    id: number;
    name: string;
    phone?: string | null;
};

type Lead = {
    id: number;
    name: string | null;
    phone: string | null;
    priority: string | null;
    interest_level: string | null;
    created_at: string;

    assigned_user: User | null;
    created_by: User | null;

    lead_source: {
        id: number;
        name: string;
    } | null;

    lead_stage: {
        id: number;
        name: string;
        color: string | null;
    } | null;
};

type LeadFilters = {
    lead?: LeadSuggestion | null;
    user?: EmployeeSuggestion | null;
    assignedStatus?: string;
    dates?: string;
};

type Props = {
    leads: PaginatedData<Lead>;
    numberOfLeads: number;
    filters: LeadFilters;
};

type LeadDetails = {
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
    project?: string | null;
    project_id?: string | null;

    stage?: string | null;
    stage_color?: string | null;
    source?: string | null;
    assigned_to?: string | null;
    profession?: string | null;
    designation_id?: string | null;
    priority?: string | null;
    interest_level?: string | null;
    estimated_budget?: number | string | null;

    last_contacted_at?: string | null;
    next_follow_up_at?: string | null;
    converted_at?: string | null;
    remarks?: string | null;
};

function titleCase(value: string | null | undefined) {
    if (!value) {
        return '—';
    }

    return value
        .replace(/_/g, ' ')
        .replace(
            /\w\S*/g,
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        );
}

async function searchLeads(
    query: string,
    signal?: AbortSignal,
): Promise<LeadSuggestion[]> {
    const response = await fetch(
        `/get-leads?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search departments.');
    }

    return response.json();
}

async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> {
    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search departments.');
    }

    return response.json();
}

export default function LeadAssign({
    leads,
    numberOfLeads,
    filters = {},
}: Props) {
    const initialFilters: LeadFilters = {
        lead: filters.lead ?? null,
        user: filters.user ?? null,
        dates: filters.dates ?? '',
        assignedStatus: filters.assignedStatus ?? '',
    };

    const {
        filters: filterValues,
        updateFilter,
        submit,
        buildQuery,
    } = useFilters(initialFilters, {
        url: '/lead/assigned',

        serializers: {
            lead: (lead) => lead?.id,
            user: (user) => user?.id,
        },
    });

    const [selectedLeadDetails, setSelectedLeadDetails] =
        useState<LeadDetails | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [assignUserId, setAssignUserId] = useState('');
    const [assignUserLabel, setAssignUserLabel] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [processing, setProcessing] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [unassignModalOpen, setUnassignModalOpen] = useState(false);

    const pageLeadIds = useMemo(
        () => leads.data.map((lead) => lead.id),
        [leads.data],
    );

    const allSelected =
        pageLeadIds.length > 0 &&
        pageLeadIds.every((id) => selectedIds.includes(id));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds((current) =>
                current.filter((id) => !pageLeadIds.includes(id)),
            );

            return;
        }

        setSelectedIds((current) =>
            Array.from(new Set([...current, ...pageLeadIds])),
        );
    };

    const toggleLead = (id: number) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            {
                ...buildQuery(),
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleBulkAssign = () => {
        if (!selectedIds.length || !assignUserId) {
            return;
        }

        setProcessing(true);

        router.post(
            '/leads/bulk-assign',
            {
                ids: selectedIds,
                user_id: Number(assignUserId),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setAssignUserId('');
                    setAssignUserLabel('');
                    setAssignModalOpen(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleBulkUnassign = () => {
        if (!selectedIds.length) {
            return;
        }

        setProcessing(true);

        router.post(
            '/leads/bulk-unassign',
            {
                ids: selectedIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setUnassignModalOpen(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const loadLeadDetails = async (leadId: number) => {
        setIsDetailsLoading(true);
        setShowDetailsModal(true);
        setSelectedLeadDetails(null);

        try {
            const response = await fetch(`/lead/${leadId}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Unable to load lead details.');
            }

            const data: LeadDetails = await response.json();

            setSelectedLeadDetails(data);
        } catch {
            setShowDetailsModal(false);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    return (
        <>
            <Head title="Lead Assign" />
            <PageTitle title="Lead Assign" />
            <Card>
                <CardHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }}
                        className="d-flex gap-2 flex-wrap justify-content-start align-items-center"
                    >
                        <div
                            className="position-relative"
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <SuggestionSearchInput<LeadSuggestion>
                                searchFn={searchLeads}
                                idKey="id"
                                labelKey="name"
                                placeholder="Search by name | phone | email"
                                showSearchIcon={false}
                                defaultSelectedItem={filterValues?.lead}
                                onSelect={(lead) => {
                                    updateFilter('lead', lead);
                                }}
                                onClear={() => {
                                    updateFilter('lead', null);
                                }}
                                clearOnFocus
                                renderOption={(lead) => {
                                    return (
                                        <>
                                            <div className="f-w-500">
                                                {lead.name}
                                            </div>

                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <Tooltip
                                                    title={
                                                        lead.company_name ||
                                                        'No company'
                                                    }
                                                    placement="right"
                                                    showOnlyIfTruncated
                                                >
                                                    <small
                                                        className="d-inline-block text-truncate"
                                                        style={{
                                                            maxWidth: '200px',
                                                        }}
                                                    >
                                                        {lead.company_name ||
                                                            'No company'}
                                                    </small>
                                                </Tooltip>
                                            </div>
                                        </>
                                    );
                                }}
                            />
                        </div>

                        <div
                            className="position-relative"
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <SuggestionSearchInput<EmployeeSuggestion>
                                searchFn={searchEmployees}
                                idKey="id"
                                labelKey="name"
                                placeholder="Search employee"
                                showSearchIcon={false}
                                defaultSelectedItem={filterValues?.user}
                                onSelect={(user) => {
                                    updateFilter('user', user);
                                }}
                                onClear={() => {
                                    updateFilter('user', null);
                                }}
                                clearOnFocus
                            />
                        </div>

                        <select
                            className="form-select"
                            value={filterValues?.assignedStatus}
                            onChange={(event) =>
                                updateFilter(
                                    'assignedStatus',
                                    event.target.value,
                                )
                            }
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <option value="">Select Assigned Status</option>
                            <option value="non_assigned">Non Assigned</option>
                            <option value="assigned">Assigned</option>
                        </select>

                        <div
                            style={{
                                flex: 1,
                                flexBasis: '100px',
                            }}
                        >
                            <DatePicker
                                id="required_date"
                                mode="range"
                                value={filterValues?.dates}
                                placeholder="Select dates"
                                disabled={processing}
                                onChange={(date) => {
                                    updateFilter('dates', date);
                                }}
                                rangeSeparator=" to "
                                showClearButton
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            style={{
                                flex: 1,
                                flexBasis: '50px',
                                maxWidth: '95px',
                            }}
                        >
                            Filter
                        </Button>

                        <div
                            className="d-flex justify-content-end align-items-center"
                            style={{
                                flex: 1,
                                flexBasis: '300px',
                            }}
                        >
                            <div
                                className="position-relative"
                                style={{
                                    flex: 1,
                                }}
                            >
                                <SuggestionSearchInput<EmployeeSuggestion>
                                    searchFn={searchEmployees}
                                    idKey="id"
                                    labelKey="name"
                                    placeholder="Assign to"
                                    showSearchIcon={false}
                                    onSelect={(option) => {
                                        setAssignUserId(String(option.id));
                                        setAssignUserLabel(option.name);
                                    }}
                                    onClear={() => {
                                        setAssignUserId('');
                                        setAssignUserLabel('');
                                    }}
                                    clearOnFocus
                                    classNames={{
                                        input: 'rounded-end-0',
                                    }}
                                />
                            </div>

                            <Button
                                type="button"
                                variant="success"
                                disabled={!selectedIds.length || !assignUserId}
                                onClick={() => setAssignModalOpen(true)}
                                className="m-0 px-2"
                                style={{
                                    borderRadius: 0,
                                    height: '38px',
                                }}
                            >
                                Assign
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                disabled={!selectedIds.length}
                                onClick={() => setUnassignModalOpen(true)}
                                className="m-0 px-2"
                                style={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    height: '38px',
                                }}
                            >
                                Unassign
                            </Button>
                        </div>
                    </form>
                </CardHeader>

                <CardBody>
                    <Table
                        wrapperClassName="overflow-auto"
                        wrapperStyle={{
                            maxHeight: 'calc(100vh - 250px)',
                        }}
                    >
                        <thead>
                            <TableRow>
                                <TableHead
                                    sticky
                                    style={{
                                        width: 52,
                                    }}
                                >
                                    <Checkbox
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        style={{
                                            marginTop: '4px',
                                        }}
                                    />
                                </TableHead>

                                <TableHead
                                    sticky
                                    style={{
                                        width: 70,
                                    }}
                                >
                                    Sl
                                </TableHead>

                                <TableHead sticky>Lead Date</TableHead>

                                <TableHead sticky>Assigned To</TableHead>

                                <TableHead sticky>Name</TableHead>

                                <TableHead sticky>Source</TableHead>

                                <TableHead sticky>Stage</TableHead>

                                <TableHead sticky>Priority</TableHead>

                                <TableHead sticky>Interest Level</TableHead>

                                <TableHead sticky>Created By</TableHead>
                            </TableRow>
                        </thead>

                        <TableBody>
                            {leads.data.length ? (
                                leads.data.map((lead, index) => (
                                    <TableRow key={lead.id}>
                                        <td className="">
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    lead.id,
                                                )}
                                                onChange={() =>
                                                    toggleLead(lead.id)
                                                }
                                            />
                                        </td>

                                        <td>{(leads.from || 1) + index}</td>

                                        <td>
                                            {dayjs(lead.created_at).format(
                                                'DD MMM, YYYY',
                                            )}
                                        </td>

                                        <td>
                                            <span className="fw-semibold">
                                                {lead?.assigned_user?.name}
                                            </span>
                                            <br />

                                            <small className="text-muted">
                                                {lead?.assigned_user
                                                    ?.employee_id || '—'}
                                            </small>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-ghost p-0 text-start text-dark"
                                                onClick={() =>
                                                    loadLeadDetails(lead.id)
                                                }
                                            >
                                                <span className="fw-semibold">
                                                    {lead.name}
                                                </span>
                                                <br />

                                                <small className="text-muted">
                                                    {lead.phone || '—'}
                                                </small>
                                            </button>
                                        </td>

                                        <td>{lead.lead_source?.name || '—'}</td>

                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor:
                                                        lead.lead_stage
                                                            ?.color ||
                                                        '#6c757d',
                                                }}
                                            >
                                                {lead.lead_stage?.name || '—'}
                                            </span>
                                        </td>

                                        <td>{titleCase(lead.priority)}</td>

                                        <td>
                                            {titleCase(lead.interest_level)}
                                        </td>

                                        <td>
                                            <div>
                                                {lead.created_by?.name || '—'}
                                            </div>

                                            {lead.created_by?.employee_id && (
                                                <small className="text-muted">
                                                    #
                                                    {
                                                        lead.created_by
                                                            .employee_id
                                                    }
                                                </small>
                                            )}
                                        </td>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <td
                                        colSpan={10}
                                        className="py-5 text-center text-muted"
                                    >
                                        No leads found.
                                    </td>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
                <CardFooter>
                    <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                        <TablePaginationInfo
                            to={leads?.to ?? 0}
                            total={leads?.total ?? 0}
                            from={leads?.from ?? 0}
                        />
                        <Pagination
                            currentPage={leads?.current_page}
                            lastPage={leads?.last_page}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </CardFooter>
            </Card>

            <ViewLeadModal
                open={showDetailsModal}
                onOpenChange={(open) => {
                    setShowDetailsModal(open);

                    if (!open) {
                        setSelectedLeadDetails(null);
                    }
                }}
                lead={selectedLeadDetails}
                loading={isDetailsLoading}
            />

            <ConfirmModal
                open={assignModalOpen}
                onOpenChange={setAssignModalOpen}
                onConfirm={handleBulkAssign}
                processing={processing}
                title="Assign selected leads?"
                description={`${selectedIds.length} selected lead${
                    selectedIds.length === 1 ? '' : 's'
                } will be assigned to ${assignUserLabel}.`}
                confirmText="Yes, Assign"
                processingText="Assigning..."
                confirmVariant="success"
                icon={
                    <AlertCircle
                        size={80}
                        strokeWidth={1}
                        className="text-warning"
                    />
                }
            />

            <ConfirmModal
                open={unassignModalOpen}
                onOpenChange={setUnassignModalOpen}
                onConfirm={handleBulkUnassign}
                processing={processing}
                title="Unassign selected leads?"
                description={`${selectedIds.length} selected lead${
                    selectedIds.length === 1 ? '' : 's'
                } will no longer be assigned to an employee.`}
                confirmText="Yes, Unassign"
                processingText="Unassigning..."
                confirmVariant="danger"
                icon={
                    <AlertCircle
                        size={80}
                        strokeWidth={1}
                        className="text-warning"
                    />
                }
            />
        </>
    );
}
