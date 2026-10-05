<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $bill_id
 * @property int $vendor_id
 * @property string $document_no
 * @property \Carbon\CarbonImmutable $document_date
 * @property \Carbon\CarbonImmutable $due_date
 * @property numeric $amount
 * @property numeric $paid_amount
 * @property numeric $balance
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill|null $bill
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinanceTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereDocumentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereDocumentNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereVendorId($value)
 * @mixin \Eloquent
 */
class AccountsPayable extends Model
{
    use HasFactory;

    protected $fillable = ['bill_id', 'vendor_id', 'document_no', 'document_date', 'due_date', 'amount', 'paid_amount', 'balance', 'status'];

    protected function casts(): array
    {
        return ['document_date' => 'date', 'due_date' => 'date', 'amount' => 'decimal:2', 'paid_amount' => 'decimal:2', 'balance' => 'decimal:2'];
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(FinanceTransaction::class);
    }
}
