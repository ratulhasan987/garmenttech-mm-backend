<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $action
 * @property string $table_name
 * @property int $record_id
 * @property string|null $old_values
 * @property string|null $new_values
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereNewValues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereOldValues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereRecordId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereTableName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereUserId($value)
 * @mixin \Eloquent
 */
class AuditTrail extends Model
{
    use HasFactory;
}
