<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SerializedComponentInstallment extends Model
{
    protected $fillable = [
        'machine_id', 'serialized_component_id',
        'installed_at', 'removed_at',
        'installed_by', 'removed_by',
        'installation_reason', 'removal_reason', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'installed_at' => 'datetime',
            'removed_at'   => 'datetime',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function serializedComponent(): BelongsTo
    {
        return $this->belongsTo(SerializedComponent::class);
    }

    public function installer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'installed_by');
    }

    public function remover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'removed_by');
    }
}