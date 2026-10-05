<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Collection;

/**
 * @property int $id
 * @property int|null $department_id
 * @property int|null $designation_id
 * @property int|null $reporting_officer
 * @property string|null $employee_id
 * @property string $role
 * @property numeric|null $account_balance
 * @property int $working_hours
 * @property string $name
 * @property string $email
 * @property string|null $image
 * @property int|null $shift_id
 * @property string|null $language
 * @property string|null $phone
 * @property string|null $mobile
 * @property string|null $emergency_contact
 * @property string|null $national_id
 * @property string $pay_frequency
 * @property string|null $gender
 * @property string|null $marital_status
 * @property string|null $blood_group
 * @property string|null $health_condition
 * @property string|null $joining_date
 * @property string|null $probation_period_end_date
 * @property string|null $address
 * @property string|null $bank_name
 * @property string|null $account_number
 * @property string|null $branch_address
 * @property string|null $tin_number
 * @property string|null $basic_salary
 * @property string|null $transport_allowance
 * @property string|null $family_allowance
 * @property string|null $others_allowance
 * @property string|null $gross_salary
 * @property string $status
 * @property string $attendance_type
 * @property \Carbon\CarbonImmutable|null $email_verified_at
 * @property string $password
 * @property string|null $last_login_at
 * @property string|null $remember_token
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attendance> $attendances
 * @property-read int|null $attendances_count
 * @property-read \App\Models\Department|null $department
 * @property-read \App\Models\Designation|null $designation
 * @property-read \App\Models\Document|null $document
 * @property-read mixed $image_url
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadFollowupNotification> $leadFollowupsNotifications
 * @property-read int|null $lead_followups_notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveRequest> $leaveRequests
 * @property-read int|null $leave_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leave> $leaves
 * @property-read int|null $leaves_count
 * @property-read \App\Models\LoanInterest|null $loanInterest
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Loan> $loans
 * @property-read int|null $loans_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read User|null $reportingOfficer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalaryAdvance> $salaryAdvances
 * @property-read int|null $salary_advances_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalaryIncrement> $salaryIncrements
 * @property-read int|null $salary_increments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesTeamMember> $salesTeams
 * @property-read int|null $sales_teams_count
 * @property-read \App\Models\Shift|null $shift
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $teams
 * @property-read int|null $teams_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserLeave> $userLeave
 * @property-read int|null $user_leave_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, ?string $guard = null, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User team($teams, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAccountBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAccountNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAttendanceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBloodGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBranchAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDepartmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmergencyContact($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFamilyAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGrossSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereHealthCondition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereJoiningDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLanguage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastLoginAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMaritalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMobile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereNationalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereOthersAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePayFrequency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProbationPeriodEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereReportingOfficer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereShiftId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTinNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTransportAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereWorkingHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, ?string $guard = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutTeam($teams)
 * @mixin \Eloquent
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    protected string $guard_name = 'web';

    public function getDefaultGuardName(): string
    {
        return 'web';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'department_id',
        'designation_id',
        'reporting_officer',
        'employee_id',
        'role',
        'account_balance',
        'name',
        'email',
        'image',
        'status',
        'shift_id',
        'working_hours',
        'phone',
        'mobile',
        'language',

        'joining_date',
        'probation_period_end_date',
        'emergency_contact',
        'national_id',
        'pay_frequency',
        'gender',
        'marital_status',
        'blood_group',
        'health_condition',

        // Bank Informations
        'bank_name',
        'account_number',
        'branch_address',
        'tin_number',
        'basic_salary',
        'gross_salary',
        'transport_allowance',
        'family_allowance',
        'others_allowance',

        'address',
        'last_login_at',
        'password',
    ];

    protected $appends = ['image_url'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    public static function getPermissionGroups()
    {
        $permissionGroup = DB::table('permissions')
            ->select('group_name as name')
            ->groupBy('group_name')->get();
        return $permissionGroup;
    }
    public static function getpermissionsByGroupName($group_name)
    {
        $permissions = DB::table('permissions')
            ->select('name', 'id')
            ->where('group_name', $group_name)
            ->get();
        return $permissions;
    }
    public static function roleHasPermission($permission, $roles)
    {
        $hasPermission = true;
        foreach ($permission as $p) {
            if (!$roles->hasPermissionTo($p->name)) {
                $hasPermission = false;
            }
        }
        return $hasPermission;
    }

    public function document()
    {
        return $this->hasOne(Document::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function reportingOfficer()
    {
        return $this->belongsTo(User::class, 'reporting_officer');
    }

    public function attendances()
    {
        return $this->hasMany(
            Attendance::class,
            'user_id'
        );
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function leaves()
    {
        return $this->belongsToMany(Leave::class, 'user_leave')
            ->withPivot('start_date', 'end_date', 'remaining_days')
            ->withTimestamps();
    }

    // Define the relationship with the user_leave pivot table
    public function userLeave()
    {
        return $this->hasMany(UserLeave::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class, 'user_id');
    }

    public function salaryAdvances()
    {
        return $this->hasMany(SalaryAdvance::class, 'user_id');
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? asset($this->image) : null;
    }


    public function loanInterest()
    {
        return $this->hasOneThrough(
            LoanInterest::class,
            Designation::class,
            'id',
            'designation_id',
            'designation_id',
            'id'
        );
    }

    public function salaryIncrements()
    {
        return $this->hasMany(SalaryIncrement::class, 'user_id');
    }


    public function salesTeams()
    {
        return $this->hasMany(SalesTeamMember::class);
    }

    public function managedTeamUserIds(): Collection
    {
        // Teams where *this user* is an active manager
        $managedTeamIds = $this->salesTeams()
            ->where('role', 'manager')
            ->where('is_active', true)
            ->pluck('sales_team_id');

        if ($managedTeamIds->isEmpty()) {
            // Not a manager of any team → only own leads
            return collect([$this->id]);
        }

        // All active members of the teams this user manages
        return SalesTeamMember::whereIn('sales_team_id', $managedTeamIds)
            ->where('is_active', true)
            ->pluck('user_id')
            ->push($this->id)          // always include self
            ->unique()
            ->values();
    }

    public function leadFollowupsNotifications()
    {
        return $this->hasMany(LeadFollowupNotification::class)
            ->whereNull('read_at')
            ->whereDate('notify_at', today());


    }

}
