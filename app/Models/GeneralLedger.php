<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $account_id
 * @property int $journal_line_id
 * @property int|null $project_id
 * @property string $date
 * @property numeric $debit
 * @property numeric $credit
 * @property numeric $balance
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ChartOfAccount $account
 * @property-read \App\Models\JournalLine $journalLine
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereCredit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereDebit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereJournalLineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class GeneralLedger extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'journal_line_id',
        'project_id',
        'date',
        'debit',
        'credit',
        'balance'
    ];

    public function journalLine()
    {
        return $this->belongsTo(JournalLine::class, 'journal_line_id');
    }

    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }
}
