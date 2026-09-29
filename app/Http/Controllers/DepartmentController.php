<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\Auth;

class DepartmentController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();
            return $next($request);
        });
    }

    public function index(Request $request)
    {

        if (is_null($this->user) || !$this->user->can('settings.department')) {
            abort('403', 'Unauthorized access');
        }

        // $data = Department::latest()->paginate(20);
        $data = Department::query()
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

        return Inertia::render('settings/department/index', [
            "data" => $data,
            'filters' => [
                'department_id' => $request->department_id,
            ],
        ]);

    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.department')) {
            abort('403', 'Unauthorized access');
        }


        $request->validate([
            'code' => ['required', 'unique:departments,code', 'string', 'max:255'],
            'name' => ['required', 'unique:departments,name', 'string', 'max:255']
        ]);

        $department = new Department();
        $department->code = $request->code;
        $department->name = ucfirst($request->name);
        $department->save();

        return redirect()->back()->with('notification', [
            'message' => 'New department saved successfully.',
            'type' => 'success',
        ]);
    }

    public function edit(Department $department)
    {
        if (is_null($this->user) || !$this->user->can('settings.department')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($department);
    }

    public function updatedepartment(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.department')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'code' => ['required', "unique:departments,code, $request->id", 'string', 'max:255'],
            'name' => ['required', "unique:departments,name, $request->id", 'string', 'max:255']
        ]);

        $department = Department::whereId($request->id)->first();
        $department->code = $request->code;
        $department->name = ucfirst($request->name);
        $department->save();

        return redirect()->back()->with('notification', [
            'message' => 'Department Updated Successfully.',
            'type' => 'success',
        ]);
    }

    public function destroy(Department $department)
    {
        if (is_null($this->user) || !$this->user->can('settings.department')) {
            abort('403', 'Unauthorized access');
        }

        $deletedepartment = $department->delete();

        if ($deletedepartment) {

            return redirect()->back()->with("notification", [
                'message' => 'Department Deleted successfully!',
                'type' => 'success',
            ]);
        }
    }

    public function getDepartments(Request $request)
    {
        $keyword = $request->keyword;

        $query = Department::query()
            ->select(
                'id',
                'code',
                'name'
            );

        if (!empty($keyword)) {
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

        $departments = $query
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($departments);
    }
}
