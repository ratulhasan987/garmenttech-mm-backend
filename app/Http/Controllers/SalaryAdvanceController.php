<?php

namespace App\Http\Controllers;

use App\Models\SalaryAdvance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalaryAdvanceController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request
    ): Response|JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | Employee Suggestions
        |--------------------------------------------------------------------------
        */

        if ($request->expectsJson()) {
            return $this->employeeSuggestions(
                $request
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $request->user()?->can(
                'salary.advance'
            ),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $userId =
            $request->filled('user')
                ? (int) $request->input('user')
                : null;

        $status =
            $request->input('status');

        $sorting =
            $request->input('sorting');

        $startDate =
            $request->input('start_date');

        $endDate =
            $request->input('end_date');

        /*
        |--------------------------------------------------------------------------
        | Query
        |--------------------------------------------------------------------------
        */

        $query =
            SalaryAdvance::query()
                ->with([
                    'user:id,employee_id,name',
                    'updateBy:id,name',
                ])
                ->when(
                    $userId,
                    function ($query) use ($userId) {
                        $query->where(
                            'user_id',
                            $userId
                        );
                    }
                )
                ->when(
                    $status,
                    function ($query) use ($status) {
                        $query->where(
                            'status',
                            $status
                        );
                    }
                )
                ->when(
                    $startDate,
                    function ($query) use ($startDate) {
                        $query->whereDate(
                            'created_at',
                            '>=',
                            $startDate
                        );
                    }
                )
                ->when(
                    $endDate,
                    function ($query) use ($endDate) {
                        $query->whereDate(
                            'created_at',
                            '<=',
                            $endDate
                        );
                    });

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        if (
            in_array(
                $sorting,
                [
                    'asc',
                    'desc',
                ],
                true
            )
        ) {
            $query->orderBy(
                'created_at',
                $sorting
            );
        } else {
            $query->latest('id');
        }

        /*
        |--------------------------------------------------------------------------
        | Total
        |--------------------------------------------------------------------------
        */

        $numberOfAdvances =
            (clone $query)->count();

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $advances =
            $query
                ->paginate(30)
                ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Selected Employee
        |--------------------------------------------------------------------------
        */

        $selectedEmployee = null;

        if ($userId) {
            $employee =
                User::query()
                    ->select([
                        'id',
                        'employee_id',
                        'name',
                    ])
                    ->where(
                        'status',
                        'active'
                    )
                    ->find(
                        $userId
                    );

            if ($employee) {
                $selectedEmployee = [
                    'id' =>
                        $employee->id,

                    'employee_id' =>
                        $employee->employee_id,

                    'name' =>
                        $employee->name,

                    'label' =>
                        $employee->name .
                        ' - ' .
                        $employee->employee_id,
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'hr/payroll/salary-advance/index',
            [
                'advances' =>
                    $advances,

                'numberOfAdvances' =>
                    $numberOfAdvances,

                'filters' => [
                    'user' =>
                        $userId,

                    'status' =>
                        $status,

                    'sorting' =>
                        $sorting,

                    'start_date' =>
                        $startDate,

                    'end_date' =>
                        $endDate,
                ],

                'selectedEmployee' =>
                    $selectedEmployee,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Suggestions
    |--------------------------------------------------------------------------
    */

    private function employeeSuggestions(
        Request $request
    ): JsonResponse {
        $keyword =
            trim(
                (string) $request->input(
                    'keyword',
                    ''
                )
            );

        $employees =
            User::query()
                ->select([
                    'id',
                    'employee_id',
                    'name',
                ])
                ->where(
                    'status',
                    'active'
                )
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            function ($query) use ($keyword) {
                                $query
                                    ->where(
                                        'name',
                                        'like',
                                        "%{$keyword}%"
                                    )
                                    ->orWhere(
                                        'employee_id',
                                        'like',
                                        "%{$keyword}%"
                                    );
                            }
                        );
                    }
                )
                ->orderBy('name')
                ->limit(20)
                ->get()
                ->map(
                    function (User $employee) {
                        return [
                            'id' =>
                                $employee->id,

                            'employee_id' =>
                                $employee->employee_id,

                            'name' =>
                                $employee->name,

                            'label' =>
                                $employee->name .
                                ' - ' .
                                $employee->employee_id,
                        ];
                    }
                )
                ->values();

        return response()->json(
            $employees
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
        abort_unless(
            $request->user()?->can(
                'salary.advance'
            ),
            403
        );

        $validated =
            $request->validate([
                'user_id' => [
                    'required',
                    'integer',
                    'exists:users,id',
                ],

                'amount' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'month' => [
                    'required',
                    'date_format:Y-m',
                    'after_or_equal:' .
                    now()->format('Y-m'),
                ],

                'status' => [
                    'required',
                    'in:Active,In-active',
                ],
            ]);

        SalaryAdvance::create(
            [
                'user_id' =>
                    $validated['user_id'],

                'amount' =>
                    $validated['amount'],

                'month' =>
                    $validated['month'],

                'status' =>
                    $validated['status'],
            ]
        );

        return redirect()
            ->back()
            ->with(
                'success',
                'Salary advance recorded successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Show / Edit Data
    |--------------------------------------------------------------------------
    */

    public function edit(
        SalaryAdvance $salaryAdvance
    ) {
        abort_unless(
            request()->user()?->can(
                'salary.advance'
            ),
            403
        );

        $salaryAdvance->load([
            'user:id,employee_id,name',
        ]);

        return response()->json(
            $salaryAdvance
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        SalaryAdvance $salaryAdvance
    ) {
        abort_unless(
            $request->user()?->can(
                'salary.advance'
            ),
            403
        );

        $validated =
            $request->validate([
                'amount' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'month' => [
                    'required',
                    'date_format:Y-m',
                    'after_or_equal:' .
                    now()->format('Y-m'),
                ],

                'status' => [
                    'required',
                    'in:Active,In-active,Completed',
                ],
            ]);

        $salaryAdvance->update(
            [
                'amount' =>
                    $validated['amount'],

                'month' =>
                    $validated['month'],

                'status' =>
                    $validated['status'],

                'updated_by' =>
                    $request->user()->id,
            ]
        );

        return redirect()
            ->back()
            ->with(
                'success',
                'Salary advance updated successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        SalaryAdvance $salaryAdvance
    ) {
        abort_unless(
            $request->user()?->can(
                'salary.advance'
            ),
            403
        );

        $salaryAdvance->delete();

        return redirect()
            ->back()
            ->with(
                'success',
                'Salary advance deleted successfully.'
            );
    }
}