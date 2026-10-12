<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SerializedComponent extends Model
{
    protected $fillable = [
        'item_id', 'serial_number', 'current_status',
        'purchase_date', 'warranty_start_date', 'warranty_end_date', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date'        => 'date',
            'warranty_start_date'  => 'date',
            'warranty_end_date'    => 'date',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(SerializedComponentInstallment::class);
    }
}