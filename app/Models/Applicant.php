<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    protected $fillable = [
        'applicant_no',
        'application_date',
        'applicant_image',
        'applicant_name_en',
        'applicant_name_bn',
        'father_name_en',
        'father_name_bn',
        'mother_name_en',
        'mother_name_bn',
        'mailling_address_en',
        'mailling_address_bn',
        'permanent_address_en',
        'permanent_address_bn',
        'personal_phone',
        'personal_email',
        'date_of_birth_or_age',
        'marital_status',
        'date_of_marriage',
        'religion',
        'nationality',
        'passport_no',
        'national_id_no',
        'tin_no',

        'client_name_one',
        'client_nid_one',
        'client_name_two',
        'client_nid_two',
        'client_name_three',
        'client_nid_three',

        'nominee_image',
        'nominee_name',
        'relation_with_applicant',
        'nominee_address',
        'nominee_age',
        'nominee_phone',
        'nominee_nid_no',

        'occupation',
        'occupation_phone',
        'occupation_address',

        'rate_per_katha',
        'rate_per_katha_inword',
        'total_price',
        'total_price_inword',
        'plot_no',
        'road_no',
        'block',
        'plot_area',
        'facing',
        'plot_size',

        'bank_name',
        'branch',
        'cheque_date',
        'cheque_po_dd_no',
        'amount',

        'full_payment',
        'booking_money',
        'balance_amount',
        'per_installment',
        'installment',
        'down_payment',
        'payment_date',
        'installment_start_from',
        'remarks',

        'user_id',
        'received_amount',

        'applicant_signature',
        'joint_applicant_signature',
        'authorized_signature',
        'authorized_sig_date',
        'sales_officer_signature',
        'group_leader_signature',
        'head_of_sales_signature',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
