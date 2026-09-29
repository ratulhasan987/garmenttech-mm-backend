import { FormEvent } from 'react';

import {
    router,
    useForm,
} from '@inertiajs/react';

import { ArrowLeft } from 'react-feather';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

import { DatePicker } from '@/components/ui/form/date-picker';

import type {
    SalesInvoice,
    SalesPayment,
} from '@/types/sales';

type Props = {
    invoices: SalesInvoice[];
    payment?: SalesPayment | null;
};

function localDate(): string {
    const date = new Date();

    const offset =
        date.getTimezoneOffset() * 60000;

    return new Date(
        date.getTime() - offset,
    )
        .toISOString()
        .slice(0, 10);
}

export default function SalesPaymentForm({
    invoices,
    payment = null,
}: Props) {
    const isEdit = Boolean(payment);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm({
        sales_invoice_id: payment
            ? String(payment.sales_invoice_id)
            : '',

        payment_date: payment?.payment_date
            ? String(
                  payment.payment_date,
              ).slice(0, 10)
            : localDate(),

        amount: payment
            ? String(payment.amount)
            : '',

        payment_method:
            payment?.payment_method ??
            'cash',

        reference:
            payment?.reference ?? '',

        remarks:
            payment?.remarks ?? '',
    });

    const selectedInvoice =
        invoices.find(
            (invoice) =>
                String(invoice.id) ===
                data.sales_invoice_id,
        );

    const currentPaymentAmount =
        payment &&
        String(payment.sales_invoice_id) ===
            data.sales_invoice_id
            ? Number(payment.amount ?? 0)
            : 0;

    const availableAmount =
        selectedInvoice
            ? Number(
                  selectedInvoice.due_amount ??
                      0,
              ) +
              currentPaymentAmount
            : 0;

    const handleInvoiceChange = (
        value: string,
    ) => {
        setData(
            'sales_invoice_id',
            value,
        );

        const invoice =
            invoices.find(
                (item) =>
                    String(item.id) ===
                    value,
            );

        if (!invoice) {
            setData('amount', '');
            return;
        }

        if (
            isEdit &&
            payment &&
            String(payment.sales_invoice_id) ===
                value
        ) {
            setData(
                'amount',
                String(
                    Number(
                        invoice.due_amount ??
                            0,
                    ) +
                        Number(
                            payment.amount ??
                                0,
                        ),
                ),
            );

            return;
        }

        setData(
            'amount',
            String(
                invoice.due_amount ?? 0,
            ),
        );
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (isEdit && payment) {
            put(
                `/operations/sales/payments/${payment.id}`,
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        post(
            '/operations/sales/payments',
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">
                                {isEdit
                                    ? 'Edit Sales Payment'
                                    : 'Record Sales Payment'}
                            </h5>

                            <p className="text-muted mb-0">
                                {isEdit
                                    ? 'Update sales payment information.'
                                    : 'Record a payment against an approved sales invoice.'}
                            </p>
                        </div>

                        {isEdit &&
                            payment && (
                                <span className="badge bg-light text-dark">
                                    {
                                        payment.payment_no
                                    }
                                </span>
                            )}
                    </div>
                </CardHeader>

                <CardBody>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">
                                Sales Invoice
                                <span className="text-danger">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <select
                                className="form-select"
                                value={
                                    data.sales_invoice_id
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleInvoiceChange(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    processing
                                }
                            >
                                <option value="">
                                    Select Invoice
                                </option>

                                {invoices.map(
                                    (
                                        invoice,
                                    ) => (
                                        <option
                                            key={
                                                invoice.id
                                            }
                                            value={
                                                invoice.id
                                            }
                                        >
                                            {
                                                invoice.invoice_no
                                            }{' '}
                                            -{' '}
                                            {
                                                invoice
                                                    .client
                                                    ?.name
                                            }{' '}
                                            - Due:{' '}
                                            {
                                                invoice.due_amount
                                            }
                                        </option>
                                    ),
                                )}
                            </select>

                            {errors.sales_invoice_id && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.sales_invoice_id
                                    }
                                </div>
                            )}
                        </div>

                        {selectedInvoice && (
                            <div className="col-12">
                                <div className="border rounded p-3">
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <small className="text-muted d-block">
                                                Invoice
                                            </small>

                                            <strong>
                                                {
                                                    selectedInvoice.invoice_no
                                                }
                                            </strong>
                                        </div>

                                        <div className="col-md-3">
                                            <small className="text-muted d-block">
                                                Customer
                                            </small>

                                            <strong>
                                                {
                                                    selectedInvoice
                                                        .client
                                                        ?.name ??
                                                    '-'
                                                }
                                            </strong>
                                        </div>

                                        <div className="col-md-3">
                                            <small className="text-muted d-block">
                                                Invoice Total
                                            </small>

                                            <strong>
                                                {Number(
                                                    selectedInvoice.grand_total ??
                                                        0,
                                                ).toLocaleString(
                                                    'en-US',
                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </strong>
                                        </div>

                                        <div className="col-md-3">
                                            <small className="text-muted d-block">
                                                Available Due
                                            </small>

                                            <strong className="text-danger">
                                                {availableAmount.toLocaleString(
                                                    'en-US',
                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="col-md-6">
                            <label className="form-label">
                                Payment Date
                                <span className="text-danger">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <DatePicker
                                value={
                                    data.payment_date
                                }
                                error={
                                    errors.payment_date
                                }
                                onChange={(
                                    value,
                                ) =>
                                    setData(
                                        'payment_date',
                                        value,
                                    )
                                }
                            />

                            {errors.payment_date && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.payment_date
                                    }
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Amount
                                <span className="text-danger">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="form-control"
                                value={
                                    data.amount
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'amount',
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                disabled={
                                    processing
                                }
                            />

                            {selectedInvoice && (
                                <small className="text-muted">
                                    Maximum:{' '}
                                    {availableAmount.toLocaleString(
                                        'en-US',
                                        {
                                            minimumFractionDigits: 2,
                                        },
                                    )}
                                </small>
                            )}

                            {errors.amount && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.amount
                                    }
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Payment Method
                                <span className="text-danger">
                                    {' '}
                                    *
                                </span>
                            </label>

                            <select
                                className="form-select"
                                value={
                                    data.payment_method
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'payment_method',
                                        event.target
                                            .value,
                                    )
                                }
                                disabled={
                                    processing
                                }
                            >
                                <option value="cash">
                                    Cash
                                </option>

                                <option value="bank">
                                    Bank
                                </option>

                                <option value="card">
                                    Card
                                </option>

                                <option value="mobile_banking">
                                    Mobile Banking
                                </option>

                                <option value="cheque">
                                    Cheque
                                </option>

                                <option value="other">
                                    Other
                                </option>
                            </select>

                            {errors.payment_method && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.payment_method
                                    }
                                </div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Reference
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={
                                    data.reference
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'reference',
                                        event.target
                                            .value,
                                    )
                                }
                                disabled={
                                    processing
                                }
                            />

                            {errors.reference && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.reference
                                    }
                                </div>
                            )}
                        </div>

                        <div className="col-12">
                            <label className="form-label">
                                Remarks
                            </label>

                            <textarea
                                className="form-control"
                                rows={4}
                                value={
                                    data.remarks
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setData(
                                        'remarks',
                                        event.target
                                            .value,
                                    )
                                }
                                disabled={
                                    processing
                                }
                            />

                            {errors.remarks && (
                                <div className="text-danger small mt-1">
                                    {
                                        errors.remarks
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
                        <Button
                            type="button"
                            variant="secondary"
                            appearance="outline"
                            disabled={
                                processing
                            }
                            onClick={() =>
                                router.visit(
                                    '/operations/sales/payments',
                                )
                            }
                        >
                            <ArrowLeft
                                size={16}
                                className="me-1"
                            />

                            Back
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                processing
                            }
                        >
                            {processing
                                ? 'Saving...'
                                : isEdit
                                  ? 'Update Payment'
                                  : 'Record Payment'}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </form>
    );
}