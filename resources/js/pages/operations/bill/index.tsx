import { FormEvent, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import { Eye } from 'react-feather';

import PageTitle from '@/components/page-title';

import { Button } from '@/components/ui/button';

import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';

import { Select } from '@/components/ui/form/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type { PaginatedData } from '@/types/pagination';
import { usePermission } from '@/hooks/use-permission';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type PaymentStatus = 'Paid' | 'Due' | 'Partial-paid';

type Vendor = {
    id: number;

    vendor_id: string | null;

    name: string;
};

type PurchaseOrder = {
    id: number;

    order_id: string;
};

type GoodsReceivedNote = {
    id: number;

    grn_no: string;
};

type Bill = {
    id: number;

    bill_no: string;

    goods_received_note_id: number;

    purchase_order_id: number;

    vendor_id: number;

    sub_total: string;

    total_tax: string;

    total_discount: string;

    shipping_cost: string;

    grand_total: string;

    paid_amount: string;

    due_amount: string;

    payment_status: PaymentStatus;

    bill_date: string | null;

    due_date: string | null;

    created_at: string;

    vendor: Vendor | null;

    purchase_order: PurchaseOrder | null;

    goods_received_note: GoodsReceivedNote | null;
};

type BillFilters = {
    bill_no?: string | null;

    payment_status?: PaymentStatus | '';
};

type Currency = {
    id?: number;

    symbol?: string | null;

    exchange_rate?: string | number | null;
};

type Props = {
    data: PaginatedData<Bill>;

    filters: BillFilters;

    hasFilters: boolean;

    numberOfBills: number;

    activeCurrency: Currency | null;
};

/*
|--------------------------------------------------------------------------
| Status Class
|--------------------------------------------------------------------------
*/

function getStatusClass(status: PaymentStatus) {
    switch (status) {
        case 'Paid':
            return 'bg-success';

        case 'Partial-paid':
            return 'bg-info text-white';

        case 'Due':
            return 'bg-warning text-dark';

        default:
            return 'bg-secondary';
    }
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

type BillSuggestion = {
    id: number;

    grn_no: string;
    bill_no: string;

    purchase_order_id: number;
    goods_received_note_id: number;

    order_id: string | null;
};

async function searchBills(
    query: string,
    signal?: AbortSignal,
): Promise<BillSuggestion[]> {
    const response = await fetch(
        `/get-bills?keyword=${encodeURIComponent(query)}`,
        {
            signal,

            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('Failed to search GRNs.');
    }

    return response.json();
}

export default function BillIndexPage({
    data,
    filters,
    hasFilters,
    numberOfBills,
    activeCurrency,
}: Props) {
    const { can } = usePermission();
    const canView = can('bill.view');

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    const [billNo, setBillNo] = useState(filters?.bill_no ?? '');

    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>(
        filters?.payment_status ?? '',
    );

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */

    const symbol = activeCurrency?.symbol ?? '$';

    const exchangeRate = Number(activeCurrency?.exchange_rate ?? 1) || 1;

    const formatMoney = (amount: string | number) => {
        const value = Number(amount ?? 0) * exchangeRate;

        return `${symbol} ${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2,
        })}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Filter
    |--------------------------------------------------------------------------
    */

    const handleFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/bill',
            {
                ...(billNo.trim()
                    ? {
                          bill_no: billNo.trim(),
                      }
                    : {}),

                ...(paymentStatus
                    ? {
                          payment_status: paymentStatus,
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

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            {
                page,

                ...(billNo.trim()
                    ? {
                          bill_no: billNo.trim(),
                      }
                    : {}),

                ...(paymentStatus
                    ? {
                          payment_status: paymentStatus,
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

    const handleBillSelect = (bill: BillSuggestion) => {
        setBillNo(bill.bill_no);

        router.get(
            '/bill',
            {
                bill_no: bill.bill_no,

                ...(paymentStatus
                    ? {
                          payment_status: paymentStatus,
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

    const handleBillClear = () => {
        setBillNo('');

        router.get(
            '/bill',
            {
                ...(paymentStatus
                    ? {
                          payment_status: paymentStatus,
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
    | Reset
    |--------------------------------------------------------------------------
    */

    const handleReset = () => {
        setBillNo('');

        setPaymentStatus('');

        router.get(
            '/bill',
            {},
            {
                preserveState: false,

                preserveScroll: true,

                replace: true,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const visitPage = (url: string | null) => {
        if (!url) {
            return;
        }

        router.visit(url, {
            preserveState: true,

            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Bills" />

            <PageTitle title="Bills" />

            <div className="container-fluid">
                <Card>
                    {/*
                    |--------------------------------------------------------------------------
                    | Header
                    |--------------------------------------------------------------------------
                    */}

                    <CardHeader>
                        <form
                            onSubmit={handleFilter}
                            className="d-flex gap-2 flex-wrap align-items-center"
                        >
                            <div>
                                <SuggestionSearchInput<BillSuggestion>
                                    searchFn={searchBills}
                                    idKey="id"
                                    labelKey="bill_no"
                                    secondaryLabelKey="grn_no"
                                    placeholder="Search Bill..."
                                    showSearchIcon
                                    clearOnFocus={false}
                                    defaultValue={filters?.bill_no ?? ''}
                                    onSelect={handleBillSelect}
                                    onClear={handleBillClear}
                                    emptyLabel="No GRNs found."
                                />
                            </div>

                            <div
                                style={{
                                    width: 170,
                                }}
                            >
                                <Select
                                    value={paymentStatus}
                                    onChange={(event) =>
                                        setPaymentStatus(
                                            event.target.value as
                                                PaymentStatus | '',
                                        )
                                    }
                                >
                                    <option value="">-- Status --</option>

                                    <option value="Due">Due</option>

                                    <option value="Partial-paid">
                                        Partial-paid
                                    </option>

                                    <option value="Paid">Paid</option>
                                </Select>
                            </div>

                            <Button type="submit">Filter</Button>

                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                            )}
                        </form>

                        <p className="text-muted small mb-0 mt-2">
                            Bills are generated automatically when a GRN is
                            approved.
                        </p>
                    </CardHeader>

                    {/*
                    |--------------------------------------------------------------------------
                    | Body
                    |--------------------------------------------------------------------------
                    */}

                    <CardBody>
                        <div className="table-responsive">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead sticky>Bill No</TableHead>

                                        <TableHead sticky>PO</TableHead>

                                        <TableHead sticky>GRN</TableHead>

                                        <TableHead sticky>Vendor</TableHead>

                                        <TableHead sticky className="text-end">
                                            Net
                                        </TableHead>

                                        <TableHead sticky>Status</TableHead>

                                        {canView && (
                                            <TableHead
                                                sticky
                                                className="text-center"
                                            >
                                                Action
                                            </TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {data.data.length > 0 ? (
                                        data.data.map((bill) => (
                                            <TableRow key={bill.id}>
                                                <TableCell>
                                                    <strong>
                                                        {bill.bill_no}
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    {bill.purchase_order
                                                        ?.order_id ?? '—'}
                                                </TableCell>

                                                <TableCell>
                                                    {bill.goods_received_note
                                                        ?.grn_no ?? '—'}
                                                </TableCell>

                                                <TableCell>
                                                    <div>
                                                        {bill.vendor?.name ??
                                                            '—'}

                                                        {bill.vendor
                                                            ?.vendor_id && (
                                                            <small className="d-block text-muted">
                                                                #
                                                                {
                                                                    bill.vendor
                                                                        .vendor_id
                                                                }
                                                            </small>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-end">
                                                    <strong>
                                                        {formatMoney(
                                                            bill.grand_total,
                                                        )}
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`badge ${getStatusClass(
                                                            bill.payment_status,
                                                        )}`}
                                                    >
                                                        {bill.payment_status}
                                                    </span>
                                                </TableCell>

                                                {canView && (
                                                    <TableCell className="text-center">
                                                        <button
                                                            type="button"
                                                            className="border-0 bg-transparent p-0 text-primary"
                                                            title="View Bill"
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/bill/${bill.id}`,
                                                                )
                                                            }
                                                        >
                                                            <Eye size={17} />
                                                        </button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center text-muted py-4"
                                            >
                                                No bills
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <TablePaginationInfo
                                from={data?.from ?? 0}
                                to={data?.to ?? 0}
                                total={data?.total}
                            />

                            <Pagination
                                currentPage={data?.current_page}
                                lastPage={data?.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
