<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Lead;
use App\Models\LeadConversation;
use App\Models\LeadStage;
use App\Models\SalesTeam;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmDashboardController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $request->validate([
            'range' => [
                'nullable',
                'in:today,yesterday,last_7_days,this_month,last_month,this_year,last_year,custom',
            ],

            'from' => [
                'nullable',
                'date',
            ],

            'to' => [
                'nullable',
                'date',
                'after_or_equal:from',
            ],

            'employee_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'sales_team_id' => [
                'nullable',
                'integer',
                'exists:sales_teams,id',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Resolve Filters
        |--------------------------------------------------------------------------
        */

        $range = $request->input('range');

        [$from, $to] = $this->resolveDateRange(
            $range,
            $request->input('from'),
            $request->input('to'),
        );

        $employeeId = $request->integer('employee_id') ?: null;
        $salesTeamId = $request->integer('sales_team_id') ?: null;

        /*
        |--------------------------------------------------------------------------
        | Resolve Sales Team Members
        |--------------------------------------------------------------------------
        |
        | A lead does not have sales_team_id.
        |
        | sales_team_id
        |      ↓
        | sales_team_members
        |      ↓
        | user_id
        |      ↓
        | leads.assigned_to
        |
        */

        $salesTeamMemberIds = null;

        if ($salesTeamId) {
            $salesTeamMemberIds = \DB::table('sales_team_members')
                ->where('sales_team_id', $salesTeamId)
                ->where('is_active', true)
                ->pluck('user_id');
        }

        /*
        |--------------------------------------------------------------------------
        | Base Queries
        |--------------------------------------------------------------------------
        */

        $leadQuery = Lead::accessible(auth()->user());

        $clientQuery = Client::accessible(auth()->user());

        /*
        |--------------------------------------------------------------------------
        | Lead Filters
        |--------------------------------------------------------------------------
        */

        $leadQuery
            ->when(
                $employeeId,
                fn($query) => $query->where(
                    'assigned_to',
                    $employeeId
                )
            )
            ->when(
                $salesTeamMemberIds !== null,
                fn($query) => $query->whereIn(
                    'assigned_to',
                    $salesTeamMemberIds
                )
            );

        /*
        |--------------------------------------------------------------------------
        | Date Filter
        |--------------------------------------------------------------------------
        */

        $leadQuery->when($from && $to, function ($query) use ($from, $to) {
            $query->whereBetween('created_at', [
                $from->copy()->startOfDay(),
                $to->copy()->endOfDay(),
            ]);
        });

        $clientQuery->when($from && $to, function ($query) use ($from, $to) {
            $query->whereBetween('created_at', [
                $from->copy()->startOfDay(),
                $to->copy()->endOfDay(),
            ]);
        });

        /*
        |--------------------------------------------------------------------------
        | Basic Summary
        |--------------------------------------------------------------------------
        */

        $data = [];

        $data['totalLeads'] = (clone $leadQuery)->count();

        $data['totalCustomers'] = (clone $clientQuery)->count();

        $data['todayFollowUps'] = (clone $leadQuery)
            ->whereDate('next_follow_up_at', today())
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Conversion Rate
        |--------------------------------------------------------------------------
        */

        $convertedCount = (clone $leadQuery)
            ->where('is_converted', true)
            ->count();

        $data['conversionRate'] = $data['totalLeads']
            ? round(
                ($convertedCount / $data['totalLeads']) * 100,
                2
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | This Month
        |--------------------------------------------------------------------------
        */

        $data['thisMonthLeads'] = (clone $leadQuery)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $data['thisMonthClients'] = (clone $clientQuery)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Pending Follow Ups
        |--------------------------------------------------------------------------
        */

        $data['pendingFollowUpsCount'] = (clone $leadQuery)
            ->whereNotNull('next_follow_up_at')
            ->where('next_follow_up_at', '<', now())
            ->where('is_converted', false)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Lead Chart
        |--------------------------------------------------------------------------
        */

        $leadChart = (clone $leadQuery)
            ->selectRaw(
                'MONTH(created_at) as month, COUNT(*) as total'
            )
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->pluck('total', 'month');

        $leadData = array_fill(0, 12, 0);

        foreach ($leadChart as $month => $count) {
            $leadData[$month - 1] = $count;
        }

        $data['leadChart'] = $leadData;

        /*
        |--------------------------------------------------------------------------
        | Customer Chart
        |--------------------------------------------------------------------------
        */

        $clientChart = (clone $clientQuery)
            ->selectRaw(
                'MONTH(created_at) as month, COUNT(*) as total'
            )
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->pluck('total', 'month');

        $clientData = array_fill(0, 12, 0);

        foreach ($clientChart as $month => $count) {
            $clientData[$month - 1] = $count;
        }

        $data['clientChart'] = $clientData;

        /*
        |--------------------------------------------------------------------------
        | Lead Source Distribution
        |--------------------------------------------------------------------------
        */

        $leadSources = (clone $leadQuery)
            ->select('source_id')
            ->selectRaw('COUNT(*) as total')
            ->with('leadSource:id,name')
            ->groupBy('source_id')
            ->get();

        $data['leadSourceData'] = [
            'series' => $leadSources
                ->pluck('total')
                ->toArray(),

            'labels' => $leadSources
                ->map(fn($item) => $item->leadSource?->name ?? 'Unknown')
                ->toArray(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Top Sales Executives
        |--------------------------------------------------------------------------
        */

        $data['topSalesPersons'] = (clone $leadQuery)
            ->select('assigned_to')
            ->selectRaw('COUNT(*) as leads_count')
            ->with('assignedUser:id,name,employee_id')
            ->whereNotNull('assigned_to')
            ->groupBy('assigned_to')
            ->orderByDesc('leads_count')
            ->take(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Recent Activities
        |--------------------------------------------------------------------------
        */

        $data['recentActivities'] = LeadConversation::with([
            'lead:id,name,assigned_to',
            'user:id,name',
        ])
            ->whereHas('lead', function ($query) use ($employeeId, $salesTeamMemberIds, $from, $to) {
                $query
                    ->accessible(auth()->user())

                    ->when($from && $to, function ($query) use ($from, $to) {
                        $query->whereBetween('created_at', [
                            $from->copy()->startOfDay(),
                            $to->copy()->endOfDay(),
                        ]);
                    })

                    ->when(
                        $employeeId,
                        fn($query) => $query->where(
                            'assigned_to',
                            $employeeId
                        )
                    )

                    ->when(
                        $salesTeamMemberIds !== null,
                        fn($query) => $query->whereIn(
                            'assigned_to',
                            $salesTeamMemberIds
                        )
                    );
            })
            ->latest()
            ->take(10)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Lead Pipeline
        |--------------------------------------------------------------------------
        */

        $data['leadStages'] = LeadStage::withCount([
            'leads' => function ($query) use ($employeeId, $salesTeamMemberIds, $from, $to) {
                $query
                    ->accessible(auth()->user())

                    ->when($from && $to, function ($query) use ($from, $to) {
                        $query->whereBetween('created_at', [
                            $from->copy()->startOfDay(),
                            $to->copy()->endOfDay(),
                        ]);
                    })

                    ->when(
                        $employeeId,
                        fn($query) => $query->where(
                            'assigned_to',
                            $employeeId
                        )
                    )

                    ->when(
                        $salesTeamMemberIds !== null,
                        fn($query) => $query->whereIn(
                            'assigned_to',
                            $salesTeamMemberIds
                        )
                    );
            },
        ])
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Selected Employee
        |--------------------------------------------------------------------------
        */

        $employee = $employeeId
            ? User::query()
                ->select('id', 'name')
                ->find($employeeId)
            : null;

        /*
        |--------------------------------------------------------------------------
        | Selected Sales Team
        |--------------------------------------------------------------------------
        */

        $salesTeam = $salesTeamId
            ? SalesTeam::query()
                ->select('id', 'name', 'code')
                ->find($salesTeamId)
            : null;

        /*
        |--------------------------------------------------------------------------
        | Inertia Response
        |--------------------------------------------------------------------------
        */

        return Inertia::render('dashboard/crm-dashboard', [
            'data' => $data,

            'filters' => [
                'range' => $range,

                'from' => $from?->toDateString(),

                'to' => $to?->toDateString(),

                'employee' => $employee
                    ? [
                        'id' => $employee->id,
                        'name' => $employee->name,
                    ]
                    : null,

                'sales_team' => $salesTeam
                    ? [
                        'id' => $salesTeam->id,
                        'name' => $salesTeam->name,
                        'code' => $salesTeam->code,
                    ]
                    : null,
            ],
        ]);
    }

    /**
     * Resolve dashboard date range.
     */
    private function resolveDateRange(
        ?string $range,
        ?string $from = null,
        ?string $to = null,
    ): array {
        return match ($range) {
            'today' => [
                now()->startOfDay(),
                now()->endOfDay(),
            ],

            'yesterday' => [
                now()->subDay()->startOfDay(),
                now()->subDay()->endOfDay(),
            ],

            'last_7_days' => [
                now()->subDays(6)->startOfDay(),
                now()->endOfDay(),
            ],

            'this_month' => [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ],

            'last_month' => [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth(),
            ],

            'this_year' => [
                now()->startOfYear(),
                now()->endOfYear(),
            ],

            'last_year' => [
                now()->subYear()->startOfYear(),
                now()->subYear()->endOfYear(),
            ],

            'custom' => [
                Carbon::parse($from)->startOfDay(),
                Carbon::parse($to)->endOfDay(),
            ],

            default => [
                null,
                null,
            ],
        };
    }
}
