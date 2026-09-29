import { useCallback, useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Filter, Plus, Trash, X } from 'react-feather';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/form/date-picker';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { searchCustomers } from '@/lib/sales';
import type {
    Customer,
    CustomerIndexProps,
    CustomerSuggestion,
} from '@/types/sales';
import ViewCustomerModal from './view-modal';

const CUSTOMERS_URL = '/operations/sales/customers';

type Suggestion = {
    id: number;
    name: string;
};

type CustomerData = {
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

type ServerFilters = {
    customer_id?: number | null;
    profession_id?: number | null;
    lead_designation_id?: number | null;
    area_id?: number | null;
    sector_id?: number | null;
    company_name?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    sort?: string | null;
};

type FilterForm = {
    profession_id: string;
    lead_designation_id: string;
    area_id: string;
    sector_id: string;
    company_name: string;
    date_from: string;
    date_to: string;
    sort: string;
};

type FilterSelections = {
    profession: Suggestion | null;
    designation: Suggestion | null;
    area: Suggestion | null;
    sector: Suggestion | null;
};

type CustomerPageProps = Omit<CustomerIndexProps, 'filters'> & {
    filters: ServerFilters;
    filterSelections: FilterSelections;
};

const emptyFilters: FilterForm = {
    profession_id: '',
    lead_designation_id: '',
    area_id: '',
    sector_id: '',
    company_name: '',
    date_from: '',
    date_to: '',
    sort: 'latest',
};

function fromServer(filters: ServerFilters): FilterForm {
    return {
        profession_id: String(filters.profession_id ?? ''),
        lead_designation_id: String(filters.lead_designation_id ?? ''),
        area_id: String(filters.area_id ?? ''),
        sector_id: String(filters.sector_id ?? ''),
        company_name: filters.company_name ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        sort: filters.sort ?? 'latest',
    };
}

function buildQuery(
    filters: ServerFilters | FilterForm,
    customerId?: number | null,
): Record<string, string | number> {
    const query: Record<string, string | number> = {};
    const id =
        customerId === undefined && 'customer_id' in filters
            ? filters.customer_id
            : customerId;

    if (id != null) {
        query.customer_id = id;
    }

    const keys = [
        'profession_id',
        'lead_designation_id',
        'area_id',
        'sector_id',
        'company_name',
        'date_from',
        'date_to',
        'sort',
    ] as const;

    for (const key of keys) {
        const value = filters[key];
        if (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            !(key === 'sort' && value === 'latest')
        ) {
            query[key] = value;
        }
    }

    return query;
}

async function searchSuggestions(
    endpoint: string,
    keyword: string,
): Promise<Suggestion[]> {
    try {
        const response = await fetch(
            `${endpoint}?keyword=${encodeURIComponent(keyword)}`,
            {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            },
        );

        if (!response.ok) return [];

        const result: unknown = await response.json();
        if (Array.isArray(result)) return result as Suggestion[];

        if (result && typeof result === 'object') {
            const payload = result as {
                data?: unknown;
                results?: unknown;
            };
            if (Array.isArray(payload.data)) {
                return payload.data as Suggestion[];
            }
            if (Array.isArray(payload.results)) {
                return payload.results as Suggestion[];
            }
        }
    } catch {
        // Search suggestions must not crash the customer index page.
    }

    return [];
}

export default function CustomerIndexPage({
    data,
    filters,
    selectedCustomer,
    filterSelections,
}: CustomerPageProps) {
    const [viewCustomer, setViewCustomer] = useState<CustomerData | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Follow the existing Riho header theme switch; do not create a second toggle.
    useEffect(() => {
        const syncHeaderTheme = () => {
            setDarkMode(document.body.classList.contains('dark-only'));
        };

        syncHeaderTheme();

        const themeObserver = new MutationObserver(syncHeaderTheme);
        themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => themeObserver.disconnect();
    }, []);
    const [filterResetKey, setFilterResetKey] = useState(0);
    const [draft, setDraft] = useState<FilterForm>(() => fromServer(filters));

    const [selectedProfession, setSelectedProfession] =
        useState<Suggestion | null>(filterSelections.profession);
    const [selectedDesignation, setSelectedDesignation] =
        useState<Suggestion | null>(filterSelections.designation);
    const [selectedArea, setSelectedArea] = useState<Suggestion | null>(
        filterSelections.area,
    );
    const [selectedSector, setSelectedSector] = useState<Suggestion | null>(
        filterSelections.sector,
    );

    // Resync the form and the suggestion labels after Inertia navigation.
    useEffect(() => {
        setDraft(fromServer(filters));
        setSelectedProfession(filterSelections.profession);
        setSelectedDesignation(filterSelections.designation);
        setSelectedArea(filterSelections.area);
        setSelectedSector(filterSelections.sector);
    }, [
        filters.customer_id,
        filters.profession_id,
        filters.lead_designation_id,
        filters.area_id,
        filters.sector_id,
        filters.company_name,
        filters.date_from,
        filters.date_to,
        filters.sort,
    ]);

    // These are the same suggestion endpoints used by your Create Customer form.
    const searchProfessions = useCallback(
        (keyword: string) =>
            searchSuggestions('/get-lead-professions', keyword),
        [],
    );
    const searchDesignations = useCallback(
        (keyword: string) =>
            searchSuggestions('/get-lead-designations', keyword),
        [],
    );
    const searchAreas = useCallback(
        (keyword: string) => searchSuggestions('/get-lead-area', keyword),
        [],
    );
    const searchSectors = useCallback(
        (keyword: string) => searchSuggestions('/get-lead-sectors', keyword),
        [],
    );

    const filterCount =
        [
            filters.customer_id,
            filters.profession_id,
            filters.lead_designation_id,
            filters.area_id,
            filters.sector_id,
            filters.company_name,
            filters.date_from,
            filters.date_to,
        ].filter(
            (value) => value !== null && value !== undefined && value !== '',
        ).length + (filters.sort && filters.sort !== 'latest' ? 1 : 0);

    const visit = (query: Record<string, string | number>) => {
        router.get(CUSTOMERS_URL, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const setFilter = (key: keyof FilterForm, value: string) => {
        setDraft((current) => ({ ...current, [key]: value }));
    };

    const handleCustomerSelect = (customer: CustomerSuggestion) => {
        visit(buildQuery(filters, customer.id));
    };

    const handleCustomerClear = () => {
        visit(buildQuery(filters, null));
    };

    const resetDraftToAppliedFilters = () => {
        setDraft(fromServer(filters));
        setSelectedProfession(filterSelections.profession);
        setSelectedDesignation(filterSelections.designation);
        setSelectedArea(filterSelections.area);
        setSelectedSector(filterSelections.sector);
        setFilterResetKey((current) => current + 1);
    };

    const openFilterModal = () => {
        resetDraftToAppliedFilters();
        setShowFilters(true);
    };

    const closeFilterModal = () => {
        resetDraftToAppliedFilters();
        setShowFilters(false);
    };

    // SuggestionSearchInput and Flatpickr can render their dropdowns outside
    // the popover. A document-level outside-click handler would mistake
    // selecting an option for a request to close the filters.
    // Keep filters open while editing; close only on Apply, Reset, X or Escape.
    useEffect(() => {
        if (!showFilters) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeFilterModal();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showFilters]);

    const applyFilters = () => {
        if (
            draft.date_from &&
            draft.date_to &&
            draft.date_to < draft.date_from
        ) {
            return;
        }

        setShowFilters(false);
        visit(buildQuery(draft, filters.customer_id));
    };

    const clearAllFilters = () => {
        setDraft({ ...emptyFilters });
        setSelectedProfession(null);
        setSelectedDesignation(null);
        setSelectedArea(null);
        setSelectedSector(null);
        setFilterResetKey((current) => current + 1);
        setShowFilters(false);
        visit({});
    };

    const handlePageChange = (page: number) => {
        visit({ ...buildQuery(filters), page });
    };

    const confirmDelete = () => {
        if (!deleteCustomer) return;

        router.delete(`${CUSTOMERS_URL}/${deleteCustomer.id}`, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeleteCustomer(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const loadCustomerDetails = async (customerId: number) => {
        setIsDetailsLoading(true);
        setShowDetailsModal(true);
        setViewCustomer(null);

        try {
            const response = await fetch(`${CUSTOMERS_URL}/${customerId}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (!response.ok)
                throw new Error('Unable to load customer details.');
            setViewCustomer((await response.json()) as CustomerData);
        } catch {
            setShowDetailsModal(false);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const invalidDateRange = Boolean(
        draft.date_from && draft.date_to && draft.date_to < draft.date_from,
    );

    return (
        <>
            <Head title="All Customers" />

            <PageTitle title="Customers" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">
                            <Link
                                href={`${CUSTOMERS_URL}/create`}
                                className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 align-self-start"
                            >
                                <Plus size={17} />
                                Create Customer
                            </Link>

                            <div
                                className="d-flex flex-column flex-sm-row align-items-stretch gap-2 w-100"
                                style={{ maxWidth: 560 }}
                            >
                                <div
                                    className="flex-grow-1"
                                    style={{ minWidth: 0 }}
                                >
                                    <SuggestionSearchInput<CustomerSuggestion>
                                        key={`customer-${filters.customer_id ?? 'all'}-${filterResetKey}`}
                                        searchFn={searchCustomers}
                                        idKey="id"
                                        labelKey="label"
                                        placeholder="Search customer name, code or phone..."
                                        showSearchIcon
                                        clearOnFocus={false}
                                        defaultSelectedItem={selectedCustomer}
                                        debounceMs={300}
                                        loadingLabel="Searching customers..."
                                        emptyLabel="No customers found."
                                        onSelect={handleCustomerSelect}
                                        onClear={handleCustomerClear}
                                        renderOption={(customer) => (
                                            <div className="w-100">
                                                <div className="f-w-500">
                                                    {customer.label}
                                                </div>
                                                {(customer.company_name ||
                                                    customer.phone) && (
                                                    <small className="f-light d-block mt-1">
                                                        {customer.company_name}
                                                        {customer.company_name &&
                                                        customer.phone
                                                            ? ' • '
                                                            : ''}
                                                        {customer.phone}
                                                    </small>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="customer-filter-anchor">
                                    <button
                                        type="button"
                                        className={`btn d-inline-flex align-items-center justify-content-center gap-2 ${
                                            showFilters || filterCount > 0
                                                ? 'btn-primary'
                                                : 'btn-outline-primary'
                                        }`}
                                        aria-expanded={showFilters}
                                        aria-controls="customer-advanced-filters"
                                        aria-haspopup="dialog"
                                        onClick={openFilterModal}
                                    >
                                        <Filter size={16} />
                                        Filters
                                        {filterCount > 0 && (
                                            <span
                                                className={`badge bg-light text-dark ${darkMode ? 'text-white' : 'text-black'} rounded-pill`}
                                            >
                                                {filterCount}
                                            </span>
                                        )}
                                    </button>
                                    {showFilters && (
                                        <div
                                            className={`customer-filter-popover ${darkMode ? 'customer-filter-dark' : 'customer-filter-light'}`}
                                            role="dialog"
                                            aria-modal="false"
                                            aria-labelledby="customer-filter-title"
                                        >
                                            <form
                                                id="customer-advanced-filters"
                                                onSubmit={(event) =>
                                                    event.preventDefault()
                                                }
                                            >
                                                <div className="customer-filter-heading border-bottom px-3 py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="customer-filter-header-icon">
                                                            <Filter size={17} />
                                                        </span>
                                                        <div>
                                                            <h5
                                                                id="customer-filter-title"
                                                                className="modal-title fw-semibold mb-0"
                                                            >
                                                                Filter Customers
                                                            </h5>
                                                            <small className="text-muted">
                                                                Refine your
                                                                customer list
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        aria-label="Close filters"
                                                        onClick={
                                                            closeFilterModal
                                                        }
                                                    />
                                                </div>

                                                <div className="customer-filter-body px-3 py-3">
                                                    <div className="row g-2 g-sm-3">
                                                        <div className="col-12 col-sm-6">
                                                            <SuggestionSearchInput<Suggestion>
                                                                key={`profession-${filters.profession_id ?? 'all'}-${filterResetKey}`}
                                                                searchFn={
                                                                    searchProfessions
                                                                }
                                                                idKey="id"
                                                                labelKey="name"
                                                                placeholder="Search profession..."
                                                                showSearchIcon={
                                                                    false
                                                                }
                                                                clearOnFocus={
                                                                    false
                                                                }
                                                                defaultSelectedItem={
                                                                    selectedProfession
                                                                }
                                                                onSelect={(
                                                                    item,
                                                                ) => {
                                                                    setSelectedProfession(
                                                                        item,
                                                                    );
                                                                    setFilter(
                                                                        'profession_id',
                                                                        String(
                                                                            item.id,
                                                                        ),
                                                                    );
                                                                }}
                                                                onClear={() => {
                                                                    setSelectedProfession(
                                                                        null,
                                                                    );
                                                                    setFilter(
                                                                        'profession_id',
                                                                        '',
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <SuggestionSearchInput<Suggestion>
                                                                key={`designation-${filters.lead_designation_id ?? 'all'}-${filterResetKey}`}
                                                                searchFn={
                                                                    searchDesignations
                                                                }
                                                                idKey="id"
                                                                labelKey="name"
                                                                placeholder="Search designation..."
                                                                showSearchIcon={
                                                                    false
                                                                }
                                                                clearOnFocus={
                                                                    false
                                                                }
                                                                defaultSelectedItem={
                                                                    selectedDesignation
                                                                }
                                                                onSelect={(
                                                                    item,
                                                                ) => {
                                                                    setSelectedDesignation(
                                                                        item,
                                                                    );
                                                                    setFilter(
                                                                        'lead_designation_id',
                                                                        String(
                                                                            item.id,
                                                                        ),
                                                                    );
                                                                }}
                                                                onClear={() => {
                                                                    setSelectedDesignation(
                                                                        null,
                                                                    );
                                                                    setFilter(
                                                                        'lead_designation_id',
                                                                        '',
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <SuggestionSearchInput<Suggestion>
                                                                key={`area-${filters.area_id ?? 'all'}-${filterResetKey}`}
                                                                searchFn={
                                                                    searchAreas
                                                                }
                                                                idKey="id"
                                                                labelKey="name"
                                                                placeholder="Search area..."
                                                                showSearchIcon={
                                                                    false
                                                                }
                                                                clearOnFocus={
                                                                    false
                                                                }
                                                                defaultSelectedItem={
                                                                    selectedArea
                                                                }
                                                                onSelect={(
                                                                    item,
                                                                ) => {
                                                                    setSelectedArea(
                                                                        item,
                                                                    );
                                                                    setFilter(
                                                                        'area_id',
                                                                        String(
                                                                            item.id,
                                                                        ),
                                                                    );
                                                                }}
                                                                onClear={() => {
                                                                    setSelectedArea(
                                                                        null,
                                                                    );
                                                                    setFilter(
                                                                        'area_id',
                                                                        '',
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <SuggestionSearchInput<Suggestion>
                                                                key={`sector-${filters.sector_id ?? 'all'}-${filterResetKey}`}
                                                                searchFn={
                                                                    searchSectors
                                                                }
                                                                idKey="id"
                                                                labelKey="name"
                                                                placeholder="Search sector..."
                                                                showSearchIcon={
                                                                    false
                                                                }
                                                                clearOnFocus={
                                                                    false
                                                                }
                                                                defaultSelectedItem={
                                                                    selectedSector
                                                                }
                                                                onSelect={(
                                                                    item,
                                                                ) => {
                                                                    setSelectedSector(
                                                                        item,
                                                                    );
                                                                    setFilter(
                                                                        'sector_id',
                                                                        String(
                                                                            item.id,
                                                                        ),
                                                                    );
                                                                }}
                                                                onClear={() => {
                                                                    setSelectedSector(
                                                                        null,
                                                                    );
                                                                    setFilter(
                                                                        'sector_id',
                                                                        '',
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <input
                                                                id="customer-company-filter"
                                                                aria-label="Company name"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Search company..."
                                                                maxLength={100}
                                                                value={
                                                                    draft.company_name
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setFilter(
                                                                        'company_name',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <DatePicker
                                                                id="customer-date-from"
                                                                mode="single"
                                                                value={
                                                                    draft.date_from
                                                                }
                                                                placeholder="Select start date"
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setFilter(
                                                                        'date_from',
                                                                        value,
                                                                    )
                                                                }
                                                                dateFormat="Y-m-d"
                                                                displayFormat="Y-m-d"
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <DatePicker
                                                                id="customer-date-to"
                                                                mode="single"
                                                                value={
                                                                    draft.date_to
                                                                }
                                                                minDate={
                                                                    draft.date_from ||
                                                                    undefined
                                                                }
                                                                placeholder="Select end date"
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    setFilter(
                                                                        'date_to',
                                                                        value,
                                                                    )
                                                                }
                                                                dateFormat="Y-m-d"
                                                                displayFormat="Y-m-d"
                                                            />
                                                        </div>

                                                        <div className="col-12 col-sm-6">
                                                            <select
                                                                id="customer-sort-filter"
                                                                aria-label="Sort customers"
                                                                className="form-select"
                                                                value={
                                                                    draft.sort
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setFilter(
                                                                        'sort',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="latest">
                                                                    Newest First
                                                                </option>
                                                                <option value="oldest">
                                                                    Oldest First
                                                                </option>
                                                                <option value="name_asc">
                                                                    Name A–Z
                                                                </option>
                                                                <option value="name_desc">
                                                                    Name Z–A
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {invalidDateRange && (
                                                        <p
                                                            className="text-danger small mt-2 mb-0"
                                                            role="alert"
                                                        >
                                                            Created To cannot be
                                                            earlier than Created
                                                            From.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="customer-filter-footer border-top px-3 py-3">
                                                    <div className="row g-2 w-100 m-0">
                                                        <div className="col-6 ps-0">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger w-100"
                                                                onClick={
                                                                    clearAllFilters
                                                                }
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                        <div className="col-6 pe-0">
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary w-100"
                                                                disabled={
                                                                    invalidDateRange
                                                                }
                                                                onClick={
                                                                    applyFilters
                                                                }
                                                            >
                                                                Apply Filters
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>Sl</TableHead>
                                    <TableHead sticky>Customer</TableHead>
                                    <TableHead sticky>Company</TableHead>
                                    <TableHead sticky>Phone</TableHead>
                                    <TableHead sticky>Email</TableHead>
                                    <TableHead sticky>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((customer, index) => (
                                        <TableRow key={customer.id}>
                                            <TableCell>
                                                {(data.current_page - 1) *
                                                    data.per_page +
                                                    index +
                                                    1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center gap-2">
                                                    {customer.image ? (
                                                        <img
                                                            src={`/storage/${customer.image}`}
                                                            alt={customer.name}
                                                            className="rounded-circle border"
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                objectFit:
                                                                    'cover',
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="rounded-circle border bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                            }}
                                                        >
                                                            <span className="f-w-500">
                                                                {customer.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="f-w-500">
                                                            {customer.name}
                                                        </div>
                                                        {customer.client_no && (
                                                            <small className="text-muted d-block">
                                                                {
                                                                    customer.client_no
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {customer.company_name ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {customer.phone ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {customer.email ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex align-items-center gap-2">
                                                    <button
                                                        type="button"
                                                        title="View Customer"
                                                        aria-label={`View ${customer.name}`}
                                                        className="btn btn-link p-0 border-0"
                                                        onClick={() =>
                                                            void loadCustomerDetails(
                                                                customer.id,
                                                            )
                                                        }
                                                    >
                                                        <Eye size={24} />
                                                    </button>
                                                    <Link
                                                        title="Edit Customer"
                                                        aria-label={`Edit ${customer.name}`}
                                                        className="btn btn-link p-0 border-0"
                                                        href={`${CUSTOMERS_URL}/${customer.id}/edit`}
                                                    >
                                                        <Edit size={20} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        title="Delete Customer"
                                                        aria-label={`Delete ${customer.name}`}
                                                        className="btn btn-link text-danger p-0 border-0"
                                                        disabled={deleting}
                                                        onClick={() => {
                                                            setDeleteCustomer(
                                                                customer,
                                                            );
                                                            setDeleteModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={6} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <TablePaginationInfo
                                from={data.from ?? 0}
                                to={data.to ?? 0}
                                total={data.total}
                            />
                            <Pagination
                                currentPage={data.current_page}
                                lastPage={data.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <style>{`
                /* Header-controlled theme: React follows body.dark-only. */
                .customer-filter-anchor {
                    position: relative;
                    flex-shrink: 0;
                    z-index: 20;
                }
                .customer-filter-popover {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    width: 530px;
                    max-width: calc(100vw - 28px);
                    z-index: 1080;
                    background: var(--customer-filter-bg) !important;
                    color: var(--customer-filter-text) !important;
                    border: 1px solid var(--customer-filter-border);
                    border-radius: 12px;
                    box-shadow: var(--customer-filter-shadow);
                    overflow: visible;
                }
                .customer-filter-popover.customer-filter-light {
                    --customer-filter-bg: #ffffff;
                    --customer-filter-input-bg: #ffffff;
                    --customer-filter-border: #dce4ec;
                    --customer-filter-text: #253044;
                    --customer-filter-muted: #687789;
                    --customer-filter-placeholder: #8793a2;
                    --customer-filter-hover: #eff7f7;
                    --customer-filter-icon-bg: #e6f3f3;
                    --customer-filter-focus: rgba(0, 102, 102, .16);
                    --customer-filter-shadow: 0 16px 46px rgba(0, 0, 0, .16);
                    --bs-body-bg: #ffffff;
                    --bs-border-color: var(--customer-filter-border);
                    --bs-body-color: var(--customer-filter-text);
                    --bs-secondary-color: var(--customer-filter-muted);
                    color-scheme: light;
                }
                .customer-filter-popover.customer-filter-dark {
                    --customer-filter-bg: #26282e;
                    --customer-filter-input-bg: #22242a;
                    --customer-filter-border: #41464f;
                    --customer-filter-text: #f1f3f6;
                    --customer-filter-muted: #b5bdc9;
                    --customer-filter-placeholder: #a0aab7;
                    --customer-filter-hover: #343b45;
                    --customer-filter-icon-bg: rgba(0, 145, 145, .18);
                    --customer-filter-focus: rgba(0, 153, 153, .2);
                    --customer-filter-shadow: 0 20px 54px rgba(0, 0, 0, .38);
                    --bs-body-bg: #26282e;
                    --bs-border-color: var(--customer-filter-border);
                    --bs-body-color: var(--customer-filter-text);
                    --bs-secondary-color: var(--customer-filter-muted);
                    color-scheme: dark;
                }
                .customer-filter-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    background: var(--customer-filter-bg) !important;
                    color: var(--customer-filter-text) !important;
                    border-radius: 12px 12px 0 0;
                }
                .customer-filter-heading h5,
                .customer-filter-popover .modal-title {
                    color: var(--customer-filter-text);
                }
                .customer-filter-popover .text-muted,
                .customer-filter-popover small.text-muted {
                    color: var(--customer-filter-muted) !important;
                }
                .customer-filter-popover .border-top,
                .customer-filter-popover .border-bottom {
                    border-color: var(--customer-filter-border) !important;
                }
                .customer-filter-body {
                    background: var(--customer-filter-bg) !important;
                    max-height: min(62vh, 580px);
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                .customer-filter-footer {
                    background: var(--customer-filter-bg) !important;
                    border-radius: 0 0 12px 12px;
                }
                .customer-filter-header-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    flex-shrink: 0;
                    border-radius: 9px;
                    background: var(--customer-filter-icon-bg);
                    color: #008080;
                }
                .customer-filter-popover .form-control,
                .customer-filter-popover .form-select,
                .customer-filter-popover input.flatpickr-input {
                    min-width: 0;
                    background-color: var(--customer-filter-input-bg) !important;
                    color: var(--customer-filter-text) !important;
                    -webkit-text-fill-color: var(--customer-filter-text);
                    border-color: var(--customer-filter-border) !important;
                }
                .customer-filter-popover .form-control::placeholder,
                .customer-filter-popover input::placeholder {
                    color: var(--customer-filter-placeholder) !important;
                    opacity: 1;
                }
                .customer-filter-popover .form-control:focus,
                .customer-filter-popover .form-select:focus,
                .customer-filter-popover input.flatpickr-input:focus {
                    border-color: #008080 !important;
                    box-shadow: 0 0 0 3px var(--customer-filter-focus) !important;
                }
                .customer-filter-popover .form-select option {
                    background: var(--customer-filter-input-bg);
                    color: var(--customer-filter-text);
                }
                .customer-filter-popover .dropdown-menu {
                    background: var(--customer-filter-bg) !important;
                    color: var(--customer-filter-text);
                    border-color: var(--customer-filter-border);
                    z-index: 1100;
                }
                .customer-filter-popover .dropdown-item {
                    color: var(--customer-filter-text);
                }
                .customer-filter-popover .dropdown-item:hover,
                .customer-filter-popover .dropdown-item:focus {
                    background: var(--customer-filter-hover);
                    color: var(--customer-filter-text);
                }
                .customer-filter-popover.customer-filter-dark .btn-close {
                    filter: invert(1) grayscale(100%);
                }
                .customer-filter-popover.customer-filter-dark .btn-outline-danger {
                    color: #ff858b;
                    border-color: #ff858b;
                }
                .customer-filter-popover.customer-filter-dark .btn-outline-danger:hover {
                    color: #ffffff;
                    background: #dc3545;
                    border-color: #dc3545;
                }
                @media (max-width: 575.98px) {
                    .customer-filter-popover {
                        position: fixed;
                        left: 12px;
                        right: 12px;
                        top: 78px;
                        width: auto;
                        max-width: none;
                    }
                    .customer-filter-body {
                        max-height: calc(100dvh - 215px);
                    }
                }
            `}</style>

            <ViewCustomerModal
                open={showDetailsModal}
                onOpenChange={(open) => {
                    setShowDetailsModal(open);
                    if (!open) setViewCustomer(null);
                }}
                customer={viewCustomer}
                loading={isDetailsLoading}
            />

            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setDeleteCustomer(null);
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}
