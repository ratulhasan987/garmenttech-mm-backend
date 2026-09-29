import {
    useState,
} from 'react';

import {
    router,
} from '@inertiajs/react';

import {
    Send,
    Trash,
} from 'react-feather';

import {
    ConfirmModal,
} from '@/components/modals/confirm-modal';

import {
    DeleteConfirmModal,
} from '@/components/modals/delete-confirm-modal';

import PageTitle from '@/components/page-title';

import {
    TableEmpty,
} from '@/components/shared/table-empty';

import {
    TablePaginationInfo,
} from '@/components/shared/table-pagination-info';

import StockDocumentModal from '@/components/pages/inventory/stock-document-modal';

import {
    Button,
} from '@/components/ui/button';

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
    StockDocument,
    StockDocumentIndexProps,
    StockDocumentMode,
} from '@/types/inventory';

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type Props =
    StockDocumentIndexProps & {
        mode: StockDocumentMode;

        title: string;

        endpoint: string;
    };

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getDate(
    document: StockDocument,
    mode: StockDocumentMode,
): string {
    const value =
        mode === 'receive'
            ? document.receive_date
            : mode === 'issue'
              ? document.issue_date
              : mode ===
                  'adjustment'
                ? document.adjustment_date
                : document.transfer_date;

    if (!value) {
        return '-';
    }

    return value.slice(
        0,
        10,
    );
}

