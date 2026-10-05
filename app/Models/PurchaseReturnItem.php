<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $purchase_return_id
 * @property int $product_id
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $tax_amount
 * @property numeric $line_total
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\PurchaseReturn $purchaseReturn
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem wherePurchaseReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturnItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class PurchaseReturnItem extends Model
{
    protected $fillable = [

        'purchase_return_id',
        'product_id',
        'quantity',
        'unit_price',
        'tax_amount',
        'line_total'

    ];


    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'product_id'
        );
    }


    public function purchaseReturn()
    {
        return $this->belongsTo(
            PurchaseReturn::class,
            'purchase_return_id'
        );
    }
}