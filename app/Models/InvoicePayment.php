<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $receipt_no
 * @property int $invoice_id
 * @property int $invoice_payment_configure_id
 * @property numeric|null $pay_amount
 * @property string|null $payment_method
 * @property string|null $bank_name
 * @property string|null $branch
 * @property int|null $account_id
 * @property string|null $reference
 * @property int|null $created_by
 * @property string|null $description
 * @property string|null $attachment
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client|null $client
 * @property-read \App\Models\InvoicePaymentConfigure $configure
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Invoice $invoice
 * @property-read \App\Models\InvoicePaymentConfigure $paymentStep
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereAttachment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereBranch($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereInvoicePaymentConfigureId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment wherePayAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereReceiptNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class InvoicePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_no',
        'invoice_id',
        'invoice_payment_configure_id',
        'date',
        'pay_amount',
        'payment_method',
        'bank_name',
        'branch',
        'account_id',
        'reference',
        'created_by',
        'description',
        'attachment',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function configure()
    {
        return $this->belongsTo(InvoicePaymentConfigure::class, 'invoice_payment_configure_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Direct vendor access through Invoice
    public function client()
    {
        return $this->hasOneThrough(
            Client::class,  // final model
            Invoice::class,    // intermediate model
            'id',           // Local key on Invoice (Invoice.id)
            'id',           // Local key on Vendor (Vendor.id)
            'invoice_id',      // Foreign key on InvoicePayment (invoice_id)
            'client_id'     // Foreign key on Invoice (client_id)
        );
    }

    // Direct vendor access through Invoice
    public function user()
    {
        return $this->hasOneThrough(
            User::class,  // final model
            Invoice::class,    // intermediate model
            'id',           // Local key on Invoice (Invoice.id)
            'id',           // Local key on Vendor (User.id)
            'invoice_id',      // Foreign key on InvoicePayment (invoice_id)
            'user_id'     // Foreign key on Invoice (user_id)
        );
    }

    public function paymentStep()
    {
        return $this->belongsTo(InvoicePaymentConfigure::class, 'invoice_payment_configure_id');
    }
}
