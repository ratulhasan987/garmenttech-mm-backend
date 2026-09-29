<?php

namespace App\Console\Commands;

use App\Events\LeadFollowup;
use Illuminate\Console\Command;
use App\Models\LeadFollowupNotification;

class DispatchLeadNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lead:dispatch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch lead follow-up notifications in real-time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $notifications = LeadFollowupNotification::with('lead:id,name,next_follow_up_at')
            // ->where('notify_at','<=',now())
            ->whereBetween('notify_at', [
                now()->subMinutes(5),
                now()->addMinutes(5),
            ])
            ->whereNull('read_at')
            ->limit(100)
            ->get();

        foreach ($notifications as $notification) {

            broadcast(new LeadFollowup($notification));

        }
    }
}
