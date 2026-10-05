<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $applicant_no
 * @property string $application_date
 * @property string|null $applicant_image
 * @property string|null $applicant_name_en
 * @property string|null $applicant_name_bn
 * @property string|null $father_name_en
 * @property string|null $father_name_bn
 * @property string|null $mother_name_en
 * @property string|null $mother_name_bn
 * @property string|null $mailling_address_en
 * @property string|null $mailling_address_bn
 * @property string|null $permanent_address_en
 * @property string|null $permanent_address_bn
 * @property string|null $personal_phone
 * @property string|null $personal_email
 * @property string|null $date_of_birth_or_age
 * @property string|null $marital_status
 * @property string|null $date_of_marriage
 * @property string|null $religion
 * @property string|null $nationality
 * @property string|null $passport_no
 * @property string|null $national_id_no
 * @property string|null $tin_no
 * @property string|null $client_name_one
 * @property string|null $client_nid_one
 * @property string|null $client_name_two
 * @property string|null $client_nid_two
 * @property string|null $client_name_three
 * @property string|null $client_nid_three
 * @property string|null $nominee_image
 * @property string|null $nominee_name
 * @property string|null $relation_with_applicant
 * @property string|null $nominee_address
 * @property string|null $nominee_age
 * @property string|null $nominee_phone
 * @property string|null $nominee_nid_no
 * @property string|null $occupation
 * @property string|null $occupation_phone
 * @property string|null $occupation_address
 * @property numeric|null $rate_per_katha
 * @property string|null $rate_per_katha_inword
 * @property numeric|null $total_price
 * @property string|null $total_price_inword
 * @property string|null $plot_no
 * @property string|null $road_no
 * @property string|null $block
 * @property string|null $plot_area
 * @property string|null $facing
 * @property string|null $plot_size
 * @property string|null $bank_name
 * @property string|null $branch
 * @property string|null $cheque_date
 * @property string|null $cheque_po_dd_no
 * @property numeric|null $amount
 * @property numeric|null $full_payment
 * @property numeric|null $booking_money
 * @property numeric|null $balance_amount
 * @property numeric|null $per_installment
 * @property int|null $installment
 * @property numeric|null $down_payment
 * @property string|null $payment_date
 * @property string|null $installment_start_from
 * @property string|null $remarks
 * @property int|null $user_id
 * @property numeric|null $received_amount
 * @property string|null $applicant_signature
 * @property string|null $joint_applicant_signature
 * @property string|null $authorized_signature
 * @property string|null $authorized_sig_date
 * @property string|null $sales_officer_signature
 * @property string|null $group_leader_signature
 * @property string|null $head_of_sales_signature
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereApplicantImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereApplicantNameBn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereApplicantNameEn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereApplicantNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereApplicantSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereApplicationDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereAuthorizedSigDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereAuthorizedSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereBalanceAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereBlock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereBookingMoney($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereBranch($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereChequeDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereChequePoDdNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereClientNameOne($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereClientNameThree($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereClientNameTwo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereClientNidOne($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereClientNidThree($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereClientNidTwo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereDateOfBirthOrAge($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereDateOfMarriage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereDownPayment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereFacing($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereFatherNameBn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereFatherNameEn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereFullPayment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereGroupLeaderSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereHeadOfSalesSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereInstallment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereInstallmentStartFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereJointApplicantSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereMaillingAddressBn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereMaillingAddressEn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereMaritalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereMotherNameBn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereMotherNameEn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNationalIdNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNationality($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNomineeAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNomineeAge($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNomineeImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNomineeName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNomineeNidNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereNomineePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereOccupation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereOccupationAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereOccupationPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePassportNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePaymentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePerInstallment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePermanentAddressBn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePermanentAddressEn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePersonalEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePersonalPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePlotArea($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePlotNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant wherePlotSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereRatePerKatha($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereRatePerKathaInword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereReceivedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereRelationWithApplicant($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereReligion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereRoadNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereSalesOfficerSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereTinNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereTotalPriceInword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Applicant whereUserId($value)
 * @mixin \Eloquent
 */
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
