import { Head, router } from '@inertiajs/react';

import { Eye } from 'lucide-react';

import PageTitle from '@/components/page-title';

import { TableEmpty } from '@/components/shared/table-empty';

import { TablePaginationInfo } from '@/components/shared/table-pagination-info';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { Pagination } from '@/components/ui/pagination';

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

type Warehouse = {
    id: number;

    name: string;
};

type Product = {
    id: number;

    code: string;

    name: string;
};

type StockRow = {
    product_id: number;

    code: string;

    name: string;

    unit: string | null;

    total_quantity: number;

    total_reserved_quantity: number;

    total_available_quantity: number;

    warehouse_count: number;

    reorder_level: number;

    is_reorder: boolean;
};

type Page<T> = {
    data: T[];

    current_page: number;

    last_page: number;

    per_page: number;

    total: number;

    from: number | null;

    to: number | null;
};

type Props = {
    data: Page<StockRow>;

    warehouses: Warehouse[];

    products: Product[];

    filters: {
        warehouse_id?: number | null;

        product_id?: number | null;
    };
};

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ProductsStock({
    data,
    warehouses,
    products,
    filters,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const warehouseId = filters.warehouse_id ?? null;

    const productId = filters.product_id ?? null;

    /*
    |--------------------------------------------------------------------------
    | Navigate With Filters
    |--------------------------------------------------------------------------
    */

    const go = (
        warehouse_id: number | null,

        product_id: number | null,

        page?: number,
    ) => {
        router.get(
            '/inventory/stocks',
            {
                ...(warehouse_id
                    ? {
                          warehouse_id,
                      }
                    : {}),

                ...(product_id
                    ? {
                          product_id,
                      }
                    : {}),

                ...(page
                    ? {
                          page,
                      }
                    : {}),
            },
            {
                preserveState: true,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | View
    |--------------------------------------------------------------------------
    */

    const handleView = (row: StockRow) => {
        router.visit(`/inventory/stocks/${row.product_id}`);
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Product Stock" />

            <PageTitle title="Product Stock" />

            <div className="container-fluid">
                <Card>
                    {/*
                    |--------------------------------------------------------------------------
                    | Filters
                    |--------------------------------------------------------------------------
                    */}

                    <CardHeader>
                        <div className="row g-2 w-100">
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={warehouseId ?? ''}
                                    onChange={(event) =>
                                        go(
                                            event.target.value
                                                ? Number(event.target.value)
                                                : null,

                                            productId,
                                        )
                                    }
                                >
                                    <option value="">All Warehouses</option>

                                    {warehouses.map((warehouse) => (
                                        <option
                                            key={warehouse.id}
                                            value={warehouse.id}
                                        >
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-5">
                                <select
                                    className="form-select"
                                    value={productId ?? ''}
                                    onChange={(event) =>
                                        go(
                                            warehouseId,

                                            event.target.value
                                                ? Number(event.target.value)
                                                : null,
                                        )
                                    }
                                >
                                    <option value="">All Products</option>

                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.code}
                                            {' - '}
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(warehouseId || productId) && (
                                <div className="col-md-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        appearance="outline"
                                        className="w-100"
                                        onClick={() => go(null, null)}
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    {/*
                    |--------------------------------------------------------------------------
                    | Table
                    |--------------------------------------------------------------------------
                    */}

                    <CardBody>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL</TableHead>

                                    <TableHead>Product</TableHead>

                                    <TableHead>Unit</TableHead>

                                    <TableHead>Physical</TableHead>

                                    <TableHead>Reserved</TableHead>

                                    <TableHead>Available</TableHead>

                                    <TableHead>Warehouses</TableHead>

                                    <TableHead>Reorder Level</TableHead>

                                    <TableHead>Status</TableHead>

                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length > 0 ? (
                                    data.data.map((row, index) => (
                                        <TableRow key={row.product_id}>
                                            {/*
                                                |--------------------------------------------------------------------------
                                                | SL
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                {(data.current_page - 1) *
                                                    data.per_page +
                                                    index +
                                                    1}
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Product
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                <strong>{row.name}</strong>

                                                <div className="small text-muted">
                                                    {row.code}
                                                </div>
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Unit
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>{row.unit}</TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Total Physical
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                {Number(
                                                    row.total_quantity,
                                                ).toFixed(2)}
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Total Reserved
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                {Number(
                                                    row.total_reserved_quantity,
                                                ).toFixed(2)}
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Total Available
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                <strong>
                                                    {Number(
                                                        row.total_available_quantity,
                                                    ).toFixed(2)}
                                                </strong>
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Warehouses
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                <span className="badge bg-light text-dark">
                                                    {row.warehouse_count}
                                                </span>
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Reorder Level
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                {Number(
                                                    row.reorder_level,
                                                ).toFixed(2)}
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | Status
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                <span
                                                    className={`badge ${
                                                        row.is_reorder
                                                            ? 'bg-danger'
                                                            : 'bg-success'
                                                    }`}
                                                >
                                                    {row.is_reorder
                                                        ? 'Reorder'
                                                        : 'OK'}
                                                </span>
                                            </TableCell>

                                            {/*
                                                |--------------------------------------------------------------------------
                                                | View
                                                |--------------------------------------------------------------------------
                                                */}

                                            <TableCell>
                                                <button
                                                    type="button"
                                                    className="btn btn-link"
                                                    onClick={() =>
                                                        handleView(row)
                                                    }
                                                >
                                                    <Eye
                                                        size={16}
                                                    />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={10} />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    {/*
                    |--------------------------------------------------------------------------
                    | Pagination
                    |--------------------------------------------------------------------------
                    */}

                    <CardFooter>
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={data.from ?? 0}
                                to={data.to ?? 0}
                                total={data.total}
                            />

                            <Pagination
                                currentPage={data.current_page}
                                lastPage={data.last_page}
                                onPageChange={(page) =>
                                    go(warehouseId, productId, page)
                                }
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
