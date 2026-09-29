import PageTitle from '@/components/page-title';
import { useForm } from '@inertiajs/react';
import type { SubmitEvent } from 'react';

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    group_name: string;
    created_at: string;
    updated_at: string;
};

type PermissionGroup = {
    name: string;
};

type RoleForm = {
    name: string;
    permissions: string[];
};

type CreateRolePageProps = {
    permissions: Permission[];
    permissions_group: PermissionGroup[];
};

export default function CreateRolePage({
    permissions,
    permissions_group,
}: CreateRolePageProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<RoleForm>({
            name: '',
            permissions: [],
        });

    /*
    |--------------------------------------------------------------------------
    | All Permission Names
    |--------------------------------------------------------------------------
    */

    const allPermissions = permissions.map((permission) => permission.name);

    /*
    |--------------------------------------------------------------------------
    | Check All Status
    |--------------------------------------------------------------------------
    */

    const checkAll =
        allPermissions.length > 0 &&
        allPermissions.every((permission) =>
            data.permissions.includes(permission),
        );

    /*
    |--------------------------------------------------------------------------
    | Check All
    |--------------------------------------------------------------------------
    */

    const handleCheckAll = (checked: boolean) => {
        if (checked) {
            setData('permissions', allPermissions);
        } else {
            setData('permissions', []);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Group Toggle
    |--------------------------------------------------------------------------
    */

    const handleGroupToggle = (
        groupPermissions: string[],
        checked: boolean,
    ) => {
        if (checked) {
            setData(
                'permissions',
                Array.from(new Set([...data.permissions, ...groupPermissions])),
            );
        } else {
            setData(
                'permissions',
                data.permissions.filter(
                    (permission) => !groupPermissions.includes(permission),
                ),
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Single Permission Toggle
    |--------------------------------------------------------------------------
    */

    const handlePermissionToggle = (permission: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permission]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((item) => item !== permission),
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/roles', {
            preserveScroll: true,

            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <>
            <PageTitle title="Create Role" />

            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <section>
                            <div className="card">
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        {/* ROLE NAME */}
                                        <div className="form-group mb-3">
                                            <label htmlFor="name">
                                                * Role name
                                            </label>

                                            <input
                                                id="name"
                                                type="text"
                                                className={`form-control ${
                                                    errors.name
                                                        ? 'is-invalid'
                                                        : ''
                                                }`}
                                                placeholder="Enter Role Name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                            {errors.name && (
                                                <div className="invalid-feedback">
                                                    {errors.name}
                                                </div>
                                            )}
                                        </div>

                                        {/* PERMISSION */}
                                        <label className="form-check-label">
                                            Permission
                                        </label>

                                        <hr />

                                        {/* CHECK ALL */}
                                        <div className="form-check mb-3">
                                            <input
                                                id="check-all"
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={checkAll}
                                                onChange={(e) =>
                                                    handleCheckAll(
                                                        e.target.checked,
                                                    )
                                                }
                                            />

                                            <label
                                                htmlFor="check-all"
                                                className="form-check-label"
                                            >
                                                All
                                            </label>
                                        </div>

                                        <hr />

                                        {/* PERMISSION GROUPS */}
                                        {permissions_group.map((group) => {
                                            const groupPermissions = permissions
                                                .filter(
                                                    (permission) =>
                                                        permission.group_name ===
                                                        group.name,
                                                )
                                                .map(
                                                    (permission) =>
                                                        permission.name,
                                                );

                                            const groupChecked =
                                                groupPermissions.length > 0 &&
                                                groupPermissions.every(
                                                    (permission) =>
                                                        data.permissions.includes(
                                                            permission,
                                                        ),
                                                );

                                            return (
                                                <div
                                                    className="row mb-3"
                                                    key={group.name}
                                                >
                                                    {/* GROUP */}
                                                    <div className="col-md-3">
                                                        <div className="form-check">
                                                            <input
                                                                id={`group-${group.name}`}
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={
                                                                    groupChecked
                                                                }
                                                                onChange={(e) =>
                                                                    handleGroupToggle(
                                                                        groupPermissions,
                                                                        e.target
                                                                            .checked,
                                                                    )
                                                                }
                                                            />

                                                            <label
                                                                htmlFor={`group-${group.name}`}
                                                                className="form-check-label fw-semibold"
                                                            >
                                                                {group.name}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* GROUP PERMISSIONS */}
                                                    <div className="col-md-9">
                                                        {permissions
                                                            .filter(
                                                                (permission) =>
                                                                    permission.group_name ===
                                                                    group.name,
                                                            )
                                                            .map(
                                                                (
                                                                    permission,
                                                                ) => (
                                                                    <div
                                                                        className="form-check"
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                    >
                                                                        <input
                                                                            id={`permission-${permission.id}`}
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            checked={data.permissions.includes(
                                                                                permission.name,
                                                                            )}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handlePermissionToggle(
                                                                                    permission.name,
                                                                                    e
                                                                                        .target
                                                                                        .checked,
                                                                                )
                                                                            }
                                                                        />

                                                                        <label
                                                                            htmlFor={`permission-${permission.id}`}
                                                                            className="form-check-label"
                                                                        >
                                                                            {
                                                                                permission.name
                                                                            }
                                                                        </label>
                                                                    </div>
                                                                ),
                                                            )}

                                                        <hr />
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {errors.permissions && (
                                            <div className="text-danger mb-3">
                                                {errors.permissions}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="btn btn-primary mt-3 px-4"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Creating...'
                                                : 'Create'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

