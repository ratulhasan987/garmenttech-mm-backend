<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $asset_id
 * @property int $year
 * @property int $month
 * @property numeric $depreciation_amount
 * @property int $journal_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereAssetId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereDepreciationAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereJournalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssetDepreciation whereYear($value)
 * @mixin \Eloquent
 */
class AssetDepreciation extends Model
{
    use HasFactory;
}
