<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $ip_address
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class WifiIp extends Model
{
    use HasFactory;

    protected $fillable = ['ip_address'];
}
