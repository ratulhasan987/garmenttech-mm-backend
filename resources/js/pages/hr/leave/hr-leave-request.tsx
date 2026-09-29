import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Edit, Eye, Trash2 } from 'react-feather';

// Adjust imports based on your actual paths
import { DatePicker } from '@/components/ui/form/date-picker';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { usePermission } from '@/hooks/use-permission';


import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

interface User {
    id: number;
    name: string;
    employee_id: string;
    reporting_officer: number | null;
}

interface Leave {
    id: number;
    name: string;
}

interface LeaveRequestData {
    id: number;
    start_date: string;
    end_date: string;
    leave_type: string;
    sub_type: string;
    days: number;
    reporting_officer_status: string;
    status: string;
    created_at: string;
    user: User;
    leave: Leave;
}

interface EmployeeSuggestion {
    id: number;
    name: string;
    employee_id: string;
}

interface Props {
    leaves: Leave[];
    requests: { data: LeaveRequestData[]; from: number; to: number; total: number; links: any[]; current_page: number; last_page: number };
    numberOfRequests: number;
    filters: any;
}

export default function HrLeaveRequest({ leaves, requests, numberOfRequests, filters }: Props) {
    const { can, canAny } = usePermission();

    const showActions = canAny(['leave.view', 'leave.edit', 'leave.delete']);
    const canView = can('leave.view');
    const canEdit = can('leave.edit');
    const canDelete = can('leave.delete');
    const canStatus = can('leave.status');
    const canCreate = can('leave.create');

    // Filter States
    const [search, setSearch] = useState('');
    const [employeeId, setEmployeeId] = useState(filters.user || '');
    const [sorting, setSorting] = useState(filters.sorting || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Typeahead State
    const [suggestions, setSuggestions] = useState<EmployeeSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Add Modal State
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addSearch, setAddSearch] = useState('');
    const [addEmployeeId, setAddEmployeeId] = useState('');
    const [addSuggestions, setAddSuggestions] = useState<EmployeeSuggestion[]>([]);
    const [showAddSuggestions, setShowAddSuggestions] = useState(false);

    const addForm = useForm({
        user_id: '',
        leave: '',
        type: 'Full Day',
        sub_type: 'first_half_day',
        dates: '',
        reason: '',
        status: 'approved',
        attachment: null as File | null,
    });

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequestData | null>(null);
    const [deleting, setDeleting] = useState(false);

    // View Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        id: '',
        leave: '',
        type: 'Full Day',
        sub_type: 'first_half_day',
        dates: '',
        reason: ''
    });



    const [employeeLeaves, setEmployeeLeaves] = useState<{ id: number; name: string; remaining_days: number }[]>([]);

    // Fetch suggestions for typeahead (Header Filter)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetch(`/get-employees?keyword=${encodeURIComponent(search)}`)
                .then(res => res.json())
                .then(data => setSuggestions(data || []));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Fetch suggestions for Add Modal
    useEffect(() => {
        if (!addModalOpen) return;
        const delayDebounceFn = setTimeout(() => {
            fetch(`/get-employees?keyword=${encodeURIComponent(addSearch)}`)
                .then(res => res.json())
                .then(data => setAddSuggestions(data || []));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [addSearch, addModalOpen]);

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-suggestion-container')) {
                setShowSuggestions(false);
                setShowAddSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const selectSuggestion = (user: EmployeeSuggestion) => {
        setSearch(`${user.name} - ${user.employee_id}`);
        setEmployeeId(String(user.id));
        setShowSuggestions(false);
    };



    const selectAddSuggestion = (user: EmployeeSuggestion) => {
        setAddSearch(`${user.name} - ${user.employee_id}`);
        setAddEmployeeId(String(user.id));
        addForm.setData('user_id', String(user.id));
        addForm.setData('leave', '');           // Reset previously selected leave
        setEmployeeLeaves([]);                  // Clear old list
        setShowAddSuggestions(false);

        // Fetch leaves assigned to THIS employee
        fetch(`/hr/get-user-leaves/${user.id}`)
            .then(res => res.json())
            .then(data => setEmployeeLeaves(data || []))
            .catch(() => setEmployeeLeaves([]));
    };

    const handleFilter = () => {
        router.get('/hr/all-leave-request', {
            user: employeeId,
            sorting: sorting,
            start_date: startDate,
            end_date: endDate
        }, { preserveState: true, replace: true });
    };

    const handlePageChange = (page: number) => {
        router.get('/hr/all-leave-request', {
            page,
            user: employeeId,
            sorting: sorting,
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            addForm.setData('attachment', e.target.files[0]);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/hr/manually-leave-request', {
            preserveScroll: true,
            onSuccess: () => {
                setAddModalOpen(false);
                addForm.reset();
                setAddSearch('');
                setAddEmployeeId('');
                setEmployeeLeaves([]); 
            }
        });
    };

    // Delete Logic
    const openDeleteModal = (req: LeaveRequestData) => {
        setSelectedRequest(req);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedRequest) return;
        setDeleting(true);
        router.delete(`/hr/leave-request/${selectedRequest.id}`, {
            onSuccess: () => {
                setDeleting(false);
                setDeleteModalOpen(false);
                setSelectedRequest(null);
            },
            onFinish: () => setDeleting(false)
        });
    };

    // View Logic
    const openViewModal = async (id: number) => {
        const res = await fetch(`/hr/leave-request/${id}/show`);
        const data = await res.json();
        setViewData(data);
        setViewModalOpen(true);
    };

    const handleStatusChange = (id: number, status: 'approved' | 'rejected') => {
        router.post('/hr/leave-request-status', { id, status }, {
            preserveScroll: true,
            onSuccess: () => setViewModalOpen(false)
        });
    };

    // Edit Logic
    const openEditModal = async (id: number) => {
        const res = await fetch(`/hr/leave-request/${id}/edit`);
        const data = await res.json();
        setEditData(data);
        setEditForm({
            id: data.id,
            leave: data.leave_id,
            type: data.leave_type || 'Full Day',
            sub_type: data.sub_type || 'first_half_day',
            dates: data.start_date === data.end_date ? data.start_date : `${data.start_date} to ${data.end_date}`,
            reason: data.reason || ''
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/hr/leave-request/update', editForm, {
            preserveScroll: true,
            onSuccess: () => setEditModalOpen(false)
        });
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            default: return 'bg-warning text-dark';
        }
    };

    return (
        <>
            <Head title="All Leave Requests" />
            <PageTitle title="All Leave Requests" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="px-3 py-3">
                        <div className="d-flex gap-2 flex-wrap justify-content-start align-items-center mb-3">
                            {canCreate && (
                                <button type="button" className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                                    Leave Apply
                                </button>
                            )}

                            {/* Search Typeahead */}
                            <div className="search-suggestion-container" style={{ position: 'relative', flex: 1, flexBasis: '200px' }}>
                                <input type="hidden" value={employeeId} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Employee"
                                    autoComplete="off"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setEmployeeId('');
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {showSuggestions && (
                                    <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
                                        {suggestions.length > 0 ? (
                                            suggestions.map(item => (
                                                <a key={item.id} className="dropdown-item" href="javascript:void(0)" onClick={() => selectSuggestion(item)}>
                                                    {item.name} - {item.employee_id}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="dropdown-item text-muted">No employees found</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <select className="form-control" style={{ flex: 1, flexBasis: '200px' }} value={sorting} onChange={(e) => setSorting(e.target.value)}>
                                <option value="">-- Sort By Date --</option>
                                <option value="asc">Oldest First</option>
                                <option value="desc">Newest First</option>
                            </select>

                            <style>{`.holiday-dp-wrap input:first-of-type{position:absolute!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;padding:0!important;margin:0!important;border:0!important;overflow:hidden!important}`}</style>

                            <div className="holiday-dp-wrap" style={{ flex: 1, flexBasis: '200px' }} onClick={() => setStartDate('')}>
                                <DatePicker
                                    value={startDate}
                                    placeholder="Start Date"
                                    disabled={false}
                                    allowInput={false}
                                    onChange={(dateString) => setStartDate(dateString)}
                                />
                            </div>

                            <div className="holiday-dp-wrap" style={{ flex: 1, flexBasis: '200px' }} onClick={() => setEndDate('')}>
                                <DatePicker
                                    value={endDate}
                                    placeholder="End Date"
                                    disabled={false}
                                    allowInput={false}
                                    onChange={(dateString) => setEndDate(dateString)}
                                />
                            </div>

                            <button type="button" className="btn btn-primary" onClick={handleFilter}>Filter</button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive">
                            <table className="table" id="requestTable">
                                <thead>
                                    <tr>
                                        <th>Sl</th>
                                        <th>Employee Name</th>
                                        <th>Leave</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        {/* <th>Reporting Officer</th> */}
                                        <th>Status</th>
                                        {showActions && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.length > 0 ? (
                                        requests.data.map((req, index) => (
                                            <tr key={req.id}>
                                                <td>{requests.from + index}</td>
                                                <td style={{ cursor: 'pointer' }} onClick={() => openViewModal(req.id)}>
                                                    {req.user?.name} <br />
                                                    <span className="text-muted">#{req.user?.employee_id}</span> <br />
                                                    <span className="text-secondary" style={{ fontSize: '12px' }}>
                                                        {new Date(req.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td>{req.leave?.name}</td>
                                                <td>{req.start_date}</td>
                                                <td>{req.end_date}</td>
                                                <td>
                                                    {req.leave_type} <br />
                                                    <span style={{ fontSize: '11px' }}>
                                                        {req.leave_type === 'Half Day' ? (req.sub_type === 'first_half_day' ? 'First Half' : 'Second Half') : ''}
                                                    </span>
                                                </td>
                                                <td>{req.leave_type === 'Half Day' ? Number(req.days).toFixed(1) : Math.round(Number(req.days))} Day</td>

                                                <td>
                                                    <span className={`badge ${getStatusClass(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                {showActions && (
                                                    <td>
                                                        <ul className="action d-flex gap-2 list-unstyled mb-0">
                                                            {canView && (
                                                                <li>
                                                                    <button onClick={() => openViewModal(req.id)} className="text-primary btn btn-link p-0 border-0">
                                                                        <Eye size={16} />
                                                                    </button>
                                                                </li>
                                                            )}
                                                            {canEdit && (
                                                                <li>
                                                                    <button onClick={() => openEditModal(req.id)} className="text-warning btn btn-link p-0 border-0">
                                                                        <Edit size={16} />
                                                                    </button>
                                                                </li>
                                                            )}
                                                            {canDelete && (
                                                                <li>
                                                                    <button onClick={() => openDeleteModal(req)} className="text-danger btn btn-link p-0 border-0">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center text-muted p-4">No leave requests found.</td>
                                        </tr>
                                    )}
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

            {/* Add Modal */}
            {addModalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Leave Request</h5>
                                <button type="button" className="btn-close" onClick={() => setAddModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-body">
                                    <div className="form-group mb-3 search-suggestion-container" style={{ position: 'relative' }}>
                                        <label className="form-label">Select Employee</label>
                                        <input type="hidden" value={addEmployeeId} />
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search employees"
                                            autoComplete="off"
                                            value={addSearch}
                                            onChange={(e) => {
                                                setAddSearch(e.target.value);
                                                setAddEmployeeId('');
                                                addForm.setData('user_id', '');
                                                addForm.setData('leave', '');
                                                setEmployeeLeaves([]);
                                            }}
                                            onFocus={() => setShowAddSuggestions(true)}
                                        />
                                        {showAddSuggestions && (
                                            <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
                                                {addSuggestions.length > 0 ? (
                                                    addSuggestions.map(item => (
                                                        <a key={item.id} className="dropdown-item" href="javascript:void(0)" onClick={() => selectAddSuggestion(item)}>
                                                            {item.name} - {item.employee_id}
                                                        </a>
                                                    ))
                                                ) : (
                                                    <span className="dropdown-item text-muted">No employees found</span>
                                                )}
                                            </div>
                                        )}
                                        {addForm.errors.user_id && <div className="text-danger mt-1">{addForm.errors.user_id}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Select Leave (*)
                                            {addEmployeeId && employeeLeaves.length === 0 && (
                                                <small className="text-muted ms-2">(No leaves assigned to this employee)</small>
                                            )}
                                        </label>
                                        <select
                                            className="form-control"
                                            value={addForm.data.leave}
                                            onChange={e => addForm.setData('leave', e.target.value)}
                                            required
                                            disabled={!addEmployeeId}   // Disable until an employee is picked
                                        >
                                            <option value="">Select One</option>
                                            {employeeLeaves.map(l => (
                                                <option key={l.id} value={l.id}>
                                                    {l.name} (Remaining: {l.remaining_days} {l.remaining_days === 1 ? 'day' : 'days'})
                                                </option>
                                            ))}
                                        </select>
                                        {!addEmployeeId && <small className="text-muted">Please select an employee first.</small>}
                                        {addForm.errors.leave && <div className="text-danger mt-1">{addForm.errors.leave}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Leave Type (*)</label>
                                        <select
                                            className="form-control"
                                            value={addForm.data.type}
                                            onChange={e => addForm.setData('type', e.target.value as 'Full Day' | 'Half Day')}
                                            required
                                        >
                                            <option value="Full Day">Full Day</option>
                                            <option value="Half Day">Half Day</option>
                                        </select>
                                    </div>

                                    {addForm.data.type === 'Half Day' && (
                                        <div className="mb-3">
                                            <label className="form-label">Select one</label>
                                            <select
                                                className="form-control"
                                                value={addForm.data.sub_type}
                                                onChange={e => addForm.setData('sub_type', e.target.value as 'first_half_day' | 'second_half_day')}
                                            >
                                                <option value="first_half_day">1st Half</option>
                                                <option value="second_half_day">2nd Half</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label">Select Dates (*)</label>
                                        <DatePicker
                                            value={addForm.data.dates}
                                            placeholder="Select Dates"
                                            disabled={false}
                                            allowInput={false}
                                            onChange={(dateString) => addForm.setData('dates', dateString)}
                                            mode={addForm.data.type === 'Half Day' ? 'single' : 'range'}
                                        />
                                        {addForm.errors.dates && <div className="text-danger mt-1">{addForm.errors.dates}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Reason (*)</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={addForm.data.reason}
                                            onChange={e => addForm.setData('reason', e.target.value)}
                                            maxLength={255}
                                            required
                                        />
                                        {addForm.errors.reason && <div className="text-danger mt-1">{addForm.errors.reason}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Attachment</label>
                                        <input className="form-control" type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} />
                                        {addForm.errors.attachment && <div className="text-danger mt-1">{addForm.errors.attachment}</div>}
                                    </div>

                                    <div className="mb-3 border rounded-3 p-3">
                                        <h6 className="mb-2">Is Approved</h6>
                                        <div className="d-flex gap-3">
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="approved" value="approved" checked={addForm.data.status === 'approved'} onChange={e => addForm.setData('status', e.target.value)} />
                                                <label className="form-check-label" htmlFor="approved">Approved</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="pending" value="pending" checked={addForm.data.status === 'pending'} onChange={e => addForm.setData('status', e.target.value)} />
                                                <label className="form-check-label" htmlFor="pending">Pending</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" id="rejected" value="rejected" checked={addForm.data.status === 'rejected'} onChange={e => addForm.setData('status', e.target.value)} />
                                                <label className="form-check-label" htmlFor="rejected">Rejected</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Close</button>
                                    <button type="submit" className="btn btn-primary" disabled={addForm.processing}>Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModalOpen && viewData && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Show Request</h5>
                                <button type="button" className="btn-close" onClick={() => setViewModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex align-items-center mb-4">
                                    <img src={viewData.employee_image ? `/${viewData.employee_image}` : '/avatar.png'} className="rounded-circle me-3" width="70" height="70" alt="Employee" />
                                    <div>
                                        <h5 className="mb-1 fw-semibold">{viewData.employee_name}</h5>
                                        <p className="mb-0 text-muted small">Employee ID: {viewData.employee_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <table className="table table-borderless table-hover">
                                    <tbody>
                                        <tr><th className="text-muted fw-normal">Leave</th><td>{viewData.leave_name}</td></tr>
                                        <tr><th className="text-muted fw-normal">Type</th><td>{viewData.leave_type} {viewData.sub_type === 'first_half_day' ? '(First Half)' : viewData.sub_type === 'second_half_day' ? '(Second Half)' : ''}</td></tr>
                                        <tr><th className="text-muted fw-normal">Start</th><td>{viewData.start_date}</td></tr>
                                        <tr><th className="text-muted fw-normal">End</th><td>{viewData.end_date}</td></tr>
                                        <tr><th className="text-muted fw-normal">Duration</th><td>{viewData.quantity} Day(s)</td></tr>
                                        <tr><th className="text-muted fw-normal">Reason</th><td>{viewData.reason}</td></tr>
                                        {viewData.attachment && (
                                            <tr>
                                                <th className="text-muted fw-normal">Attachment</th>
                                                <td>
                                                    <a href={`/${viewData.attachment}`} target="_blank" className="btn btn-sm btn-outline-primary">
                                                        View Document
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {canStatus && (
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-danger" onClick={() => handleStatusChange(viewData.id, 'rejected')}>Reject</button>
                                    <button type="button" className="btn btn-primary" onClick={() => handleStatusChange(viewData.id, 'approved')}>Approve</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && editData && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Request</h5>
                                <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Employee</label>
                                        <input type="text" className="form-control" value={editData.employee || ''} readOnly />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label">Select Leave (*)</label>
                                        <select className="form-control" value={editForm.leave} onChange={(e) => setEditForm({ ...editForm, leave: e.target.value })}>
                                            <option value="">Select One</option>
                                            {leaves.map(leave => <option key={leave.id} value={leave.id}>{leave.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label">Leave Type (*)</label>
                                        <select className="form-control" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'Full Day' | 'Half Day' })}>
                                            <option value="Full Day">Full Day</option>
                                            <option value="Half Day">Half Day</option>
                                        </select>
                                    </div>
                                    {editForm.type === 'Half Day' && (
                                        <div className="form-group mb-3">
                                            <label className="form-label">Select one</label>
                                            <select className="form-control" value={editForm.sub_type} onChange={(e) => setEditForm({ ...editForm, sub_type: e.target.value })}>
                                                <option value="first_half_day">1st Half</option>
                                                <option value="second_half_day">2nd Half</option>
                                            </select>
                                        </div>
                                    )}
                                    <div className="form-group mb-3">
                                        <label className="form-label">Select Dates (*)</label>
                                        <DatePicker
                                            value={editForm.dates}
                                            placeholder="Select Dates"
                                            disabled={false}
                                            allowInput={false}
                                            onChange={(dateString) => setEditForm({ ...editForm, dates: dateString })}
                                            mode={editForm.type === 'Half Day' ? 'single' : 'range'}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label">Reason (*)</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={editForm.reason}
                                            onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Close</button>
                                    <button type="submit" className="btn btn-primary">Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                key={selectedRequest?.id || 'no-req'}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedRequest(null);
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}