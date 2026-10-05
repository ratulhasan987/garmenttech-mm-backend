<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property numeric $amount
 * @property string|null $note
 * @property string $date
 * @property string|null $file
 * @property string|null $advance_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $advanceBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereAdvanceBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereUserId($value)
 * @mixin \Eloquent
 */
class Advance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'note',
        'date',
        'file',
        'advance_by'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function advanceBy()
    {
        return $this->belongsTo(User::class, 'advance_by');
    }

}
