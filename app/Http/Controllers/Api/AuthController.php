<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember_me' => 'boolean', // Optional
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('mobile_token')->plainTextToken;

        // OPTIONAL: manually track expiration using personal_access_tokens table
        if ($request->remember_me) {
            // Extend expiration to 1 month or custom time (optional logic)
            DB::table('personal_access_tokens')
                ->where('tokenable_id', $user->id)
                ->latest()
                ->update(['expires_at' => Carbon::now()->addMonth()]);
        }


        $user->load([
            'roles',
            'permissions'
        ]);

        return ApiResponse::success(
            message: 'Login successful',
            data: [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'account' => $user->account,
                    'image' => $user->image,
                    'status' => $user->status,

                    'attendanceType' => $user->attendance_type,
                    'useFingerprint' => $user->use_fingerprint,
                    'useFace' => $user->use_face,

                    'shift' => $user->shift,
                    'workingHours' => $user->working_hours,

                    'phone' => $user->phone,
                    'language' => $user->language,

                    'website' => $user->website,
                    'github' => $user->github,
                    'twitter' => $user->twitter,
                    'facebook' => $user->facebook,
                    'linkedIn' => $user->linkedIn,

                    'joiningDate' => $user->joining_date,
                    'probationPeriodEndDate' => $user->probation_period_end_date,

                    'emergencyContact' => $user->emergency_contact,
                    'nationalId' => $user->national_id,

                    'payFrequency' => $user->pay_frequency,
                    'gender' => $user->gender,
                    'maritalStatus' => $user->marital_status,
                    'bloodGroup' => $user->blood_group,
                    'healthCondition' => $user->health_condition,

                    'bankName' => $user->bank_name,
                    'accountNumber' => $user->account_number,
                    'branchAddress' => $user->branch_address,
                    'tinNumber' => $user->tin_number,

                    'basicSalary' => $user->basic_salary,
                    'grossSalary' => $user->gross_salary,
                    'transportAllowance' => $user->transport_allowance,
                    'familyAllowance' => $user->family_allowance,
                    'othersAllowance' => $user->others_allowance,

                    'address' => $user->address,
                    'lastLoginAt' => $user->last_login_at,

                    'roles' => $user->when(
                        $user->relationLoaded('roles'),
                        fn() => $user->getRoleNames(),
                    ),
                ],
                'permissions' => $user->getAllPermissions()
                    ->pluck('name')
                    ->values(),

                'allPermissions' => Permission::query()
                    ->orderBy('group_name')
                    ->orderBy('name')
                    ->get(['group_name', 'name'])
                    ->groupBy('group_name')
                    ->map(fn($permissions, $groupName) => [
                        'group_name' => $groupName,
                        'permissions' => $permissions
                            ->pluck('name')
                            ->values()
                            ->all(),
                    ])
                    ->values()
                    ->all(),
            ]
        );

    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(
            message: 'You are successfully logged out'
        );
    }


}
