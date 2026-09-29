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

import CategoryModal from '@/components/pages/inventory/category-modal';

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
    CategoryIndexProps,
    ProductCategory,
} from '@/types/inventory';

export default function CategoryIndexPage({
    data,
    parents,
}: CategoryIndexProps) {
    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        selectedCategory,
        setSelectedCategory,
    ] =
        useState<ProductCategory | null>(
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

    const createCategory = () => {
        setSelectedCategory(
            null,
        );

        setModalOpen(
            true,
        );
    };

    const editCategory = (
        category: ProductCategory,
    ) => {
        setSelectedCategory(
            category,
        );

        setModalOpen(
            true,
        );
    };

    const deleteCategory = (
        category: ProductCategory,
    ) => {
        setSelectedCategory(
            category,
        );

        setDeleteOpen(
            true,
        );
    };

    const confirmDelete = () => {
        if (!selectedCategory) {
            return;
        }

        router.delete(
            `/operations/product-categories/${selectedCategory.id}`,
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

                    setSelectedCategory(
                        null,
                    );
                },
            },
        );
    };

    return (
        <>
        <Head title="Product Categories" />
            <PageTitle
                title="Product Categories"
            />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                                <h5 className="mb-1">
                                    Product Categories
                                </h5>

                                <p className="mb-0 text-muted">
                                    Manage parent and
                                    sub categories.
                                </p>
                            </div>

                            <Button
                                onClick={
                                    createCategory
                                }
                            >
                                Add Category
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
                                        Name
                                    </TableHead>

                                    <TableHead sticky>
                                        Parent Category
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
                                            category,
                                            index,
                                        ) => (
                                            <TableRow
                                                key={
                                                    category.id
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
                                                        category.name
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    {category
                                                        .parent
                                                        ?.name ??
                                                        'Root Category'}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-link p-0 border-0"
                                                            onClick={() =>
                                                                editCategory(
                                                                    category,
                                                                )
                                                            }
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
                                                            onClick={() =>
                                                                deleteCategory(
                                                                    category,
                                                                )
                                                            }
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
                                            4
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

            <CategoryModal
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
                        setSelectedCategory(
                            null,
                        );
                    }
                }}
                category={
                    selectedCategory
                }
                parents={
                    parents
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
                title="Delete Category?"
                description={
                    selectedCategory
                        ? `Are you sure you want to delete "${selectedCategory.name}"?`
                        : 'Delete this category?'
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}