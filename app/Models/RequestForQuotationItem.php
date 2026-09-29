<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestForQuotationItem extends Model
{
    protected $table = 'request_for_quotation_items';

    protected $fillable = [
        'request_for_quotation_id',
        'requisition_item_id',
        'type',
        'item_id',
        'description',
        'unit',
        'quantity',
        'unit_price',
        'amount',
        'delivery_days',
        'remarks',
        'is_selected',
    ];

    protected $casts = [
        'quantity'     => 'decimal:2',
        'unit_price'   => 'decimal:2',
        'amount'       => 'decimal:2',
        'is_selected'  => 'boolean',
        'delivery_days'=> 'integer',
    ];

    public function rfq()
    {
        return $this->belongsTo(RequestForQuotation::class, 'request_for_quotation_id');
    }

    public function requisitionItem()
    {
        return $this->belongsTo(RequisitionItem::class, 'requisition_item_id');
    }

    protected static function booted()
    {
        static::saving(function (self $item) {
            $item->amount = round((float) $item->quantity * (float) $item->unit_price, 2);
        });
    }
}