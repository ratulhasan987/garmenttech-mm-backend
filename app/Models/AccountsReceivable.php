<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
