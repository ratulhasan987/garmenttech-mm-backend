import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
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
import type { FinanceAccount } from '@/types/finance';

export default function AccountShow({
    kind,
    account,
}: {
    kind: 'payable' | 'receivable';
    account: FinanceAccount;
}) {
    const plural = kind === 'payable' ? 'payables' : 'receivables';
    const action = kind === 'payable' ? 'Pay' : 'Collect';
    const form = useForm({
        transaction_date: new Date().toISOString().slice(0, 10),
        amount: account.balance,
        payment_method: 'cash',
        reference: '',
        remarks: '',
    });
    const money = (value: string) =>
        Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(
            `/finance/${plural}/${account.id}/${kind === 'payable' ? 'pay' : 'collect'}`,
            {
                preserveScroll: true,
                onSuccess: () => form.reset('reference', 'remarks'),
            },
        );
    };
    const sourceUrl =
        kind === 'payable'
            ? `/bill/${account.bill_id}`
            : account.source_type === 'sales_invoice'
              ? `/operations/sales/invoices/${account.source_id}`
              : `/purchase-returns/${account.source_id}/show`;

    return (
        <>
            <Head title={`${action} ${account.document_no}`} />
            <PageTitle
                title={`${kind === 'payable' ? 'Payable' : 'Receivable'} Details`}
            />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xl-8">
                        <Card>
                            <CardHeader
                                title={account.document_no}
                                actions={
                                    <Link
                                        href={sourceUrl}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Source document
                                    </Link>
                                }
                            />
                            <CardBody>
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <small>Party</small>
                                        <div>
                                            {account.client?.name ??
                                                account.vendor?.name}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <small>Total</small>
                                        <div>{money(account.amount)}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <small>Balance</small>
                                        <div>{money(account.balance)}</div>
                                    </div>
                                </div>
                                <h5>Transactions</h5>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No.</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead className="text-end">
                                                Amount
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {account.transactions?.length ? (
                                            account.transactions.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                    >
                                                        <TableCell>
                                                            {
                                                                transaction.transaction_no
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                transaction.transaction_date
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.payment_method ??
                                                                '—'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.reference ??
                                                                '—'}
                                                        </TableCell>
                                                        <TableCell className="text-end">
                                                            {money(
                                                                transaction.amount,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center"
                                                >
                                                    No transactions yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="col-xl-4">
                        <Card>
                            <CardHeader title={action} />
                            <CardBody>
                                {account.status === 'closed' ? (
                                    <div className="alert alert-success mb-0">
                                        This account is fully settled.
                                    </div>
                                ) : (
                                    <form onSubmit={submit}>
                                        <label className="form-label">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control mb-3"
                                            value={form.data.transaction_date}
                                            onChange={(e) =>
                                                form.setData(
                                                    'transaction_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <label className="form-label">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            max={account.balance}
                                            className="form-control mb-3"
                                            value={form.data.amount}
                                            onChange={(e) =>
                                                form.setData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <label className="form-label">
                                            Method
                                        </label>
                                        <select
                                            className="form-select mb-3"
                                            value={form.data.payment_method}
                                            onChange={(e) =>
                                                form.setData(
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
                                            <option value="cheque">
                                                Cheque
                                            </option>
                                            <option value="other">Other</option>
                                        </select>
                                        <label className="form-label">
                                            Reference
                                        </label>
                                        <input
                                            className="form-control mb-3"
                                            value={form.data.reference}
                                            onChange={(e) =>
                                                form.setData(
                                                    'reference',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <label className="form-label">
                                            Remarks
                                        </label>
                                        <textarea
                                            className="form-control mb-3"
                                            value={form.data.remarks}
                                            onChange={(e) =>
                                                form.setData(
                                                    'remarks',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {Object.values(form.errors).map(
                                            (error) => (
                                                <div
                                                    className="text-danger mb-2"
                                                    key={error}
                                                >
                                                    {error}
                                                </div>
                                            ),
                                        )}
                                        <button
                                            disabled={form.processing}
                                            className="btn btn-primary w-100"
                                        >
                                            {action}
                                        </button>
                                    </form>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
