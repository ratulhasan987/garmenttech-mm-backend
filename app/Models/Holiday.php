<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Holiday extends Model
{
    protected $fillable = ['name', 'date', 'is_recurring'];

    protected $casts = [
        'date' => 'date',
        'is_recurring' => 'boolean',
    ];

    public function occursOn($date)
    {
        $date = Carbon::parse($date);
        $holidayDate = Carbon::parse($this->date);

        if ($this->is_recurring) {
            // Only compare month and day
            return $holidayDate->format('m-d') === $date->format('m-d');
        }

        return $holidayDate->isSameDay($date);
    }

    public function getDisplayDateAttribute()
    {
        return $this->is_recurring
            ? $this->date->format('m-d')
            : $this->date->format('Y-m-d');
    }

    /**
     * Scope: Return holidays formatted for frontend.
     * - Non-recurring → full date (Y-m-d)
     * - Recurring → only month & day (m-d)
     */
    public function scopeForCalendar($query)
    {
        return $query->get()->map(function ($holiday) {
            return [
                'id' => $holiday->id,
                'name' => $holiday->name,
                'date' => $holiday->is_recurring
                    ? $holiday->date->format('m-d')
                    : $holiday->date->format('Y-m-d'),
                'is_recurring' => $holiday->is_recurring,
            ];
        });
    }
}
