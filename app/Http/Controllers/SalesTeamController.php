<?php

namespace App\Http\Controllers;

use App\Models\SalesTeam;
use App\Models\SalesTeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesTeamController extends Controller
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

        $this->authorizePermission('crm.team_management');

        $data = SalesTeam::query()
            ->withCount('members')
            ->when(
                $request->filled('sales_team_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->sales_team_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();


        return Inertia::render('crm/settings/sales-team/index', [
            'data' => $data,
            'filters' => [
                'sales_team_id' => $request->sales_team_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizePermission('crm.team_management');

        $validated = $request->validate([
            'code' => 'required|unique:sales_teams,code|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'manager_id' => 'required|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            $team = SalesTeam::create($validated);

            SalesTeamMember::create([
                'sales_team_id' => $team->id,
                'user_id' => $request->manager_id,
                'role' => 'manager',
                'joined_at' => now(),
                'is_active' => true,
            ]);

            DB::commit();


            return redirect()->back()->with("notification", [
                'message' => 'Sales team created successfully with initial manager.',
                'type' => 'success',
                'key' => (string) str()->uuid(),

            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('notification', [
                'message' => $e->getMessage(),
                'type' => 'error',
                'key' => (string) str()->uuid(),

            ]);
        }
    }

    public function update(Request $request, SalesTeam $salesTeam)
    {
        $this->authorizePermission('crm.team_management');

        $validated = $request->validate([
            'code' => 'required|unique:sales_teams,code,' . $salesTeam->id . '|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $salesTeam->update($validated);


        return redirect()->back()->with("notification", [
            'message' => 'Sales team updated successfully.',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ]);
    }

    public function destroy(SalesTeam $salesTeam)
    {
        $this->authorizePermission('crm.team_management');

        $salesTeam->delete();

        return redirect()->back()->with("notification", [
            'message' => 'Sales team deleted successfully.',
            'type' => 'success',
            'key' => (string) str()->uuid(),

        ]);

    }

    // ====================== MEMBER ROUTES ======================

    public function addMember(Request $request, SalesTeam $salesTeam)
    {
        $this->authorizePermission('crm.team_management');

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:manager,team_member',
        ]);

        $exists = SalesTeamMember::where('sales_team_id', $salesTeam->id)
            ->where('user_id', $validated['user_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'User is already a member of this team'], 422);
        }

        SalesTeamMember::create([
            'sales_team_id' => $salesTeam->id,
            'user_id' => $validated['user_id'],
            'role' => $validated['role'],
            'joined_at' => now(),
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Member added successfully']);
    }

    public function removeMember(SalesTeam $salesTeam, User $user)
    {
        $this->authorizePermission('crm.team_management');

        SalesTeamMember::where('sales_team_id', $salesTeam->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json(['message' => 'Member removed successfully']);
    }

    public function getAvailableUsers(SalesTeam $salesTeam, Request $request)
    {
        $this->authorizePermission('crm.team_management');

        $keyword = $request->get('keyword', '');

        $alreadyInTeam = $salesTeam->members()->pluck('user_id');

        $users = User::whereNotIn('id', $alreadyInTeam)
            ->when($keyword, function ($query, $keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('employee_id', 'like', "%{$keyword}%");
            })
            ->select('id', 'name', 'employee_id')
            ->orderBy('name')
            ->limit(15)
            ->get();

        return response()->json($users);
    }

    public function getMembers(SalesTeam $salesTeam)
    {
        $this->authorizePermission('crm.team_management');

        $members = $salesTeam->members()
            ->with('user:id,name,email,employee_id')
            ->get()
            ->map(fn($m) => [
                'user_id' => $m->user_id,
                'role' => $m->role,
                'user' => $m->user,
            ]);

        return response()->json($members);
    }

    public function getSalesTeams(Request $request)
    {
        $this->authorizePermission('crm.team_management');

        $keyword = $request->keyword;

        $query = SalesTeam::query()
            ->select(
                'id',
                'name',
                'code',
            );

        if (!empty($keyword)) {
            $query->where(function ($query) use ($keyword) {
                $query
                    ->where(
                        'name',
                        'like',
                        "%{$keyword}%"
                    )->orWhere(
                        'code',
                        'like',
                        "%{$keyword}%"
                    );
            });
        }

        $data = $query
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($data);
    }
}
