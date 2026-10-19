<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $employee_id
 * @property string $pay_period
 * @property numeric $gross_salary
 * @property numeric $deductions
 * @property numeric $net_salary
 * @property string $status
 * @property int $journal_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereGrossSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereJournalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereNetSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry wherePayPeriod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class PayrollEntry extends Model
{
    use HasFactory;
}
