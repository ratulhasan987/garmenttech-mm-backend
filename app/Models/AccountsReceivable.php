<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $client_id
 * @property int|null $vendor_id
 * @property string $source_type
 * @property int $source_id
 * @property string $document_no
 * @property \Carbon\CarbonImmutable $document_date
 * @property \Carbon\CarbonImmutable $due_date
 * @property numeric $amount
 * @property numeric $received_amount
 * @property numeric $balance
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client|null $client
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinanceTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\Vendor|null $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereDocumentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereDocumentNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereReceivedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereSourceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereSourceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereVendorId($value)
 * @mixin \Eloquent
 */
class AccountsReceivable extends Model
{
    use HasFactory;

    protected $fillable = ['client_id', 'vendor_id', 'source_type', 'source_id', 'document_no', 'document_date', 'due_date', 'amount', 'received_amount', 'balance', 'status'];

    protected function casts(): array
    {
        return ['document_date' => 'date', 'due_date' => 'date', 'amount' => 'decimal:2', 'received_amount' => 'decimal:2', 'balance' => 'decimal:2'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
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
