<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Document;
use App\Models\User;
use App\Models\Role;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public $user;

    public function index(Request $request): Response
    {
        $this->authorizePermission('user.list');

        $query = User::select('id', 'employee_id', 'image', 'name', 'email', 'role', 'department_id', 'designation_id', 'reporting_officer', 'last_login_at', 'status')->with(['department:id,code,name', 'designation:id,code,name', 'reportingOfficer:id,name']);

        if ($request->has('user') && !empty($request->input('user'))) {
            $query->where('id', $request->input('user'));
        }

        if ($request->has('department') && !empty($request->input('department'))) {
            $query->where('department_id', $request->input('department'));
        }

        if ($request->has('status') && !empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('sorting')) {
            switch ($request->input('sorting')) {
                case 'latest':
                    $query->orderBy('created_at', 'desc');
                    break;

                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;

                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;

                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;

                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
        }

        // Get the total number of leads for this que
        $numberOfStaffs = $query->count();

        // Paginate with 30 records per page
        $staffs = $query->latest()->paginate(30);


        $departments = Department::select(['id', 'name'])->orderBy('name', 'asc')->get();

        $selectedUser = $request->filled('user')
            ? User::query()
                ->select(['id', 'name', 'employee_id'])
                ->find($request->input('user'))
            : null;

        return Inertia::render('hr/users/index', [
            "departments" => $departments,
            "data" => $staffs,
            "filters" => [
                "user" => $selectedUser,
                "department" => $request->department,
                "status" => $request->status,
                "sorting" => $request->sorting,

            ]
        ]);

    }

    public function create()
    {
        $this->authorizePermission('user.create');

        $roles = Role::all();
        $shifts = Shift::select(['id', 'name'])->orderBy('name', 'asc')->get();
        $departments = Department::select(['id', 'name'])->orderBy('name', 'asc')->get();
        $designations = Designation::select(['id', 'name'])->orderBy('name', 'asc')->get();

        return Inertia::render('hr/users/create-user', [
            "roles" => $roles,
            "departments" => $departments,
            "shifts" => $shifts,
            "designations" => $designations
        ]);


    }

    public function store(Request $request)
    {
        $this->authorizePermission('user.create');

        // Validate the incoming request data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'department' => 'required|exists:departments,id',
            'designation' => 'required|exists:designations,id',
            'reporting_officer' => 'nullable|exists:users,id',
            'shift' => 'required|exists:shifts,id',
            'phone' => 'required|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'emergency_contact' => 'required|string|max:255',
            'pay_frequency' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'branch_address' => 'nullable|string|max:255',
            'tin_number' => 'nullable|string|max:255',
            'joining_date' => 'required|string|max:255',
            'probation_period_end_date' => 'required|string|max:255',
            'basic_salary' => 'required|numeric|min:1',
            'gross_salary' => 'nullable|string|max:255',
            'transport_allowance' => 'nullable|numeric|min:1',
            'family_allowance' => 'nullable|numeric|min:1',
            'others_allowance' => 'nullable|numeric|min:1',
            'gender' => 'nullable|string|max:255',
            'marital_status' => 'nullable|string|max:255',
            'blood_group' => 'nullable|string|max:255',
            'health_condition' => 'nullable|string|max:255',
            'role' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'address' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = File::fileUpload($request->file('image'), 'Users');
        } else {
            $imagePath = null;
        }

        // Generate unique Employee ID (Year-Based with prefix)
        $year = date('Y');

        $last_employee = User::where('employee_id', 'LIKE', "EMP$year%")
            ->orderBy('id', 'desc')
            ->first();

        if ($last_employee) {
            // Extract only the numeric part after "PURYYYY"
            $last_employeeNumber = intval(substr($last_employee->employee_id, 7));
            $newEmployeeIdNumber = $last_employeeNumber + 1;
        } else {
            $newEmployeeIdNumber = 1;
        }

        // Format: JUR + Year + 3-digit running number
        $employeeId = "EMP" . $year . sprintf('%03d', $newEmployeeIdNumber);

        $user = new User();
        $user->employee_id = $employeeId;
        $user->department_id = $request->input('department');
        $user->designation_id = $request->input('designation');
        $user->reporting_officer = $request->input('reporting_officer');
        $user->shift_id = $request->input('shift');
        $user->name = $request->input('name');
        $user->role = $request->input('role');
        $user->email = $request->input('email');
        $user->phone = $request->input('phone');
        $user->mobile = $request->input('mobile');
        $user->national_id = $request->input('national_id');
        $user->emergency_contact = $request->input('emergency_contact');
        $user->gender = $request->input('gender');
        $user->marital_status = $request->input('marital_status');
        $user->blood_group = $request->input('blood_group');
        $user->health_condition = $request->input('health_condition');
        $user->pay_frequency = $request->input('pay_frequency');
        $user->bank_name = $request->input('bank_name');
        $user->account_number = $request->input('account_number');
        $user->branch_address = $request->input('branch_address');
        $user->tin_number = $request->input('tin_number');
        $user->joining_date = $request->input('joining_date');
        $user->probation_period_end_date = $request->input('probation_period_end_date');
        $user->basic_salary = $request->input('basic_salary');
        $user->transport_allowance = $request->input('transport_allowance');
        $user->family_allowance = $request->input('family_allowance');
        $user->others_allowance = $request->input('others_allowance');
        $user->gross_salary = $request->input('basic_salary') + $request->input('transport_allowance') + $request->input('family_allowance') + $request->input('others_allowance');
        $user->address = $request->input('address');
        $user->password = bcrypt($request->input('password'));
        $user->image = $imagePath;
        $user->save();

        if ($request->role) {
            $user->assignRole($request->role);
        }

        // When user create that itme crearte a document for update user all document
        if ($user) {
            $document = new Document();
            $user->document()->save($document);
        }


        return redirect()->back()->with("notification", [
            'message' => 'User created successfully.',
            'type' => 'success'
        ]);
    }

    public function show(string $id)
    {
        $this->authorizePermission('user.view');

        $user = User::with(['department:id,code,name', 'designation:id,code,name'])->findOrFail($id);

        return Inertia::render('hr/users/show-user', [
            "user" => $user
        ]);

    }

    public function edit($id)
    {
        $this->authorizePermission('user.edit', 'user.view');

        $roles = Role::all();
        $user = User::with('reportingOfficer:id,employee_id,name')->findOrFail($id);
        $shifts = Shift::select(['id', 'name'])->orderBy('name', 'asc')->get();
        $departments = Department::select(['id', 'name'])->orderBy('name', 'asc')->get();
        $designations = Designation::select(['id', 'name'])->orderBy('name', 'asc')->get();


        return Inertia::render('hr/users/edit-user', [
            "user" => $user,
            "roles" => $roles,
            "departments" => $departments,
            "shifts" => $shifts,
            "designations" => $designations
        ]);
    }

    public function update(Request $request, string $id)
    {
        $this->authorizePermission('user.edit');

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'department' => 'required|exists:departments,id',
            'designation' => 'required|exists:designations,id',
            'reporting_officer' => 'nullable|exists:users,id',
            'shift' => 'required|exists:shifts,id',
            'phone' => 'required|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'emergency_contact' => 'required|string|max:255',
            'pay_frequency' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'branch_address' => 'nullable|string|max:255',
            'tin_number' => 'nullable|string|max:255',
            'joining_date' => 'required|string|max:255',
            'probation_period_end_date' => 'required|string|max:255',
            'basic_salary' => 'required|numeric|min:1',
            'gross_salary' => 'nullable|string|max:255',
            'transport_allowance' => 'nullable|numeric|min:1',
            'family_allowance' => 'nullable|numeric|min:1',
            'others_allowance' => 'nullable|numeric|min:1',
            'gender' => 'nullable|string|max:255',
            'marital_status' => 'nullable|string|max:255',
            'blood_group' => 'nullable|string|max:255',
            'health_condition' => 'nullable|string|max:255',
            'role' => 'required|string|max:255',
            'password' => 'nullable|string|min:8',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'address' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('image')) {

            $old_image = $user->image;
            File::deleteFile($old_image);

            $imagePath = File::upload($request->file('image'), 'Users');
            $user->image = $imagePath;
        }

        $user->role = $request->input('role');
        $user->department_id = $request->input('department');
        $user->designation_id = $request->input('designation');
        $user->reporting_officer = $request->input('reporting_officer');
        $user->shift_id = $request->input('shift');
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->phone = $request->input('phone');
        $user->mobile = $request->input('mobile');
        $user->national_id = $request->input('national_id');
        $user->emergency_contact = $request->input('emergency_contact');
        $user->gender = $request->input('gender');
        $user->marital_status = $request->input('marital_status');
        $user->blood_group = $request->input('blood_group');
        $user->health_condition = $request->input('health_condition');

        $user->pay_frequency = $request->input('pay_frequency');
        $user->bank_name = $request->input('bank_name');
        $user->account_number = $request->input('account_number');
        $user->branch_address = $request->input('branch_address');
        $user->tin_number = $request->input('tin_number');
        $user->joining_date = $request->input('joining_date');
        $user->probation_period_end_date = $request->input('probation_period_end_date');
        $user->basic_salary = $request->input('basic_salary');
        $user->transport_allowance = $request->input('transport_allowance');
        $user->family_allowance = $request->input('family_allowance');
        $user->others_allowance = $request->input('others_allowance');
        $user->gross_salary = $request->input('basic_salary') + $request->input('transport_allowance') + $request->input('family_allowance') + $request->input('others_allowance');

        $user->address = $request->input('address');

        if ($request->input('password')) {
            $user->password = bcrypt($request->input('password'));
        }

        $user->save();

        if ($request->role) {
            $user->syncRoles($request->role);
        }


        return redirect()->back()->with("notification", [
            'message' => 'User updated successfully.',
            'type' => 'success'
        ]);
    }

    public function destroy(string $id)
    {
        $this->authorizePermission('user.delete');

        $user = User::findOrFail($id);
        $deleteUser = $user->delete();
        if ($deleteUser) {
            File::deleteFile($user->image);
            $notification = ['message' => 'User deleted successfully.', 'type' => 'error'];
            return redirect()->back()->with($notification);
        }
    }

    public function status($user)
    {
        $this->authorizePermission('user.status');

        $user = User::whereId($user)->first();

        if ($user->hasRole('superadmin')) {
            return redirect()
                ->back()
                ->with('notification', [
                    'message' => 'Super admin status cannot be changed.',
                    'type' => 'error',
                ]);
        }


        /*
    |--------------------------------------------------------------------------
    | Toggle Status
    |--------------------------------------------------------------------------
    */

        $newStatus =
            $user->status === 'active'
            ? 'inactive'
            : 'active';

        DB::transaction(function () use ($user, $newStatus) {
            /*
            |--------------------------------------------------------------------------
            | Update User
            |--------------------------------------------------------------------------
            */

            $user->forceFill([
                'status' => $newStatus,

                /*
                |--------------------------------------------------------------------------
                | Invalidate Remember Me Login
                |--------------------------------------------------------------------------
                */

                'remember_token' => null,
            ])->save();

            /*
            |--------------------------------------------------------------------------
            | Invalidate Active Sessions
            |--------------------------------------------------------------------------
            |
            | This works when SESSION_DRIVER=database.
            |
            */

            if (
                config('session.driver') ===
                'database'
            ) {
                DB::table(
                    config(
                        'session.table',
                        'sessions'
                    )
                )
                    ->where(
                        'user_id',
                        $user->id
                    )
                    ->delete();
            }
        });

        return redirect()
            ->back()
            ->with('notification', [
                'message' =>
                    $newStatus === 'active'
                    ? 'User has been activated successfully.'
                    : 'User has been deactivated and logged out successfully.',

                'type' => 'success',
            ]);
    }

    public function getRolePermissions($role)
    {
        $role = Role::find($role);
        return response()->json(['role' => $role]);
    }

    public function getEmployees(Request $request)
    {
        $keyword = $request->keyword;

        $query = DB::table('users')->select('id', 'employee_id', 'name');

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('employee_id', 'like', "%{$keyword}%");
            });
        }

        // Always return max 20 employees
        $employees = $query->orderBy('name')->limit(20)->get();

        return response()->json($employees);
    }


}
