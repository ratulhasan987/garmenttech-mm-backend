<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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