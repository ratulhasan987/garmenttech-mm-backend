import {
    type FormEvent,
} from 'react';

import {
    Head,
    useForm,
} from '@inertiajs/react';

import PageTitle from '@/components/page-title';

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

type Role = {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Permission[];
};

type RoleForm = {
    name: string;
    permissions: string[];
};

type UpdateRolePageProps = {
    role: Role;
    permissions: Permission[];
    permissions_group: PermissionGroup[];
};

export default function UpdateRolePage({
    role,
    permissions = [],
    permissions_group = [],
}: UpdateRolePageProps) {
    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm<RoleForm>({
        name: role?.name ?? '',

        permissions:
            role?.permissions?.map(
                (permission) =>
                    permission.name,
            ) ?? [],
    });

    /*
    |--------------------------------------------------------------------------
    | All Permission Names
    |--------------------------------------------------------------------------
    */

    const allPermissions =
        permissions.map(
            (permission) =>
                permission.name,
        );

    /*
    |--------------------------------------------------------------------------
    | Check All Status
    |--------------------------------------------------------------------------
    */

    const checkAll =
        allPermissions.length > 0 &&
        allPermissions.every(
            (permission) =>
                data.permissions.includes(
                    permission,
                ),
        );

    /*
    |--------------------------------------------------------------------------
    | Check All
    |--------------------------------------------------------------------------
    */

    const handleCheckAll = (
        checked: boolean,
    ) => {
        setData(
            'permissions',
            checked
                ? allPermissions
                : [],
        );
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
                Array.from(
                    new Set([
                        ...data.permissions,
                        ...groupPermissions,
                    ]),
                ),
            );

            return;
        }

        setData(
            'permissions',
            data.permissions.filter(
                (permission) =>
                    !groupPermissions.includes(
                        permission,
                    ),
            ),
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Single Permission Toggle
    |--------------------------------------------------------------------------
    */

    const handlePermissionToggle = (
        permission: string,
        checked: boolean,
    ) => {
        if (checked) {
            setData(
                'permissions',
                Array.from(
                    new Set([
                        ...data.permissions,
                        permission,
                    ]),
                ),
            );

            return;
        }

        setData(
            'permissions',
            data.permissions.filter(
                (item) =>
                    item !== permission,
            ),
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        put(
            `/roles/${role.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Update Role" />

            <PageTitle title="Update Role" />

            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    noValidate
                                >
                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Role Name
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="form-group mb-3">
                                        <label
                                            htmlFor="name"
                                            className="form-label"
                                        >
                                            <span className="text-danger">
                                                *
                                            </span>{' '}
                                            Role name
                                        </label>

                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            className={`form-control ${errors.name
                                                    ? 'is-invalid'
                                                    : ''
                                                }`}
                                            placeholder="Enter Role Name"
                                            value={
                                                data.name
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setData(
                                                    'name',
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            disabled={
                                                processing
                                            }
                                        />

                                        {errors.name && (
                                            <div className="invalid-feedback">
                                                {
                                                    errors.name
                                                }
                                            </div>
                                        )}
                                    </div>

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Permissions
                                    |--------------------------------------------------------------------------
                                    */}

                                    <label className="form-label fw-semibold">
                                        Permissions
                                    </label>

                                    <hr />

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Check All
                                    |--------------------------------------------------------------------------
                                    */}

                                    <div className="form-check mb-3">
                                        <input
                                            id="check-all"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={
                                                checkAll
                                            }
                                            disabled={
                                                processing
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                handleCheckAll(
                                                    event
                                                        .target
                                                        .checked,
                                                )
                                            }
                                        />

                                        <label
                                            htmlFor="check-all"
                                            className="form-check-label fw-semibold"
                                        >
                                            All
                                        </label>
                                    </div>

                                    <hr />

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Permission Groups
                                    |--------------------------------------------------------------------------
                                    */}

                                    {permissions_group.map(
                                        (group) => {
                                            /*
                                            |--------------------------------------------------------------------------
                                            | Permissions belonging to group
                                            |--------------------------------------------------------------------------
                                            */

                                            const groupPermissions =
                                                permissions
                                                    .filter(
                                                        (
                                                            permission,
                                                        ) =>
                                                            permission.group_name ===
                                                            group.name,
                                                    )
                                                    .map(
                                                        (
                                                            permission,
                                                        ) =>
                                                            permission.name,
                                                    );

                                            /*
                                            |--------------------------------------------------------------------------
                                            | Group Checked Status
                                            |--------------------------------------------------------------------------
                                            */

                                            const groupChecked =
                                                groupPermissions.length >
                                                0 &&
                                                groupPermissions.every(
                                                    (
                                                        permission,
                                                    ) =>
                                                        data.permissions.includes(
                                                            permission,
                                                        ),
                                                );

                                            return (
                                                <div
                                                    key={
                                                        group.name
                                                    }
                                                    className="row mb-3"
                                                >
                                                    {/*
                                                    |--------------------------------------------------------------------------
                                                    | Group Checkbox
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                    <div className="col-md-3">
                                                        <div className="form-check">
                                                            <input
                                                                id={`group-${group.name}`}
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={
                                                                    groupChecked
                                                                }
                                                                disabled={
                                                                    processing
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    handleGroupToggle(
                                                                        groupPermissions,
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                    )
                                                                }
                                                            />

                                                            <label
                                                                htmlFor={`group-${group.name}`}
                                                                className="form-check-label fw-semibold"
                                                            >
                                                                {
                                                                    group.name
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/*
                                                    |--------------------------------------------------------------------------
                                                    | Group Permission Items
                                                    |--------------------------------------------------------------------------
                                                    */}

                                                    <div className="col-md-9">
                                                        {permissions
                                                            .filter(
                                                                (
                                                                    permission,
                                                                ) =>
                                                                    permission.group_name ===
                                                                    group.name,
                                                            )
                                                            .map(
                                                                (
                                                                    permission,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                        className="form-check mb-2"
                                                                    >
                                                                        <input
                                                                            id={`permission-${permission.id}`}
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            checked={data.permissions.includes(
                                                                                permission.name,
                                                                            )}
                                                                            disabled={
                                                                                processing
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                handlePermissionToggle(
                                                                                    permission.name,
                                                                                    event
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
                                        },
                                    )}

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Permission Validation Error
                                    |--------------------------------------------------------------------------
                                    */}

                                    {errors.permissions && (
                                        <div className="text-danger mb-3">
                                            {
                                                errors.permissions
                                            }
                                        </div>
                                    )}

                                    {/*
                                    |--------------------------------------------------------------------------
                                    | Submit
                                    |--------------------------------------------------------------------------
                                    */}

                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={
                                            processing
                                        }
                                    >
                                        {processing
                                            ? 'Updating...'
                                            : 'Update Role'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}