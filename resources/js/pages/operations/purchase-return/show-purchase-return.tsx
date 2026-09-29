import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import { Trash, Edit, Printer, Download } from 'react-feather';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Vendor = {
    id: number;

    vendor_id: string | null;

    name: string;

    phone?: string | null;
};

type Warehouse = {
    id: number;

    name: string;
};

type Product = {
    id: number;

    code: string;

    name: string;
};

type PurchaseReturnItem = {
    id: number;

    product_id: number;

    quantity: number;

    unit_price: number;

    tax_amount: number;

    line_total: number;

    product: Product | null;
};

type User = {
    id: number;

    name: string;

    employee_id: string | null;
};

type PurchaseReturn = {
    id: number;

    return_no: string;

    status: 'Draft' | 'Approved' | 'Cancelled';

    return_date: string;

    subtotal: number;

    tax_amount: number;

    grand_total: number;

    note: string | null;

    document: string | null;

    vendor: Vendor | null;

    warehouse: Warehouse | null;

    purchase_order: {
        id: number;

        order_id: string;
    } | null;

    items: PurchaseReturnItem[];

    created_by?: User | null;

    createdBy?: User | null;

    approvedBy?: User | null;

    debit_note?: { id: number; debit_note_no: string } | null;

    receivable?: { id: number } | null;
};

type Props = {
    purchaseReturn: PurchaseReturn;
};

function formatMoney(value: number) {
    return Number(value ?? 0).toFixed(2);
}