function getWarehouseLabel(
    document: StockDocument,
    mode: StockDocumentMode,
) {
    if (mode === 'transfer') {
        return (
            <div className="text-nowrap">
                <div>
                    <strong>
                        From:
                    </strong>{' '}
                    {document
                        .from_warehouse
                        ?.name ??
                        '-'}
                </div>

                <div>
                    <strong>
                        To:
                    </strong>{' '}
                    {document
                        .to_warehouse
                        ?.name ??
                        '-'}
                </div>
            </div>
        );
    }

    return (
        document.warehouse
            ?.name ??
        '-'
    );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export function StockDocumentIndex({
    data,
    products,
    warehouses,
    mode,
    title,
    endpoint,
}: Props) {
    /*
    |--------------------------------------------------------------------------
    | Create Modal
    |--------------------------------------------------------------------------
    */

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Delete State
    |--------------------------------------------------------------------------
    */

    const [
        selectedDocument,
        setSelectedDocument,
    ] =
        useState<StockDocument | null>(
            null,
        );

    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Post State
    |--------------------------------------------------------------------------
    */

    const [
        postModalOpen,
        setPostModalOpen,
    ] = useState(false);

    const [
        selectedPostDocument,
        setSelectedPostDocument,
    ] =
        useState<StockDocument | null>(
            null,
        );

    const [
        postingId,
        setPostingId,
    ] =
        useState<number | null>(
            null,
        );

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Open Post Confirmation
    |--------------------------------------------------------------------------
    */

    const handlePost = (
        document: StockDocument,
    ) => {
        if (
            document.status !==
            'draft'
        ) {
            return;
        }

        setSelectedPostDocument(
            document,
        );

        setPostModalOpen(
            true,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Post
    |--------------------------------------------------------------------------
    */

    const confirmPost = () => {
        if (
            !selectedPostDocument
        ) {
            return;
        }

        const document =
            selectedPostDocument;

        router.post(
            `${endpoint}/${document.id}/post`,
            {},
            {
                preserveScroll: true,

                onStart: () => {
                    setPostingId(
                        document.id,
                    );
                },

                onSuccess: () => {
                    setPostModalOpen(
                        false,
                    );

                    setSelectedPostDocument(
                        null,
                    );
                },

                onFinish: () => {
                    setPostingId(
                        null,
                    );
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Post Modal Open Change
    |--------------------------------------------------------------------------
    */

    const handlePostModalChange = (
        open: boolean,
    ) => {
        if (
            postingId !== null
        ) {
            return;
        }

        setPostModalOpen(
            open,
        );

        if (!open) {
            setSelectedPostDocument(
                null,
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = (
        document: StockDocument,
    ) => {
        setSelectedDocument(
            document,
        );

        setDeleteModalOpen(
            true,
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Delete
    |--------------------------------------------------------------------------
    */

    const confirmDelete = () => {
        if (!selectedDocument) {
            return;
        }

        router.delete(
            `${endpoint}/${selectedDocument.id}`,
            {
                preserveScroll: true,

                onStart: () => {
                    setDeleting(
                        true,
                    );
                },

                onFinish: () => {
                    setDeleting(
                        false,
                    );
                },

                onSuccess: () => {
                    setDeleteModalOpen(
                        false,
                    );

                    setSelectedDocument(
                        null,
                    );
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Modal Open Change
    |--------------------------------------------------------------------------
    */

    const handleDeleteModalChange = (
        open: boolean,
    ) => {
        if (
            deleting
        ) {
            return;
        }

        setDeleteModalOpen(
            open,
        );

        if (!open) {
            setSelectedDocument(
                null,
            );
        }
    };

    return (
        <>
            <PageTitle
                title={
                    title
                }
            />

            <div className="container-fluid">
                <Card>
                    <CardHeader>
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
                            <div>
                                <h5 className="mb-1">
                                    {title}
                                </h5>

                                <p className="text-muted mb-0">
                                    Create,
                                    review and
                                    post{' '}
                                    {title.toLowerCase()}
                                    {' '}
                                    documents.
                                </p>
                            </div>

                            <Button
                                onClick={() =>
                                    setModalOpen(
                                        true,
                                    )
                                }
                            >
                                Add New
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
                                        Reference
                                    </TableHead>

                                    <TableHead sticky>
                                        Date
                                    </TableHead>

                                    <TableHead sticky>
                                        Warehouse
                                    </TableHead>

                                    <TableHead
                                        sticky
                                        className="text-center"
                                    >
                                        Items
                                    </TableHead>

                                    <TableHead sticky>
                                        Status
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
                                            document,
                                            index,
                                        ) => (
                                            <TableRow
                                                key={
                                                    document.id
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
                                                    <strong className="text-nowrap">
                                                        {
                                                            document.reference_no
                                                        }
                                                    </strong>
                                                </TableCell>

                                                <TableCell className="text-nowrap">
                                                    {getDate(
                                                        document,
                                                        mode,
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {getWarehouseLabel(
                                                        document,
                                                        mode,
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <span className="badge bg-light text-dark">
                                                        {
                                                            document
                                                                .items
                                                                .length
                                                        }
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <StatusBadge
                                                        status={
                                                            document.status
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {document.status ===
                                                        'draft' ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            {/*
                                                            |--------------------------------------------------------------------------
                                                            | Post
                                                            |--------------------------------------------------------------------------
                                                            */}

                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0 border-0"
                                                                title="Post document"
                                                                disabled={
                                                                    postingId ===
                                                                    document.id
                                                                }
                                                                onClick={() =>
                                                                    handlePost(
                                                                        document,
                                                                    )
                                                                }
                                                            >
                                                                {postingId ===
                                                                document.id ? (
                                                                    <span
                                                                        className="spinner-border spinner-border-sm"
                                                                        role="status"
                                                                        aria-hidden="true"
                                                                    />
                                                                ) : (
                                                                    <Send
                                                                        size={
                                                                            22
                                                                        }
                                                                    />
                                                                )}
                                                            </button>

                                                            {/*
                                                            |--------------------------------------------------------------------------
                                                            | Delete
                                                            |--------------------------------------------------------------------------
                                                            */}

                                                            <button
                                                                type="button"
                                                                className="btn btn-link text-danger p-0 border-0"
                                                                title="Delete"
                                                                disabled={
                                                                    deleting ||
                                                                    postingId !==
                                                                        null
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        document,
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
                                                    ) : (
                                                        <span className="text-muted">
                                                            Posted
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )
                                ) : (
                                    <TableEmpty
                                        colSpan={
                                            7
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

            {/*
            |--------------------------------------------------------------------------
            | Stock Document Modal
            |--------------------------------------------------------------------------
            */}

            <StockDocumentModal
                open={
                    modalOpen
                }
                onOpenChange={
                    setModalOpen
                }
                mode={
                    mode
                }
                endpoint={
                    endpoint
                }
                products={
                    products
                }
                warehouses={
                    warehouses
                }
            />

            {/*
            |--------------------------------------------------------------------------
            | Post Confirmation Modal
            |--------------------------------------------------------------------------
            */}

            <ConfirmModal
                open={
                    postModalOpen
                }
                onOpenChange={
                    handlePostModalChange
                }
                onConfirm={
                    confirmPost
                }
                title="Post Stock Document?"
                description={
                    selectedPostDocument
                        ? `Are you sure you want to post "${selectedPostDocument.reference_no}"? Stock will be updated and this document cannot be edited afterward.`
                        : 'Are you sure you want to post this stock document?'
                }
                confirmText="Post Document"
                cancelText="Cancel"
                confirmVariant="success"
                processing={
                    postingId !==
                    null
                }
                processingText="Posting..."
                icon={
                    <div
                        className="
                            d-flex
                            align-items-center
                            justify-content-center
                            rounded-circle
                            border
                            border-3
                            border-success
                            text-success
                        "
                        style={{
                            width: 80,
                            height: 80,
                        }}
                    >
                        <Send
                            size={
                                36
                            }
                        />
                    </div>
                }
            />

            {/*
            |--------------------------------------------------------------------------
            | Delete Confirmation Modal
            |--------------------------------------------------------------------------
            */}

            <DeleteConfirmModal
                open={
                    deleteModalOpen
                }
                onOpenChange={
                    handleDeleteModalChange
                }
                processing={
                    deleting
                }
                title="Delete Draft?"
                description={
                    selectedDocument
                        ? `Are you sure you want to delete "${selectedDocument.reference_no}"?`
                        : 'Are you sure you want to delete this draft?'
                }
                onConfirm={
                    confirmDelete
                }
            />
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

function StatusBadge({
    status,
}: {
    status: string;
}) {
    if (
        status === 'posted'
    ) {
        return (
            <span className="badge bg-success">
                Posted
            </span>
        );
    }

    if (
        status === 'cancelled'
    ) {
        return (
            <span className="badge bg-danger">
                Cancelled
            </span>
        );
    }

    return (
        <span className="badge bg-warning text-dark">
            Draft
        </span>
    );
}