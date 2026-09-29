import { Head, router, useForm } from '@inertiajs/react';

import { useEffect, useState } from 'react';

import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { Edit, Eye, Plus, Trash2 } from 'react-feather';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { DatePicker } from '@/components/ui/form/date-picker';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

import { Pagination } from '@/components/ui/pagination';
import { usePermission } from '@/hooks/use-permission';

interface User {
    id: number;

    name: string;

    employee_id: string;

    image?: string;
}

interface WFHRequest {
    id: number;

    start_date: string;

    end_date: string;

    days: number;

    reason: string;

    status: string;

    created_at: string;

    user: User;
}

interface Props {
    requests: {
        data: WFHRequest[];

        from: number;

        to: number;

        total: number;

        links: any[];

        current_page: number;

        last_page: number;
    };

    numberOfRequests: number;

    filters: any;
}

type ManualWfhForm = {
    user_id: number | null;
    dates: string;
    reason: string;
};

/** Uses the same employee endpoint as the existing WFH index filter. */
async function searchEmployeeSuggestions(keyword: string): Promise<User[]> {
    try {
        const response = await fetch(
            `/get-employees?keyword=${encodeURIComponent(keyword)}`,
            {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            },
        );

        if (!response.ok) {
            return [];
        }

        const result: unknown = await response.json();

        if (Array.isArray(result)) {
            return result as User[];
        }

        if (result && typeof result === 'object' && 'data' in result) {
            const data = result.data;

            return Array.isArray(data) ? (data as User[]) : [];
        }

        return [];
    } catch {
        return [];
    }
}

