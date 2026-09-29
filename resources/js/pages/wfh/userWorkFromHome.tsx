import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/form/date-picker';
import { usePermission } from '@/hooks/use-permission';
import dayjs from 'dayjs';

interface WFH {
    id: number;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
    status: string;
    created_at: string;
}

interface Props {
    requests: WFH[];
}

export default function UserWorkFromHome({ requests }: Props) {

    const { can } = usePermission();
    const canCreate = can('user.WFH');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<any>(null);

    const form = useForm({
        dates: '',
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/hr/wfh', {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                form.reset();
            }
        });
    };

    const openViewModal = async (id: number) => {
        const res = await fetch(`/hr/wfh/${id}/show`);
        const data = await res.json();
        setViewData(data);
        setViewModalOpen(true);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            default: return 'bg-warning text-dark';
        }
    };



    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    };

    return (
        <>
            <Head title="Work From Home" />
            <PageTitle title="Work From Home" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center px-3 py-3">

                        {canCreate && (


                            <Button type="button" onClick={() => setIsModalOpen(true)}>Apply New</Button>

                        )}
                        <h5 className="mb-0"></h5>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive">
                            <table className="table" id="wfhTable">
                                <thead>
                                    <tr>
                                        <th>Sl</th>
                                        <th>Applied Day</th>
                                        <th>Date</th>
                                        <th>Duration</th>
                                       

                                            <th>Status</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req, index) => (
                                        <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => openViewModal(req.id)}>
                                            <td>{index + 1}</td>
                                            <td>{new Date(req.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            <td>
                                                {req.start_date === req.end_date
                                                    ? formatDate(req.start_date)
                                                    : `${formatDate(req.start_date)} to ${formatDate(req.end_date)}`
                                                }
                                            </td>
                                            <td>{req.days} Day(s)</td>


                           

                                                <td>
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
                </Card>
            </div>

            {/* Apply Modal */}
            {isModalOpen && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">WFH Request</h5>
                                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Select Dates (*)</label>
                                        {/* Using DatePicker with mode='range' to select multiple dates */}
                                        <DatePicker
                                            value={form.data.dates}
                                            placeholder="Select Dates"
                                            disabled={false}
                                            allowInput={false}
                                            onChange={(dateString) => form.setData('dates', dateString)}
                                            mode='range'
                                            minDate={dayjs().format('YYYY-MM-DD')}
                                        />
                                        {form.errors.dates && <div className="text-danger mt-1">{form.errors.dates}</div>}
                                    </div>

                                    <div className="form-group mb-3">
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
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
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
                                    <img src={viewData.employee_image ? `/${viewData.employee_image}` : '/avatar.png'} className="rounded-circle me-3" width="70" height="70" alt="Employee" />
                                    <div>
                                        <h5 className="mb-1 fw-semibold">{viewData.employee_name}</h5>
                                        <p className="mb-0 text-muted small">Employee ID: {viewData.employee_id || 'N/A'}</p>
                                    </div>
                                </div>
                                <table className="table table-borderless table-hover">
                                    <tbody>
                                        <tr><th className="text-muted fw-normal">Start</th><td>{viewData.start_date}</td></tr>
                                        <tr><th className="text-muted fw-normal">End</th><td>{viewData.end_date}</td></tr>
                                        <tr><th className="text-muted fw-normal">Duration</th><td>{viewData.quantity} Day(s)</td></tr>
                                        <tr><th className="text-muted fw-normal">Reason</th><td>{viewData.reason}</td></tr>
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
    );
}