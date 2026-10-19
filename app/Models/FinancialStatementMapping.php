<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $statement_type
 * @property int $account_id
 * @property string $section
 * @property string|null $sub_section
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereSection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereStatementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereSubSection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class FinancialStatementMapping extends Model
{
    use HasFactory;
}
