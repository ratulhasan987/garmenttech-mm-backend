<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $invoice_payment_id
 * @property int $invoice_id
 * @property int $user_id
 * @property numeric $collection_amount
 * @property string|null $commission_type
 * @property numeric $commission_rate
 * @property numeric $commission_amount
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Invoice $invoice
 * @property-read \App\Models\InvoicePayment $payment
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCollectionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCommissionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereInvoicePaymentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereUserId($value)
 * @mixin \Eloquent
 */
class SalesCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_payment_id',
        'invoice_id',
        'user_id',
        'collection_amount',
        'commission_type',
        'commission_rate',
        'commission_amount',
        'status',
        'created_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function payment()
    {
        return $this->belongsTo(InvoicePayment::class, 'invoice_payment_id');
    }

}
