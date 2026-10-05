<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $type
 * @property int $account_id
 * @property string $date
 * @property numeric $amount
 * @property int|null $reference_id
 * @property int|null $project_id
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereReferenceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class CashBankTransaction extends Model
{
    use HasFactory;
}
