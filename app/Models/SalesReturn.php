<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $return_no
 * @property int $sales_invoice_id
 * @property int $warehouse_id
 * @property \Carbon\CarbonImmutable $return_date
 * @property numeric $total_amount
 * @property string $status
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinanceTransaction> $financeTransactions
 * @property-read int|null $finance_transactions_count
 * @property-read \App\Models\SalesInvoice $invoice
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesReturnItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereReturnDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereReturnNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereSalesInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturn whereWarehouseId($value)
 * @mixin \Eloquent
 */
class SalesReturn extends Model
{
    protected $fillable = [
        'return_no',
        'sales_invoice_id',
        'warehouse_id',
        'return_date',
        'total_amount',
        'status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'return_date' =>
                'date:Y-m-d',

            'total_amount' =>
                'decimal:2',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(
            SalesInvoice::class,
            'sales_invoice_id'
        );
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class
        );
    }

    public function items(): HasMany
    {
        return $this->hasMany(
            SalesReturnItem::class
        );
    }

    public function financeTransactions(): HasMany
    {
        return $this->hasMany(FinanceTransaction::class);
    }
}