export default function WfhIndex({
    requests,

    numberOfRequests,

    filters,
}: Props) {
    const { can, canAny } = usePermission();

    const showActions = canAny([
        'WFH.view',

        'WFH.edit',

        'WFH.delete',

        'WFH.status',
    ]);

    const canView = can('WFH.view');

    const canEdit = can('WFH.edit');

    const canDelete = can('WFH.delete');

    const canStatus = can('WFH.status');

    // Manually recording WFH also approves the request and creates attendance.
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [selectedManualEmployee, setSelectedManualEmployee] =
        useState<User | null>(null);
    const manualForm = useForm<ManualWfhForm>({
        user_id: null,
        dates: '',
        reason: '',
    });

    const openManualModal = () => {
        manualForm.reset();
        manualForm.clearErrors();
        setSelectedManualEmployee(null);
        setManualModalOpen(true);
    };

    const closeManualModal = () => {
        if (manualForm.processing) {
            return;
        }

        setManualModalOpen(false);
        setSelectedManualEmployee(null);
        manualForm.clearErrors();
    };

    const submitManualWfh = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (manualForm.processing) {
            return;
        }

        manualForm.post('/hr/wfh/manual', {
            preserveScroll: true,
            onSuccess: () => {
                setManualModalOpen(false);
                setSelectedManualEmployee(null);
                manualForm.reset();
            },
        });
    };

    // Filter States

    const [search, setSearch] = useState('');

    const [employeeId, setEmployeeId] = useState(filters.employee || '');

    const [sorting, setSorting] = useState(filters.sorting || '');

    const [startDate, setStartDate] = useState(filters.start_date || '');

    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Typeahead State

    const [suggestions, setSuggestions] = useState<User[]>([]);

    const [showSuggestions, setShowSuggestions] = useState(false);

    // Delete Modal State

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedWFH, setSelectedWFH] = useState<WFHRequest | null>(null);

    const [deleting, setDeleting] = useState(false);

    // View Modal State

    const [viewModalOpen, setViewModalOpen] = useState(false);

    const [viewData, setViewData] = useState<any>(null);

    // Edit Modal State

    const [editModalOpen, setEditModalOpen] = useState(false);

    const [editData, setEditData] = useState<any>(null);

    const [editForm, setEditForm] = useState({ id: '', dates: '', reason: '' });

    // Fetch suggestions for typeahead

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetch(`/get-employees?keyword=${encodeURIComponent(search)}`)
                .then((res) => res.json())

                .then((data) => {
                    setSuggestions(data);
                });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Hide suggestions when clicking outside

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (!target.closest('.search-suggestion-container')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const selectSuggestion = (user: User) => {
        setSearch(`${user.name} - ${user.employee_id}`);

        setEmployeeId(String(user.id));

        setShowSuggestions(false);
    };

    const handleFilter = () => {
        router.get(
            '/hr/all-wfh',

            {
                employee: employeeId,

                sorting: sorting,

                start_date: startDate,

                end_date: endDate,
            },

            { preserveState: true, replace: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/hr/all-wfh',

            {
                page,

                employee: employeeId,

                sorting: sorting,

                start_date: startDate,

                end_date: endDate,
            },

            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    // Delete Logic

    const openDeleteModal = (wfh: WFHRequest) => {
        setSelectedWFH(wfh);

        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedWFH) {
            return;
        }

        setDeleting(true);

        router.delete(`/hr/wfh/${selectedWFH.id}`, {
            onSuccess: () => {
                setDeleting(false);

                setDeleteModalOpen(false);

                setSelectedWFH(null);
            },

            onFinish: () => {
                setDeleting(false);
            },
        });
    };

    // View Logic

    const openViewModal = async (id: number) => {
        const res = await fetch(`/hr/wfh/${id}/show`);

        const data = await res.json();

        setViewData(data);

        setViewModalOpen(true);
    };

    const handleStatusChange = (
        id: number,

        status: 'approved' | 'rejected',
    ) => {
        router.post(
            '/hr/wfh-status',

            { id, status },

            {
                preserveScroll: true,

                onSuccess: () => setViewModalOpen(false),
            },
        );
    };

    // Edit Logic

    const openEditModal = async (id: number) => {
        const res = await fetch(`/hr/wfh/${id}/edit`);

        const data = await res.json();

        setEditData(data);

        setEditForm({
            id: data.id,

            dates:
                data.start_date === data.end_date
                    ? data.start_date
                    : `${data.start_date} to ${data.end_date}`,

            reason: data.reason,
        });

        setEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/hr/wfh/update', editForm, {
            preserveScroll: true,

            onSuccess: () => setEditModalOpen(false),
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) {
            return 'N/A';
        }

        // WFH start_date/end_date are business dates, not UTC timestamps.
        const datePart = dateString.slice(0, 10);
        const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

        if (!parts) {
            return dateString;
        }

        const date = new Date(
            Number(parts[1]),
            Number(parts[2]) - 1,
            Number(parts[3]),
        );

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
    };

    return (
        <>
            <Head title="WFH Requests" />

            <PageTitle title="WFH Requests" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="px-3 py-3">
                        <div className="d-flex gap-2 flex-wrap justify-content-start align-items-center mb-3">
                            {canStatus && (
                                <div className="d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary d-inline-flex align-items-center gap-2"
                                        onClick={openManualModal}
                                    >
                                        <Plus size={16} />
                                        Add WFH
                                    </button>
                                </div>
                            )}

                            {/* Search Typeahead */}

                            <div
                                className="search-suggestion-container"

                                style={{
                                    position: 'relative',

                                    flex: 1,

                                    flexBasis: '200px',
                                }}
                            >
                                <input type="hidden" value={employeeId} />

                                <input
                                    type="text"

                                    className="form-control"

                                    placeholder="Search employees"

                                    autoComplete="off"

                                    value={search}

                                    onChange={(e) => {
                                        setSearch(e.target.value);

                                        setEmployeeId('');
                                    }}

                                    onFocus={() => setShowSuggestions(true)}
                                />

                                {showSuggestions && (
                                    <div
                                        className="dropdown-menu show"

                                        style={{
                                            maxHeight: '200px',

                                            overflowY: 'auto',

                                            width: '100%',
                                        }}
                                    >
                                        {suggestions.length > 0 ? (
                                            suggestions.map((item) => (
                                                <a
                                                    key={item.id}

                                                    className="dropdown-item"

                                                    href="javascript:void(0)"

                                                    onClick={() =>
                                                        selectSuggestion(item)
                                                    }
                                                >
                                                    {item.name} -{' '}
                                                    {item.employee_id}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="dropdown-item text-muted">
                                                No employees found
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sort Dropdown */}

                            <select
                                className="form-control"

                                style={{ flex: 1, flexBasis: '200px' }}

                                value={sorting}

                                onChange={(e) => setSorting(e.target.value)}
                            >
                                <option value="">-- Sort By Date --</option>

                                <option value="asc">Oldest First</option>

                                <option value="desc">Newest First</option>
                            </select>

                            {/* Date Pickers */}

                            <style>{`.holiday-dp-wrap input:first-of-type{position:absolute!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;padding:0!important;margin:0!important;border:0!important;overflow:hidden!important}`}</style>

                            <div
                                className="holiday-dp-wrap"

                                style={{ flex: 1, flexBasis: '200px' }}

                                onClick={() => setStartDate('')}
                            >
                                <DatePicker
                                    value={startDate}

                                    placeholder="Start Date"

                                    disabled={false}

                                    allowInput={false}

                                    onChange={(dateString) =>
                                        setStartDate(dateString)
                                    }
                                />
                            </div>

                            <div
                                className="holiday-dp-wrap"

                                style={{ flex: 1, flexBasis: '200px' }}

                                onClick={() => setEndDate('')}
                            >
                                <DatePicker
                                    minDate={startDate}

                                    value={endDate}

                                    placeholder="End Date"

                                    disabled={false}

                                    allowInput={false}

                                    onChange={(dateString) =>
                                        setEndDate(dateString)
                                    }
                                />
                            </div>

                            <button
                                type="button"

                                className="btn btn-primary"

                                onClick={handleFilter}
                            >
                                Filter
                            </button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive">
                            <table className="table" id="wfhTable">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>Sl</th>

                                        <th>Employee</th>

                                        <th>Date</th>

                                        <th>Duration</th>

                                        <th>Status</th>

                                        {showActions && (
                                            <th style={{ width: '120px' }}>
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {requests.data.map((req, index) => (
                                        <tr key={req.id}>
                                            <td>{requests.from + index}</td>

                                            <td>
                                                {req.user?.name} <br />
                                                <span>
                                                    #{req.user?.employee_id}
                                                </span>
                                            </td>

                                            <td>
                                                {req.start_date === req.end_date
                                                    ? formatDate(req.start_date)
                                                    : `${formatDate(req.start_date)} to ${formatDate(req.end_date)}`}
                                            </td>

                                            <td>{req.days} Day(s)</td>

                                            <td>
                                                <span
                                                    className={`badge text-capitalize ${req.status === 'approved' ? 'bg-success' : req.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}
                                                >
                                                    {req.status}
                                                </span>
                                            </td>

                                            {showActions && (
                                                <td>
                                                    <ul className="action d-flex gap-2 list-unstyled mb-0">
                                                        {canView && (
                                                            <li>
                                                                <button
                                                                    onClick={() =>
                                                                        openViewModal(
                                                                            req.id,
                                                                        )
                                                                    }

                                                                    className="text-primary btn btn-link p-0 border-0"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </li>
                                                        )}

                                                        {canEdit && (
                                                            <li>
                                                                <button
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            req.id,
                                                                        )
                                                                    }

                                                                    className="text-warning btn btn-link p-0 border-0"
                                                                >
                                                                    <Edit
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </li>
                                                        )}

                                                        {canDelete && (
                                                            <li>
                                                                <button
                                                                    onClick={() =>
                                                                        openDeleteModal(
                                                                            req,
                                                                        )
                                                                    }

                                                                    className="text-danger btn btn-link p-0 border-0"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={requests.from ?? 0}

                                to={requests.to ?? 0}

                                total={numberOfRequests}
                            />

                            <Pagination
                                currentPage={requests.current_page}

                                lastPage={requests.last_page}

                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* HR manual WFH: select employee, date(s), and reason. */}
            {manualModalOpen && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="manual-wfh-title"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5
                                    id="manual-wfh-title"
                                    className="modal-title mb-0"
                                >
                                    Add Work From Home
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    disabled={manualForm.processing}
                                    onClick={closeManualModal}
                                />
                            </div>

                            <form onSubmit={submitManualWfh}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Employee{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <SuggestionSearchInput<User>
                                            searchFn={searchEmployeeSuggestions}
                                            idKey="id"
                                            labelKey="name"
                                            placeholder="Search employee name or ID..."
                                            showSearchIcon
                                            clearOnFocus={false}
                                            disabled={manualForm.processing}
                                            defaultSelectedItem={
                                                selectedManualEmployee
                                            }
                                            onSelect={(employee) => {
                                                setSelectedManualEmployee(
                                                    employee,
                                                );
                                                manualForm.setData(
                                                    'user_id',
                                                    employee.id,
                                                );
                                                manualForm.clearErrors(
                                                    'user_id',
                                                );
                                            }}
                                            onClear={() => {
                                                setSelectedManualEmployee(null);
                                                manualForm.setData(
                                                    'user_id',
                                                    null,
                                                );
                                            }}
                                            renderOption={(employee) => (
                                                <div>
                                                    <div className="fw-semibold">
                                                        {employee.name}
                                                    </div>
                                                    <small className="text-muted">
                                                        #{employee.employee_id}
                                                    </small>
                                                </div>
                                            )}
                                        />
                                        {manualForm.errors.user_id && (
                                            <div className="text-danger small mt-1">
                                                {manualForm.errors.user_id}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            WFH Date(s){' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <DatePicker
                                            id="manual-wfh-dates"
                                            mode="range"
                                            value={manualForm.data.dates}
                                            placeholder="Select date or date range"
                                            allowInput={false}
                                            disabled={manualForm.processing}
                                            dateFormat="Y-m-d"
                                            displayFormat="Y-m-d"
                                            onChange={(dates) => {
                                                manualForm.setData(
                                                    'dates',
                                                    dates,
                                                );
                                                manualForm.clearErrors('dates');
                                            }}
                                        />
                                        {manualForm.errors.dates && (
                                            <div className="text-danger small mt-1">
                                                {manualForm.errors.dates}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-0">
                                        <label
                                            htmlFor="manual-wfh-reason"
                                            className="form-label"
                                        >
                                            Reason{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            id="manual-wfh-reason"
                                            className="form-control"
                                            rows={3}
                                            maxLength={255}
                                            required
                                            disabled={manualForm.processing}
                                            placeholder="Reason for manually recording WFH..."
                                            value={manualForm.data.reason}
                                            onChange={(event) => {
                                                manualForm.setData(
                                                    'reason',
                                                    event.target.value,
                                                );
                                                manualForm.clearErrors(
                                                    'reason',
                                                );
                                            }}
                                        />
                                        <div className="d-flex justify-content-between mt-1">
                                            <span className="text-danger small">
                                                {manualForm.errors.reason ?? ''}
                                            </span>
                                            <small className="text-muted">
                                                {manualForm.data.reason.length}
                                                /255
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-light border"
                                        disabled={manualForm.processing}
                                        onClick={closeManualModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary d-inline-flex align-items-center gap-2"
                                        disabled={
                                            manualForm.processing ||
                                            !manualForm.data.user_id ||
                                            !manualForm.data.dates ||
                                            !manualForm.data.reason.trim()
                                        }
                                    >
                                        {manualForm.processing && (
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />
                                        )}
                                        Save & Approve
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}

            {viewModalOpen && viewData && (
                <div
                    className="modal fade show d-block"

                    tabIndex={-1}

                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Show Request</h5>

                                <button
                                    type="button"

                                    className="btn-close"

                                    onClick={() => setViewModalOpen(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="d-flex align-items-center mb-4">
                                    <img
                                        src={
                                            viewData.employee_image
                                                ? `/${viewData.employee_image}`
                                                : '/avatar.png'
                                        }

                                        className="rounded-circle me-3"

                                        width="70"

                                        height="70"

                                        alt="Employee"
                                    />

                                    <div>
                                        <h5 className="mb-1 fw-semibold">
                                            {viewData.employee_name}
                                        </h5>

                                        <p className="mb-0 text-muted small">
                                            Employee ID:{' '}
                                            {viewData.employee_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <table className="table table-borderless table-hover">
                                    <tbody>
                                        <tr>
                                            <th className="text-muted fw-normal">
                                                Start
                                            </th>

                                            <td>{viewData.start_date}</td>
                                        </tr>

                                        <tr>
                                            <th className="text-muted fw-normal">
                                                End
                                            </th>

                                            <td>{viewData.end_date}</td>
                                        </tr>

                                        <tr>
                                            <th className="text-muted fw-normal">
                                                Duration
                                            </th>

                                            <td>{viewData.quantity} Day(s)</td>
                                        </tr>

                                        <tr>
                                            <th className="text-muted fw-normal">
                                                Reason
                                            </th>

                                            <td>{viewData.reason}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {canStatus && (
                                <div className="modal-footer">
                                    <button
                                        type="button"

                                        className="btn btn-danger"

                                        onClick={() =>
                                            handleStatusChange(
                                                viewData.id,

                                                'rejected',
                                            )
                                        }
                                    >
                                        Reject
                                    </button>

                                    <button
                                        type="button"

                                        className="btn btn-primary"

                                        onClick={() =>
                                            handleStatusChange(
                                                viewData.id,

                                                'approved',
                                            )
                                        }
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}

            {editModalOpen && editData && (
                <div
                    className="modal fade show d-block"

                    tabIndex={-1}

                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Request</h5>

                                <button
                                    type="button"

                                    className="btn-close"

                                    onClick={() => setEditModalOpen(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="form-group mb-3">
                                        <label className="form-label">
                                            Employee
                                        </label>

                                        <input
                                            type="text"

                                            className="form-control"

                                            value={editData.employee_name || ''}

                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">
                                            Select Dates (*)
                                        </label>

                                        <DatePicker
                                            value={editForm.dates}

                                            placeholder="Select Dates"

                                            disabled={false}

                                            allowInput={false}

                                            onChange={(dateString) =>
                                                setEditForm({
                                                    ...editForm,

                                                    dates: dateString,
                                                })
                                            }

                                            mode="range"
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">
                                            Reason (*)
                                        </label>

                                        <textarea
                                            className="form-control"

                                            rows={3}

                                            value={editForm.reason}

                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,

                                                    reason: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"

                                        className="btn btn-secondary"

                                        onClick={() => setEditModalOpen(false)}
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="submit"

                                        className="btn btn-primary"
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                key={selectedWFH?.id || 'no-wfh'}

                open={deleteModalOpen}

                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedWFH(null);
                    }
                }}

                processing={deleting}

                onConfirm={confirmDelete}
            />
        </>
    );
}
