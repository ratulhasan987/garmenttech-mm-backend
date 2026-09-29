<?php

namespace App\Http\Controllers\Api;

use App\Actions\User\CreateUser;
use App\Actions\User\UpdateUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public $user;

    private UserService $userService;


    public function __construct(UserService $userService)
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->user();
            return $next($request);
        });

        $this->userService = $userService;


    }

    public function index(Request $request): JsonResponse
    {
        if (is_null($this->user) || !$this->user->can('user.list')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $query = User::query()
            ->select([
                'id',
                'employee_id',
                'image',
                'name',
                'email',
                'role',
                'department_id',
                'designation_id',
                'reporting_officer',
                'last_login_at',
                'status',
                'created_at',
            ])
            ->with([
                'department:id,code,name',
                'designation:id,code,name',
                'reportingOfficer:id,name',
            ]);

        $query
            ->when(
                $request->filled('user'),
                fn($query) =>
                    $query->whereKey($request->user)
            )
            ->when(
                $request->filled('department'),
                fn($query) =>
                    $query->where(
                        'department_id',
                        $request->department
                    )
            )
            ->when(
                $request->filled('status'),
                fn($query) =>
                    $query->where(
                        'status',
                        $request->status
                    )
            );

        $query->when(
            $request->filled('sorting'),
            function ($query) use ($request) {

                match ($request->sorting) {
                    'latest' =>
                        $query->latest(),

                    'oldest' =>
                        $query->oldest(),

                    'name_asc' =>
                        $query->orderBy('name'),

                    'name_desc' =>
                        $query->orderByDesc('name'),

                    default =>
                        $query->latest(),
                };
            }
        );

        $users = $query
            ->paginate(
                $request->integer('per_page', 30)
            )
            ->withQueryString();

        return ApiResponse::success(
            message: 'Users data retrived successfully.',
            data: $users->items(),
            meta: $users
        );
    }



    public function store(
        StoreUserRequest $request,
        CreateUser $createUser
    ): JsonResponse {
        if (is_null($this->user) || !$this->user->can('user.create')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $user = $createUser->handle(
            $request->validated()
        );

        $user->load([
            'department:id,code,name',
            'designation:id,code,name',
            'reportingOfficer:id,name',
            'roles:id,name',
        ]);

        return ApiResponse::success(
            message: 'User successfully created.',
            data: $user,
        );

    }

    public function show(User $user): JsonResponse
    {
        if (is_null($this->user) || !$this->user->can('user.view')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $user->load([
            'department:id,code,name',
            'designation:id,code,name',
            'reportingOfficer:id,name',
            'roles:id,name',
        ]);

        return ApiResponse::success(
            message: 'User data retrived successfully.',
            data: $user,
        );
    }

    public function update(
        UpdateUserRequest $request,
        User $user,
        UpdateUser $updateUser
    ): JsonResponse {
        if (is_null($this->user) || !$this->user->can('user.edit')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $user = $updateUser->handle(
            $user,
            $request->validated()
        );

        $user->load([
            'department:id,code,name',
            'designation:id,code,name',
            'reportingOfficer:id,name',
            'roles:id,name',
        ]);


        return ApiResponse::success(
            message: 'User data updated successfully.',
            data: $user,
        );
    }

    public function destroy(User $user): JsonResponse
    {
        if (is_null($this->user) || !$this->user->can('user.delete')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $user->delete();


        return ApiResponse::success(
            message: 'User deleted successfully',
        );
    }

    public function status(User $user): JsonResponse
    {
        if (is_null($this->user) || !$this->user->can('user.status')) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        if ($user->hasRole('superadmin')) {
            abort(403, 'Super admin status cannot be changed.');
        }

        $newStatus = $user->status === 'active'
            ? 'inactive'
            : 'active';

        $user->update([
            'status' => $newStatus,
            'remember_token' => null,
        ]);


        return ApiResponse::success(
            message: 'User status updated successfully',
            data: $user->fresh()
        );

    }

    public function employees(
        Request $request
    ): JsonResponse {

        return $this->userService->employees($request->keyord);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return ApiResponse::success(
            message: 'User data retrieved successfully',
            data: $this->userService->userData($user)
        );
    }

}
