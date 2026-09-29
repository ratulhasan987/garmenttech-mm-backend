import { Head, Link, router } from '@inertiajs/react';
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
import type { FinancePage } from '@/types/finance';
import { DatePicker } from '@/components/ui/form/date-picker';

type Props = {
    kind: 'payables' | 'receivables';
    data: FinancePage;
    filters: {
        search?: string;
        status?: string;
        source_type?: string;
        from?: string;
        to?: string;
    };
};

export default function AccountIndex({ kind, data, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [sourceType, setSourceType] = useState(filters.source_type ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const title = kind === 'payables' ? 'Payables' : 'Receivables';
    const money = (value: string) =>
        Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            `/finance/${kind}`,
            { search, status, source_type: sourceType, from, to },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title={title} />
            <PageTitle title={title} />
            <div className="container-fluid">
                <Card>
                    <CardHeader
                        title={title}
                        description={
                            kind === 'payables'
                                ? 'Vendor bills waiting to be paid.'
                                : 'Amounts to collect from customers and vendors.'
                        }
                    />
                    <CardBody>
                        <form className="row g-2 mb-3" onSubmit={submit}>
                            <div className="col-md-3">
                                <input
                                    className="form-control"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search document or party"
                                />
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">All statuses</option>
                                    <option value="open">Open</option>
                                    <option value="partial">Partial</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            {kind === 'receivables' && (
                                <div className="col-md-2">
                                    <select
                                        className="form-select"
                                        value={sourceType}
                                        onChange={(e) =>
                                            setSourceType(e.target.value)
                                        }
                                    >
                                        <option value="">All sources</option>
                                        <option value="sales_invoice">
                                            Sales invoices
                                        </option>
                                        <option value="purchase_return">
                                            Purchase returns
                                        </option>
                                    </select>
                                </div>
                            )}
                            <div className="col-md-2">
                                <DatePicker
                                    id="finance-date-from"
                                    mode="single"
                                    value={from}
                                    placeholder="From Date"
                                    onChange={(value) => setFrom(value)}
                                    dateFormat="Y-m-d"
                                    displayFormat="Y-m-d"
                                />
                            </div>
                            <div className="col-md-2">
                                <DatePicker
                                    id="finance-date-to"
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
                                    <TableHead>Document</TableHead>
                                    <TableHead>Party</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead className="text-end">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-end">
                                        Balance
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.length ? (
                                    data.data.map((account) => (
                                        <TableRow key={account.id}>
                                            <TableCell>
                                                {account.document_no}
                                            </TableCell>
                                            <TableCell>
                                                {account.client?.name ??
                                                    account.vendor?.name ??
                                                    '—'}
                                            </TableCell>
                                            <TableCell>
                                                {account.document_date}
                                            </TableCell>
                                            <TableCell>
                                                {account.due_date}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                {money(account.amount)}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                {money(account.balance)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`badge badge-light-${account.status === 'closed' ? 'success' : account.status === 'partial' ? 'warning' : 'danger'}`}
                                                >
                                                    {account.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <Link
                                                    className="btn btn-sm btn-outline-primary"
                                                    href={`/finance/${kind}/${account.id}`}
                                                >
                                                    View
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-4"
                                        >
                                            No records found.
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
            </div>
        </>
    );
}
