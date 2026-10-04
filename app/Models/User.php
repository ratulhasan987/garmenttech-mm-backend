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
