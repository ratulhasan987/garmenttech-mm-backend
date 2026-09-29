import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Users,
    UserPlus,
    UserCheck,
    Calendar,
    RefreshCw,
    BarChart2,
    Activity as ActivityIcon,
    User,
} from 'react-feather';
import { usePermission } from '@/hooks/use-permission';
import PageTitle from '@/components/page-title';
import { Card, CardBody } from '@/components/ui/card';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadStage {
    id: number;
    name: string;
    color: string;
    leads_count: number;
}

interface AssignedUser {
    id: number;
    name: string;
    employee_id: string | null;
}

interface TopSalesPerson {
    assigned_to: number;
    leads_count: number;
    assignedUser: AssignedUser | null;
}

interface RecentActivity {
    id: number;
    lead_id: number;
    channel: string | null;
    message: string | null;
    created_at: string;
    lead: { id: number; name: string } | null;
    user: { id: number; name: string } | null;
}

interface LeadSourceData {
    series: number[];
    labels: string[];
}

interface ProjectWiseLeads {
    series: number[];
    labels: string[];
}

export interface CrmDashboardData {
    totalLeads: number;
    totalCustomers: number;
    todayFollowUps: number;
    todayLeads?: number;
    conversionRate: number;
    thisMonthLeads: number;
    thisMonthClients: number;
    pendingFollowUpsCount: number;
    leadChart: number[]; // 12 values, Jan..Dec
    clientChart: number[]; // 12 values, Jan..Dec
    leadSourceData: LeadSourceData;
    projectWiseLeads?: ProjectWiseLeads;
    topSalesPersons: TopSalesPerson[];
    recentActivities: RecentActivity[];
    leadStages: LeadStage[];
}

type DashboardFilters = {
    range?: FilterRange;
    from?: string;
    to?: string;
    employee?: EmployeeSuggestion | null;
    sales_team?: SalesTeamSuggestion | null;
};

interface PageProps {
    data: CrmDashboardData;
    auth?: {
        permissions?: string[];
    };
    filters: DashboardFilters;
    [key: string]: any;
}

const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const DONUT_COLORS = [
    '#6366f1',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#8b5cf6',
    '#ec4899',
    '#84cc16',
];

const FILTER_RANGES = [
    {
        value: 'today',
        label: 'Today',
    },
    {
        value: 'yesterday',
        label: 'Yesterday',
    },
    {
        value: 'last_7_days',
        label: 'Last 7 Days',
    },
    {
        value: 'this_month',
        label: 'This Month',
    },
    {
        value: 'last_month',
        label: 'Last Month',
    },
    {
        value: 'this_year',
        label: 'This Year',
    },
    {
        value: 'last_year',
        label: 'Last Year',
    },
    {
        value: 'custom',
        label: 'Custom Range',
    },
] as const;
type FilterRange = (typeof FILTER_RANGES)[number]['value'];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const numberFormat = (value: number | undefined | null): string =>
    (value ?? 0).toLocaleString();

function truncate(text: string | null | undefined, length = 60): string {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length)}…` : text;
}

function formatDate(value: string): string {
    const d = new Date(value);
    return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatTime(value: string): string {
    const d = new Date(value);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

// ---------------------------------------------------------------------------
// Reusable pieces
// ---------------------------------------------------------------------------

const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    className: string;
}> = ({ title, value, icon, className }) => (
    <div className="col-xl-3 col-lg-6 col-md-6">
        <div className={`card dashboard-card ${className} h-100`}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6
                            className={
                                className.includes('warning')
                                    ? ''
                                    : 'text-white'
                            }
                        >
                            {title}
                        </h6>
                        <h2
                            className={`mb-0 ${className.includes('warning') ? '' : 'text-white'}`}
                        >
                            {numberFormat(value)}
                        </h2>
                    </div>
                    <div className="dashboard-icon">{icon}</div>
                </div>
            </div>
        </div>
    </div>
);

const MetricCard: React.FC<{
    label: string;
    value: string | number;
    borderColor: 'success' | 'primary' | 'info' | 'danger';
}> = ({ label, value, borderColor }) => (
    <div className="col-xl-3 col-lg-6">
        <div
            className={`card border-0 shadow-sm h-100 border-start border-5 border-${borderColor}`}
        >
            <div className="card-body">
                <small className="text-muted">{label}</small>
                <h3 className="mt-1">{value}</h3>
            </div>
        </div>
    </div>
);

const QuickActionCard: React.FC<{
    href: string;
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    subtitle: string;
}> = ({ href, icon, iconClass, title, subtitle }) => (
    <div className="col-lg-3 col-md-6">
        <Link href={href} className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 hover-shadow">
                <div className="card-body text-center py-4">
                    <div className={`${iconClass} fs-2 mb-3`}>{icon}</div>
                    <h5 className="mb-1">{title}</h5>
                    <p className="text-muted small mb-0">{subtitle}</p>
                </div>
            </div>
        </Link>
    </div>
);

type EmployeeSuggestion = {
    id: number;
    name: string;
};

async function searchEmployees(
    query: string,
    signal?: AbortSignal,
): Promise<EmployeeSuggestion[]> {
    const response = await fetch(
        `/get-employees?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search departments.');
    }

    return response.json();
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type SalesTeamSuggestion = {
    id: number;
    name: string;
    code: string;
};

