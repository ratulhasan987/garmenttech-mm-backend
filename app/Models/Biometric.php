<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $template
 * @property string $biometric_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereBiometricId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereTemplate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereUserId($value)
 * @mixin \Eloquent
 */
class Biometric extends Model
{
    use HasFactory;
}
