<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $journal_entry_id
 * @property int $account_id
 * @property numeric $debit
 * @property numeric $credit
 * @property int|null $project_id
 * @property int|null $cost_center_id
 * @property string|null $narration
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ChartOfAccount $account
 * @property-read \App\Models\JournalEntry $journalEntry
 * @property-read \App\Models\GeneralLedger|null $ledger
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereCostCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereCredit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereDebit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereJournalEntryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereNarration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class JournalLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'debit',
        'credit',
        'project_id',
        'cost_center_id',
        'narration'
    ];

    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class, 'journal_entry_id');
    }

    public function ledger()
    {
        return $this->hasOne(GeneralLedger::class, 'journal_line_id');
    }
}
