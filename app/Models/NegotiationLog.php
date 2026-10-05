<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property numeric|null $discussed_price
 * @property numeric|null $customer_counter_price
 * @property numeric|null $final_price
 * @property string|null $status
 * @property int $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereCustomerCounterPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereDiscussedPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereFinalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class NegotiationLog extends Model
{
    use HasFactory;
}
