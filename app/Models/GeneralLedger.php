<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
