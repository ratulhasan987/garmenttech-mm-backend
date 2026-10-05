<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $machine_model_id
 * @property int $item_id
 * @property string $relationship_type
 * @property int $quantity_required
 * @property int $is_critical
 * @property int $is_recommended
 * @property string|null $notes
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereIsCritical($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereIsRecommended($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereMachineModelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereQuantityRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereRelationshipType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class MachineModelItem extends Model
{
    //
}