function formatQuantity(value: number) {
    return Number(value ?? 0).toFixed(2);
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowPurchaseReturn({ purchaseReturn }: Props) {
    /*
    |--------------------------------------------------------------------------
    | Modal
    |--------------------------------------------------------------------------
    */

    const [showStatusModal, setShowStatusModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Selected Status
    |--------------------------------------------------------------------------
    */

    const [selectedStatus, setSelectedStatus] = useState<
        'Approved' | 'Cancelled' | ''
    >('');

    /*
    |--------------------------------------------------------------------------
    | Status Update
    |--------------------------------------------------------------------------
    */

    const openStatusModal = (status: 'Approved' | 'Cancelled') => {
        setSelectedStatus(status);

        setShowStatusModal(true);
    };

    const updateStatus = () => {
        if (!selectedStatus) {
            return;
        }

        router.post(
            `/purchase-returns/${purchaseReturn.id}/status`,

            {
                status: selectedStatus,
            },

            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowStatusModal(false);

                    setSelectedStatus('');
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const deletePurchaseReturn = () => {
        router.delete(
            `/purchase-returns/${purchaseReturn.id}`,

            {
                preserveScroll: true,

                onSuccess: () => {
                    router.visit('/purchase-returns');
                },
            },
        );
    };

    return (
        <>
            <Head title={`Purchase Return ${purchaseReturn.return_no}`} />

            <PageTitle
                title={`Purchase Return - ${purchaseReturn.return_no}`}
            />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div>
                                <h4 className="mb-1">
                                    {purchaseReturn.return_no}
                                </h4>

                                <span className="text-muted">
                                    Return Date: {purchaseReturn.return_date}
                                </span>
                            </div>

                            <div className="d-flex gap-2">
                                <Button
                                    type="button"
                                    variant="info"
                                    onClick={() => {
                                        router.visit('/purchase-returns');
                                    }}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="row">
                            <div className="col-md-3 mb-3">
                                <div className="text-muted">Status</div>

                                <div>
                                    {purchaseReturn.status === 'Draft' && (
                                        <span className="badge bg-warning">
                                            Draft
                                        </span>
                                    )}

                                    {purchaseReturn.status === 'Approved' && (
                                        <span className="badge bg-success">
                                            Approved
                                        </span>
                                    )}

                                    {purchaseReturn.status === 'Cancelled' && (
                                        <span className="badge bg-danger">
                                            Cancelled
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-3 mb-3">
                                <div className="text-muted">Vendor</div>

                                <strong>
                                    {purchaseReturn.vendor?.name ?? '-'}
                                </strong>
                            </div>

                            <div className="col-md-3 mb-3">
                                <div className="text-muted">Warehouse</div>

                                <strong>
                                    {purchaseReturn.warehouse?.name ?? '-'}
                                </strong>
                            </div>

                            <div className="col-md-3 mb-3">
                                <div className="text-muted">Purchase Order</div>

                                <strong>
                                    {purchaseReturn.purchase_order?.order_id ??
                                        '-'}
                                </strong>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div className="text-muted">Created By</div>

                                <strong>
                                    {purchaseReturn.createdBy?.name ?? '-'}
                                </strong>
                            </div>

                            <div className="col-md-6 mb-3">
                                <div className="text-muted">Approved By</div>

                                <strong>
                                    {purchaseReturn.approvedBy?.name ?? '-'}
                                </strong>
                            </div>
                        </div>

                        {purchaseReturn.note && (
                            <div className="mt-3">
                                <div className="text-muted">Note</div>

                                <p className="mb-0">{purchaseReturn.note}</p>
                            </div>
                        )}
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Return Items</h5>

                            {purchaseReturn.document && (
                                <a
                                    href={`/storage/${purchaseReturn.document}`}

                                    target="_blank"

                                    className="btn btn-sm btn-outline-primary"
                                >
                                    View Document
                                </a>
                            )}
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table wrapperClassName="overflow-auto">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL</TableHead>

                                    <TableHead>Product</TableHead>

                                    <TableHead className="text-end">
                                        Quantity
                                    </TableHead>

                                    <TableHead className="text-end">
                                        Unit Price
                                    </TableHead>

                                    <TableHead className="text-end">
                                        Tax
                                    </TableHead>

                                    <TableHead className="text-end">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {purchaseReturn.items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>

                                        <TableCell>
                                            <div>{item.product?.name}</div>

                                            <small className="text-muted">
                                                Code: {item.product?.code}
                                            </small>
                                        </TableCell>

                                        <TableCell className="text-end">
                                            {formatQuantity(item.quantity)}
                                        </TableCell>

                                        <TableCell className="text-end">
                                            {formatMoney(item.unit_price)}
                                        </TableCell>

                                        <TableCell className="text-end">
                                            {formatMoney(item.tax_amount)}
                                        </TableCell>

                                        <TableCell className="text-end">
                                            {formatMoney(item.line_total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="d-flex justify-content-end mt-4">
                            <table className="table table-borderless w-auto">
                                <tbody>
                                    <tr>
                                        <td>Sub Total</td>

                                        <td className="text-end">
                                            {formatMoney(
                                                purchaseReturn.subtotal,
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Tax</td>

                                        <td className="text-end">
                                            {formatMoney(
                                                purchaseReturn.tax_amount,
                                            )}
                                        </td>
                                    </tr>

                                    <tr className="fw-bold">
                                        <td>Grand Total</td>

                                        <td className="text-end">
                                            {formatMoney(
                                                purchaseReturn.grand_total,
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex justify-content-end">
                            <div className="d-flex gap-2">
                                {purchaseReturn.status === 'Draft' && (
                                    <>
                                        <Button
                                            type="button"

                                            variant="primary"

                                            appearance="outline"

                                            onClick={() =>
                                                router.visit(
                                                    `/purchase-returns/${purchaseReturn.id}/edit`,
                                                )
                                            }
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </Button>

                                        <Button
                                            type="button"

                                            variant="danger"

                                            appearance="outline"

                                            onClick={() =>
                                                setShowDeleteModal(true)
                                            }
                                        >
                                            <Trash size={16} />
                                            Delete
                                        </Button>
                                    </>
                                )}

                                {purchaseReturn.status === 'Draft' && (
                                    <>
                                        <Button
                                            type="button"

                                            variant="success"

                                            onClick={() =>
                                                openStatusModal('Approved')
                                            }
                                        >
                                            Approve
                                        </Button>

                                        <Button
                                            type="button"

                                            variant="danger"

                                            onClick={() =>
                                                openStatusModal('Cancelled')
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}

                                {purchaseReturn.debit_note && (
                                    <>
                                        <a
                                            className="btn btn-outline-primary"
                                            target="_blank"
                                            href={`/finance/vendor-debit-notes/${purchaseReturn.debit_note.id}/stream`}
                                        >
                                            <Printer size={16} /> Print debit
                                            note
                                        </a>
                                        <a
                                            className="btn btn-outline-primary"
                                            href={`/finance/vendor-debit-notes/${purchaseReturn.debit_note.id}/download`}
                                        >
                                            <Download size={16} /> Download
                                        </a>
                                    </>
                                )}

                                {purchaseReturn.receivable && (
                                    <Button
                                        type="button"
                                        variant="success"
                                        onClick={() =>
                                            router.visit(
                                                `/finance/receivables/${purchaseReturn.receivable?.id}`,
                                            )
                                        }
                                    >
                                        View receivable
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <ConfirmModal
                open={showStatusModal}

                title="Update Purchase Return Status"

                description={`Are you sure you want to change status to ${selectedStatus}?`}

                confirmText="Confirm"

                cancelText="Cancel"

                onConfirm={updateStatus}

                onOpenChange={() => {
                    setShowStatusModal(false);

                    setSelectedStatus('');
                }}
            />

            <ConfirmModal
                open={showDeleteModal}

                title="Delete Purchase Return"

                description={
                    'Are you sure you want to delete this purchase return?'
                }

                confirmText="Delete"

                cancelText="Cancel"

                confirmVariant="danger"

                onConfirm={deletePurchaseReturn}

                onOpenChange={() => setShowDeleteModal(false)}
            />
        </>
    );
}
