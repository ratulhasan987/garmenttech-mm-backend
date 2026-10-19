<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MachineTypeItem extends Model
{
    protected $fillable = [
        'machine_type_id', 'item_id', 'relationship_type',
        'quantity_required', 'is_critical', 'is_recommended', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_critical'     => 'boolean',
            'is_recommended'  => 'boolean',
            'quantity_required' => 'decimal:4',
        ];
    }

    public function machineType(): BelongsTo
    {
        return $this->belongsTo(MachineModel::class, 'machine_type_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}