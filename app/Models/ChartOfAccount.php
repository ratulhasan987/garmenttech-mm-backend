<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// class ChartOfAccount extends Model
// {
//     use HasFactory;

//     protected $fillable = [
//         'account_code',
//         'account_name',
//         'account_type',
//         'parent_id',
//         'level',
//         'is_posting',
//         'status',
//         'description'
//     ];

//     public function parentAccount()
//     {
//         return $this->belongsTo(ChartOfAccount::class, 'parent_id');
//     }

//     public function children()
//     {
//         return $this->hasMany(ChartOfAccount::class, 'parent_id');
//     }

//     public function childrenRecursive()
//     {
//         return $this->children()->with('childrenRecursive');
//     }

//     public function generalLedgers()
//     {
//         return $this->hasMany(GeneralLedger::class, 'account_id');
//     }
//     public function getTotalBalance($start_date = null, $end_date = null)
//     {
//         $query = $this->generalLedgers();

//         // Only filter if both dates provided
//         if ($start_date && $end_date) {
//             $query->whereDate('date', '>=', $start_date)
//                 ->whereDate('date', '<=', $end_date);
//         }

//         $debit  = $query->sum('debit') ?? 0;
//         $credit = $query->sum('credit') ?? 0;
//         $balance = $debit - $credit;

//         // FIX: Use already loaded children (from with('childrenRecursive'))
//         // Do NOT do children()->get() → causes N+1 and wrong filtering
//         foreach ($this->childrenRecursive as $child) {
//             $balance += $child->getTotalBalance($start_date, $end_date);
//         }

//         return $balance;
//     }
// }


class ChartOfAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_code', 'account_name', 'account_type', 'parent_id',
        'level', 'is_posting', 'status', 'description'
    ];

    // Relationships
    public function parentAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_id');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function generalLedgers()
    {
        return $this->hasMany(GeneralLedger::class, 'account_id');
    }

    /**
     * Balance for a specific period (used for Assets, Liabilities, etc.)
     */
    public function getTotalBalance($start_date = null, $end_date = null)
    {
        $query = $this->generalLedgers();

        if ($start_date && $end_date) {
            $query->whereDate('date', '>=', $start_date)
                  ->whereDate('date', '<=', $end_date);
        }

        $debit  = $query->sum('debit') ?? 0;
        $credit = $query->sum('credit') ?? 0;
        $balance = $debit - $credit;

        foreach ($this->childrenRecursive as $child) {
            $balance += $child->getTotalBalance($start_date, $end_date);
        }

        return $balance;
    }

    /**
     * CUMULATIVE balance from the beginning of time up to $endDate
     * This is the CRITICAL method for Retained Earnings
     */
    public function getCumulativeBalance($endDate = null)
    {
        $query = $this->generalLedgers();

        if ($endDate) {
            $query->whereDate('date', '<=', $endDate);
        }
        // No start date → includes ALL historical transactions

        $debit  = $query->sum('debit') ?? 0;
        $credit = $query->sum('credit') ?? 0;
        $balance = $debit - $credit;

        // Recursively include children
        foreach ($this->childrenRecursive as $child) {
            $balance += $child->getCumulativeBalance($endDate);
        }

        return $balance;
    }


    /**
     * Get cumulative balance as of a date (including children)
     */
    // public function getCumulativeBalance($asOfDate)
    // {
    //     $debit  = $this->generalLedgers()
    //         ->where('date', '<=', $asOfDate)
    //         ->sum('debit');

    //     $credit = $this->generalLedgers()
    //         ->where('date', '<=', $asOfDate)
    //         ->sum('credit');

    //     $balance = $credit - $debit;

    //     foreach ($this->children as $child) {
    //         $balance += $child->getCumulativeBalance($asOfDate);
    //     }

    //     return $balance;
    // }


    /**
     * Get total debit/credit movement for a period (including all children)
     */
    public function getPeriodMovement($from, $to)
    {
        $debit  = $this->generalLedgers()
            ->whereBetween('date', [$from, $to])
            ->sum('debit');

        $credit = $this->generalLedgers()
            ->whereBetween('date', [$from, $to])
            ->sum('credit');

        // Add children recursively
        foreach ($this->children as $child) {
            $childMove = $child->getPeriodMovement($from, $to);
            $debit  += $childMove['debit'];
            $credit += $childMove['credit'];
        }

        return [
            'debit'  => $debit,
            'credit' => $credit,
        ];
    }
}

