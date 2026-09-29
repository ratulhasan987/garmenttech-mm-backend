import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye } from 'react-feather';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
} from '@/components/ui/card';
import { Select } from '@/components/ui/form/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { TableEmpty } from '@/components/shared/table-empty';
import { rihoAsset } from '@/lib/riho';
import { usePermission } from '@/hooks/use-permission';


import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';


interface DocumentUser {
    id: number;
    name: string;
    employee_id: string;
    image: string | null;
    status: string;
    department_id: number | null;
    designation_id: number | null;
}

interface DepartmentOrDesignation {
    id: number;
    name: string;
}

interface DocumentItem {
    id: number;
    user_id: number;
    user: DocumentUser;
    department: DepartmentOrDesignation | null;
    designation: DepartmentOrDesignation | null;
    progress: number;
}

interface SelectedEmployee {
    id: number;
    name: string;
    employee_id: string;
}

interface PaginatedDocuments {
    data: DocumentItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    documents: PaginatedDocuments;
    numberOfDocuments: number;
    departments: DepartmentOrDesignation[];
    designations: DepartmentOrDesignation[];
    filters: {
        user?: string | number;
        department?: string | number;
        designation?: string | number;
        status?: string;
    };
    selectedUser: SelectedEmployee | null;
}

export default function DocumentIndex({
    documents,
    numberOfDocuments,
    departments,
    designations,
    filters,
    selectedUser,
}: Props) {
    const { can } = usePermission();

    const showActions = can('user.view') || can('user.edit') || can('user.delete');

    /*
    |--------------------------------------------------------------------------
    | Filter State
    |--------------------------------------------------------------------------
    */
    const [filterUser, setFilterUser] = useState<string>(
        filters.user ? String(filters.user) : ''
    );
    const [filterDepartment, setFilterDepartment] = useState<string>(
        filters.department ? String(filters.department) : ''
    );
    const [filterDesignation, setFilterDesignation] = useState<string>(
        filters.designation ? String(filters.designation) : ''
    );
    const [filterStatus, setFilterStatus] = useState<string>(
        filters.status || ''
    );

    /*
    |--------------------------------------------------------------------------
    | Employee Search State
    |--------------------------------------------------------------------------
    */
    const [employeeSearch, setEmployeeSearch] = useState<string>(
        selectedUser ? `${selectedUser.name} - ${selectedUser.employee_id}` : ''
    );
    const [suggestions, setSuggestions] = useState<SelectedEmployee[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestionRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchEmployees = useCallback(async (keyword: string = '') => {
        try {
            const res = await fetch(`/get-employees?keyword=${encodeURIComponent(keyword)}`);
            const data: SelectedEmployee[] = await res.json();
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
        } catch {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    const handleSearchInput = (value: string) => {
        setEmployeeSearch(value);
        setFilterUser('');

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchEmployees(value.trim());
        }, 300);
    };

    const handleSearchFocus = () => {
        if (filterUser) {
            setEmployeeSearch('');
            setFilterUser('');
        }
        fetchEmployees();
    };

    const handleSelectSuggestion = (emp: SelectedEmployee) => {
        setEmployeeSearch(`${emp.name} - ${emp.employee_id}`);
        setFilterUser(String(emp.id));
        setShowSuggestions(false);
    };

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(target) &&
                inputRef.current &&
                !inputRef.current.contains(target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Apply Filters
    |--------------------------------------------------------------------------
    */
    const applyFilters = () => {
        // Replaced route() with standard URL string
        router.get(
            '/document',
            {
                ...(filterUser && { user: filterUser }),
                ...(filterDepartment && { department: filterDepartment }),
                ...(filterDesignation && { designation: filterDesignation }),
                ...(filterStatus && { status: filterStatus }),
            },
            { preserveState: true, preserveScroll: true }
        );
    };




    const handlePageChange = (page: number) => {
        router.get(
            '/document',
            {
                page,
                ...(filterUser && { user: filterUser }),
                ...(filterDepartment && { department: filterDepartment }),
                ...(filterDesignation && { designation: filterDesignation }),
                ...(filterStatus && { status: filterStatus }),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };



    const progressColor = (p: number) => {
        if (p < 40) return 'bg-danger';
        if (p < 70) return 'bg-warning';
        return 'bg-success';
    };

    const serialNumber = (index: number) =>
        index + 1 + (documents.current_page - 1) * documents.per_page;

    return (
        <>
            <Head title="User Documents" />
            <PageTitle title="Document List" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {/* Employee Search */}
                            <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
                                <input
                                    type="text"
                                    ref={inputRef}
                                    className="form-control"
                                    placeholder="Search employees"
                                    autoComplete="off"
                                    value={employeeSearch}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    onFocus={handleSearchFocus}
                                />
                                {showSuggestions && (
                                    <div
                                        ref={suggestionRef}
                                        className="dropdown-menu show"
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            width: '100%',
                                            maxHeight: 200,
                                            overflowY: 'auto',
                                            zIndex: 1050,
                                        }}
                                    >
                                        {suggestions.length > 0 ? (
                                            suggestions.map((emp) => (
                                                <a
                                                    key={emp.id}
                                                    href="javascript:void(0)"
                                                    className="dropdown-item"
                                                    onClick={() => handleSelectSuggestion(emp)}
                                                >
                                                {emp.name} - {emp.employee_id}
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

                            {/* Department */}
                            <Select
                                id="department"
                                name="department"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="">All Department</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </Select>

                            {/* Designation */}
                            <Select
                                id="designation"
                                name="designation"
                                value={filterDesignation}
                                onChange={(e) => setFilterDesignation(e.target.value)}
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="">All Designation</option>
                                {designations.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </Select>

                            {/* Status */}
                            <Select
                                id="status"
                                name="status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ maxWidth: '160px' }}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Select>

                            <Button appearance="outline" onClick={applyFilters}>
                                Filter
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{ maxHeight: 'calc(100vh - 350px)' }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>SL</TableHead>
                                    <TableHead sticky>Image</TableHead>
                                    <TableHead sticky>Full Name</TableHead>
                                    <TableHead sticky>Department</TableHead>
                                    <TableHead sticky>Designation</TableHead>
                                    <TableHead sticky>Status</TableHead>
                                    <TableHead sticky>Progress</TableHead>
                                    {showActions && (
                                        <TableHead sticky>Action</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {documents.data.length > 0 ? (
                                    documents.data.map((doc, index) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>{serialNumber(index)}</TableCell>
                                            <TableCell>
                                                <img
                                                    src={
                                                        doc.user?.image
                                                            ? `/${doc.user.image}`
                                                            : rihoAsset('/images/avtar/3.jpg')
                                                    }
                                                    alt={doc.user?.name}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="d-flex flex-column">
                                                    <span>{doc.user?.name}</span>
                                                    <small className="text-muted">
                                                        #{doc.user?.employee_id}
                                                    </small>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {doc.department?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {doc.designation?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`status-badge ${
                                                        doc.user?.status === 'active'
                                                            ? 'active'
                                                            : 'inactive'
                                                    }`}
                                                >
                                                    {doc.user?.status
                                                        ? doc.user.status.charAt(0).toUpperCase() +
                                                          doc.user.status.slice(1)
                                                        : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className="progress"
                                                    style={{ height: 18, minWidth: '120px' }}
                                                >
                                                    <div
                                                        className={`progress-bar ${progressColor(
                                                            doc.progress
                                                        )}`}
                                                        role="progressbar"
                                                        style={{ width: `${doc.progress}%` }}
                                                        aria-valuenow={doc.progress}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    >
                                                        {doc.progress}%
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {showActions && (
                                                <TableCell>
                                                    <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
                                                        {can('user.view') && (
                                                            <li>
                                                                {/* Replaced route() with standard URL string */}
                                                                <Link
                                                                    href={`/document/${doc.id}/show`}
                                                                    className="btn btn-link p-0 border-0"
                                                                    title="View Document"
                                                                >
                                                                    <Eye size={20} />
                                                                </Link>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={showActions ? 8 : 7} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                              <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={documents.from ?? 0}
                                to={documents.to ?? 0}
                                total={numberOfDocuments}
                            />
                            <Pagination
                                currentPage={documents.current_page}
                                lastPage={documents.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Scoped Styles */}
            <style>{`
                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #fff;
                }
                .status-badge.active {
                    background-color: #28a745;
                }
                .status-badge.inactive {
                    background-color: #dc3545;
                }
                .progress {
                    background-color: #e9ecef;
                    border-radius: 0.25rem;
                }
                .progress-bar.bg-danger {
                    background-color: #dc3545 !important;
                }
                .progress-bar.bg-warning {
                    background-color: #ffc107 !important;
                }
                .progress-bar.bg-success {
                    background-color: #28a745 !important;
                }
            `}</style>
        </>
    );
}