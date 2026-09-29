import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Check, Edit, Trash2, X } from 'react-feather';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { usePermission } from '@/hooks/use-permission';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

interface Leave {
    id: number;
    name: string;
    qty: number;
}

interface UserLeave {
    leave_id: number;
    remaining_days: number;
}

interface User {
    id: number;
    name: string;
    employee_id: string;
    department: { id: number; name: string } | null;
    leaves: Leave[];
    userLeave: UserLeave[];
}

interface EmployeeSuggestion {
    id: number;
    name: string;
    employee_id: string;
}

interface Props {
    leaves: Leave[];
    userWiseLeaves: { data: User[]; from: number; to: number; total: number; links: any[] } | null;
    numberOfAssignLeaves: number;
    departments: { id: number; name: string }[];
    filters: any;
}

export default function LeaveManagementIndex({ leaves, userWiseLeaves, numberOfAssignLeaves, departments, filters }: Props) {
    const { can, canAny } = usePermission();

    const canAssign = can('leave.assign');
    const showActions = canAny(['leave.edit', 'leave.delete']);
    const canCreate = can('leave.create');
    const canEdit = can('leave.edit');
    const canDelete = can('leave.delete');

    // Safely extract pagination data
    const wfhData = userWiseLeaves?.data || [];
    const from = userWiseLeaves?.from || 0;
    const to = userWiseLeaves?.to || 0;
    const links = userWiseLeaves?.links || [];

    const currentPage = (userWiseLeaves as any)?.current_page || 1;
    const lastPage = (userWiseLeaves as any)?.last_page || 1;

    // Filter States
    const [search, setSearch] = useState('');
    const [employeeId, setEmployeeId] = useState(filters?.user || '');
    const [department, setDepartment] = useState(filters?.department || '');
    const [sorting, setSorting] = useState(filters?.sorting || '');

    // Typeahead State (Header Filter)
    const [suggestions, setSuggestions] = useState<EmployeeSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Add Modal State
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addSearch, setAddSearch] = useState('');
    const [addEmployeeId, setAddEmployeeId] = useState('');
    const [addSuggestions, setAddSuggestions] = useState<EmployeeSuggestion[]>([]);
    const [showAddSuggestions, setShowAddSuggestions] = useState(false);

    // Add Modal Leave Tags State
    const [addLeaveSearch, setAddLeaveSearch] = useState('');
    const [showAddLeaveSuggestions, setShowAddLeaveSuggestions] = useState(false);
    const [addLeaveIds, setAddLeaveIds] = useState<number[]>([]);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // Edit Modal Leave Tags State
    const [editLeaveSearch, setEditLeaveSearch] = useState('');
    const [showEditLeaveSuggestions, setShowEditLeaveSuggestions] = useState(false);
    const [editLeaveIds, setEditLeaveIds] = useState<number[]>([]);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch suggestions for Header filter
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetch(`/get-employees?keyword=${encodeURIComponent(search)}`)
                .then(res => res.json())
                .then(data => setSuggestions(data || []));
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Fetch suggestions for Add Modal (Unassigned employees)
    useEffect(() => {
        if (!addModalOpen) return;
        const delayDebounceFn = setTimeout(() => {
            fetch(`/get-unassign-leave-employees?keyword=${encodeURIComponent(addSearch)}`)
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
                setShowAddLeaveSuggestions(false);
                setShowEditLeaveSuggestions(false);
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
        setShowAddSuggestions(false);
    };

    const handleFilter = () => {
        router.get('/hr/leave-management', {
            user: employeeId,
            department: department,
            sorting: sorting
        }, { preserveState: true, replace: true });
    };



    const handlePageChange = (page: number) => {
        router.get('/hr/leave-management', {
            page,
            user: employeeId,
            department: department,
            sorting: sorting
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };




    // --- Leave Tags Handlers ---
    const toggleAddLeave = (id: number) => {
        if (addLeaveIds.includes(id)) {
            setAddLeaveIds(addLeaveIds.filter(i => i !== id));
        } else {
            setAddLeaveIds([...addLeaveIds, id]);
        }
        // Close the dropdown on select
        setShowAddLeaveSuggestions(false);
        // Clear the search so it's fresh next time you click
        setAddLeaveSearch('');
    };

    const toggleEditLeave = (id: number) => {
        if (editLeaveIds.includes(id)) {
            setEditLeaveIds(editLeaveIds.filter(i => i !== id));
        } else {
            setEditLeaveIds([...editLeaveIds, id]);
        }
        // Close the dropdown on select
        setShowEditLeaveSuggestions(false);
        // Clear the search so it's fresh next time you click
        setEditLeaveSearch('');
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/hr/leave-management', {
            user: addEmployeeId,
            leaves: addLeaveIds
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setAddModalOpen(false);
                setAddSearch('');
                setAddEmployeeId('');
                setAddLeaveIds([]);
            }
        });
    };

    const openEditModal = async (id: number) => {
        try {
            const res = await fetch(`/hr-leave-management/${id}/edit`);
            const data = await res.json();
            setEditData(data);
            setEditLeaveIds(data?.leaves || []);
            setEditModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch edit data", error);
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        router.post('/hr-leave-management/update', {
            user: editData.id,
            leaves: editLeaveIds
        }, {
            preserveScroll: true,
            onSuccess: () => setEditModalOpen(false)
        });
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedUser) return;
        setDeleting(true);
        router.delete(`/hr-leave-management/${selectedUser.id}`, {
            onSuccess: () => {
                setDeleting(false);
                setDeleteModalOpen(false);
                setSelectedUser(null);
            },
            onFinish: () => setDeleting(false)
        });
    };

    // Filtered Suggestions for Leaves (Shows all if no search, excludes nothing so we can toggle deselect)
    const filteredAddLeaves = leaves.filter(l =>
        l.name.toLowerCase().includes(addLeaveSearch.toLowerCase())
    );

    const filteredEditLeaves = leaves.filter(l =>
        l.name.toLowerCase().includes(editLeaveSearch.toLowerCase())
    );

    return (
        <>
            <Head title="Manage Leave" />
            <PageTitle title="Manage Leave" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="px-3 py-3 ">
                        <div className="d-flex gap-2 flex-wrap justify-content-start align-items-center mb-3">
                            {canAssign && (
                                <button type="button" className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                                    Assign Leave
                                </button>
                            )}

                            {/* Search Typeahead */}
                            <div className="search-suggestion-container" style={{ position: 'relative', flex: 1, flexBasis: '200px' }}>
                                <input type="hidden" value={employeeId} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search employee"
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

                            <select className="form-control" style={{ flex: 1, flexBasis: '200px' }} value={department} onChange={(e) => setDepartment(e.target.value)}>
                                <option value="">All Department</option>
                                {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                            </select>

                            <select className="form-control" style={{ flex: 1, flexBasis: '200px' }} value={sorting} onChange={(e) => setSorting(e.target.value)}>
                                <option value="">-- Sort By Date --</option>
                                <option value="asc">Oldest First</option>
                                <option value="desc">Newest First</option>
                            </select>

                            <button type="button" className="btn btn-primary" onClick={handleFilter}>Filter</button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive">
                            <table className="table" id="leaveTable">
                                <thead>
                                    <tr>
                                        <th>Sl</th>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Leaves</th>
                                        <th>Remaining Leaves</th>
                                        {showActions && (

                                            <th>Actions</th>

                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {wfhData.length > 0 ? (
                                        wfhData.map((user, index) => {
                                            if (!user) return null;
                                            return (
                                                <tr key={user.id}>
                                                    <td>{from + index}</td>
                                                    <td>{user.name} <br /> <span className="text-muted">#{user.employee_id}</span></td>
                                                    <td>{user.department?.name || 'N/A'}</td>
                                                    <td>
                                                        <ul className="ps-3 mb-0">
                                                            {user.leaves?.map(leave => <li key={leave.id}><b>{leave.name}:</b> {leave.qty}</li>)}
                                                        </ul>
                                                    </td>

                                                    <td>
                                                        <ul className="ps-3 mb-0">
                                                            {user.leaves?.map(leave => {
                                                                // Read directly from the pivot data
                                                                const remaining = leave.pivot?.remaining_days || 0;
                                                                return <li key={leave.id}><b>{leave.name}:</b> {Number(remaining).toFixed(1)}</li>;
                                                            })}
                                                        </ul>
                                                    </td>



                                                    {showActions && (

                                                        <td>
                                                            <ul className="action d-flex gap-2 list-unstyled mb-0">

                                                                {canEdit && (


                                                                    <li>
                                                                        <button onClick={() => openEditModal(user.id)} className="text-warning btn btn-link p-0 border-0">
                                                                            <Edit size={16} />
                                                                        </button>
                                                                    </li>

                                                                )}


                                                                {canDelete && (

                                                                    <li>
                                                                        <button onClick={() => openDeleteModal(user)} className="text-danger btn btn-link p-0 border-0">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </li>

                                                                )}
                                                            </ul>
                                                        </td>


                                                    )}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center text-muted p-4">No leave records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
              
                    </CardBody>

                      <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={from}
                                to={to}
                                total={numberOfAssignLeaves}
                            />
                            <Pagination
                                currentPage={currentPage}
                                lastPage={lastPage}
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
                                <h5 className="modal-title">Assign Leave</h5>
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
                                                    <span className="dropdown-item text-muted">No unassigned employees found</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Leave Tags Input */}
                                    <div className="form-group search-suggestion-container" style={{ position: 'relative' }}>
                                        <label className="form-label">Select Leaves (*)</label>
                                        <div className="form-control d-flex flex-wrap gap-1 align-items-center" style={{ minHeight: '40px' }}>
                                            {addLeaveIds.map(id => {
                                                const leave = leaves.find(l => l.id === id);
                                                if (!leave) return null;
                                                return (
                                                    <span key={id} className="badge bg-primary d-flex align-items-center gap-1" style={{ padding: '5px 10px' }}>
                                                        {leave.name}
                                                        <button type="button" className="btn btn-sm btn-link text-white p-0 border-0" onClick={() => toggleAddLeave(id)}>
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                            <input
                                                type="text"
                                                className="border-0 flex-grow-1"
                                                style={{ outline: 'none', minWidth: '120px', backgroundColor: 'transparent', boxShadow: 'none' }}
                                                placeholder={addLeaveIds.length === 0 ? "Click to select leaves..." : ""}
                                                value={addLeaveSearch}
                                                onChange={(e) => setAddLeaveSearch(e.target.value)}
                                                onClick={() => setShowAddLeaveSuggestions(true)}
                                                onFocus={() => setShowAddLeaveSuggestions(true)}
                                            />
                                        </div>
                                        {showAddLeaveSuggestions && (
                                            <div className="dropdown-menu show" style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                                                {filteredAddLeaves.length > 0 ? (
                                                    filteredAddLeaves.map(leave => {
                                                        const isSelected = addLeaveIds.includes(leave.id);
                                                        return (
                                                            <a
                                                                key={leave.id}
                                                                className={`dropdown-item d-flex justify-content-between align-items-center ${isSelected ? 'bg-light text-primary' : ''}`}
                                                                href="javascript:void(0)"
                                                                onClick={() => toggleAddLeave(leave.id)}
                                                            >
                                                                {leave.name}
                                                                {isSelected && <Check size={16} />}
                                                            </a>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="dropdown-item text-muted">No leaves found</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Close</button>
                                    {canCreate && (

                                        <button type="submit" className="btn btn-primary" disabled={!addEmployeeId || addLeaveIds.length === 0}>Save changes</button>

                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            {canEdit && (

                <>
                    {/* Edit Modal */}
                    {editModalOpen && editData && (
                        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Update Leaves</h5>
                                        <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)}></button>
                                    </div>
                                    <form onSubmit={handleEditSubmit}>
                                        <div className="modal-body">
                                            <div className="form-group mb-3">
                                                <label className="form-label">Select User (*)</label>
                                                <input type="text" className="form-control" value={editData.name || ''} readOnly />
                                            </div>

                                            {/* Leave Tags Input */}
                                            <div className="form-group search-suggestion-container" style={{ position: 'relative' }}>
                                                <label className="form-label">Select Leaves (*)</label>
                                                <div className="form-control d-flex flex-wrap gap-1 align-items-center" style={{ minHeight: '40px' }}>
                                                    {editLeaveIds.map(id => {
                                                        const leave = leaves.find(l => l.id === id);
                                                        if (!leave) return null;
                                                        return (
                                                            <span key={id} className="badge bg-primary d-flex align-items-center gap-1" style={{ padding: '5px 10px' }}>
                                                                {leave.name}
                                                                <button type="button" className="btn btn-sm btn-link text-white p-0 border-0" onClick={() => toggleEditLeave(id)}>
                                                                    <X size={14} />
                                                                </button>
                                                            </span>
                                                        );
                                                    })}
                                                    <input
                                                        type="text"
                                                        className="border-0 flex-grow-1"
                                                        style={{ outline: 'none', minWidth: '120px', backgroundColor: 'transparent', boxShadow: 'none' }}
                                                        placeholder={editLeaveIds.length === 0 ? "Click to select leaves..." : ""}
                                                        value={editLeaveSearch}
                                                        onChange={(e) => setEditLeaveSearch(e.target.value)}
                                                        onClick={() => setShowEditLeaveSuggestions(true)}
                                                        onFocus={() => setShowEditLeaveSuggestions(true)}
                                                    />
                                                </div>
                                                {showEditLeaveSuggestions && (
                                                    <div className="dropdown-menu show" style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                                                        {filteredEditLeaves.length > 0 ? (
                                                            filteredEditLeaves.map(leave => {
                                                                const isSelected = editLeaveIds.includes(leave.id);
                                                                return (
                                                                    <a
                                                                        key={leave.id}
                                                                        className={`dropdown-item d-flex justify-content-between align-items-center ${isSelected ? 'bg-light text-primary' : ''}`}
                                                                        href="javascript:void(0)"
                                                                        onClick={() => toggleEditLeave(leave.id)}
                                                                    >
                                                                        {leave.name}
                                                                        {isSelected && <Check size={16} />}
                                                                    </a>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="dropdown-item text-muted">No leaves found</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Close</button>
                                            {canEdit && (


                                                <button type="submit" className="btn btn-primary" disabled={editLeaveIds.length === 0}>Save changes</button>

                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </>

            )}



            {canDelete && (


                <DeleteConfirmModal
                    key={selectedUser?.id || 'no-user'}
                    open={deleteModalOpen}
                    onOpenChange={(open) => {
                        if (deleting) return;
                        setDeleteModalOpen(open);
                        if (!open) setSelectedUser(null);
                    }}
                    processing={deleting}
                    onConfirm={confirmDelete}
                />

            )}

        </>
    );
}








