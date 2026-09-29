<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\Department;
use App\Models\Designation;
use App\Models\SalaryIncrement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalaryIncrementController extends Controller
{
    public $user;


    /*
    |--------------------------------------------------------------------------
    | Constructor
    |--------------------------------------------------------------------------
    */

    public function __construct()
    {
        $this->middleware(function (
            $request,
            $next
        ) {

            $this->user =
                auth()
                    ->guard('web')
                    ->user();

            return $next($request);
        });
    }


    /*
    |--------------------------------------------------------------------------
    | Increment List
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.list'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Query
        |--------------------------------------------------------------------------
        */

        $query =
            SalaryIncrement::query()
                ->with([
                    'user:id,employee_id,name,department_id,designation_id',
                    'user.department:id,code,name',
                    'user.designation:id,code,name',
                ]);


        /*
        |--------------------------------------------------------------------------
        | Employee Filter
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('user')
        ) {

            $query->where(
                'user_id',
                $request->input('user')
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Department Filter
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('department')
        ) {

            $query->whereHas(
                'user',
                function ($userQuery) use (
                    $request
                ) {

                    $userQuery->where(
                        'department_id',
                        $request->input(
                            'department'
                        )
                    );
                }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Designation Filter
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('designation')
        ) {

            $query->whereHas(
                'user',
                function ($userQuery) use (
                    $request
                ) {

                    $userQuery->where(
                        'designation_id',
                        $request->input(
                            'designation'
                        )
                    );
                }
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Status Filter
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('status')
        ) {

            $query->where(
                'status',
                $request->input('status')
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        $sorting =
            $request->input(
                'sorting',
                'desc'
            );


        if (
            $sorting === 'asc'
        ) {

            $query->orderBy(
                'effective_date',
                'asc'
            );

        } else {

            $query->orderBy(
                'effective_date',
                'desc'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Secondary Sorting
        |--------------------------------------------------------------------------
        */

        $query->orderBy(
            'id',
            'desc'
        );


        /*
        |--------------------------------------------------------------------------
        | Count
        |--------------------------------------------------------------------------
        */

        $numberOfIncrements =
            $query->count();


        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $increments =
            $query
                ->paginate(30)
                ->withQueryString();


        /*
        |--------------------------------------------------------------------------
        | Filter Options
        |--------------------------------------------------------------------------
        */

        $departments =
            Department::query()
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy(
                    'name',
                    'asc'
                )
                ->get();


        $designations =
            Designation::query()
                ->select([
                    'id',
                    'name',
                ])
                ->orderBy(
                    'name',
                    'asc'
                )
                ->get();


        /*
        |--------------------------------------------------------------------------
        | Active Currency
        |--------------------------------------------------------------------------
        */

        $activeCurrency =
            Currency::query()
                ->where(
                    'is_active',
                    true
                )
                ->first();


        /*
        |--------------------------------------------------------------------------
        | Selected Employee
        |--------------------------------------------------------------------------
        */

        $selectedEmployee = null;


        if (
            $request->filled('user')
        ) {

            $selectedEmployee =
                User::query()
                    ->select([
                        'id',
                        'employee_id',
                        'name',
                    ])
                    ->find(
                        $request->input('user')
                    );
        }


        /*
        |--------------------------------------------------------------------------
        | Permissions
        |--------------------------------------------------------------------------
        */

        $permissions = [
            'create' =>
                $this->user->can(
                    'increment.create'
                ),

            'view' =>
                $this->user->can(
                    'increment.view'
                ),

            'edit' =>
                $this->user->can(
                    'increment.edit'
                ),

            'delete' =>
                $this->user->can(
                    'increment.delete'
                ),

            'status' =>
                $this->user->can(
                    'increment.status'
                ),
        ];


        /*
        |--------------------------------------------------------------------------
        | Return Inertia Page
        |--------------------------------------------------------------------------
        */

        return inertia(
            'hr/salary/increment/index',
            [
                'increments' =>
                    $increments,

                'numberOfIncrements' =>
                    $numberOfIncrements,

                'departments' =>
                    $departments,

                'designations' =>
                    $designations,

                'activeCurrency' =>
                    $activeCurrency,

                'filters' => [

                    'user' =>
                        $request->input(
                            'user'
                        ),

                    'department' =>
                        $request->input(
                            'department'
                        ),

                    'designation' =>
                        $request->input(
                            'designation'
                        ),

                    'status' =>
                        $request->input(
                            'status'
                        ),

                    'sorting' =>
                        $request->input(
                            'sorting',
                            'desc'
                        ),

                    'employee' =>
                        $selectedEmployee,
                ],

                'permissions' =>
                    $permissions,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create()
    {
        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.create'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        $employees =
            User::query()
                ->where(
                    'status',
                    'active'
                )
                ->select([
                    'id',
                    'employee_id',
                    'name',
                    'basic_salary',
                ])
                ->orderBy(
                    'name'
                )
                ->get();


        return response()->json(
            [
                'employees' =>
                    $employees,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.create'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        $validated =
            $request->validate([
                'user_id' => [
                    'required',
                    'integer',
                    'exists:users,id',
                ],

                'increment_type' => [
                    'required',
                    'in:percentage,fixed',
                ],

                'increment_value' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'effective_date' => [
                    'required',
                    'date',
                ],
            ]);


        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */

        $employee =
            User::query()
                ->where(
                    'status',
                    'active'
                )
                ->findOrFail(
                    $validated['user_id']
                );


        /*
        |--------------------------------------------------------------------------
        | Old Basic Salary
        |--------------------------------------------------------------------------
        */

        $oldBasicSalary =
            (float) (
                $employee->basic_salary ??
                0
            );


        $incrementValue =
            (float) (
                $validated[
                    'increment_value'
                ]
            );


        /*
        |--------------------------------------------------------------------------
        | Calculate Increment
        |--------------------------------------------------------------------------
        */

        if (
            $validated[
                'increment_type'
            ] === 'percentage'
        ) {

            $incrementAmount =
                $oldBasicSalary *
                $incrementValue /
                100;

        } else {

            $incrementAmount =
                $incrementValue;
        }


        $newBasicSalary =
            $oldBasicSalary +
            $incrementAmount;


        /*
        |--------------------------------------------------------------------------
        | Create Increment
        |--------------------------------------------------------------------------
        */

        SalaryIncrement::create([
            'user_id' =>
                $employee->id,

            'increment_type' =>
                $validated[
                    'increment_type'
                ],

            'increment_value' =>
                $incrementValue,

            'increment_amount' =>
                $incrementAmount,

            'old_basic_salary' =>
                $oldBasicSalary,

            'new_basic_salary' =>
                $newBasicSalary,

            'effective_date' =>
                $validated[
                    'effective_date'
                ],

            'status' =>
                'pending',
        ]);


        return back()->with(
            'success',
            'Salary increment created successfully.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    public function show(
        SalaryIncrement $increment
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.view'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        $increment->load([
            'user:id,employee_id,name,department_id,designation_id',
            'user.department:id,code,name',
            'user.designation:id,code,name',
        ]);


        /*
        |--------------------------------------------------------------------------
        | JSON Response
        |--------------------------------------------------------------------------
        */

        if (
            request()->expectsJson()
        ) {

            return response()->json(
                $increment
            );
        }


        return redirect()->route(
            'hr.increment.index'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    public function edit(
        SalaryIncrement $increment
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.edit'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        $increment->load([
            'user:id,employee_id,name,department_id,designation_id',
            'user.department:id,code,name',
            'user.designation:id,code,name',
        ]);


        if (
            request()->expectsJson()
        ) {

            return response()->json(
                $increment
            );
        }


        return redirect()->route(
            'hr.increment.index'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        SalaryIncrement $increment
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.edit'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Only Pending Can Be Edited
        |--------------------------------------------------------------------------
        */

        if (
            $increment->status !==
            'pending'
        ) {

            return back()->with(
                'error',
                'Only pending increments can be edited.'
            );
        }


        $validated =
            $request->validate([
                'user_id' => [
                    'required',
                    'integer',
                    'exists:users,id',
                ],

                'increment_type' => [
                    'required',
                    'in:percentage,fixed',
                ],

                'increment_value' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'effective_date' => [
                    'required',
                    'date',
                ],
            ]);


        $employee =
            User::query()
                ->where(
                    'status',
                    'active'
                )
                ->findOrFail(
                    $validated['user_id']
                );


        $oldBasicSalary =
            (float) (
                $employee->basic_salary ??
                0
            );


        $incrementValue =
            (float) (
                $validated[
                    'increment_value'
                ]
            );


        if (
            $validated[
                'increment_type'
            ] === 'percentage'
        ) {

            $incrementAmount =
                $oldBasicSalary *
                $incrementValue /
                100;

        } else {

            $incrementAmount =
                $incrementValue;
        }


        $newBasicSalary =
            $oldBasicSalary +
            $incrementAmount;


        $increment->update([
            'user_id' =>
                $employee->id,

            'increment_type' =>
                $validated[
                    'increment_type'
                ],

            'increment_value' =>
                $incrementValue,

            'increment_amount' =>
                $incrementAmount,

            'old_basic_salary' =>
                $oldBasicSalary,

            'new_basic_salary' =>
                $newBasicSalary,

            'effective_date' =>
                $validated[
                    'effective_date'
                ],
        ]);


        return back()->with(
            'success',
            'Salary increment updated successfully.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    public function destroy(
        SalaryIncrement $increment
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.delete'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Approved Increment Cannot Be Deleted
        |--------------------------------------------------------------------------
        */

        if (
            $increment->status ===
            'approved'
        ) {

            return back()->with(
                'error',
                'Approved increment cannot be deleted.'
            );
        }


        $increment->delete();


        return back()->with(
            'success',
            'Salary increment deleted successfully.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(
        Request $request,
        SalaryIncrement $increment
    ) {

        if (
            is_null($this->user) ||
            !$this->user->can(
                'increment.status'
            )
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }


        $validated =
            $request->validate([
                'status' => [
                    'required',
                    'in:approved,rejected',
                ],
            ]);


        /*
        |--------------------------------------------------------------------------
        | Only Pending Can Change
        |--------------------------------------------------------------------------
        */

        if (
            $increment->status !==
            'pending'
        ) {

            return back()->with(
                'error',
                'Only pending increments can change status.'
            );
        }


        DB::transaction(
            function () use (
                $increment,
                $validated
            ) {

                $increment->update([
                    'status' =>
                        $validated[
                            'status'
                        ],

                    'approved_by' =>
                        $validated[
                            'status'
                        ] === 'approved'
                            ? auth()->id()
                            : null,
                ]);


                /*
                |--------------------------------------------------------------------------
                | Update Employee Basic Salary
                |--------------------------------------------------------------------------
                |
                | The new salary becomes effective when
                | the increment is approved.
                |
                */

                if (
                    $validated[
                        'status'
                    ] === 'approved'
                ) {

                    User::where(
                        'id',
                        $increment->user_id
                    )->update([
                        'basic_salary' =>
                            $increment->new_basic_salary,
                    ]);
                }
            }
        );


        return back()->with(
            'success',
            $validated['status'] === 'approved'
                ? 'Salary increment approved successfully.'
                : 'Salary increment rejected successfully.'
        );
    }
}