<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Designation;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DesignationController extends Controller
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
     * Display designation list.
     */
    public function index(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.designation')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $designations = Designation::query()
            ->when(
                $request->filled('designation_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->designation_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return ApiResponse::success(
            data: $designations,
            message: 'Designations retrieved successfully.',
        );
    }

    /**
     * Store a new designation.
     */
    public function store(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.designation')
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
                'unique:designations,code',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:designations,name',
            ],
        ], [
            'code.required' => 'Please give a designation code.',
            'code.unique' => 'This designation code already exists.',

            'name.required' => 'Please give a designation name.',
            'name.unique' => 'This designation name already exists.',
        ]);

        $designation = Designation::create([
            'code' => $validated['code'],
            'name' => ucfirst($validated['name']),
            'status' => 'actionable',
        ]);

        return ApiResponse::success(
            data: $designation,
            message: 'Designation created successfully.',
            status: 201,
        );
    }

    /**
     * Display a single designation.
     */
    public function show(Designation $designation)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.designation')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        return ApiResponse::success(
            data: $designation,
            message: 'Designation retrieved successfully.',
        );
    }

    /**
     * Update a designation.
     */
    public function update(
        Request $request,
        Designation $designation
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.designation')
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
                Rule::unique('designations', 'code')
                    ->ignore($designation->id),
            ],

            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('designations', 'name')
                    ->ignore($designation->id),
            ],
        ], [
            'code.required' => 'Please give a designation code.',
            'code.unique' => 'This designation code already exists.',

            'name.required' => 'Please give a designation name.',
            'name.unique' => 'This designation name already exists.',
        ]);

        $designation->update([
            'code' => $validated['code'],
            'name' => ucfirst($validated['name']),
        ]);

        $designation->refresh();

        return ApiResponse::success(
            data: $designation,
            message: 'Designation updated successfully.',
        );
    }

    /**
     * Delete designation.
     */
    public function destroy($id)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.designation')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        try {
            $designation = Designation::findOrFail($id);

            if ($designation->status === 'default') {
                return ApiResponse::error(
                    message: 'Default designation cannot be deleted.'
                );
            }

            $designation->delete();

            return ApiResponse::success(
                message: 'Designation deleted successfully.',
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(
                message: 'Designation not found.',
            );
        }
    }

    /**
     * Search designations.
     */
    public function search(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.designation')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'keyword' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $keyword = $validated['keyword'] ?? null;

        $designations = Designation::query()
            ->select([
                'id',
                'name',
                'code',
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
            data: $designations,
            message: 'Designations retrieved successfully.',
        );
    }
}