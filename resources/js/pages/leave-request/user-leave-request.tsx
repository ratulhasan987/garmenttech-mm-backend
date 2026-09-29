import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import { usePermission } from '@/hooks/use-permission';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

interface Leave {
    id: number;
    name: string;
    qty: number;
    total_qty: number;
    used_days: number;
    remaining_days: number;
}

interface LeaveRequestData {
    id: number;
    leave: { name: string };
    start_date: string;
    end_date: string;
    leave_type: string;
    sub_type: string;
    days: number;
    reporting_officer_status: string;
    status: string;
}

interface Props {
    leaves: Leave[];
    getRemainingleaves: Leave[];
    requests: { data: LeaveRequestData[]; from: number; to: number; total: number; links: any[]; current_page: number; last_page: number };
    numberOfRequests: number;
    shift: any;
}

export default function UserLeaveRequest({ leaves, getRemainingleaves, requests, numberOfRequests, shift }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<any>(null);
    const { can } = usePermission();

    const canLeave = can('user.leave');


    const form = useForm({
        leave: '',
        type: 'Full Day',
        sub_type: 'first_half_day',
        dates: '',
        reason: '',
        attachment: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            form.setData('attachment', e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/hr/leave-request', {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            }
        });
    };

    const openViewModal = async (id: number) => {
        const res = await fetch(`/hr/leave-request/${id}/show`);
        const data = await res.json();
        setViewData(data);
        setViewModalOpen(true);
    };

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
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
            <Head title="Leave Request" />
            <PageTitle title="Leave Request" />

            <div className="container-fluid">
                {/* Leave Balance Summary */}
                <Card className="mb-4">
                    <CardHeader className="bg-primary text-white">
                        <h5 className="mb-0 fw-bold text-white">Leave Balance Summary</h5>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="py-3 px-4 border-0 text-muted fw-semibold">Leave</th>
                                        <th className="py-3 px-4 border-0 text-muted fw-semibold text-center">Total</th>
                                        <th className="py-3 px-4 border-0 text-muted fw-semibold text-center">Used</th>
                                        <th className="py-3 px-4 border-0 text-muted fw-semibold text-center">Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave.id} className="border-bottom">
                                            <td className="py-3 px-4 fw-medium">{leave.name}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="badge bg-light text-dark fw-normal px-3 py-2 text-muted">{leave.total_qty} Days</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <div className="progress w-75 me-2" style={{ height: '8px' }}>
                                                        <div
                                                            className="progress-bar bg-info"
                                                            role="progressbar"
                                                            style={{ width: `${Math.min(100, (leave.used_days / leave.total_qty) * 100)}%` }}
                                                            aria-valuenow={leave.used_days}
                                                            aria-valuemin={0}
                                                            aria-valuemax={leave.total_qty}
                                                        ></div>
                                                    </div>
                                                    <span className="text-muted small">{Number(leave.used_days).toFixed(1)}d</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`badge ${leave.remaining_days > 5 ? 'bg-success' : leave.remaining_days > 2 ? 'bg-warning' : 'bg-danger'} rounded-pill px-3 py-2`}>
                                                    {Number(leave.remaining_days).toFixed(1)} Days
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                {/* Leave Requests List */}
                <Card>
                    <CardHeader className="px-3 py-3 d-flex justify-content-between align-items-center">

                        {canLeave && (

                            <Button type="button" onClick={() => setIsAddModalOpen(true)}>Leave Apply</Button>

                        )}



                        <h5 className="mb-0">My Leave Requests</h5>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Sl</th>
                                        <th>Leave Name</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.map((req, index) => (
                                        <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => openViewModal(req.id)}>
                                            <td>{requests.from + index}</td>
                                            <td>{req.leave.name}</td>
                                            <td>{req.start_date}</td>
                                            <td>{req.end_date}</td>
                                            <td>
                                                {req.leave_type} <br />
                                                <span style={{ fontSize: '11px' }}>
                                                    {req.leave_type === 'Half Day' ? (req.sub_type === 'first_half_day' ? 'First Half' : 'Second Half') : ''}
                                                </span>
                                            </td>
                                            <td>{req.leave_type === 'Half Day' ? Number(req.days).toFixed(1) : Math.round(Number(req.days))} Day</td>                                            <td>
                                                <span className={`badge ${getStatusClass(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </td>
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


            {canLeave && (
                <>
                    {/* Add Modal */}
                    {isAddModalOpen && (
                        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Leave Request</h5>
                                        <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="modal-body">
                                            <div className="mb-3">
                                                <label className="form-label">Select Leave (*)</label>
                                                <select
                                                    className="form-control"
                                                    value={form.data.leave}
                                                    onChange={e => form.setData('leave', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select One</option>
                                                    {getRemainingleaves.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                </select>
                                                {form.errors.leave && <div className="text-danger mt-1">{form.errors.leave}</div>}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Leave Type (*)</label>
                                                <select
                                                    className="form-control"
                                                    value={form.data.type}
                                                    onChange={e => form.setData('type', e.target.value as 'Full Day' | 'Half Day')}
                                                    required
                                                >
                                                    <option value="Full Day">Full Day</option>
                                                    <option value="Half Day">Half Day</option>
                                                </select>
                                            </div>

                                            {form.data.type === 'Half Day' && (
                                                <div className="mb-3">
                                                    <label className="form-label">Select one</label>
                                                    <select
                                                        className="form-control"
                                                        value={form.data.sub_type}
                                                        onChange={e => form.setData('sub_type', e.target.value as 'first_half_day' | 'second_half_day')}
                                                    >
                                                        <option value="first_half_day">1st Half ({shift?.shift_start_time} - {shift?.first_half_shift_end_time})</option>
                                                        <option value="second_half_day">2nd Half ({shift?.second_half_shift_start_time} - {shift?.shift_end_time})</option>
                                                    </select>
                                                </div>
                                            )}

                                            <div className="mb-3">
                                                <label className="form-label">Select Dates (*)</label>
                                                <DatePicker
                                                    value={form.data.dates}
                                                    placeholder="Select Dates"
                                                    disabled={false}
                                                    allowInput={false}
                                                    onChange={(dateString) => form.setData('dates', dateString)}
                                                    mode={form.data.type === 'Half Day' ? 'single' : 'range'}
                                                />
                                                {form.errors.dates && <div className="text-danger mt-1">{form.errors.dates}</div>}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Reason (*)</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    value={form.data.reason}
                                                    onChange={e => form.setData('reason', e.target.value)}
                                                    maxLength={255}
                                                    required
                                                />
                                                {form.errors.reason && <div className="text-danger mt-1">{form.errors.reason}</div>}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Attachment (Image or PDF, max 5 MB)</label>
                                                <input className="form-control" type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} />
                                                {form.errors.attachment && <div className="text-danger mt-1">{form.errors.attachment}</div>}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Close</button>
                                            <button type="submit" className="btn btn-primary" disabled={form.processing}>Save changes</button>
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
                                            <img
                                                src={viewData.employee_image ? `/${viewData.employee_image}` : '/avatar.png'}
                                                className="rounded-circle me-3"
                                                width="70" height="70"
                                                alt="Employee"
                                            />
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
                                        <div className="text-center mt-4">
                                            <b>Your Request Status is :</b> <span className={`badge ${getStatusClass(viewData.status)}`}>{viewData.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
