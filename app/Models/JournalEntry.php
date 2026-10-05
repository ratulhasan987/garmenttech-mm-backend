<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $journal_no
 * @property string $date
 * @property string $module
 * @property int|null $user_id
 * @property int|null $vendor_id
 * @property int|null $client_id
 * @property int|null $invoice_id
 * @property int|null $bill_id
 * @property string|null $description
 * @property int $posted_by
 * @property int|null $approved_by
 * @property string $status
 * @property array<array-key, mixed>|null $attachments
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\JournalLine> $lines
 * @property-read int|null $lines_count
 * @property-read \App\Models\User $postedBy
 * @property-read \App\Models\Bill|null $purchaseReference
 * @property-read \App\Models\Invoice|null $salesReference
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereJournalNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereModule($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry wherePostedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalEntry whereVendorId($value)
 * @mixin \Eloquent
 */
class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_no',
        'date',
        'module',
        'user_id',
        'vendor_id',
        'client_id',
        'invoice_id',
        'bill_id',
        'description',
        'posted_by',
        'approved_by',
        'status',
        'attachments'
    ];

    protected $casts = [
        'attachments' => 'array', // <== converts JSON string to PHP array automatically
    ];

    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function salesReference()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function purchaseReference()
    {
        return $this->belongsTo(Bill::class, 'bill_id');
    }
}
