<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $asset_code
 * @property string $asset_name
 * @property string $purchase_date
 * @property numeric $cost
 * @property int $useful_life
 * @property numeric $salvage_value
 * @property string $depreciation_method
 * @property numeric $accumulated_depreciation
 * @property numeric $net_book_value
 * @property int|null $project_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereAccumulatedDepreciation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereAssetCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereAssetName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereDepreciationMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereNetBookValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset wherePurchaseDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereSalvageValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FixedAsset whereUsefulLife($value)
 * @mixin \Eloquent
 */
class FixedAsset extends Model
{
    use HasFactory;
}
