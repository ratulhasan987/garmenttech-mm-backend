import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { TransactionPage } from '@/types/finance';
import { DatePicker } from '@/components/ui/form/date-picker';

type SalesReturn = {
    id: number;
    return_no: string;
    return_date: string;
    total_amount: string;
    refunded_amount: string | null;
    invoice?: { client?: { name: string } | null } | null;
};
export default function Page({
    data,
    filters,
    salesReturns,
}: {
    data: TransactionPage;
    filters: {
        search?: string;
        direction?: string;
        transaction_type?: string;
        payment_method?: string;
        from?: string;
        to?: string;
    };
    salesReturns: SalesReturn[];
}) {
    const [direction, setDirection] = useState(filters.direction ?? '');
    const [search, setSearch] = useState(filters.search ?? '');
    const [transactionType, setTransactionType] = useState(
        filters.transaction_type ?? '',
    );
    const [paymentMethod, setPaymentMethod] = useState(
        filters.payment_method ?? '',
    );
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/finance/transactions',
            {
                search,
                direction,
                transaction_type: transactionType,
                payment_method: paymentMethod,
                from,
                to,
            },
            { preserveState: true, replace: true },
        );
    };
    const money = (value: string) =>
        Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    const refund = useForm({
        sales_return_id: salesReturns[0]?.id ?? 0,
        transaction_date: new Date().toISOString().slice(0, 10),
        amount: salesReturns[0]
            ? String(
                  Number(salesReturns[0].total_amount) -
                      Number(salesReturns[0].refunded_amount ?? 0),
              )
            : '',
        payment_method: 'cash',
        reference: '',
        remarks: '',
    });
    const chooseReturn = (id: number) => {
        const selected = salesReturns.find((item) => item.id === id);
        refund.setData({
            ...refund.data,
            sales_return_id: id,
            amount: selected
                ? String(
                      Number(selected.total_amount) -
                          Number(selected.refunded_amount ?? 0),
                  )
                : '',
        });
    };
    const submitRefund = (e: FormEvent) => {
        e.preventDefault();

        if (refund.data.sales_return_id) {
            refund.post(
                `/finance/sales-returns/${refund.data.sales_return_id}/refund`,
                { preserveScroll: true },
            );
        }
    };

    return (
        <>
            <Head title="Finance Transactions" />
            <PageTitle title="Transactions" />
            <div className="container-fluid">
                <Card>
                    <CardHeader
                        title="All Transactions"
                        description="Every finance collection and payment."
                    />
                    <CardBody>
                        <form className="row g-2 mb-3" onSubmit={submit}>
                            <div className="col-md-3">
                                <input
                                    className="form-control"
                                    placeholder="Transaction or reference"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={direction}
                                    onChange={(e) =>
                                        setDirection(e.target.value)
                                    }
                                >
                                    <option value="">All directions</option>
                                    <option value="inflow">Money in</option>
                                    <option value="outflow">Money out</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={transactionType}
                                    onChange={(e) =>
                                        setTransactionType(e.target.value)
                                    }
                                >
                                    <option value="">All types</option>
                                    <option value="customer_collection">
                                        Customer collection
                                    </option>
                                    <option value="vendor_collection">
                                        Vendor collection
                                    </option>
                                    <option value="vendor_payment">
                                        Vendor payment
                                    </option>
                                    <option value="customer_refund">
                                        Customer refund
                                    </option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                >
                                    <option value="">All methods</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="card">Card</option>
                                    <option value="mobile_banking">
                                        Mobile banking
                                    </option>
                                    <option value="cheque">Cheque</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <DatePicker
                                    id="filter-date-from"
                                    mode="single"
                                    value={from}
                                    placeholder="From Date"
                                    onChange={(value) => setFrom(value)}
                                    dateFormat="Y-m-d"
                                    displayFormat="Y-m-d"
                                />
                            </div>

                            <div className="col-md-3">
                                <DatePicker
                                    id="filter-date-to"
                                    mode="single"
                                    value={to}
                                    placeholder="To Date"
                                    onChange={(value) => setTo(value)}
                                    dateFormat="Y-m-d"
                                    displayFormat="Y-m-d"
                                    minDate={from || undefined}
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary w-100">
                                    Filter
                                </button>
                            </div>
                        </form>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-end">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length ? (
                                    data.data.map((transaction) => {
                                        const account =
                                            transaction.receivable ??
                                            transaction.payable;
                                        const path = transaction.receivable
                                            ? 'receivables'
                                            : 'payables';

                                        return (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    {transaction.transaction_no}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        transaction.transaction_date
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`badge badge-light-${transaction.direction === 'inflow' ? 'success' : 'danger'}`}
                                                    >
                                                        {transaction.transaction_type.replaceAll(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {account ? (
                                                        <Link
                                                            href={`/finance/${path}/${account.id}`}
                                                        >
                                                            {
                                                                account.document_no
                                                            }
                                                        </Link>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.payment_method ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.reference ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-end ${transaction.direction === 'inflow' ? 'text-success' : 'text-danger'}`}
                                                >
                                                    {transaction.direction ===
                                                    'inflow'
                                                        ? '+'
                                                        : '-'}
                                                    {money(transaction.amount)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-4"
                                        >
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {data.last_page > 1 && (
                            <div className="d-flex justify-content-between mt-3">
                                <span>
                                    Showing {data.from ?? 0}–{data.to ?? 0} of{' '}
                                    {data.total}
                                </span>
                                <div>
                                    <button
                                        disabled={!data.prev_page_url}
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() =>
                                            data.prev_page_url &&
                                            router.get(data.prev_page_url)
                                        }
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={!data.next_page_url}
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() =>
                                            data.next_page_url &&
                                            router.get(data.next_page_url)
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
                {salesReturns.length > 0 && (
                    <Card>
                        <CardHeader
                            title="Record Customer Refund"
                            description="Refunds for approved sales returns count as money out."
                        />
                        <CardBody>
                            <form className="row g-2" onSubmit={submitRefund}>
                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={refund.data.sales_return_id}
                                        onChange={(e) =>
                                            chooseReturn(Number(e.target.value))
                                        }
                                    >
                                        {salesReturns.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.return_no} —{' '}
                                                {item.invoice?.client?.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={refund.data.transaction_date}
                                        onChange={(e) =>
                                            refund.setData(
                                                'transaction_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        className="form-control"
                                        value={refund.data.amount}
                                        onChange={(e) =>
                                            refund.setData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-md-2">
                                    <select
                                        className="form-select"
                                        value={refund.data.payment_method}
                                        onChange={(e) =>
                                            refund.setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank">Bank</option>
                                        <option value="card">Card</option>
                                        <option value="mobile_banking">
                                            Mobile banking
                                        </option>
                                        <option value="cheque">Cheque</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <button
                                        disabled={refund.processing}
                                        className="btn btn-danger w-100"
                                    >
                                        Record refund
                                    </button>
                                </div>
                            </form>
                            {Object.values(refund.errors).map((error) => (
                                <div className="text-danger mt-2" key={error}>
                                    {error}
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                )}
            </div>
        </>
    );
}
