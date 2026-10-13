import {
    useState,
} from 'react';

import {
    Head,
    router,
} from '@inertiajs/react';

import {
    Edit,
    Trash,
} from 'react-feather';

import {
    DeleteConfirmModal,
} from '@/components/modals/delete-confirm-modal';

import BrandModal from '@/components/pages/inventory/brand-modal';

import PageTitle from '@/components/page-title';

import {
    TableEmpty,
} from '@/components/shared/table-empty';

import {
    TablePaginationInfo,
} from '@/components/shared/table-pagination-info';

import { Button } from '@/components/ui/button';

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import {
    Pagination,
} from '@/components/ui/pagination';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type {
    BrandIndexProps,
    ProductBrand,
} from '@/types/inventory';

export default function BrandIndexPage({
    data,
}: BrandIndexProps) {
    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        selectedBrand,
        setSelectedBrand,
    ] =
        useState<ProductBrand | null>(
            null,
        );

    const [
        deleteOpen,
        setDeleteOpen,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const handlePageChange = (
        page: number,
    ) => {
        router.get(
            window.location.pathname,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const confirmDelete = () => {
        if (!selectedBrand) {
            return;
        }

        router.delete(
            `/brand/${selectedBrand.id}`,
            {
                preserveScroll: true,

                onStart: () =>
                    setDeleting(
                        true,
                    ),

                onFinish: () =>
                    setDeleting(
                        false,
                    ),

                onSuccess: () => {
                    setDeleteOpen(
                        false,
                    );

                    setSelectedBrand(
                        null,
                    );
                },
            },
        );
    };

    return (
        <>
        <Head title="Brands" />
            <PageTitle title="Brands" />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">
                                    Product Brands
                                </h5>

                                <p className="mb-0 text-muted">
                                    Manage product
                                    manufacturers and
                                    brands.
                                </p>
                            </div>

                            <Button
                                onClick={() => {
                                    setSelectedBrand(
                                        null,
                                    );

                                    setModalOpen(
                                        true,
                                    );
                                }}
                            >
                                Add Brand
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <Table
                            wrapperClassName="overflow-auto"
                            wrapperStyle={{
                                maxHeight:
                                    'calc(100vh - 350px)',
                            }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead sticky>
                                        Sl
                                    </TableHead>

                                    <TableHead sticky>
                                        Brand Name
                                    </TableHead>

                                    <TableHead sticky>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data
                                    .length >
                                0 ? (
                                    data.data.map(
                                        (
                                            brand,
                                            index,
                                        ) => (
                                            <TableRow
                                                key={
                                                    brand.id
                                                }
                                            >
                                                <TableCell>
                                                    {(data.current_page -
                                                        1) *
                                                        data.per_page +
                                                        index +
                                                        1}
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        brand.name
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-0 border-0"
                                                            onClick={() => {
                                                                setSelectedBrand(
                                                                    brand,
                                                                );

                                                                setModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Edit
                                                                size={
                                                                    22
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-0 border-0 text-danger"
                                                            onClick={() => {
                                                                setSelectedBrand(
                                                                    brand,
                                                                );

                                                                setDeleteOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Trash
                                                                size={
                                                                    22
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                ) : (
                                    <TableEmpty
                                        colSpan={
                                            3
                                        }
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
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

            <BrandModal
                open={
                    modalOpen
                }
                onOpenChange={(
                    open,
                ) => {
                    setModalOpen(
                        open,
                    );

                    if (!open) {
                        setSelectedBrand(
                            null,
                        );
                    }
                }}
                brand={
                    selectedBrand
                }
            />

            <DeleteConfirmModal
                open={
                    deleteOpen
                }
                onOpenChange={
                    setDeleteOpen
                }
                processing={
                    deleting
                }
                title="Delete Brand?"
                description={
                    selectedBrand
                        ? `Are you sure you want to delete "${selectedBrand.name}"?`
                        : 'Delete this brand?'
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}