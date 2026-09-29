import { useEffect, type FormEvent } from 'react';

import { useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';

import { AppModal } from '@/components/ui/modal/app-modal';

import type { SalesInvoice } from '@/types/sales';
import { DatePicker } from '@/components/ui/form/date-picker';

type Props = {
    open: boolean;

    onOpenChange: (open: boolean) => void;

    invoices: SalesInvoice[];
};

function localDate(): string {
    const date = new Date();

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function SalesPaymentModal({
    open,
    onOpenChange,
    invoices,
}: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            sales_invoice_id: '',
            payment_date: localDate(),
            amount: '',
            payment_method: 'cash',
            reference: '',
            remarks: '',
        });

        useEffect(() => {
    if (
        !open ||
        invoices.length !==
            1
    ) {
        return;
    }

    const invoice =
        invoices[0];

    setData(
        'sales_invoice_id',
        String(
            invoice.id,
        ),
    );

    setData(
        'amount',
        String(
            invoice.due_amount,
        ),
    );
}, [
    open,
    invoices,
]);

    const handleClose = () => {
        if (processing) {
            return;
        }

        reset();

        clearErrors();

        onOpenChange(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/operations/sales/payments', {
            preserveScroll: true,

            onSuccess: () => {
                handleClose();
            },
        });
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();
                }
            }}
            title="Record Sales Payment"
            size="lg"
            centered
            busy={processing}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="sales-payment-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Record Payment'}
                    </Button>
                </>
            }
        >
            <form id="sales-payment-form" onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Invoice</label>

                        <select
                            className="form-select"
                            value={data.sales_invoice_id}
                            onChange={(event) => {
                                const value = event.target.value;

                                setData('sales_invoice_id', value);

                                const invoice = invoices.find(
                                    (item) => String(item.id) === value,
                                );

                                if (invoice) {
                                    setData(
                                        'amount',
                                        String(invoice.due_amount),
                                    );
                                }
                            }}
                        >
                            <option value="">Select Invoice</option>

                            {invoices.map((invoice) => (
                                <option key={invoice.id} value={invoice.id}>
                                    {invoice.invoice_no} -{' '}
                                    {invoice.client?.name} - Due:{' '}
                                    {invoice.due_amount}
                                </option>
                            ))}
                        </select>

                        {errors.sales_invoice_id && (
                            <div className="text-danger small mt-1">
                                {errors.sales_invoice_id}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Payment Date</label>

                        <DatePicker
                            value={data.payment_date}
                            error={errors.payment_date}
                            onChange={(value) => setData('payment_date', value)}
                        />

                        {errors.payment_date && (
                            <div className="text-danger small mt-1">
                                {errors.payment_date}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Amount</label>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="form-control"
                            value={data.amount}
                            onChange={(event) =>
                                setData('amount', event.target.value)
                            }
                        />

                        {errors.amount && (
                            <div className="text-danger small mt-1">
                                {errors.amount}
                            </div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Payment Method</label>

                        <select
                            className="form-select"
                            value={data.payment_method}
                            onChange={(event) =>
                                setData('payment_method', event.target.value)
                            }
                        >
                            <option value="cash">Cash</option>

                            <option value="bank">Bank</option>

                            <option value="card">Card</option>

                            <option value="mobile_banking">
                                Mobile Banking
                            </option>

                            <option value="cheque">Cheque</option>

                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Reference</label>

                        <input
                            type="text"
                            className="form-control"
                            value={data.reference}
                            onChange={(event) =>
                                setData('reference', event.target.value)
                            }
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label">Remarks</label>

                        <textarea
                            className="form-control"
                            rows={3}
                            value={data.remarks}
                            onChange={(event) =>
                                setData('remarks', event.target.value)
                            }
                        />
                    </div>
                </div>
            </form>
        </AppModal>
    );
}
