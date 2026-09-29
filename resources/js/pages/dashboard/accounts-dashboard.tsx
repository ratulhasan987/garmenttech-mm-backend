import { useState } from 'react';

import { Head, router } from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Box,
    CreditCard,
    DollarSign,
    FileText,
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    Truck,
} from 'react-feather';

import {
    Area,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import PageTitle from '@/components/page-title';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
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

type DashboardFilters = {
    range: string;
    from: string;
    to: string;
    warehouse_id: number | null;
    label: string;
};

type DashboardStats = {
    total_sales: number;
    total_purchase: number;

    receivable: number;
    payable: number;

    unpaid_invoices: number;
    unpaid_bills: number;

    stock_products: number;
    low_stock_products: number;

    pending_purchase_orders: number;
    pending_grns: number;

    sales_change: number;
    purchase_change: number;
};

type ChartItem = {
    key: string;
    label: string;
    sales: number;
    purchase: number;
};

type InventorySummary = {
    total_quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    low_stock: number;
    out_of_stock: number;
};

type LowStockProduct = {
    id: number;
    item_id: number;

    unit: string | null;

    quantity: number;
    reserved_quantity: number;
    available_quantity: number;

    product_code: string | null;
    product_name: string;

    reorder_level: number;

    warehouse_name: string;
};

type PendingApproval = {
    key: string;
    label: string;
    count: number;
};

type RecentTransaction = {
    id: string;

    type: string;

    reference: string;

    party: string;

    amount: number;

    status: string;

    date: string;
};

interface DashboardProps {
    filters: DashboardFilters;

    warehouses: Warehouse[];

    stats: DashboardStats;

    salesPurchaseChart: ChartItem[];

    inventory: InventorySummary;

    lowStockProducts: LowStockProduct[];

    pendingApprovals: PendingApproval[];

    recentTransactions: RecentTransaction[];
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatMoney = (value: number): string => {
    return `৳${new Intl.NumberFormat('en-BD', {
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0))}`;
};

const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-BD', {
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
};

const formatCompactNumber = (value: number): string => {
    const amount = Number(value ?? 0);

    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }

    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M`;
    }

    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1)}K`;
    }

    return String(Math.round(amount));
};

const getStatusClass = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'approved':
        case 'paid':
        case 'posted':
            return 'bg-light-success text-success';

        case 'pending':
        case 'partial-paid':
        case 'partial':
            return 'bg-light-warning text-warning';

        case 'draft':
            return 'bg-light-primary text-primary';

        case 'rejected':
        case 'cancelled':
        case 'unpaid':
            return 'bg-light-danger text-danger';

        default:
            return 'bg-light-secondary text-secondary';
    }
};

const getTransactionTypeClass = (type: string): string => {
    switch (type) {
        case 'Sale':
            return 'bg-light-success text-success';

        case 'Purchase':
            return 'bg-light-primary text-primary';

        case 'Bill':
            return 'bg-light-warning text-warning';

        case 'Purchase Return':
            return 'bg-light-danger text-danger';

        default:
            return 'bg-light-secondary text-secondary';
    }
};

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

const INVENTORY_CARD_HEIGHT = 500;

