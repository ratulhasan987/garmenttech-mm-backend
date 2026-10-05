<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $rfq_no
 * @property int|null $requisition_id
 * @property bool $is_requisition_based
 * @property int $vendor_id
 * @property \Carbon\CarbonImmutable|null $required_date
 * @property \Carbon\CarbonImmutable|null $submitted_date
 * @property string $status
 * @property string|null $notes
 * @property int|null $created_by
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $approved_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\User|null $createdBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\RequestForQuotationItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Project|null $project
 * @property-read \App\Models\Requisition|null $requisition
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereIsRequisitionBased($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereRequiredDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereRfqNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereSubmittedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotation whereVendorId($value)
 * @mixin \Eloquent
 */
class RequestForQuotation extends Model
{
    protected $table = 'request_for_quotations';

    protected $fillable = [
        'rfq_no',
        'project_id',
        'requisition_id',
        'is_requisition_based',
        'vendor_id',
        'required_date',
        'submitted_date',
        'status',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'required_date'        => 'date',
        'submitted_date'       => 'date',
        'approved_at'          => 'datetime',
        'is_requisition_based' => 'boolean',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function requisition()
    {
        return $this->belongsTo(Requisition::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function items()
    {
        return $this->hasMany(RequestForQuotationItem::class, 'request_for_quotation_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['Draft', 'Pending'], true);
    }
}