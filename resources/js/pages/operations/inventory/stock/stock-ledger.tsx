import { Head, router } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { CardFooter, Card } from '@/components/ui/card';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';
type Warehouse = { id: number; name: string };
type Product = { id: number; code: string; name: string };
type Row = {
    id: number;
    warehouse_name: string | null;
    product_code: string | null;
    product_name: string | null;
    unit: string | null;
    stock_in: number;
    stock_out: number;
    running_balance: number;
    movement: string;
    reference_type: string | null;
    reference_id: number | null;
    remarks: string | null;
    created_by_name: string | null;
    created_at: string;
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
type Filters = {
    warehouse_id?: number | null;
    product_id?: number | null;
    movement?: string | null;
    from_date?: string | null;
    to_date?: string | null;
};
type Props = {
    data: Page<Row>;
    warehouses: Warehouse[];
    products: Product[];
    movements: string[];
    filters: Filters;
};
export default function StockLedger({
    data,
    warehouses,
    products,
    movements,
    filters,
}: Props) {
    const apply = (patch: Partial<Filters>, page?: number) => {
        const n = { ...filters, ...patch };
        router.get(
            '/inventory/stock-ledger',
            {
                ...(n.warehouse_id ? { warehouse_id: n.warehouse_id } : {}),
                ...(n.product_id ? { product_id: n.product_id } : {}),
                ...(n.movement ? { movement: n.movement } : {}),
                ...(n.from_date ? { from_date: n.from_date } : {}),
                ...(n.to_date ? { to_date: n.to_date } : {}),
                ...(page ? { page } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };
    const has = !!(
        filters.warehouse_id ||
        filters.product_id ||
        filters.movement ||
        filters.from_date ||
        filters.to_date
    );
    return (
        <>
            <Head title="Stock Ledger" />
            <PageTitle title="Stock Ledger" />
            <div className="container-fluid">
                <Card>
                    <div className="card-header">
                        <div className="row g-2">
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={filters.warehouse_id ?? ''}
                                    onChange={(e) =>
                                        apply({
                                            warehouse_id: e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        })
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
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={filters.product_id ?? ''}
                                    onChange={(e) =>
                                        apply({
                                            product_id: e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        })
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
                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    value={filters.movement ?? ''}
                                    onChange={(e) =>
                                        apply({
                                            movement: e.target.value || null,
                                        })
                                    }
                                >
                                    <option value="">All Movements</option>
                                    {movements.map((x) => (
                                        <option key={x} value={x}>
                                            {x}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.from_date ?? ''}
                                    onChange={(e) =>
                                        apply({
                                            from_date: e.target.value || null,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.to_date ?? ''}
                                    onChange={(e) =>
                                        apply({
                                            to_date: e.target.value || null,
                                        })
                                    }
                                />
                            </div>
                            {has && (
                                <div className="col-12">
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() =>
                                            router.get(
                                                '/inventory/stock-ledger',
                                            )
                                        }
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Warehouse</th>
                                        <th>Movement</th>
                                        <th>Reference</th>
                                        <th>Stock In</th>
                                        <th>Stock Out</th>
                                        <th>Balance</th>
                                        <th>User</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.length ? (
                                        data.data.map((x) => (
                                            <tr key={x.id}>
                                                <td className="text-nowrap">
                                                    {new Date(
                                                        x.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                                <td>
                                                    <strong>
                                                        {x.product_name}
                                                    </strong>
                                                    <div className="small text-muted">
                                                        {x.product_code}
                                                    </div>
                                                </td>
                                                <td>{x.warehouse_name}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        {x.movement}
                                                    </span>
                                                </td>
                                                <td>
                                                    {x.reference_type
                                                        ? `${x.reference_type} #${x.reference_id ?? ''}`
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {x.stock_in > 0 ? (
                                                        <span className="text-success fw-semibold">
                                                            {x.stock_in.toFixed(
                                                                2,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>
                                                    {x.stock_out > 0 ? (
                                                        <span className="text-danger fw-semibold">
                                                            {x.stock_out.toFixed(
                                                                2,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>
                                                    <strong>
                                                        {x.running_balance.toFixed(
                                                            2,
                                                        )}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {x.created_by_name ?? '-'}
                                                </td>
                                                <td>{x.remarks ?? '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={10}
                                                className="text-center text-muted py-5"
                                            >
                                                No stock movements found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <CardFooter>
                        <div className="d-flex justify-content-between">
                            <TablePaginationInfo
                                from={data?.from ?? 0}
                                to={data?.to ?? 0}
                                total={data?.total}
                            />
                            <Pagination
                                currentPage={data?.current_page}
                                lastPage={data?.last_page}
                                onPageChange={(page) => {
                                    console.log(page);
                                }}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
