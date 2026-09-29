import { Head, router } from '@inertiajs/react';

import { ArrowLeft } from 'lucide-react';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardHeader } from '@/components/ui/card';

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

type Product = {
    id: number;

    code: string;

    name: string;

    unit: string | null;

    reorder_level: number;
};

type Summary = {
    warehouse_count: number;

    total_quantity: number;

    total_reserved_quantity: number;

    total_available_quantity: number;

    is_reorder: boolean;
};

type StockRow = {
    id: number;

    warehouse_id: number;

    warehouse: {
        id: number;

        name: string;
    } | null;

    unit: string | null;

    quantity: number;

    reserved_quantity: number;

    available_quantity: number;

    is_reorder: boolean;
};

type Props = {
    product: Product;

    summary: Summary;

    stocks: StockRow[];
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ShowProductStock({ product, summary, stocks }: Props) {
    return (
        <>
            <Head title={`${product.name} Stock`} />

            <PageTitle title="Product Stock Details" />

            <div className="container-fluid">
                {/*
                |--------------------------------------------------------------------------
                | Product Information
                |--------------------------------------------------------------------------
                */}

                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div>
                                <h5 className="mb-1">{product.name}</h5>

                                <div className="text-muted">
                                    {product.code}

                                    {product.unit && (
                                        <>
                                            {' • '}
                                            {product.unit}
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                appearance="outline"
                                onClick={() =>
                                    router.visit('/inventory/stocks')
                                }
                            >
                                <ArrowLeft size={16} className="me-1" />
                                Back
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {/*
                        |--------------------------------------------------------------------------
                        | Summary
                        |--------------------------------------------------------------------------
                        */}

                        <div className="row g-3">
                            <div className="col-md-3">
                                <div className="border rounded p-3 h-100">
                                    <div className="text-muted small mb-1">
                                        Warehouses
                                    </div>

                                    <h4 className="mb-0">
                                        {summary.warehouse_count}
                                    </h4>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="border rounded p-3 h-100">
                                    <div className="text-muted small mb-1">
                                        Physical Stock
                                    </div>

                                    <h4 className="mb-0">
                                        {Number(summary.total_quantity).toFixed(
                                            2,
                                        )}
                                    </h4>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="border rounded p-3 h-100">
                                    <div className="text-muted small mb-1">
                                        Reserved
                                    </div>

                                    <h4 className="mb-0">
                                        {Number(
                                            summary.total_reserved_quantity,
                                        ).toFixed(2)}
                                    </h4>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="border rounded p-3 h-100">
                                    <div className="text-muted small mb-1">
                                        Available
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">
                                            {Number(
                                                summary.total_available_quantity,
                                            ).toFixed(2)}
                                        </h4>

                                        <span
                                            className={`badge ${
                                                summary.is_reorder
                                                    ? 'bg-danger'
                                                    : 'bg-success'
                                            }`}
                                        >
                                            {summary.is_reorder
                                                ? 'Reorder'
                                                : 'OK'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*
                        |--------------------------------------------------------------------------
                        | Reorder Level
                        |--------------------------------------------------------------------------
                        */}

                        <div className="mt-3">
                            <span className="text-muted">Reorder Level:</span>{' '}
                            <strong>
                                {Number(product.reorder_level).toFixed(2)}
                            </strong>
                        </div>
                    </CardBody>
                </Card>

                {/*
                |--------------------------------------------------------------------------
                | Warehouse Breakdown
                |--------------------------------------------------------------------------
                */}

                <Card className="mt-4">
                    <CardHeader>
                        <div>
                            <h5 className="mb-1">Warehouse Stock</h5>

                            <p className="text-muted mb-0">
                                Stock quantity by warehouse.
                            </p>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL</TableHead>

                                    <TableHead>Warehouse</TableHead>

                                    <TableHead>Unit</TableHead>

                                    <TableHead>Physical</TableHead>

                                    <TableHead>Reserved</TableHead>

                                    <TableHead>Available</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {stocks.length > 0 ? (
                                    stocks.map((stock, index) => (
                                        <TableRow key={stock.id}>
                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>
                                                <strong>
                                                    {stock.warehouse?.name}
                                                </strong>
                                            </TableCell>

                                            <TableCell>{stock.unit}</TableCell>

                                            <TableCell>
                                                {Number(stock.quantity).toFixed(
                                                    2,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {Number(
                                                    stock.reserved_quantity,
                                                ).toFixed(2)}
                                            </TableCell>

                                            <TableCell>
                                                <strong>
                                                    {Number(
                                                        stock.available_quantity,
                                                    ).toFixed(2)}
                                                </strong>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted py-5"
                                        >
                                            No warehouse stock found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