async function searchSalesTeam(
    query: string,
    signal?: AbortSignal,
): Promise<SalesTeamSuggestion[]> {
    const response = await fetch(
        `/get-sales-teams?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search departments.');
    }

    return response.json();
}

export default function CrmDashboard({ data, filters = {} }: PageProps) {
    const [range, setRange] = useState<FilterRange | null>(
        filters?.range ?? null,
    );

    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');

    const [employee, setEmployee] = useState<EmployeeSuggestion | null>(
        filters?.employee ?? null,
    );

    const [salesTeam, setSalesTeam] = useState<SalesTeamSuggestion | null>(
        filters?.sales_team ?? null,
    );

    /*
        |--------------------------------------------------------------------------
        | Apply Filter
        |--------------------------------------------------------------------------
        */

    const applyFilters = () => {
        router.get(
            '/dashboard/crm',
            {
                range,
                from: range === 'custom' ? from : undefined,
                to: range === 'custom' ? to : undefined,
                employee_id: employee?.id ?? undefined,
                sales_team_id: salesTeam?.id ?? undefined,
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
        setRange(null);
        setFrom('');
        setTo('');
        setEmployee(null);
        setSalesTeam(null);

        router.get(
            '/dashboard/crm',
            {},
            {
                preserveState: false,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    const { can } = usePermission();

    const leadTrend = MONTH_LABELS.map((month, i) => ({
        month,
        Leads: data.leadChart?.[i] ?? 0,
    }));

    const clientTrend = MONTH_LABELS.map((month, i) => ({
        month,
        Customers: data.clientChart?.[i] ?? 0,
    }));

    const leadSourcePie = (data.leadSourceData?.labels ?? []).map(
        (label, i) => ({
            name: label,
            value: data.leadSourceData?.series?.[i] ?? 0,
        }),
    );

    const projectWiseBars = (data.projectWiseLeads?.labels ?? []).map(
        (label, i) => ({
            name: label,
            Leads: data.projectWiseLeads?.series?.[i] ?? 0,
        }),
    );

    return (
        <>
            <Head title="CRM Dashboard" />

            <PageTitle title="CRM Dashboard" />

            {/* =========================================================
                    Dashboard Header / Filters
                ========================================================= */}

            <Card shadow={false}>
                <CardBody>
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-4 col-lg-2">
                            <select
                                className="form-select"
                                value={range ?? ''}
                                onChange={(event) => {
                                    setRange(event.target.value as FilterRange);
                                }}
                            >
                                <option value="">Select Date</option>

                                {FILTER_RANGES.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {range === 'custom' && (
                            <>
                                <div className="col-12 col-md-4 col-lg-2">
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

                        {can('lead.global') && (
                            <div className="col-12 col-md-4 col-lg-2">
                                <SuggestionSearchInput<EmployeeSuggestion>
                                    searchFn={searchEmployees}
                                    idKey="id"
                                    labelKey="name"
                                    placeholder="Search employee"
                                    showSearchIcon={false}
                                    // defaultSelectedItem={filterValues?.user}
                                    disabled={!!salesTeam}
                                    onSelect={(user) => {
                                        setEmployee(user);
                                        setSalesTeam(null);
                                    }}
                                    onClear={() => {
                                        setEmployee(null);
                                    }}
                                    clearOnFocus
                                />
                            </div>
                        )}

                        <div className="col-12 col-md-4 col-lg-2">
                            <SuggestionSearchInput<SalesTeamSuggestion>
                                searchFn={searchSalesTeam}
                                idKey="id"
                                labelKey="name"
                                secondaryLabelKey="code"
                                placeholder="Sales team..."
                                showSearchIcon
                                disabled={!!employee}
                                onSelect={(team) => {
                                    setSalesTeam(team);
                                    setEmployee(null);
                                }}
                                onClear={() => {
                                    setSalesTeam(null);
                                }}
                                clearOnFocus
                            />
                        </div>

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
                </CardBody>
            </Card>

            <div>
                {/* Page Header */}
                {/* <div className="d-flex justify-content-end align-items-center flex-wrap gap-3 mb-4">
                        <div className="d-flex gap-2 flex-wrap">
                            {can('lead.create') && (
                                <Link
                                    href={`/lead/create`}
                                    className="btn btn-primary"
                                >
                                    <UserPlus size={16} className="me-1" /> New
                                    Lead
                                </Link>
                            )}
                            {can('customer.create') && (
                                <Link
                                    href={`/operations/sales/customers/create`}
                                    className="btn btn-success"
                                >
                                    <User size={16} className="me-1" /> New
                                    Customer
                                </Link>
                            )}
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw size={16} className="me-1" /> Refresh
                            </button>
                        </div>
                    </div> */}

                {/* Quick Action Cards */}
                <div className="row mb-4 g-3">
                    <QuickActionCard
                        href={`/lead`}
                        icon={<Users />}
                        iconClass="text-primary"
                        title="Manage Leads"
                        subtitle="All Leads"
                    />
                    <QuickActionCard
                        href={`/operations/sales/customers`}
                        icon={<UserCheck />}
                        iconClass="text-success"
                        title="Customers"
                        subtitle="My Customers"
                    />
                    <QuickActionCard
                        href={`/lead/lead-follow-up`}
                        icon={<Calendar />}
                        iconClass="text-warning"
                        title="Follow-ups"
                        subtitle="Today's Tasks"
                    />
                    <QuickActionCard
                        href={`/lead/untouch`}
                        icon={<BarChart2 />}
                        iconClass="text-danger"
                        title="Un Touch Leads"
                        subtitle="Need to Conversation"
                    />
                </div>

                {/* Main Statistics */}
                <div className="row g-3 mb-4">
                    <StatCard
                        title="Total Leads"
                        value={data.totalLeads}
                        icon={<Users size={40} />}
                        className="bg-primary text-white"
                    />
                    <StatCard
                        title="New Leads"
                        value={data.todayLeads ?? 0}
                        icon={<UserPlus size={40} />}
                        className="bg-info text-white"
                    />
                    <StatCard
                        title="Today's Follow-up"
                        value={data.todayFollowUps}
                        icon={<Calendar size={40} />}
                        className="bg-warning text-dark"
                    />
                    <StatCard
                        title="My Customers"
                        value={data.totalCustomers}
                        icon={<UserCheck size={40} />}
                        className="bg-success text-white"
                    />
                </div>

                {/* Secondary Metrics */}
                <div className="row g-3 mb-4">
                    <MetricCard
                        label="Conversion Rate"
                        value={`${data.conversionRate}%`}
                        borderColor="success"
                    />
                    <MetricCard
                        label="This Month Leads"
                        value={numberFormat(data.thisMonthLeads)}
                        borderColor="primary"
                    />
                    <MetricCard
                        label="This Month Customers"
                        value={numberFormat(data.thisMonthClients)}
                        borderColor="info"
                    />
                    <MetricCard
                        label="Pending Follow-up"
                        value={numberFormat(data.pendingFollowUpsCount)}
                        borderColor="danger"
                    />
                </div>

                <div className="row g-3">
                    {/* Pipeline */}
                    <div className="col-xl-5">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Lead Pipeline Overview</h5>
                            </div>
                            <div className="card-body">
                                {data.leadStages.length ? (
                                    data.leadStages.map((stage) => {
                                        const percentage =
                                            data.totalLeads > 0
                                                ? Math.round(
                                                      (stage.leads_count /
                                                          data.totalLeads) *
                                                          1000,
                                                  ) / 10
                                                : 0;
                                        return (
                                            <div
                                                className="mb-4"
                                                key={stage.id}
                                            >
                                                <div className="d-flex justify-content-between mb-2">
                                                    <div>
                                                        <Link
                                                            href={`/lead?stage=${stage.id}`}
                                                            className="text-black link-primary"
                                                        >
                                                            <strong>
                                                                {stage.name}
                                                            </strong>
                                                        </Link>
                                                        <span
                                                            className="badge ms-2"
                                                            style={{
                                                                background:
                                                                    stage.color,
                                                            }}
                                                        >
                                                            {stage.leads_count}
                                                        </span>
                                                    </div>
                                                    <strong>
                                                        {percentage}%
                                                    </strong>
                                                </div>
                                                <div
                                                    className="progress"
                                                    style={{ height: 10 }}
                                                >
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            background:
                                                                stage.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-muted py-4">
                                        No pipeline data available.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="col-xl-7">
                        <div className="row g-3">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">
                                            Monthly Lead Trend
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >
                                            <AreaChart data={leadTrend}>
                                                <defs>
                                                    <linearGradient
                                                        id="leadGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#6366f1"
                                                            stopOpacity={0.45}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#6366f1"
                                                            stopOpacity={0.08}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />
                                                <XAxis dataKey="month" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Area
                                                    type="monotone"
                                                    dataKey="Leads"
                                                    stroke="#6366f1"
                                                    strokeWidth={3}
                                                    fill="url(#leadGradient)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">
                                            Monthly Customer Conversion
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={360}
                                        >
                                            <BarChart data={clientTrend}>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />
                                                <XAxis dataKey="month" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="Customers"
                                                    fill="#22c55e"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={28}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Performance */}
                <div className="row mt-4 g-3">
                    <div className="col-xl-6">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    Lead Source Distribution
                                </h5>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={leadSourcePie}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                        >
                                            {leadSourcePie.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        DONUT_COLORS[
                                                            index %
                                                                DONUT_COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Legend
                                            position="bottom"
                                            content={({ payload }) => (
                                                <div
                                                    style={{
                                                        maxHeight: '80px',
                                                        overflowY: 'auto',
                                                        padding: '5px 10px',
                                                    }}
                                                >
                                                    {payload?.map(
                                                        (entry, index) => (
                                                            <div
                                                                key={`legend-${index}`}
                                                                className="d-flex align-items-center"
                                                                style={{
                                                                    marginBottom:
                                                                        '5px',
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        width: 10,
                                                                        height: 10,
                                                                        backgroundColor:
                                                                            entry.color,
                                                                        display:
                                                                            'inline-block',
                                                                        marginRight: 6,
                                                                        borderRadius:
                                                                            '50%',
                                                                    }}
                                                                />

                                                                <span>
                                                                    {
                                                                        entry.value
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-6">
                        <div className="card h-100">
                            <div className="card-header">
                                <h5 className="mb-0">Top Sales Executives</h5>
                            </div>
                            <div className="card-body">
                                {data.topSalesPersons.length ? (
                                    data.topSalesPersons.map((person) => (
                                        <div
                                            className="d-flex justify-content-between align-items-center mb-3"
                                            key={person.assigned_to}
                                        >
                                            <div>
                                                <h6 className="mb-1">
                                                    {person.assignedUser
                                                        ?.name ?? '—'}
                                                </h6>
                                                <small className="text-muted">
                                                    {
                                                        person.assignedUser
                                                            ?.employee_id
                                                    }
                                                </small>
                                            </div>
                                            <span className="badge bg-success">
                                                {person.leads_count} Leads
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        No data yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Recent Activities</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Lead</th>
                                                <th>User</th>
                                                <th>Channel</th>
                                                <th>Message</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentActivities.length ? (
                                                data.recentActivities.map(
                                                    (activity) => (
                                                        <tr key={activity.id}>
                                                            <td>
                                                                {formatDate(
                                                                    activity.created_at,
                                                                )}
                                                                <br />
                                                                <small>
                                                                    {formatTime(
                                                                        activity.created_at,
                                                                    )}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                {activity.lead
                                                                    ?.name ??
                                                                    'N/A'}
                                                            </td>
                                                            <td>
                                                                {activity.user
                                                                    ?.name ??
                                                                    'N/A'}
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-info">
                                                                    {activity.channel
                                                                        ? activity.channel
                                                                              .charAt(
                                                                                  0,
                                                                              )
                                                                              .toUpperCase() +
                                                                          activity.channel.slice(
                                                                              1,
                                                                          )
                                                                        : '-'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {truncate(
                                                                    activity.message,
                                                                    60,
                                                                )}
                                                            </td>
                                                            <td>
                                                                <ul className="action">
                                                                    {can(
                                                                        'lead.conversation',
                                                                    ) && (
                                                                        <li className="edit">
                                                                            <Link
                                                                                href={`/lead-conversation/${activity.lead_id}`}
                                                                                style={{
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                                title="Go for Follow-up"
                                                                            >
                                                                                <ActivityIcon
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            </Link>
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="text-center py-5"
                                                    >
                                                        No recent activity
                                                        found.
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
