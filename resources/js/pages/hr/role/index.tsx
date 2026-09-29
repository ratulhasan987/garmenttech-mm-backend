import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import PageTitle from '@/components/page-title';
import { usePermission } from '@/hooks/use-permission';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2 } from 'react-feather';

type Role = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

export default function RolesPage({ data }: { data: Role[] }) {

    const { canAny, canAll, can } = usePermission()

    const showActions = canAny([
        "role.edit",
        "role.delete",
    ]);


    const canEditRole = canAll([
        'role.view',
        "role.edit"
    ])



    const [
        deleteModalOpen,
        setDeleteModalOpen,
    ] = useState(false);

    const [
        selectedRoleId,
        setSelectedRoleId,
    ] = useState<number | null>(null);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const handleDelete = (
        id: number,
    ) => {
        setSelectedRoleId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedRoleId) {
            return;
        }

        router.delete(
            `/roles/${selectedRoleId}`,
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
                    setSelectedRoleId(null);
                },
            },
        );
    };



    return (
        <>
         <Head title="Role & Permissions" />
            <PageTitle title="Role & Permissions" />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <section>
                            <div className="card">
                                {
                                    can("role.create") && <div className="card-header">
                                        <Link
                                            href="/roles/create"
                                            className="btn btn-primary"
                                        >
                                            Create New Role
                                        </Link>
                                    </div>
                                }

                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead className="text-gray">
                                                <tr>
                                                    <th
                                                        style={{
                                                            width: '20px',
                                                        }}
                                                    >
                                                        Sl
                                                    </th>
                                                    <th>Name</th>
                                                    {
                                                        showActions && <th
                                                            style={{
                                                                width: '100px',
                                                            }}
                                                        >
                                                            Action
                                                        </th>
                                                    }
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {data?.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td>{index + 1}</td>

                                                        <td>{item.name}</td>
                                                        {
                                                            showActions &&
                                                            <td>
                                                                <ul className="action">
                                                                    {item.name !==
                                                                        'superadmin' && canEditRole && (
                                                                            <li className="edit">
                                                                                <Link
                                                                                    href={`/roles/${item.id}/edit`}
                                                                                    title="Edit"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        width="20"
                                                                                        height="20"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />

                                                                                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                                                                                    </svg>
                                                                                </Link>
                                                                            </li>
                                                                        )}

                                                                    {item.name !==
                                                                        'superadmin' && can("role.delete") && (
                                                                            <li className="delete">
                                                                                <button
                                                                                    type="button"
                                                                                    title="Delete"
                                                                                    className="btn p-0 border-0 bg-transparent text-danger"
                                                                                    onClick={() =>
                                                                                        handleDelete(
                                                                                            item.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        width="20"
                                                                                        height="20"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <polyline points="3 6 5 6 21 6" />
                                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                                    </svg>
                                                                                </button>
                                                                            </li>
                                                                        )}
                                                                    {item?.name ===
                                                                        'superadmin' && (
                                                                            <li>
                                                                                default
                                                                            </li>
                                                                        )}
                                                                </ul>
                                                            </td>
                                                        }
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>


            {/* Delete */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) {
                        return;
                    }

                    setDeleteModalOpen(open);

                    if (!open) {
                        setSelectedRoleId(
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
