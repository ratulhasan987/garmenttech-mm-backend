<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{

    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->user(); // Uses the default guard (sanctum for API)
            return $next($request);
        });
    }

    public function index()
    {
        if (is_null($this->user) || !$this->user->can('role.list')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $roles = Role::with('permissions')
            ->latest()
            ->get();

        return ApiResponse::success(
            data: $roles,
            message: 'Roles retrieved successfully.',
        );
    }

    public function createData()
    {
        $permissions = Permission::all();
        $permissionGroups = User::getPermissionGroups();

        return ApiResponse::success(
            data: [
                'permissions' => $permissions,
                'permissionGroups' => $permissionGroups,
            ],
            message: 'Role creation data retrieved successfully.',
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:100', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ], [
            'name.required' => 'Please give a role name.',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'status' => 'actionable',
            'guard_name' => 'web',
        ]);

        $permission = $request->permissions;
        if (!empty($permission)) {
            $role->syncPermissions($permission);
        }


        $role->load('permissions');

        return ApiResponse::success(
            data: $role,
            message: 'Role & permissions created successfully.',
            status: 201,
        );
    }

    public function show(Role $role)
    {
        $role->load('permissions');

        return ApiResponse::success(
            data: $role,
            message: 'Role retrieved successfully.',
        );

    }


    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => [
                'nullable',
                'string',
                'max:100',
                'unique:roles,name,' . $role->id,
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        if (array_key_exists('name', $validated)) {
            $role->update([
                'name' => $validated['name'],
            ]);
        }

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions($validated['permissions']);
        }


        $role->load('permissions');

        return ApiResponse::success(
            data: $role,
            message: 'Role & permissions updated successfully.',
        );
    }

    public function destroy($id)
    {
        try {

            $role = Role::findOrFail($id);
            $role->delete();

            return ApiResponse::success(
                message: 'Role deleted successfully.',
            );

        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(
                message: 'Role not found.',
            );
        }
    }
}
