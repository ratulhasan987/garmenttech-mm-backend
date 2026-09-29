<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');



$schedule = app(Schedule::class);

// Run your lead dispatch command every minute
$schedule->command('lead:dispatch')->everyMinute();
