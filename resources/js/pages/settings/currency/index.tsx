import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { TableEmpty } from '@/components/shared/table-empty';
import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PaginatedData } from '@/types/pagination';

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Edit, Trash } from 'react-feather';
import { SuggestionSearchInput } from '@/components/ui/form/suggestion-search-input';
import { Currency } from '@/types/currency';
import CreateCurrencyModal from '@/components/pages/currency/create-currency-modal';
import EditCurrencyModal from '@/components/pages/currency/edit-currency-modal';
import { Pill } from '@/components/ui/badge';

type Props = {
    data: PaginatedData<Currency>;
    filters: {
        currency_id?: number | string | null;
    };
};

type CurrencySuggestion = {
    id: number;
    currency_code: string;
    currency_name: string;
    country: string | null;
};

async function searchUnits(
    query: string,
    signal?: AbortSignal,
): Promise<CurrencySuggestion[]> {
    const response = await fetch(
        `/get-currencies?keyword=${encodeURIComponent(query)}`,
        {
            signal,
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            'Failed to search designations.',
        );
    }

    return response.json();
}

export default function DesignationIndexPage({
    data,
    filters
}: Props) {
    const [
        createModalOpen,
        setCreateModalOpen,
    ] = useState(false);

    const [
        editModalOpen,
        setEditModalOpen,
    ] = useState(false);

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const [
        selectedDepartment,
        setSelectedDepartment,
    ] = useState<Currency | null>(null);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const handlePageChange = (
        page: number,
    ) => {
        router.get(
            window.location.pathname,
            {
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleEdit = (
        department: Currency,
    ) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleDelete = (
        department: Currency,
    ) => {
        setSelectedDepartment(department);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDepartment) {
            return;
        }

        router.delete(
            `/currency/${selectedDepartment.id}`,
            {
                preserveScroll: true,

                onStart: () => {
                    setDeleting(true);
                },

                onFinish: () => {
                    setDeleting(false);
                },

                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setSelectedDepartment(null);
                },
            },
        );
    };

    const handleCurrencySelect = (
        currency: CurrencySuggestion | null,
    ) => {
        router.get(
            window.location.pathname,
            currency
                ? {
                    currency_id: currency.id,
                }
                : {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };



    return (
        <>
         <Head title="Currencies" />
            <PageTitle title="Currencies" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <Button
                                onClick={() =>
                                    setCreateModalOpen(
                                        true,
                                    )
                                }
                            >
                                Add New
                            </Button>

                            {/* <Input
                                className="d-inline w-auto"
                                placeholder="Quick Search..."
                            /> */}
                            <SuggestionSearchInput<CurrencySuggestion>
                                searchFn={searchUnits}
                                idKey="id"
                                labelKey="currency_code"
                                secondaryLabelKey="currency_name"
                                placeholder="Quick Search..."
                                showSearchIcon
                                onSelect={(designation) => { handleCurrencySelect(designation) }}
                                onClear={() => {
                                    handleCurrencySelect(null)
                                }}
                                clearOnFocus

                            />
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div>
                            <Table wrapperClassName="overflow-auto"
                                wrapperStyle={{
                                    maxHeight: 'calc(100vh - 350px)',
                                }}>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead sticky>
                                            Sl
                                        </TableHead>
                                        <TableHead sticky>
                                            Code
                                        </TableHead>

                                        <TableHead sticky>
                                            Name
                                        </TableHead>
                                        <TableHead sticky>
                                            Symbol
                                        </TableHead>
                                        <TableHead sticky>
                                            Country
                                        </TableHead>
                                        <TableHead sticky>
                                            Exchange Rate
                                        </TableHead>
                                        <TableHead sticky>
                                            Status
                                        </TableHead>

                                        <TableHead sticky>
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className=''>
                                    {data.data.length > 0 ? (
                                        data.data.map(
                                            (
                                                currency,
                                                idx,
                                            ) => (
                                                <TableRow
                                                    key={
                                                        currency.id
                                                    }
                                                >
                                                    <TableCell>
                                                        {(data.current_page -
                                                            1) *
                                                            data.per_page +
                                                            idx +
                                                            1}
                                                    </TableCell>



                                                    <TableCell>
                                                        {
                                                            currency?.currency_code
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            currency?.currency_name
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            currency?.symbol
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            currency?.country
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            currency?.exchange_rate
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {currency?.is_active && <Pill variant="success">Active</Pill>}
                                                    </TableCell>

                                                    <TableCell>
                                                        <ActionCell
                                                            onEdit={() =>
                                                                handleEdit(
                                                                    currency,
                                                                )
                                                            }
                                                            onDelete={() =>
                                                                handleDelete(
                                                                    currency,
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )
                                    ) : (
                                        <TableEmpty
                                            colSpan={
                                                4
                                            }
                                        />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={
                                    data.from ??
                                    0
                                }
                                to={
                                    data.to ??
                                    0
                                }
                                total={
                                    data.total
                                }
                            />

                            <Pagination
                                currentPage={
                                    data.current_page
                                }
                                lastPage={
                                    data.last_page
                                }
                                onPageChange={
                                    handlePageChange
                                }
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Create */}
            <CreateCurrencyModal
                open={createModalOpen}
                onOpenChange={
                    setCreateModalOpen
                }
            />

            {/* Edit */}
            <EditCurrencyModal
                open={editModalOpen}
                onOpenChange={(open) => {
                    setEditModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(
                            null,
                        );
                    }
                }}
                currency={
                    selectedDepartment
                }
            />

            {/* Delete */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedDepartment(
                            null,
                        );
                    }
                }}
                processing={deleting}

                onConfirm={confirmDelete}
            />
        </>
    );
}

type ActionCellProps = {
    onEdit: () => void;
    onDelete: () => void;
};

function ActionCell({
    onEdit,
    onDelete,
}: ActionCellProps) {
    return (
        <ul className="d-flex align-items-center gap-2 mb-0 p-0 list-unstyled">
            <li>
                <button
                    type="button"
                    title="Edit"
                    className="btn btn-link p-0 border-0"
                    onClick={onEdit}
                >
                    <Edit size={24} />
                </button>
            </li>

            <li>
                <button
                    type="button"
                    title="Delete"
                    className="btn text-danger btn-link p-0 border-0"
                    onClick={onDelete}
                >
                    <Trash size={24} />
                </button>
            </li>
        </ul>
    );
}
