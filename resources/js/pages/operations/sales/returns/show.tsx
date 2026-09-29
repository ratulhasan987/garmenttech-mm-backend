import { useState } from 'react';

import { Head, router } from '@inertiajs/react';

import { ArrowLeft, Download, Edit, Printer } from 'react-feather';

import PageTitle from '@/components/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Select } from '@/components/ui/form/select';
import { ConfirmModal } from '@/components/modals/confirm-modal';

type SalesReturnItem = {
    id: number;
    sales_invoice_item_id: number;
    product_id: number;
    quantity: number | string;
    unit_price: number | string;
    line_total: number | string;

    product?: {
        id: number;
        code?: string | null;
        name: string;

        unit?: {
            name: string;
        } | null;
    } | null;

    invoiceItem?: {
        id: number;
        quantity: number | string;
    } | null;
};

type SalesReturn = {
    id: number;
    return_no: string;
    sales_invoice_id: number;
    warehouse_id: number;
    return_date: string;
    total_amount: number | string;
    status: 'Pending' | 'Approved' | 'Rejected';
    remarks?: string | null;

    invoice?: {
        id: number;
        invoice_no: string;
        invoice_date?: string | null;

        client?: {
            id: number;
            name: string;
            client_id?: string | null;
            company_name?: string | null;
            phone?: string | null;
            address?: string | null;
        } | null;

        warehouse?: {
            id: number;
            code?: string | null;
            name: string;
        } | null;
    } | null;

    warehouse?: {
        id: number;
        code?: string | null;
        name: string;
    } | null;

    items: SalesReturnItem[];
};

type Props = {
    salesReturn: SalesReturn;
};

const money = (value: number | string) =>
    Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const statusClass = (status: SalesReturn['status']) => {
    if (status === 'Approved') {
        return 'bg-success';
    }

    if (status === 'Rejected') {
        return 'bg-danger';
    }

    return 'bg-warning text-dark';
};

