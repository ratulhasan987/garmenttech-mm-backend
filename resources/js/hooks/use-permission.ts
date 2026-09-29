import { usePage } from '@inertiajs/react';

import type {
    PermissionName,
} from '@/constant/permission.constant';


export function usePermission() {
    const { auth } = usePage().props;

    const permissions = auth.permissions ?? [];

    const roles = auth.roles ?? [];

    const can = (permission: PermissionName) => {
        return permissions.includes(permission);
    };

    const cannot = (permission: PermissionName) => {
        return !can(permission);
    };

    const canAny = (requiredPermissions: PermissionName[]) => {
        return requiredPermissions.some((permission) =>
            permissions.includes(permission),
        );
    };

    const canAll = (requiredPermissions: PermissionName[]) => {
        return requiredPermissions.every((permission) =>
            permissions.includes(permission),
        );
    };

    const hasRole = (role: string) => {
        return roles.includes(role);
    };

    return {
        permissions,
        roles,
        can,
        cannot,
        canAny,
        canAll,
        hasRole,
    };
}
