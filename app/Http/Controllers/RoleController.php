<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;


use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function index()
    {
        if (is_null($this->user) || !$this->user->can('role.list')) {
            abort('403', 'Unauthorized access');
        }

        $roles = Role::with('permissions')->latest()->get();
        return Inertia::render('hr/role/index', [
            "data" => $roles,
        ]);
    }

    public function create()
    {
        if (is_null($this->user) || !$this->user->can('role.create')) {
            abort('403', 'Unauthorized access');
        }

        $permissions = Permission::all();
        $permissionsGroup = User::getPermissionGroups();

        return Inertia::render('hr/role/create-role', [
            "permissions" => $permissions,
            "permissions_group" => $permissionsGroup,
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('role.create')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate(
            [
                'name' => 'required | max:100 | unique:roles'
            ],
            [
                'name.required' => 'Please give a role name'
            ]
        );
        $role = Role::create(['name' => $request->name, 'status' => 'actionable']);
        $permission = $request->permissions;
        if (!empty($permission)) {
            $role->syncPermissions($permission);
        }

        return redirect()->route('roles.index')->with("notification", [
            'message' => 'Role & Permission Created Successfully',
            'type' => 'success'
        ]);
    }

    public function edit($id)
    {
        if (is_null($this->user) || !$this->user->can('role.edit')) {
            abort('403', 'Unauthorized access');
        }

        $role = Role::findById($id);

        // Load assigned permissions for this role
        $role->load('permissions');

        $permissions = Permission::all();
        $permissionsGroup = User::getPermissionGroups();



        return Inertia::render('hr/role/edit-role', [
            "role" => $role,
            "permissions" => $permissions,
            "permissions_group" => $permissionsGroup,
        ]);


    }

    public function update(Request $request, $id)
    {
        if (is_null($this->user) || !$this->user->can('role.edit')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate(
            [
                'name' => 'required | max:100 | unique:roles,name,' . $id
            ],
            [
                'name.required' => 'Please give a role name'
            ]
        );
        $roles = Role::findById($id);
        $permission = $request->permissions;
        if (!empty($permission)) {
            $roles->name = $request->name;
            $roles->save();
            $roles->syncPermissions($permission);
        }

        // return redirect()->route('roles.index')->with("notification", [
        //     'message' => 'Role & Permission Update Successfully',
        //     'type' => 'success'
        // ]);

        return redirect()
            ->route('roles.edit', $id)
            ->with('notification', [
                'message' => 'Role & Permission Update Successfully',
                'type' => 'success',
            ]);


    }

    public function destroy(Role $role)
    {
        if (is_null($this->user) || !$this->user->can('role.delete')) {
            abort('403', 'Unauthorized access');
        }

        $role->delete();

        return redirect()->back()->with("notification", [
            'message' => 'This Role is Deleted Successfully',
            'type' => 'success'
        ]);
    }
}