export default function Dashboard({
    filters,
    warehouses,
    stats,
    salesPurchaseChart,
    inventory,
    lowStockProducts,
    pendingApprovals,
    recentTransactions,
}: DashboardProps) {
    const [range, setRange] = useState(filters.range);

    const [from, setFrom] = useState(filters.from);

    const [to, setTo] = useState(filters.to);

    const [warehouseId, setWarehouseId] = useState(
        filters.warehouse_id ? String(filters.warehouse_id) : '',
    );

    /*
    |--------------------------------------------------------------------------
    | Apply Filter
    |--------------------------------------------------------------------------
    */

    const applyFilters = () => {
        router.get(
            '/dashboard/accounts',
            {
                range,

                warehouse_id: warehouseId || undefined,

                from: range === 'custom' ? from : undefined,

                to: range === 'custom' ? to : undefined,
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
    | Reset Filter
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setRange('this_month');

        setWarehouseId('');

        router.get(
            '/dashboard/accounts',
            {},
            {
                preserveState: false,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    const pendingTotal = pendingApprovals.reduce(
        (total, item) => total + Number(item.count),
        0,
    );

    return (
        <>
            <Head title="Accounts Dashboard" />

            <PageTitle title="Accounts Dashboard" />

            <div className="container-fluid">
                {/* =========================================================
                    Dashboard Header / Filters
                ========================================================= */}

                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-lg">
                                <div>
                                    <h4 className="mb-1 fw-semibold">
                                        Business Overview
                                    </h4>

                                    <div className="text-muted small">
                                        {filters.label}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-4 col-lg-2">
                                <select
                                    className="form-select"
                                    value={range}
                                    onChange={(event) =>
                                        setRange(event.target.value)
                                    }
                                >
                                    <option value="today">Today</option>

                                    <option value="yesterday">Yesterday</option>

                                    <option value="last_7_days">
                                        Last 7 Days
                                    </option>

                                    <option value="this_month">
                                        This Month
                                    </option>

                                    <option value="last_month">
                                        Last Month
                                    </option>

                                    <option value="this_year">This Year</option>

                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-4 col-lg-2">
                                <select
                                    className="form-select"
                                    value={warehouseId}
                                    onChange={(event) =>
                                        setWarehouseId(event.target.value)
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

                            {range === 'custom' && (
                                <>
                                    <div className="col-12 col-md-4 col-lg-2">
                                        <label className="form-label small fw-medium">
                                            From
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            value={from}
                                            onChange={(event) =>
                                                setFrom(event.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="col-12 col-md-4 col-lg-2">
                                        <label className="form-label small fw-medium">
                                            To
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            value={to}
                                            onChange={(event) =>
                                                setTo(event.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={applyFilters}
                                >
                                    Apply
                                </button>
                            </div>

                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={resetFilters}
                                >
                                    <RefreshCw size={16} className="me-2" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    Financial Cards
                ========================================================= */}

                <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Total Sales"
                            value={formatMoney(stats.total_sales)}
                            change={stats.sales_change}
                            icon={
                                <TrendingUp
                                    size={22}
                                    className="text-primary"
                                />
                            }
                            iconBackground="rgba(115, 102, 255, 0.12)"
                        />
                    </div>

                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Total Purchase"
                            value={formatMoney(stats.total_purchase)}
                            change={stats.purchase_change}
                            icon={
                                <ShoppingCart
                                    size={22}
                                    className="text-warning"
                                />
                            }
                            iconBackground="rgba(255, 170, 5, 0.12)"
                        />
                    </div>

                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Receivable"
                            value={formatMoney(stats.receivable)}
                            subtitle={`${stats.unpaid_invoices} unpaid invoice${
                                stats.unpaid_invoices === 1 ? '' : 's'
                            }`}
                            icon={
                                <DollarSign
                                    size={22}
                                    className="text-success"
                                />
                            }
                            iconBackground="rgba(84, 186, 74, 0.12)"
                        />
                    </div>

                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Vendor Payable"
                            value={formatMoney(stats.payable)}
                            subtitle={`${stats.unpaid_bills} unpaid bill${
                                stats.unpaid_bills === 1 ? '' : 's'
                            }`}
                            icon={
                                <CreditCard size={22} className="text-danger" />
                            }
                            iconBackground="rgba(252, 68, 56, 0.10)"
                        />
                    </div>
                </div>

                {/* =========================================================
                    Operation Cards
                ========================================================= */}

                <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Products In Stock"
                            value={formatNumber(stats.stock_products)}
                            subtitle="Unique stock products"
                            icon={
                                <Package size={22} className="text-primary" />
                            }
                            iconBackground="rgba(115, 102, 255, 0.12)"
                        />
                    </div>

                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Low Stock"
                            value={formatNumber(stats.low_stock_products)}
                            subtitle="Needs attention"
                            icon={
                                <AlertTriangle
                                    size={22}
                                    className="text-danger"
                                />
                            }
                            iconBackground="rgba(252, 68, 56, 0.10)"
                        />
                    </div>

                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Pending Purchase Orders"
                            value={formatNumber(stats.pending_purchase_orders)}
                            subtitle="Waiting for approval"
                            icon={
                                <FileText size={22} className="text-warning" />
                            }
                            iconBackground="rgba(255, 170, 5, 0.12)"
                        />
                    </div>

                    <div className="col-sm-6 col-xl-3">
                        <StatCard
                            title="Pending GRN"
                            value={formatNumber(stats.pending_grns)}
                            subtitle="Goods receive pending"
                            icon={<Truck size={22} className="text-success" />}
                            iconBackground="rgba(84, 186, 74, 0.12)"
                        />
                    </div>
                </div>

                {/* =========================================================
                    Chart + Requires Attention
                ========================================================= */}

                <div className="row g-3 mb-4">
                    <div className="col-12 col-xl-8">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-transparent border-0 pt-4 px-4">
                                <div className="d-flex align-items-start justify-content-between gap-3">
                                    <div>
                                        <h5 className="mb-1 fw-semibold">
                                            Sales vs Purchase
                                        </h5>

                                        <div className="text-muted small">
                                            {filters.label}
                                        </div>
                                    </div>

                                    <div className="badge bg-light-primary text-primary">
                                        Overview
                                    </div>
                                </div>
                            </div>

                            <div className="card-body px-2 px-md-4">
                                {salesPurchaseChart.length > 0 ? (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: 340,
                                        }}
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <ComposedChart
                                                data={salesPurchaseChart}
                                                margin={{
                                                    top: 10,
                                                    right: 15,
                                                    left: 0,
                                                    bottom: 0,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="salesGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#7366ff"
                                                            stopOpacity={0.28}
                                                        />

                                                        <stop
                                                            offset="95%"
                                                            stopColor="#7366ff"
                                                            stopOpacity={0.02}
                                                        />
                                                    </linearGradient>
                                                </defs>

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                    stroke="#e9ecef"
                                                />

                                                <XAxis
                                                    dataKey="label"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: '#6c757d',
                                                    }}
                                                />

                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={55}
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: '#6c757d',
                                                    }}
                                                    tickFormatter={(value) =>
                                                        formatCompactNumber(
                                                            Number(value),
                                                        )
                                                    }
                                                />

                                                <Tooltip
                                                    formatter={(
                                                        value,
                                                        name,
                                                    ) => [
                                                        formatMoney(
                                                            Number(value ?? 0),
                                                        ),
                                                        name,
                                                    ]}
                                                    contentStyle={{
                                                        borderRadius: 10,
                                                        border: '1px solid #e9ecef',
                                                        boxShadow:
                                                            '0 4px 18px rgba(0, 0, 0, 0.08)',
                                                    }}
                                                />

                                                <Legend
                                                    iconType="circle"
                                                    wrapperStyle={{
                                                        paddingTop: 15,
                                                    }}
                                                />

                                                <Area
                                                    type="monotone"
                                                    dataKey="sales"
                                                    name="Sales"
                                                    stroke="#7366ff"
                                                    strokeWidth={2.5}
                                                    fill="url(#salesGradient)"
                                                    dot={false}
                                                    activeDot={{
                                                        r: 5,
                                                    }}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="purchase"
                                                    name="Purchase"
                                                    stroke="#f73164"
                                                    strokeWidth={2.5}
                                                    dot={false}
                                                    activeDot={{
                                                        r: 5,
                                                    }}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div
                                        className="d-flex flex-column align-items-center justify-content-center text-center text-muted"
                                        style={{
                                            minHeight: 340,
                                        }}
                                    >
                                        <TrendingUp
                                            size={38}
                                            className="mb-3"
                                        />

                                        <div className="fw-medium">
                                            No chart data
                                        </div>

                                        <small>
                                            No approved sales or purchases found
                                            for this period.
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-transparent border-0 pt-4 px-4">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h5 className="mb-1 fw-semibold">
                                            Requires Attention
                                        </h5>

                                        <div className="text-muted small">
                                            Current pending operations
                                        </div>
                                    </div>

                                    <span className="badge rounded-pill bg-light-danger text-danger">
                                        {pendingTotal}
                                    </span>
                                </div>
                            </div>

                            <div className="card-body pt-2">
                                {pendingApprovals.map((item, index) => (
                                    <div
                                        key={item.key}
                                        className={`d-flex align-items-center justify-content-between py-3 ${
                                            index !==
                                            pendingApprovals.length - 1
                                                ? 'border-bottom'
                                                : ''
                                        }`}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center bg-light-warning text-warning"
                                                style={{
                                                    width: 38,
                                                    height: 38,
                                                }}
                                            >
                                                <FileText size={17} />
                                            </div>

                                            <div>
                                                <div className="fw-medium">
                                                    {item.label}
                                                </div>

                                                <small className="text-muted">
                                                    Waiting for action
                                                </small>
                                            </div>
                                        </div>

                                        <span
                                            className={`badge rounded-pill ${
                                                item.count > 0
                                                    ? 'bg-light-warning text-warning'
                                                    : 'bg-light-success text-success'
                                            }`}
                                        >
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    Low Stock + Inventory Summary
                ========================================================= */}

                <div className="row g-3 mb-4">
                    {/* Low Stock */}
                    <div className="col-12 col-xl-8">
                        <LowStockTable lowStockProducts={lowStockProducts} />
                    </div>

                    {/* Inventory Overview */}
                    <div className="col-12 col-xl-4">
                        <InventoryOverview inventory={inventory} />
                    </div>
                </div>

                {/* =========================================================
                    Recent Transactions
                ========================================================= */}

                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-transparent border-0 pt-4 px-4">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <h5 className="mb-1 fw-semibold">
                                            Recent Transactions
                                        </h5>

                                        <div className="text-muted small">
                                            Latest ERP activity
                                        </div>
                                    </div>

                                    <TrendingUp
                                        size={20}
                                        className="text-primary"
                                    />
                                </div>
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">Type</th>

                                                <th>Reference</th>

                                                <th>Party</th>

                                                <th className="text-end">
                                                    Amount
                                                </th>

                                                <th className="text-center">
                                                    Status
                                                </th>

                                                <th className="text-end pe-4">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {recentTransactions.length > 0 ? (
                                                recentTransactions.map(
                                                    (transaction) => (
                                                        <tr
                                                            key={transaction.id}
                                                        >
                                                            <td className="ps-4">
                                                                <span
                                                                    className={`badge ${getTransactionTypeClass(
                                                                        transaction.type,
                                                                    )}`}
                                                                >
                                                                    {
                                                                        transaction.type
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="fw-medium">
                                                                    {
                                                                        transaction.reference
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    transaction.party
                                                                }
                                                            </td>

                                                            <td className="text-end fw-semibold">
                                                                {formatMoney(
                                                                    transaction.amount,
                                                                )}
                                                            </td>

                                                            <td className="text-center">
                                                                <span
                                                                    className={`badge rounded-pill ${getStatusClass(
                                                                        transaction.status,
                                                                    )}`}
                                                                >
                                                                    {
                                                                        transaction.status
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td className="text-end pe-4 text-muted">
                                                                {
                                                                    transaction.date
                                                                }
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center py-5 text-muted"
                                                    >
                                                        No transactions found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

interface StatCardProps {
    title: string;

    value: string;

    subtitle?: string;

    change?: number;

    icon: React.ReactNode;

    iconBackground: string;
}

const StatCard = ({
    title,
    value,
    subtitle,
    change,
    icon,
    iconBackground,
}: StatCardProps) => {
    const hasChange = typeof change === 'number';

    const positive = (change ?? 0) >= 0;

    return (
        <Card className="h-100">
            <CardBody>
                <div className="d-flex align-items-start justify-content-between gap-3">
                    <div className="flex-grow-1">
                        <div className="text-muted small mb-2">{title}</div>

                        <h4 className="mb-2 fw-semibold">{value}</h4>

                        {hasChange ? (
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className={
                                        positive
                                            ? 'text-success'
                                            : 'text-danger'
                                    }
                                >
                                    {positive ? (
                                        <ArrowUpRight size={15} />
                                    ) : (
                                        <ArrowDownRight size={15} />
                                    )}

                                    <span className="ms-1 fw-medium">
                                        {Math.abs(change ?? 0)}%
                                    </span>
                                </span>

                                <span className="text-muted small">
                                    vs previous period
                                </span>
                            </div>
                        ) : (
                            <div className="text-muted small">{subtitle}</div>
                        )}
                    </div>

                    <div
                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{
                            width: 48,
                            height: 48,
                            background: iconBackground,
                        }}
                    >
                        {icon}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

/*
|--------------------------------------------------------------------------
| Inventory Item
|--------------------------------------------------------------------------
*/

interface InventoryItemProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}

const InventoryItem = ({ label, value, icon }: InventoryItemProps) => {
    return (
        <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
                <div
                    className="d-flex align-items-center justify-content-center rounded-3 bg-light-primary text-primary"
                    style={{
                        width: 40,
                        height: 40,
                    }}
                >
                    {icon}
                </div>

                <div>
                    <div className="text-muted small">{label}</div>

                    <div className="fw-semibold">{value}</div>
                </div>
            </div>
        </div>
    );
};

const LowStockTable = ({
    lowStockProducts,
}: {
    lowStockProducts: LowStockProduct[];
}) => {
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h5 className="mb-1 fw-semibold">
                                Low Stock Alert
                            </h5>

                            <div className="text-muted small">
                                Products at or below reorder level
                            </div>
                        </div>

                        <AlertTriangle size={20} className="text-danger" />
                    </div>
                </CardHeader>
                <CardBody>
                    <Table
                        wrapperClassName="overflow-auto"
                        wrapperStyle={{
                            maxHeight: INVENTORY_CARD_HEIGHT - 127,
                        }}
                    >
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Reorder Level</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lowStockProducts?.length > 0 ? (
                                lowStockProducts?.map((product) => {
                                    const outOfStock =
                                        Number(product.available_quantity) <= 0;

                                    return (
                                        <tr key={product.id}>
                                            <td className="ps-4">
                                                <div className="fw-medium">
                                                    {product.product_name}
                                                </div>

                                                <small className="text-muted">
                                                    {product.product_code ||
                                                        `#${product.item_id}`}
                                                </small>
                                            </td>

                                            <td>{product.warehouse_name}</td>

                                            <td className="text-end fw-medium">
                                                {formatNumber(
                                                    product.available_quantity,
                                                )}

                                                {product.unit
                                                    ? ` ${product.unit}`
                                                    : ''}
                                            </td>

                                            <td className="text-end">
                                                {formatNumber(
                                                    product.reorder_level,
                                                )}

                                                {product.unit
                                                    ? ` ${product.unit}`
                                                    : ''}
                                            </td>

                                            <td className="text-end pe-4">
                                                <span
                                                    className={`badge rounded-pill ${
                                                        outOfStock
                                                            ? 'bg-light-danger text-danger'
                                                            : 'bg-light-warning text-warning'
                                                    }`}
                                                >
                                                    {outOfStock
                                                        ? 'Out of Stock'
                                                        : 'Low Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-5 text-muted"
                                    >
                                        No low-stock products found.
                                    </td>
                                </tr>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </>
    );
};

const InventoryOverview = ({ inventory }: { inventory: InventorySummary }) => {
    return (
        <>
            <Card
                style={{
                    height: INVENTORY_CARD_HEIGHT,
                }}
            >
                <CardHeader>
                    <h5 className="mb-1 fw-semibold">Inventory Overview</h5>

                    <div className="text-muted small">
                        Current stock position
                    </div>
                </CardHeader>

                <CardBody>
                    <InventoryItem
                        label="Total Quantity"
                        value={formatNumber(inventory.total_quantity)}
                        icon={<Box size={18} />}
                    />

                    <InventoryItem
                        label="Available Quantity"
                        value={formatNumber(inventory.available_quantity)}
                        icon={<Package size={18} />}
                    />

                    <InventoryItem
                        label="Reserved Quantity"
                        value={formatNumber(inventory.reserved_quantity)}
                        icon={<FileText size={18} />}
                    />

                    <InventoryItem
                        label="Low Stock"
                        value={formatNumber(inventory.low_stock)}
                        icon={<AlertTriangle size={18} />}
                    />

                    <div className="d-flex align-items-center justify-content-between pt-3">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3 bg-light-danger text-danger"
                                style={{
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <AlertTriangle size={18} />
                            </div>

                            <div>
                                <div className="text-muted small">
                                    Out of Stock
                                </div>

                                <div className="fw-semibold">
                                    {formatNumber(inventory.out_of_stock)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

const RecentTransaction = ({
    recentTransactions,
}: {
    recentTransactions: RecentTransaction[];
}) => {
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h5 className="mb-1 fw-semibold">
                                Recent Transactions
                            </h5>

                            <div className="text-muted small">
                                Latest ERP activity
                            </div>
                        </div>

                        <TrendingUp size={20} className="text-primary" />
                    </div>
                </CardHeader>

                <CardBody>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Type</th>

                                    <th>Reference</th>

                                    <th>Party</th>

                                    <th className="text-end">Amount</th>

                                    <th className="text-center">Status</th>

                                    <th className="text-end pe-4">Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTransactions?.length > 0 ? (
                                    recentTransactions?.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="ps-4">
                                                <span
                                                    className={`badge ${getTransactionTypeClass(
                                                        transaction.type,
                                                    )}`}
                                                >
                                                    {transaction.type}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="fw-medium">
                                                    {transaction.reference}
                                                </span>
                                            </td>

                                            <td>{transaction.party}</td>

                                            <td className="text-end fw-semibold">
                                                {formatMoney(
                                                    transaction.amount,
                                                )}
                                            </td>

                                            <td className="text-center">
                                                <span
                                                    className={`badge rounded-pill ${getStatusClass(
                                                        transaction.status,
                                                    )}`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>

                                            <td className="text-end pe-4 text-muted">
                                                {transaction.date}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-5 text-muted"
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};
