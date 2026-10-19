<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property \Carbon\CarbonImmutable $date
 * @property bool $is_recurring
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read mixed $display_date
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday forCalendar()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereIsRecurring($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
