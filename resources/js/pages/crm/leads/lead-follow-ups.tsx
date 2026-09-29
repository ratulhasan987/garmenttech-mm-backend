import { type FormEvent, useState } from 'react';

import { router, Link, Head } from '@inertiajs/react';
import { Activity, Eye } from 'react-feather';
import dayjs from 'dayjs';

import PageTitle from '@/components/page-title';
import ViewLeadModal from './view-lead';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { TableEmpty } from '@/components/shared/table-empty';
import { useFilters } from '@/hooks/use-filters';
import { usePermission } from '@/hooks/use-permission';
import LeadFilter from '@/components/pages/lead/lead-filter';
import Tooltip from '@/components/ui/tooltip';

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

type LeadSuggestion = {
    id: number;
    name: string;
    lead_code: string;
    company_name?: string;
};

type EmployeeSuggestion = {
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

type Lead = {
    id: number;
    name: string | null;
    priority: string | null;
    interest_level: string | null;
    last_contacted_at: string | null;
    next_follow_up_at: string | null;
    created_at: string;

    assigned_user: User | null;

    lead_source: {
        id: number;
        name: string;
    } | null;

    lead_stage: LeadStage | null;
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

type SuggestionOption = {
    id: number;
    name: string;
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
    sort_at?: string;
    dates: string;
    priority: string;
    interest: string;
};

type Props = {
    leads: PaginatedData<Lead>;
    numberOfLeads: number;
    stages: LeadStage[];
    sources: LeadSource[];
    filters: LeadFilters;
};

const sortingOptions = [
    'today',
    'this_week',
    'next_week',
    'this_month',
    'next_month',
    'this_year',
    'next_year',
    'after_next_year',
];

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

function badgeClass(value: string | null | undefined) {
    return value ? value.toLowerCase().replace(/\s+/g, '_') : '';
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
        throw new Error('Failed to search leads.');
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
        throw new Error('Failed to search employees.');
    }

    return response.json();
}

const emptyFilters: LeadFilters = {
    lead: null,
    stage: '',
    source: '',
    sorting: '',
    sort_at: '',
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

export default function LeadFollowUps({
    leads,
    numberOfLeads,
    stages,
    sources,
    filters,
}: Props) {
    const { can } = usePermission();
    const canView = can('lead.view');
    const canConversation = can('lead.conversation');
    const hasActions = canView || canConversation;

    const initialFilters: LeadFilters = {
        lead: filters.lead ?? null,
        stage: filters.stage ?? '',
        source: filters.source ?? '',
        sorting: filters.sorting ?? '',
        sort_at: filters.sorting ?? '',
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
        url: '/lead/lead-follow-up',

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

    const [selectedLeadDetails, setSelectedLeadDetails] =
        useState<LeadDetails | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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

    const handleSortAtSelect = (value?: string | null) => {
        const query = buildQuery();

        if (value) {
            query.sort_at = value;
        } else {
            delete query.sort_at;
        }

        router.get(window.location.pathname, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Lead Follow-up" />

            <PageTitle title="Follow-Ups Leads" />

            <Card>
                <CardHeader>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div className="w-100 w-md-auto">
                            <SuggestionSearchInput<LeadSuggestion>
                                searchFn={searchLeads}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="lead_code"
                                placeholder="Quick Search..."
                                showSearchIcon
                                defaultSelectedItem={filters?.lead}
                                onSelect={(lead) => {
                                    handleLeadSelect(lead);
                                }}
                                onClear={() => {
                                    handleLeadSelect(null);
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
                                                            maxWidth: '220px',
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
                        <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
                            <select
                                className="form-select"
                                value={filterValues?.sort_at}
                                onChange={(event) => {
                                    handleSortAtSelect(
                                        event?.target?.value ?? '',
                                    );
                                    updateFilter(
                                        'sort_at',
                                        event?.target?.value ?? '',
                                    );
                                }}
                                style={{
                                    flex: 1,
                                    flexBasis: '200px',
                                }}
                            >
                                <option value="">Sort At</option>

                                {sortingOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {titleCase(option)}
                                    </option>
                                ))}
                            </select>
                            <LeadFilter
                                values={filterValues}
                                stages={stages ?? []}
                                sources={sources ?? []}
                                onChange={updateFilter}
                                onSubmit={submit}
                                onReset={reset}
                            />
                        </div>
                    </div>
                    {/* <form
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
                                secondaryLabelKey="lead_code"
                                placeholder="Search by name | phone | email"
                                showSearchIcon={false}
                                clearOnFocus
                                defaultSelectedItem={filterValues?.lead}
                                onSelect={(lead) => {
                                    updateFilter('lead', lead);
                                }}
                                onClear={() => {
                                    updateFilter('lead', null);
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
                                clearOnFocus
                                defaultSelectedItem={filterValues?.user}
                                onSelect={(employee) => {
                                    updateFilter('user', employee);
                                }}
                                onClear={() => {
                                    updateFilter('user', null);
                                }}
                            />
                        </div>

                        <select
                            className="form-select"
                            value={filterValues?.stage}
                            onChange={(event) =>
                                updateFilter('stage', event.target.value)
                            }
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <option value="">-- Stat By Stage --</option>

                            {stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {titleCase(stage.name)}
                                </option>
                            ))}
                        </select>

                        <select
                            className="form-select"
                            value={filterValues?.priority}
                            onChange={(event) =>
                                updateFilter('priority', event.target.value)
                            }
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <option value="">Priority Level</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <select
                            className="form-select"
                            value={filterValues?.interest}
                            onChange={(event) =>
                                updateFilter('interest', event.target.value)
                            }
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <option value="">Interest Level</option>
                            <option value="cold">Cold</option>
                            <option value="warm">Warm</option>
                            <option value="hot">Hot</option>
                        </select>

                        <select
                            className="form-select"
                            value={filterValues?.sorting}
                            onChange={(event) =>
                                updateFilter('sorting', event.target.value)
                            }
                            style={{
                                flex: 1,
                                flexBasis: '200px',
                            }}
                        >
                            <option value="">Sort By</option>

                            {sortingOptions.map((option) => (
                                <option key={option} value={option}>
                                    {titleCase(option)}
                                </option>
                            ))}
                        </select>

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
                    </form> */}
                </CardHeader>

                <CardBody>
                    <Table className="mb-0 text-center">
                        <thead>
                            <TableRow>
                                <TableHead sticky style={{ width: 55 }}>
                                    Sl
                                </TableHead>

                                <TableHead sticky>Lead Date</TableHead>

                                <TableHead sticky>Contacted By</TableHead>

                                <TableHead sticky>Name</TableHead>

                                <TableHead sticky>Source</TableHead>

                                <TableHead sticky>Stage</TableHead>

                                <TableHead sticky>Priority</TableHead>

                                <TableHead sticky>Interest Level</TableHead>

                                <TableHead sticky>Last Contacted</TableHead>

                                <TableHead sticky>Followup</TableHead>

                                <TableHead
                                    sticky
                                    className="text-end"
                                    style={{ width: 105 }}
                                >
                                    Action
                                </TableHead>
                            </TableRow>
                        </thead>

                        <TableBody>
                            {leads.data.length ? (
                                leads.data.map((lead, index) => (
                                    <TableRow key={lead.id}>
                                        <td>{(leads.from || 1) + index}</td>

                                        <td>
                                            <button
                                                type="button"
                                                title="Show Lead"
                                                onClick={() =>
                                                    loadLeadDetails(lead.id)
                                                }
                                                className="btn btn-ghost p-0 text-dark"
                                            >
                                                {dayjs(lead.created_at).format(
                                                    'DD MMM, YYYY',
                                                )}
                                            </button>
                                        </td>

                                        <td>
                                            {lead.assigned_user ? (
                                                <>
                                                    <div>
                                                        {
                                                            lead.assigned_user
                                                                .name
                                                        }
                                                    </div>

                                                    <small className="text-muted">
                                                        {
                                                            lead.assigned_user
                                                                .employee_id
                                                        }
                                                    </small>
                                                </>
                                            ) : (
                                                'Not Assigned'
                                            )}
                                        </td>

                                        <td>{titleCase(lead.name)}</td>

                                        <td>
                                            {titleCase(lead.lead_source?.name)}
                                        </td>

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

                                        <td>
                                            <span
                                                className={`status-badge ${badgeClass(
                                                    lead.priority,
                                                )}`}
                                            >
                                                {titleCase(lead.priority)}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${badgeClass(
                                                    lead.interest_level,
                                                )}`}
                                            >
                                                {titleCase(lead.interest_level)}
                                            </span>
                                        </td>

                                        <td>
                                            {lead.last_contacted_at
                                                ? dayjs(
                                                      lead.last_contacted_at,
                                                  ).format(
                                                      'MMMM D, YYYY h:mm A',
                                                  )
                                                : '—'}
                                        </td>

                                        <td>
                                            {lead.next_follow_up_at
                                                ? dayjs(
                                                      lead.next_follow_up_at,
                                                  ).format(
                                                      'MMMM D, YYYY h:mm A',
                                                  )
                                                : '—'}
                                        </td>

                                        {hasActions && (
                                            <TableCell>
                                                <ActionCell
                                                    id={lead.id}
                                                    onView={() =>
                                                        loadLeadDetails(lead.id)
                                                    }
                                                    permissions={{
                                                        canConversation,
                                                        canView,
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableEmpty colSpan={11} />
                            )}
                        </TableBody>
                    </Table>
                </CardBody>

                <CardFooter>
                    <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                        <TablePaginationInfo
                            from={leads.from ?? 0}
                            to={leads.to ?? 0}
                            total={numberOfLeads}
                        />

                        <Pagination
                            currentPage={leads.current_page}
                            lastPage={leads.last_page}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </CardFooter>
            </Card>

            <ViewLeadModal
                open={showDetailsModal}
                loading={isDetailsLoading}
                lead={selectedLeadDetails}
                onOpenChange={(open) => {
                    setShowDetailsModal(open);

                    if (!open) {
                        setSelectedLeadDetails(null);
                    }
                }}
            />
        </>
    );
}

type ActionCellProps = {
    id: number;
    permissions: {
        canConversation: boolean;
        canView: boolean;
    };
    onView: () => void;
};

function ActionCell({ id, permissions, onView }: ActionCellProps) {
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
        </ul>
    );
}
