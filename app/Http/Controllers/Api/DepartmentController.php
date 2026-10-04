<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Department;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->user();

            return $next($request);
        });
    }

    /**
     * Display department list.
     */
    public function index(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.department')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $departments = Department::query()
            ->when(
                $request->filled('department_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->department_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return ApiResponse::success(
           data: $departments->items(),
            meta: $departments,
            message: 'Departments retrieved successfully.',
        );
    }

    /**
     * Store a new department.
     */
    public function store(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.department')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:255',
                'unique:departments,code',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:departments,name',
            ],
        ], [
            'code.required' => 'Please give a department code.',
            'code.unique' => 'This department code already exists.',
            'name.required' => 'Please give a department name.',
            'name.unique' => 'This department name already exists.',
        ]);

        $department = Department::create([
            'code' => $validated['code'],
            'name' => ucfirst($validated['name']),
            'status' => 'actionable',
        ]);

        return ApiResponse::success(
            data: $department,
            message: 'Department created successfully.',
            status: 201,
        );
    }

    /**
     * Display a single department.
     */
    public function show(Department $department)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.department')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        return ApiResponse::success(
            data: $department,
            message: 'Department retrieved successfully.',
        );
    }

    /**
     * Update a department.
     */
    public function update(
        Request $request,
        Department $department
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.department')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'code')
                    ->ignore($department->id),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'name')
                    ->ignore($department->id),
            ],
        ], [
            'code.required' => 'Please give a department code.',
            'code.unique' => 'This department code already exists.',
            'name.required' => 'Please give a department name.',
            'name.unique' => 'This department name already exists.',
        ]);

        $department->update([
            'code' => $validated['code'],
            'name' => ucfirst($validated['name']),
        ]);

        $department->refresh();

        return ApiResponse::success(
            data: $department,
            message: 'Department updated successfully.',
        );
    }

    /**
     * Delete a department.
     */
    public function destroy($id)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.department')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        try {
            $department = Department::findOrFail($id);

            if ($department->status === 'default') {
                return ApiResponse::error(
                    message: 'Default department cannot be deleted.'
                );
            }

            $department->delete();

            return ApiResponse::success(
                message: 'Department deleted successfully.',
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(
                message: 'Department not found.',
            );
        }
    }

    /**
     * Department suggestion/search list.
     */
    public function search(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.department')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $request->validate([
            'keyword' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $keyword = $request->input('keyword');

        $departments = Department::query()
            ->select([
                'id',
                'code',
                'name',
                'status',
            ])
            ->when(
                filled($keyword),
                function ($query) use ($keyword) {
                    $query->where(function ($query) use ($keyword) {
                        $query
                            ->where(
                                'name',
                                'like',
                                "%{$keyword}%"
                            )
                            ->orWhere(
                                'code',
                                'like',
                                "%{$keyword}%"
                            );
                    });
                }
            )
            ->orderBy('name')
            ->limit(20)
            ->get();

        return ApiResponse::success(
            data: $departments->items(),
            meta: $departments,
            message: 'Departments retrieved successfully.',
        );
    }
}