<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Configure;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {

        $user = $request->user();
        $configure = Configure::first();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'configure' => $configure
                ? [
                    'name' => $configure->name,
                    'address' => $configure->address,
                    'phone' => $configure->phone,
                    'email' => $configure->email,
                    'logo' => $configure->logo,
                    'primary_logo' => $configure->primary_logo,
                    'secondary_logo' => $configure->secondary_logo,
                ]
                : null,
            'auth' => [
                'user' => $user ? $user->load('designation') : null,
                'permissions' => fn() =>
                    $user
                    ? $user
                        ->getAllPermissions()
                        ->pluck('name')
                        ->values()
                        ->all()
                    : [],
                'roles' => fn() =>
                    $user
                    ? $user
                        ->getRoleNames()
                        ->values()
                        ->all()
                    : [],
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            'flash' => [
                'notification' => fn() => $request->session()->get('notification'),
            ],

            'notifications' => fn() => $user
                ? [
                    'unread_count' => $user->unreadNotifications()->count(),

                    'items' => $user->unreadNotifications()
                        ->latest()
                        ->get()
                        ->map(fn($notification) => [
                            'id' => $notification->id,
                            'type' => $notification->type,
                            'data' => $notification->data,
                            'created_at' => $notification->created_at,
                            'read_at' => $notification->read_at,
                        ])
                        ->values()
                        ->all(),
                ]
                : [
                    'unread_count' => 0,
                    'items' => [],
                ],

            'lead_followup_notifications' => fn() => $user
                ? [
                    'unread_count' => $user->leadFollowupsNotifications()->count(),

                    'items' => $user->leadFollowupsNotifications()
                        ->latest()
                        ->get()
                        ->map(fn($notification) => [
                            'id' => $notification->id,
                            'lead_id' => $notification->lead->id,
                            'name' => $notification->lead->name,
                            'company_name' => $notification->lead->company_name,
                            'followup_at' => $notification->notify_at,
                            'created_at' => $notification->created_at,
                            'read_at' => $notification->read_at,
                        ])
                        ->values()
                        ->all(),
                ]
                : [
                    'unread_count' => 0,
                    'items' => [],
                ],
        ];

    }
}
