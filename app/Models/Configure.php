<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $name
 * @property string|null $logo
 * @property string|null $primary_logo
 * @property string|null $secondary_logo
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $address
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure wherePrimaryLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereSecondaryLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Configure extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'primary_logo',
        'secondary_logo',
        'phone',
        'email',
        'address',
    ];

}
