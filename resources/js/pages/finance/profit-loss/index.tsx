import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

type Breakdown = {
    transaction_type: string;
    direction: 'inflow' | 'outflow';
    total: string;
};
export default function Page(props: {
    from: string;
    to: string;
    inflow: number;
    outflow: number;
    net: number;
    breakdown: Breakdown[];
}) {
    const [from, setFrom] = useState(props.from);
    const [to, setTo] = useState(props.to);
    const money = (value: number | string) =>
        Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/finance/profit-loss',
            { from, to },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Profit / Loss" />
            <PageTitle title="Profit / Loss" />
            <div className="container-fluid">
                <Card>
                    <CardHeader
                        title="Cash Profit / Loss"
                        description="Actual money collected minus actual money paid, including tax."
                    />
                    <CardBody>
                        <form className="row g-2" onSubmit={submit}>
                            <div className="col-md-4">
                                <label className="form-label">From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button className="btn btn-primary w-100">
                                    Apply
                                </button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
                <div className="row">
                    <div className="col-md-4">
                        <Card>
                            <CardBody>
                                <small>Total money in</small>
                                <h3 className="text-success mb-0">
                                    {money(props.inflow)}
                                </h3>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="col-md-4">
                        <Card>
                            <CardBody>
                                <small>Total money out</small>
                                <h3 className="text-danger mb-0">
                                    {money(props.outflow)}
                                </h3>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="col-md-4">
                        <Card>
                            <CardBody>
                                <small>
                                    {props.net >= 0 ? 'Profit' : 'Loss'}
                                </small>
                                <h3
                                    className={
                                        props.net >= 0
                                            ? 'text-success mb-0'
                                            : 'text-danger mb-0'
                                    }
                                >
                                    {money(Math.abs(props.net))}
                                </h3>
                            </CardBody>
                        </Card>
                    </div>
                </div>
                <Card>
                    <CardHeader title="Breakdown" />
                    <CardBody>
                        {props.breakdown.length ? (
                            props.breakdown.map((row) => (
                                <div
                                    className="d-flex justify-content-between border-bottom py-2"
                                    key={`${row.direction}-${row.transaction_type}`}
                                >
                                    <span className="text-capitalize">
                                        {row.transaction_type.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </span>
                                    <strong
                                        className={
                                            row.direction === 'inflow'
                                                ? 'text-success'
                                                : 'text-danger'
                                        }
                                    >
                                        {row.direction === 'inflow' ? '+' : '-'}
                                        {money(row.total)}
                                    </strong>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                No transactions in this period.
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
