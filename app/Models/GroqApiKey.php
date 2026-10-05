<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $key
 * @property string $fingerprint
 * @property string $last_four
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereLastFour($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class GroqApiKey extends Model
{
    protected $fillable = ['key', 'fingerprint', 'last_four'];

    protected $hidden = ['key', 'fingerprint'];

    protected $casts = ['key' => 'encrypted'];
}
