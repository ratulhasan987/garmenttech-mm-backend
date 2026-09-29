import { FormEvent, useEffect, useMemo, useState, useRef } from 'react';

import { Head, Link, router } from '@inertiajs/react';
import { Activity, Edit, Eye, Search, Trash2, X } from 'lucide-react';

import { usePermission } from '@/hooks/use-permission';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Trash } from 'react-feather';
import dayjs from 'dayjs';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import ViewLeadModal from './view-lead';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import { FormField } from '@/components/ui/form/form-field';
import { Select } from '@/components/ui/form/select';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { useFilters } from '@/hooks/use-filters';
import LeadFilter from '@/components/pages/lead/lead-filter';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/tooltip';
type User = {
    id: number;
    name: string;
    employee_id?: string | null;
};

type LeadStage = {
    id: number;
    name: string;
    color?: string | null;
    order?: number;
};

type LeadSource = {
    id: number;
    name: string;
};

type Profession = {
    id: number;
    name: string;
};

type Lead = {
    id: number;
    lead_code: string;
    name: string;
    company_name?: string;
    phone?: string | null;
    created_at: string;

    stage_id?: number | null;
    stage?: LeadStage | null;
    profession?: Profession | null;

    assigned_user?: User | null;
    created_by?: User | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedLeads = {
    data: Lead[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
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

type LeadSuggestion = {
    id: number;
    name: string;
    lead_code: string;
    company_name?: string;
};

type SuggestionOption = {
    id: number;
    name: string;
};

type EmployeeSuggestion = {
    id: number;
    name: string;
    employee_id?: string | null;
};

type LeadFilters = {
    sector: SuggestionOption | null;
    area: SuggestionOption | null;
    source: string | null;
    stage: string | null;
    profession: SuggestionOption | null;
    designation: SuggestionOption | null;
    lead: LeadSuggestion | null;
    user: EmployeeSuggestion | null;
    product: SuggestionOption | null;
    sorting: 'asc' | 'desc' | '';
    dates: string;
    priority: string;
    interest: string;
};

type PageProps = {
    leads: PaginatedLeads;
    numberOfLeads: number;
    stages: LeadStage[];
    sources: LeadSource[];
    filters?: Partial<LeadFilters>;
};

const emptyValue = (value?: string | number | null) =>
    value === null || value === undefined || value === '' ? '—' : value;

const titleCase = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

async function searchLead(
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

const emptyFilters: LeadFilters = {
    lead: null,
    stage: '',
    source: '',
    sorting: '',
    dates: '',
    priority: '',
    interest: '',
    sector: null,
    area: null,
    designation: null,
    profession: null,
    product: null,
    user: null,
};

export default function Index({
    leads,
    numberOfLeads,
    stages,
    sources,
    filters = {},
}: PageProps) {
    const initialFilters: LeadFilters = {
        lead: filters.lead ?? null,
        stage: filters.stage ?? '',
        source: filters.source ?? '',
        sorting: filters.sorting ?? '',
        dates: filters.dates ?? '',
        interest: filters.interest ?? '',
        priority: filters.priority ?? '',
        sector: filters?.sector ?? null,
        area: filters?.area ?? null,
        designation: filters?.designation ?? null,
        profession: filters?.profession ?? null,
        product: filters?.product ?? null,
        user: filters?.user ?? null,
    };

    const {
        filters: filterValues,
        updateFilter,
        submit,
        reset,
        buildQuery,
    } = useFilters(initialFilters, {
        url: '/lead',

        resetValues: emptyFilters,

        serializers: {
            lead: (lead) => lead?.id,
            sector: (sector) => sector?.id,
            area: (area) => area?.id,
            profession: (profession) => profession?.id,
            designation: (designation) => designation?.id,
            user: (user) => user?.id,
            product: (product) => product?.id,
        },
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const { can } = usePermission();

    const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const canView = can('lead.view');
    const canEdit = can('lead.edit');
    const canDelete = can('lead.delete');
    const canConversation = can('lead.conversation');

    const hasActions = canView || canEdit || canDelete || canConversation;

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            { ...buildQuery(), page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const loadLeadDetails = async (leadId: number) => {
        setIsDetailsLoading(true);
        setShowDetailsModal(true);
        setSelectedLead(null);

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

            setSelectedLead(data);
        } catch {
            setShowDetailsModal(false);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleDelete = (lead: Lead) => {
        setLeadToDelete(lead);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!leadToDelete) {
            return;
        }

        router.delete(`/lead/${leadToDelete.id}`, {
            preserveScroll: true,

            onStart: () => {
                setDeleting(true);
            },

            onFinish: () => {
                setDeleting(false);
            },

            onSuccess: () => {
                setDeleteModalOpen(false);
                setLeadToDelete(null);
            },
        });
    };

    const handleExportExcel = async () => {
        const csrfToken = document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
        )?.content;

        const response = await fetch('/lead/export-excel', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ...(csrfToken
                    ? {
                          'X-CSRF-TOKEN': csrfToken,
                      }
                    : {}),
            },
        });

        if (!response.ok) {
            throw new Error('Unable to export leads.');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'leads.xlsx';

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(downloadUrl);
    };

    const handleLeadSelect = (lead: LeadSuggestion | null) => {
        router.get(
            window.location.pathname,
            lead
                ? {
                      lead: lead.id,
                  }
                : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="All Leads" />

            <PageTitle title="Leads" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                        {can('lead.export') && (
                            <Button type="button" onClick={handleExportExcel}>
                                Export
                            </Button>
                        )}

                        <div className="d-flex align-items-center gap-2">
                            <div>
                                <SuggestionSearchInput<LeadSuggestion>
                                    searchFn={searchLead}
                                    idKey="id"
                                    labelKey="name"
                                    placeholder="Quick Search..."
                                    showSearchIcon
                                    defaultSelectedItem={filters?.lead}
                                    onSelect={(lead) => {
                                        handleLeadSelect(lead);
                                    }}
                                    onClear={() => {
                                        handleLeadSelect(null);
                                    }}

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
                                                        placement="left"
                                                        showOnlyIfTruncated
                                                    >
                                                        <small
                                                            className="d-inline-block text-truncate"
                                                            style={{
                                                                maxWidth:
                                                                    '220px',
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
                                    clearOnFocus
                                />
                            </div>

                            <LeadFilter
                                values={filterValues}
                                stages={stages}
                                sources={sources}
                                onChange={updateFilter}
                                onSubmit={submit}
                                onReset={reset}
                            />
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{
                                maxHeight: 'calc(100vh - 340px)',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky style={{ width: 20 }}>
                                        Sl
                                    </TableHead>
                                    <TableHead sticky>Date</TableHead>
                                    <TableHead sticky>Name</TableHead>
                                    <TableHead sticky>Phone</TableHead>
                                    <TableHead sticky>Profession</TableHead>
                                    <TableHead sticky>Stage</TableHead>
                                    <TableHead sticky>Assigned To</TableHead>
                                    <TableHead sticky>Created By</TableHead>

                                    {hasActions && (
                                        <TableHead
                                            sticky
                                            style={{ width: 100 }}
                                        >
                                            Action
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.data.length > 0 ? (
                                    leads.data.map((lead, index) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                {(leads.from ?? 1) + index}
                                            </TableCell>

                                            <TableCell>
                                                <span>
                                                    {dayjs(
                                                        lead.created_at,
                                                    ).format('DD MMM YYYY')}
                                                </span>

                                                <br />

                                                <span>#{lead.lead_code}</span>
                                            </TableCell>

                                            <TableCell>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost p-0 text-start text-dark fw-semibold"
                                                    title="Show lead details"
                                                    onClick={() =>
                                                        loadLeadDetails(lead.id)
                                                    }
                                                >
                                                    <span>{lead.name}</span>
                                                    {lead?.company_name && (
                                                        <span className="d-block text-muted small">
                                                            {lead?.company_name}
                                                        </span>
                                                    )}
                                                </button>
                                            </TableCell>

                                            <TableCell>
                                                {emptyValue(lead.phone)}
                                            </TableCell>

                                            <TableCell>
                                                {emptyValue(
                                                    lead.profession?.name,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor:
                                                            lead.stage?.color ??
                                                            '#6c757d',
                                                        fontSize: '12px',
                                                    }}
                                                >
                                                    {titleCase(
                                                        lead.stage?.name,
                                                    )}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                {lead.assigned_user ? (
                                                    <>
                                                        {
                                                            lead.assigned_user
                                                                .name
                                                        }

                                                        <br />

                                                        <small>
                                                            #
                                                            {
                                                                lead
                                                                    .assigned_user
                                                                    .employee_id
                                                            }
                                                        </small>
                                                    </>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {lead.created_by?.name ?? '—'}

                                                {lead.created_by
                                                    ?.employee_id && (
                                                    <>
                                                        <br />

                                                        <small>
                                                            #
                                                            {
                                                                lead.created_by
                                                                    .employee_id
                                                            }
                                                        </small>
                                                    </>
                                                )}
                                            </TableCell>

                                            {hasActions && (
                                                <TableCell>
                                                    <ActionCell
                                                        id={lead.id}
                                                        onView={() =>
                                                            loadLeadDetails(
                                                                lead.id,
                                                            )
                                                        }
                                                        onDelete={() =>
                                                            handleDelete(lead)
                                                        }
                                                        permissions={{
                                                            canConversation,
                                                            canView,
                                                            canEdit,
                                                            canDelete,
                                                        }}
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={hasActions ? 9 : 8}
                                            className="text-center py-5"
                                        >
                                            No leads found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                to={leads?.to ?? 0}
                                total={leads?.total}
                                from={leads?.from ?? 0}
                            />
                            <Pagination
                                currentPage={leads.current_page}
                                lastPage={leads.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <ViewLeadModal
                open={showDetailsModal}
                onOpenChange={(open) => {
                    setShowDetailsModal(open);

                    if (!open) {
                        setSelectedLead(null);
                    }
                }}
                lead={selectedLead}
                loading={isDetailsLoading}
            />

            {/* Delete */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setLeadToDelete(null);
                    }
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}

type ActionCellProps = {
    id: number;
    permissions: {
        canConversation: boolean;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
    };
    onDelete: () => void;
    onView: () => void;
};

function ActionCell({ id, permissions, onView, onDelete }: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            {permissions.canConversation && (
                <li>
                    <Link
                        href={`/lead-conversation/${id}`}
                        className="btn btn-link p-0 border-0"
                    >
                        <Activity size={24} />
                    </Link>
                </li>
            )}

            {permissions.canView && (
                <li>
                    <button
                        type="button"
                        className="btn btn-link p-0 border-0"
                        onClick={onView}
                    >
                        <Eye size={24} />
                    </button>
                </li>
            )}

            {permissions.canEdit && (
                <li>
                    <Link
                        href={`/lead/${id}/edit`}
                        className="btn btn-link text-primary p-0 border-0"
                    >
                        <Edit size={24} />
                    </Link>
                </li>
            )}

            {permissions.canDelete && (
                <li>
                    <button
                        type="button"
                        className="btn text-danger btn-link p-0 border-0"
                        onClick={onDelete}
                    >
                        <Trash size={24} />
                    </button>
                </li>
            )}
        </ul>
    );
}