export default function ShowSalesReturn({ salesReturn }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<
        'Approved' | 'Rejected' | ''
    >('');

    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const [processing, setProcessing] = useState(false);

    const [downloading, setDownloading] = useState(false);

    const handleStatusChange = (value: string) => {
        if (value !== 'Approved' && value !== 'Rejected') {
            setSelectedStatus('');
            return;
        }

        setSelectedStatus(value as 'Approved' | 'Rejected');

        setStatusModalOpen(true);
    };

    const confirmStatus = () => {
        if (!selectedStatus) {
            return;
        }

        router.patch(
            `/operations/sales/returns/${salesReturn.id}/status`,
            {
                status: selectedStatus,
            },
            {
                preserveScroll: true,

                onStart: () => {
                    setProcessing(true);
                },

                onSuccess: () => {
                    setStatusModalOpen(false);
                    setSelectedStatus('');
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handlePrint = () => {
        const iframe = document.createElement('iframe');

        iframe.style.display = 'none';

        iframe.src = `/operations/sales/returns/${salesReturn.id}/print`;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (error) {
                console.error(error);

                window.alert(
                    'Failed to print. Please download the PDF instead.',
                );

                iframe.remove();
            }
        };
    };

    const handleDownload = async () => {
        setDownloading(true);

        try {
            const response = await fetch(
                `/operations/sales/returns/${salesReturn.id}/download`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/pdf',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Failed to download PDF.');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = url;

            anchor.download = `sales_return_${salesReturn.return_no}.pdf`;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);

            window.alert('Failed to download PDF.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <Head title={`Sales Return ${salesReturn.return_no}`} />

            <PageTitle title={`Sales Return - ${salesReturn.return_no}`} />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">Sales Return</h5>

                                <div className="text-muted">
                                    {salesReturn.return_no}
                                </div>
                            </div>

                            <div className="d-flex align-items-end gap-2">
                                {salesReturn.status === 'Pending' && (
                                    <div style={{ minWidth: '200px' }}>
                                        {/* <label className="form-label mb-1">
                                            Update Status
                                        </label> */}

                                        <Select
                                            value={selectedStatus}
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    event.target.value,
                                                )
                                            }
                                            disabled={processing}
                                        >
                                            <option value="">
                                                Select Status
                                            </option>

                                            <option value="Approved">
                                                Approve
                                            </option>

                                            <option value="Rejected">
                                                Reject
                                            </option>
                                        </Select>
                                    </div>
                                )}

                            </div>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="row g-3 mb-4">
                            <div className="col-xl-3 col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <small className="text-muted d-block mb-1">
                                        Return No
                                    </small>

                                    <strong>{salesReturn.return_no}</strong>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <small className="text-muted d-block mb-1">
                                        Return Date
                                    </small>

                                    <strong>{salesReturn.return_date}</strong>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <small className="text-muted d-block mb-1">
                                        Invoice
                                    </small>

                                    <strong>
                                        {salesReturn.invoice?.invoice_no ?? '-'}
                                    </strong>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <small className="text-muted d-block mb-1">
                                        Status
                                    </small>

                                    <span
                                        className={`badge ${statusClass(
                                            salesReturn.status,
                                        )}`}
                                    >
                                        {salesReturn.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-lg-6">
                                <div className="border rounded p-3 h-100">
                                    <h6 className="mb-3">
                                        Customer Information
                                    </h6>

                                    <div className="row g-2">
                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Customer
                                            </small>

                                            <strong>
                                                {salesReturn.invoice?.client
                                                    ?.name ?? '-'}
                                            </strong>
                                        </div>

                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Customer ID
                                            </small>

                                            <strong>
                                                {salesReturn.invoice?.client
                                                    ?.client_id ?? '-'}
                                            </strong>
                                        </div>

                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Phone
                                            </small>

                                            <span>
                                                {salesReturn.invoice?.client
                                                    ?.phone ?? '-'}
                                            </span>
                                        </div>

                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Company
                                            </small>

                                            <span>
                                                {salesReturn.invoice?.client
                                                    ?.company_name ?? '-'}
                                            </span>
                                        </div>

                                        <div className="col-12">
                                            <small className="text-muted d-block">
                                                Address
                                            </small>

                                            <span>
                                                {salesReturn.invoice?.client
                                                    ?.address ?? '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="border rounded p-3 h-100">
                                    <h6 className="mb-3">Return Information</h6>

                                    <div className="row g-2">
                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Warehouse
                                            </small>

                                            <strong>
                                                {salesReturn.warehouse?.name ??
                                                    salesReturn.invoice
                                                        ?.warehouse?.name ??
                                                    '-'}
                                            </strong>
                                        </div>

                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Warehouse Code
                                            </small>

                                            <strong>
                                                {salesReturn.warehouse?.code ??
                                                    salesReturn.invoice
                                                        ?.warehouse?.code ??
                                                    '-'}
                                            </strong>
                                        </div>

                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Invoice Date
                                            </small>

                                            <span>
                                                {salesReturn.invoice
                                                    ?.invoice_date ?? '-'}
                                            </span>
                                        </div>

                                        <div className="col-sm-6">
                                            <small className="text-muted d-block">
                                                Return Amount
                                            </small>

                                            <strong>
                                                {money(
                                                    salesReturn.total_amount,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h6 className="mb-0">Returned Products</h6>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                                <thead>
                                    <tr>
                                        <th>SL</th>

                                        <th>Product</th>

                                        <th>Unit</th>

                                        <th className="text-end">Quantity</th>

                                        <th className="text-end">Unit Price</th>

                                        <th className="text-end">Line Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {salesReturn.items.length > 0 ? (
                                        salesReturn.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <strong>
                                                        {item.product?.name ??
                                                            '-'}
                                                    </strong>

                                                    {item.product?.code && (
                                                        <small className="d-block text-muted">
                                                            {item.product.code}
                                                        </small>
                                                    )}
                                                </td>

                                                <td>
                                                    {item.product?.unit?.name ??
                                                        '-'}
                                                </td>

                                                <td className="text-end">
                                                    {money(item.quantity)}
                                                </td>

                                                <td className="text-end">
                                                    {money(item.unit_price)}
                                                </td>

                                                <td className="text-end">
                                                    <strong>
                                                        {money(item.line_total)}
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center text-muted py-4"
                                            >
                                                No return items found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="row justify-content-end mt-3">
                            <div className="col-md-5 col-lg-4">
                                <div className="border rounded p-3">
                                    <div className="d-flex justify-content-between">
                                        <span>Return Total</span>

                                        <strong>
                                            {money(salesReturn.total_amount)}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {salesReturn.remarks && (
                            <div className="border rounded p-3 mt-4">
                                <h6 className="mb-2">Remarks</h6>

                                <p className="mb-0">{salesReturn.remarks}</p>
                            </div>
                        )}

                        <div className="d-flex justify-content-end align-items-end gap-2 flex-wrap mt-4 pt-4 border-top">
         
                            <Button
                                type="button"
                                variant="secondary"
                                appearance="outline"
                                onClick={() =>
                                    router.visit('/operations/sales/returns')
                                }
                            >
                                <ArrowLeft size={16} className="me-1" />
                                Back
                            </Button>

                            {salesReturn.status === 'Pending' && (
                                <Button
                                    type="button"
                                    variant="warning"
                                    appearance="outline"
                                    onClick={() =>
                                        router.visit(
                                            `/operations/sales/returns/${salesReturn.id}/edit`,
                                        )
                                    }
                                >
                                    <Edit size={16} className="me-1" />
                                    Edit
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="primary"
                                appearance="outline"
                                onClick={handlePrint}
                            >
                                <Printer size={16} className="me-1" />
                                Print
                            </Button>

                            <Button
                                type="button"
                                variant="success"
                                appearance="outline"
                                disabled={downloading}
                                onClick={() => void handleDownload()}
                            >
                                <Download size={16} className="me-1" />

                                {downloading ? 'Downloading...' : 'Download'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <ConfirmModal
                open={statusModalOpen}
                title={
                    selectedStatus === 'Approved'
                        ? 'Approve Sales Return'
                        : 'Reject Sales Return'
                }
                description={
                    selectedStatus === 'Approved'
                        ? 'Are you sure you want to approve this sales return? Stock will be increased in the return warehouse.'
                        : 'Are you sure you want to reject this sales return?'
                }
                confirmText={
                    selectedStatus === 'Approved' ? 'Approve' : 'Reject'
                }
                cancelText="Cancel"
                confirmVariant={
                    selectedStatus === 'Approved' ? 'success' : 'danger'
                }
                processing={processing}
                onConfirm={confirmStatus}
                onCancel={() => {
                    setStatusModalOpen(false);
                    setSelectedStatus('');
                }}
            />
        </>
    );
}
