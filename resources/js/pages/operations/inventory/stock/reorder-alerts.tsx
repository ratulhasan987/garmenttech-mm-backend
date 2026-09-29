import { Head, router } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import { TableEmpty } from '@/components/shared/table-empty';
type Warehouse = { id: number; name: string };
type Product = { id: number; code: string; name: string };
type Row = {
    id: number;
    unit: string | null;
    available_quantity: number;
    reorder_level: number;
    shortage: number;
    warehouse: Warehouse | null;
    product: Product | null;
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
    data: Page<Row>;
    warehouses: Warehouse[];
    products: Product[];
    filters: { warehouse_id?: number | null; product_id?: number | null };
};
export default function ReorderAlerts({
    data,
    warehouses,
    products,
    filters,
}: Props) {
    const warehouseId = filters.warehouse_id ?? null;

    const productId = filters.product_id ?? null;

    const go = (
        warehouse_id: number | null,
        product_id: number | null,
        page?: number,
    ) =>
        router.get(
            '/inventory/reorder-alerts',
            {
                ...(warehouse_id ? { warehouse_id } : {}),
                ...(product_id ? { product_id } : {}),
                ...(page ? { page } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    return (
        <>
            <Head title="Reorder Alert" />
            <PageTitle title="Reorder Alert" />
            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={warehouseId ?? ''}
                                    onChange={(e) =>
                                        go(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                            productId,
                                        )
                                    }
                                >
                                    <option value="">All Warehouses</option>
                                    {warehouses.map((x) => (
                                        <option key={x.id} value={x.id}>
                                            {x.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-5">
                                <select
                                    className="form-select"
                                    value={productId ?? ''}
                                    onChange={(e) =>
                                        go(
                                            warehouseId,
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                >
                                    <option value="">All Products</option>
                                    {products.map((x) => (
                                        <option key={x.id} value={x.id}>
                                            {x.code} - {x.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {(warehouseId || productId) && (
                                <div className="col-md-3">
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={() => go(null, null)}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SL</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead>Reorder Level</TableHead>
                                        <TableHead>Shortage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <tbody>
                                    {data.data.length ? (
                                        data.data.map((r, i) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    {(data.current_page - 1) *
                                                        data.per_page +
                                                        i +
                                                        1}
                                                </TableCell>
                                                <TableCell>
                                                    <strong>
                                                        {r.product?.name}
                                                    </strong>
                                                    <div className="small text-muted">
                                                        {r.product?.code}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {r.warehouse?.name}
                                                </TableCell>
                                                <TableCell>{r.unit}</TableCell>
                                                <TableCell>
                                                    <span className="badge bg-danger">
                                                        {Number(
                                                            r.available_quantity,
                                                        ).toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {Number(
                                                        r.reorder_level,
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <strong>
                                                        {Number(
                                                            r.shortage,
                                                        ).toFixed(2)}
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableEmpty colSpan={7} />
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                    <CardFooter className="d-flex justify-content-between">
                        <TablePaginationInfo
                            to={data?.to ?? 0}
                            total={data?.total}
                            from={data?.from ?? 0}
                        />

                        <Pagination
                            currentPage={data?.current_page}
                            lastPage={data?.last_page}
                            onPageChange={(page) =>
                                go(warehouseId, productId, page)
                            }
                        />
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
