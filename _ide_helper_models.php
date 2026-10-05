<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int|null $bill_id
 * @property int $vendor_id
 * @property string $document_no
 * @property \Carbon\CarbonImmutable $document_date
 * @property \Carbon\CarbonImmutable $due_date
 * @property numeric $amount
 * @property numeric $paid_amount
 * @property numeric $balance
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill|null $bill
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinanceTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereDocumentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereDocumentNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsPayable whereVendorId($value)
 */
	class AccountsPayable extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $client_id
 * @property int|null $vendor_id
 * @property string $source_type
 * @property int $source_id
 * @property string $document_no
 * @property \Carbon\CarbonImmutable $document_date
 * @property \Carbon\CarbonImmutable $due_date
 * @property numeric $amount
 * @property numeric $received_amount
 * @property numeric $balance
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client|null $client
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\FinanceTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\Vendor|null $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereDocumentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereDocumentNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereReceivedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereSourceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereSourceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AccountsReceivable whereVendorId($value)
 */
	class AccountsReceivable extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property string|null $description
 * @property string $related_type
 * @property int $related_id
 * @property int $user_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereRelatedId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereRelatedType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereUserId($value)
 */
	class Activity extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property numeric $amount
 * @property string|null $note
 * @property string $date
 * @property string|null $file
 * @property string|null $advance_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $advanceBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereAdvanceBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereFile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Advance whereUserId($value)
 */
	class Advance extends \Eloquent {}
}

namespace App\Models{
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
 */
	class Applicant extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Area whereUpdatedAt($value)
 */
	class Area extends \Eloquent {}
}

namespace App\Models{
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
 */
	class AssetDepreciation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $attendance_status
 * @property string|null $checked_in_at
 * @property string|null $checked_out_at
 * @property string|null $type_of_leave
 * @property string|null $checked_in_at_note
 * @property string|null $checked_out_at_note
 * @property string $attendance_type
 * @property numeric|null $latitude
 * @property numeric|null $longitude
 * @property string|null $location_address
 * @property string $biometric_method
 * @property int|null $biometric_id
 * @property string|null $device_info
 * @property int|null $modification_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $modifyBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAttendanceStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAttendanceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereBiometricId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereBiometricMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedInAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedInAtNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedOutAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedOutAtNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereDeviceInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLocationAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereModificationBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereTypeOfLeave($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUserId($value)
 */
	class Attendance extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $action
 * @property string $table_name
 * @property int $record_id
 * @property string|null $old_values
 * @property string|null $new_values
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereNewValues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereOldValues($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereRecordId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereTableName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditTrail whereUserId($value)
 */
	class AuditTrail extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $bill_no
 * @property int $goods_received_note_id
 * @property int $purchase_order_id
 * @property int $vendor_id
 * @property numeric $sub_total
 * @property numeric $total_tax
 * @property numeric $total_discount
 * @property numeric $shipping_cost
 * @property numeric $grand_total
 * @property numeric $paid_amount
 * @property numeric $due_amount
 * @property string $payment_status
 * @property \Carbon\CarbonImmutable $bill_date
 * @property \Carbon\CarbonImmutable|null $due_date
 * @property string|null $attachments
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BillItem> $billItems
 * @property-read int|null $bill_items_count
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\GoodsReceivedNote $goodsReceivedNote
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BillItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\AccountsPayable|null $payable
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BillPayment> $payments
 * @property-read int|null $payments_count
 * @property-read \App\Models\PurchaseOrder $purchaseOrder
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereBillDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereBillNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereDueAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereGoodsReceivedNoteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereShippingCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereTotalDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereTotalTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereVendorId($value)
 */
	class Bill extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $bill_id
 * @property int $goods_received_note_item_id
 * @property int $purchase_item_id
 * @property int $item_id
 * @property string|null $unit
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $discount
 * @property array<array-key, mixed>|null $taxes
 * @property numeric $total_tax
 * @property numeric $total_amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @property-read \App\Models\GoodsReceivedNoteItem $goodsReceivedNoteItem
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\PurchaseItem $purchaseItem
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereGoodsReceivedNoteItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem wherePurchaseItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereTotalTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereUpdatedAt($value)
 */
	class BillItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $bill_id
 * @property \Carbon\CarbonImmutable $date
 * @property numeric|null $pay_amount
 * @property int|null $account_id
 * @property string|null $reference
 * @property int|null $created_by
 * @property string|null $description
 * @property string|null $attachment
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\FinanceTransaction|null $financeTransaction
 * @property-read \App\Models\Vendor|null $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereAttachment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment wherePayAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereUpdatedAt($value)
 */
	class BillPayment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $template
 * @property string $biometric_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereBiometricId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereTemplate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Biometric whereUserId($value)
 */
	class Biometric extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $country
 * @property string|null $website
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MachineModel> $machineModels
 * @property-read int|null $machine_models_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereWebsite($value)
 */
	class Brand extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $project_id
 * @property int $account_id
 * @property string $fiscal_year
 * @property numeric $budget_amount
 * @property numeric $actual_amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereActualAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereBudgetAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereFiscalYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Budget whereUpdatedAt($value)
 */
	class Budget extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $address
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Floor> $floors
 * @property-read int|null $floors_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Building whereUpdatedAt($value)
 */
	class Building extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $type
 * @property int $account_id
 * @property string $date
 * @property numeric $amount
 * @property int|null $reference_id
 * @property int|null $project_id
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereReferenceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CashBankTransaction whereUpdatedAt($value)
 */
	class CashBankTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $account_code
 * @property string $account_name
 * @property string $account_type
 * @property int|null $parent_id
 * @property int $level
 * @property int $is_posting
 * @property int $status
 * @property string|null $description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ChartOfAccount> $children
 * @property-read int|null $children_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GeneralLedger> $generalLedgers
 * @property-read int|null $general_ledgers_count
 * @property-read ChartOfAccount|null $parentAccount
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereAccountCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereAccountName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereAccountType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereIsPosting($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ChartOfAccount whereUpdatedAt($value)
 */
	class ChartOfAccount extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $client_no
 * @property string $name
 * @property string $phone
 * @property string|null $email
 * @property string|null $nid_no
 * @property string|null $passport_no
 * @property string|null $tin_no
 * @property \Carbon\CarbonImmutable|null $date_of_birth
 * @property string|null $gender
 * @property string|null $marital_status
 * @property int|null $profession_id
 * @property int|null $lead_designation_id
 * @property string|null $company_name
 * @property string|null $present_address
 * @property string|null $permanent_address
 * @property int|null $area_id
 * @property int|null $sector_id
 * @property string|null $image
 * @property string $status
 * @property int|null $lead_id
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Area|null $area
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\LeadDesignation|null $designation
 * @property-read \App\Models\Lead|null $lead
 * @property-read \App\Models\Profession|null $profession
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesInvoice> $salesInvoices
 * @property-read int|null $sales_invoices_count
 * @property-read \App\Models\Sector|null $sector
 * @property-read \App\Models\User|null $updatedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client accessible(\App\Models\User $user)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereAreaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereClientNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereDateOfBirth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereLeadDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereMaritalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereNidNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePassportNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePermanentAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePresentAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereProfessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereSectorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereTinNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereUpdatedBy($value)
 */
	class Client extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $name
 * @property string|null $logo
 * @property string|null $primary_logo
 * @property string|null $secondary_logo
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $address
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure wherePrimaryLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereSecondaryLogo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Configure whereUpdatedAt($value)
 */
	class Configure extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $currency_code
 * @property string $currency_name
 * @property string|null $symbol
 * @property string|null $country
 * @property float $exchange_rate
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCurrencyCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereCurrencyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereExchangeRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereSymbol($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Currency whereUpdatedAt($value)
 */
	class Currency extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property numeric $expected_value
 * @property int $probability
 * @property string|null $expected_close_date
 * @property int $stage_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereExpectedCloseDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereExpectedValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereProbability($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereUpdatedAt($value)
 */
	class Deal extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $code
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read string $status_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Department whereUpdatedAt($value)
 */
	class Department extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $code
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read string $status_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Designation whereUpdatedAt($value)
 */
	class Designation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $resume
 * @property string|null $nid_card
 * @property string|null $as_per_nid_image
 * @property string|null $father_nid
 * @property string|null $mother_nid
 * @property string|null $relative_nid_primary
 * @property string|null $relative_nid_secondary
 * @property string|null $non_relative_nid_primary
 * @property string|null $non_relative_nid_secondary
 * @property string|null $educational_certificate
 * @property string|null $professional_certificate
 * @property string|null $training_certificate
 * @property string|null $professional_referance_primary
 * @property string|null $professional_referance_secondary
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Department|null $department
 * @property-read \App\Models\Designation|null $designation
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereAsPerNidImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereEducationalCertificate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereFatherNid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereMotherNid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereNidCard($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereNonRelativeNidPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereNonRelativeNidSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereProfessionalCertificate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereProfessionalReferancePrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereProfessionalReferanceSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereRelativeNidPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereRelativeNidSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereResume($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereTrainingCertificate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereUserId($value)
 */
	class Document extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $transaction_no
 * @property \Carbon\CarbonImmutable $transaction_date
 * @property string $direction
 * @property string $transaction_type
 * @property int|null $accounts_receivable_id
 * @property int|null $accounts_payable_id
 * @property int|null $sales_return_id
 * @property string $party_type
 * @property int $party_id
 * @property string|null $payment_type
 * @property int|null $payment_id
 * @property numeric $amount
 * @property string|null $payment_method
 * @property string|null $reference
 * @property string|null $remarks
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\AccountsPayable|null $payable
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent|null $payment
 * @property-read \App\Models\AccountsReceivable|null $receivable
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereAccountsPayableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereAccountsReceivableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePartyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePartyType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePaymentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePaymentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereSalesReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereTransactionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereTransactionNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereTransactionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereUpdatedAt($value)
 */
	class FinanceTransaction extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $statement_type
 * @property int $account_id
 * @property string $section
 * @property string|null $sub_section
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereSection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereStatementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereSubSection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinancialStatementMapping whereUpdatedAt($value)
 */
	class FinancialStatementMapping extends \Eloquent {}
}

namespace App\Models{
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
 */
	class FixedAsset extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $building_id
 * @property string $name
 * @property int $floor_number
 * @property string $code
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Building $building
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Machine> $machines
 * @property-read int|null $machines_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereBuildingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereFloorNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereUpdatedAt($value)
 */
	class Floor extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int $user_id
 * @property string $scheduled_at
 * @property string $type
 * @property string|null $outcome
 * @property int|null $next_stage_id
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereNextStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereOutcome($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereUserId($value)
 */
	class Followup extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $account_id
 * @property int $journal_line_id
 * @property int|null $project_id
 * @property string $date
 * @property numeric $debit
 * @property numeric $credit
 * @property numeric $balance
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ChartOfAccount $account
 * @property-read \App\Models\JournalLine $journalLine
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereCredit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereDebit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereJournalLineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GeneralLedger whereUpdatedAt($value)
 */
	class GeneralLedger extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $grn_no
 * @property int $purchase_order_id
 * @property int $warehouse_id
 * @property \Carbon\CarbonImmutable $received_date
 * @property int $received_by
 * @property string $status
 * @property int|null $approved_by
 * @property array<array-key, mixed>|null $attachments
 * @property string|null $note
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\Bill|null $bill
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GoodsReceivedNoteItem> $goodsReceivedNoteItems
 * @property-read int|null $goods_received_note_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GoodsReceivedNoteItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\PurchaseOrder $purchaseOrder
 * @property-read \App\Models\User $receivedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockMovement> $stockMovements
 * @property-read int|null $stock_movements_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereGrnNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereReceivedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereReceivedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereWarehouseId($value)
 */
	class GoodsReceivedNote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $goods_received_note_id
 * @property int $purchase_item_id
 * @property int $item_id
 * @property string $unit
 * @property numeric $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\BillItem|null $billItem
 * @property-read \App\Models\GoodsReceivedNote $goodsReceivedNote
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\PurchaseItem $purchaseItem
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereGoodsReceivedNoteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem wherePurchaseItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereUpdatedAt($value)
 */
	class GoodsReceivedNoteItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $key
 * @property string $fingerprint
 * @property string $last_four
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereLastFour($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GroqApiKey whereUpdatedAt($value)
 */
	class GroqApiKey extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property \Carbon\CarbonImmutable $date
 * @property bool $is_recurring
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read mixed $display_date
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday forCalendar()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereIsRecurring($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Holiday whereUpdatedAt($value)
 */
	class Holiday extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $month
 * @property numeric $own_target
 * @property numeric $coordinator_target
 * @property numeric $total_target
 * @property numeric $achievement
 * @property numeric $amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereAchievement($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereCoordinatorTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereOwnTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereTotalTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereUserId($value)
 */
	class Incentive extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $invoice_no
 * @property int $client_id
 * @property int $user_id
 * @property numeric|null $sub_total
 * @property numeric|null $total_tax
 * @property numeric|null $total_discount
 * @property numeric|null $grand_total
 * @property numeric|null $paid_amount
 * @property numeric|null $due_amount
 * @property string $payment_status
 * @property string|null $invoice_date
 * @property string|null $due_date
 * @property string|null $attachments
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client $client
 * @property-read \App\Models\User|null $createdBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InvoiceItem> $invoiceitems
 * @property-read int|null $invoiceitems_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InvoicePayment> $payments
 * @property-read int|null $payments_count
 * @property-read \App\Models\Tax|null $tax
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereDueAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereInvoiceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereInvoiceNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereTotalDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereTotalTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Invoice whereUserId($value)
 */
	class Invoice extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $invoice_id
 * @property int $item_id
 * @property string|null $unit
 * @property numeric|null $quantity
 * @property numeric|null $unit_price
 * @property numeric|null $discount
 * @property string|null $taxes
 * @property numeric|null $total_tax
 * @property numeric|null $total_amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product|null $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereTotalTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoiceItem whereUpdatedAt($value)
 */
	class InvoiceItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $receipt_no
 * @property int $invoice_id
 * @property int $invoice_payment_configure_id
 * @property numeric|null $pay_amount
 * @property string|null $payment_method
 * @property string|null $bank_name
 * @property string|null $branch
 * @property int|null $account_id
 * @property string|null $reference
 * @property int|null $created_by
 * @property string|null $description
 * @property string|null $attachment
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client|null $client
 * @property-read \App\Models\InvoicePaymentConfigure $configure
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Invoice $invoice
 * @property-read \App\Models\InvoicePaymentConfigure $paymentStep
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereAttachment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereBranch($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereInvoicePaymentConfigureId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment wherePayAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereReceiptNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePayment whereUpdatedAt($value)
 */
	class InvoicePayment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $invoice_id
 * @property string $type
 * @property numeric|null $number_of_installment
 * @property numeric|null $amount
 * @property numeric|null $paid_amount
 * @property numeric|null $percentage
 * @property string|null $installment_type
 * @property string|null $payment_day
 * @property string|null $start_month
 * @property string|null $end_month
 * @property string|null $due_date
 * @property numeric|null $late_fee
 * @property int|null $sequence
 * @property string|null $remarks
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Invoice $invoice
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereEndMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereInstallmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereLateFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereNumberOfInstallment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure wherePaymentDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure wherePercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereSequence($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereStartMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereUpdatedBy($value)
 */
	class InvoicePaymentConfigure extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $item_category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string|null $part_number
 * @property string|null $sku
 * @property string|null $barcode
 * @property string|null $description
 * @property int|null $minimum_stock
 * @property int|null $reorder_stock
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereBarcode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereBrandId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereItemCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereMinimumStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item wherePartNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereReorderStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereSku($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereUpdatedAt($value)
 */
	class Item extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $data_type
 * @property int|null $unit_id
 * @property string|null $description
 * @property int $is_required
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereDataType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereIsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereUpdatedAt($value)
 */
	class ItemAttribute extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $item_attribute_id
 * @property string $value
 * @property string $label
 * @property int $sort_order
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereItemAttributeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereValue($value)
 */
	class ItemAttributeOption extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeValue newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeValue newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeValue query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeValue whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeValue whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeValue whereUpdatedAt($value)
 */
	class ItemAttributeValue extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $item_type_id
 * @property int|null $parent_id
 * @property string $name
 * @property string|null $description
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereItemTypeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereUpdatedAt($value)
 */
	class ItemCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $is_consumable
 * @property int $is_serialized
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereIsConsumable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereIsSerialized($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemType whereUpdatedAt($value)
 */
	class ItemType extends \Eloquent {}
}

namespace App\Models{
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
 */
	class JournalEntry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $journal_entry_id
 * @property int $account_id
 * @property numeric $debit
 * @property numeric $credit
 * @property int|null $project_id
 * @property int|null $cost_center_id
 * @property string|null $narration
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ChartOfAccount $account
 * @property-read \App\Models\JournalEntry $journalEntry
 * @property-read \App\Models\GeneralLedger|null $ledger
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereCostCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereCredit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereDebit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereJournalEntryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereNarration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|JournalLine whereUpdatedAt($value)
 */
	class JournalLine extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $kpi_role_id
 * @property int $user_id
 * @property numeric $target
 * @property int|null $project_id
 * @property int|null $coordinator_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Kpi> $children
 * @property-read int|null $children_count
 * @property-read \App\Models\User|null $coordinator
 * @property-read \App\Models\KpiRole $kpiRole
 * @property-read Kpi|null $parent
 * @property-read \App\Models\Project|null $project
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereCoordinatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereKpiRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereUserId($value)
 */
	class Kpi extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property numeric $incentive
 * @property numeric|null $coordination_incentive
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereCoordinationIncentive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereIncentive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereUpdatedAt($value)
 */
	class KpiRole extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $lead_code
 * @property string|null $name
 * @property string|null $company_name
 * @property string $phone
 * @property string|null $phone_secondary
 * @property string|null $phone_foreign
 * @property string|null $email
 * @property int|null $area_id
 * @property int|null $sector_id
 * @property int|null $profession_id
 * @property int|null $designation_id
 * @property int|null $source_id
 * @property int $stage_id
 * @property int|null $assigned_to
 * @property string $priority
 * @property string|null $interest_level
 * @property \Carbon\CarbonImmutable|null $last_contacted_at
 * @property \Carbon\CarbonImmutable|null $next_follow_up_at
 * @property string|null $remarks
 * @property bool $is_converted
 * @property \Carbon\CarbonImmutable|null $converted_at
 * @property int|null $customer_id
 * @property string|null $address
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Area|null $area
 * @property-read \App\Models\User|null $assignedUser
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Deal|null $deal
 * @property-read \App\Models\LeadDesignation|null $designation
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Followup> $followups
 * @property-read int|null $followups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadConversation> $leadConversations
 * @property-read int|null $lead_conversations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadProduct> $leadProducts
 * @property-read int|null $lead_products_count
 * @property-read \App\Models\LeadSource|null $leadSource
 * @property-read \App\Models\LeadStage $leadStage
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\NegotiationLog> $negotiations
 * @property-read int|null $negotiations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Offer> $offers
 * @property-read int|null $offers_count
 * @property-read \App\Models\Profession|null $profession
 * @property-read \App\Models\Sector|null $sector
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SiteVisit> $siteVisits
 * @property-read int|null $site_visits_count
 * @property-read \App\Models\LeadStage $stage
 * @property-read \App\Models\User|null $updatedby
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead accessible(\App\Models\User $user)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereAreaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereAssignedTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereConvertedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereInterestLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereIsConverted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereLastContactedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereLeadCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereNextFollowUpAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePhoneForeign($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePhoneSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereProfessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereSectorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereSourceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereUpdatedBy($value)
 */
	class Lead extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int $assigned_to
 * @property int $assigned_by
 * @property string $assignment_type
 * @property string|null $reason
 * @property string $assigned_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignedTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereReason($value)
 */
	class LeadAssignment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int $user_id
 * @property string $channel
 * @property string|null $message
 * @property string|null $call_direction
 * @property int|null $call_duration
 * @property bool $requires_follow_up
 * @property \Carbon\CarbonImmutable|null $next_follow_up_at
 * @property int|null $stage_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereCallDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereCallDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereChannel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereNextFollowUpAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereRequiresFollowUp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereUserId($value)
 */
	class LeadConversation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $code
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read string $status_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereUpdatedAt($value)
 */
	class LeadDesignation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int $user_id
 * @property string $notify_at
 * @property string|null $read_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead|null $lead
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereNotifyAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereUserId($value)
 */
	class LeadFollowupNotification extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int $product_id
 * @property string $product_code
 * @property string $product_name
 * @property string|null $unit
 * @property numeric|null $quantity
 * @property numeric|null $estimated_price_per_unit
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @property-read \App\Models\Product $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereEstimatedPricePerUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereProductCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereProductName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereUpdatedAt($value)
 */
	class LeadProduct extends \Eloquent {}
}

namespace App\Models{
/**
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProperty newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProperty newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProperty query()
 */
	class LeadProperty extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property numeric|null $cost_per_lead
 * @property int $is_active
 * @property int $is_default
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Lead> $leads
 * @property-read int|null $leads_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereCostPerLead($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereUpdatedAt($value)
 */
	class LeadSource extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $pipeline_type
 * @property string|null $project_type
 * @property int $probability_percent 0 - 100
 * @property int $order
 * @property string|null $color
 * @property int $is_active
 * @property int $is_default
 * @property int $is_convert_to_customer Automatically create customer when lead reaches this stage
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Lead> $leads
 * @property-read int|null $leads_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereIsConvertToCustomer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage wherePipelineType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereProbabilityPercent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereProjectType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereUpdatedAt($value)
 */
	class LeadStage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int|null $from_stage_id
 * @property int $to_stage_id
 * @property int $changed_by
 * @property string $changed_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereChangedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereChangedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereFromStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereToStageId($value)
 */
	class LeadStageHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $qty
 * @property bool $is_default
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveRequest> $leaveRequests
 * @property-read int|null $leave_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Leave whereUpdatedAt($value)
 */
	class Leave extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $leave_id
 * @property string $start_date
 * @property string $end_date
 * @property string|null $leave_type
 * @property string|null $sub_type
 * @property numeric $days
 * @property int|null $reporting_officer
 * @property string $reporting_officer_status
 * @property string $status
 * @property string|null $reason
 * @property string|null $attachment
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Leave $leave
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereAttachment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereLeaveId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereLeaveType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereReportingOfficer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereReportingOfficerStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereSubType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeaveRequest whereUserId($value)
 */
	class LeaveRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $loan_details
 * @property numeric $amount
 * @property int $duration
 * @property numeric $monthly_installment
 * @property string $status
 * @property string|null $approval_date
 * @property string|null $repayment_from
 * @property numeric|null $interest
 * @property string|null $repayment_amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoanInstallment> $installments
 * @property-read int|null $installments_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereApprovalDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereInterest($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereLoanDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereMonthlyInstallment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereRepaymentAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereRepaymentFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereUserId($value)
 */
	class Loan extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $loan_id
 * @property string $month
 * @property numeric $amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Loan $loan
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereLoanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereUserId($value)
 */
	class LoanInstallment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $designation_id
 * @property numeric $rate
 * @property string $status
 * @property int $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $createdBy
 * @property-read \App\Models\Designation $designation
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereUpdatedAt($value)
 */
	class LoanInterest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $machine_id
 * @property int $model_id
 * @property string $code
 * @property string|null $notes
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MachineLocation|null $currentLocation
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MachineLocation> $locations
 * @property-read int|null $locations_count
 * @property-read \App\Models\MachineModel $model
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereMachineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereModelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereUpdatedAt($value)
 */
	class Machine extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, MachineCategory> $children
 * @property-read int|null $children_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MachineModel> $machineModels
 * @property-read int|null $machine_models_count
 * @property-read MachineCategory|null $parent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereUpdatedAt($value)
 */
	class MachineCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $machine_id
 * @property int $floor_id
 * @property string $sl_no
 * @property \Carbon\CarbonImmutable $assigned_at
 * @property \Carbon\CarbonImmutable|null $removed_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property string|null $remarks
 * @property-read \App\Models\Floor $floor
 * @property-read \App\Models\Machine $machine
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation current()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation history()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereAssignedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereFloorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereMachineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereRemovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereSlNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineLocation whereUpdatedAt($value)
 */
	class MachineLocation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $machine_category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Brand|null $machineBrand
 * @property-read \App\Models\MachineCategory|null $machineCategory
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereBrandId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereMachineCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereUpdatedAt($value)
 */
	class MachineModel extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $machine_model_id
 * @property int $item_id
 * @property string $relationship_type
 * @property int $quantity_required
 * @property int $is_critical
 * @property int $is_recommended
 * @property string|null $notes
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereIsCritical($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereIsRecommended($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereMachineModelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereQuantityRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereRelationshipType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModelItem whereUpdatedAt($value)
 */
	class MachineModelItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property numeric|null $discussed_price
 * @property numeric|null $customer_counter_price
 * @property numeric|null $final_price
 * @property string|null $status
 * @property int $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereCustomerCounterPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereDiscussedPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereFinalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NegotiationLog whereUpdatedAt($value)
 */
	class NegotiationLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $description
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notice whereUserId($value)
 */
	class Notice extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int $unit_id
 * @property numeric $offered_price
 * @property numeric|null $discount_percent
 * @property int|null $approved_by
 * @property string $status
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereDiscountPercent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereOfferedPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereUpdatedAt($value)
 */
	class Offer extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $employee_id
 * @property string $pay_period
 * @property numeric $gross_salary
 * @property numeric $deductions
 * @property numeric $net_salary
 * @property string $status
 * @property int $journal_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereGrossSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereJournalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereNetSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry wherePayPeriod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PayrollEntry whereUpdatedAt($value)
 */
	class PayrollEntry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $product_category_id
 * @property int|null $product_brand_id
 * @property int $unit_id
 * @property numeric $reorder_level
 * @property numeric $purchase_price
 * @property numeric $sales_price
 * @property array<array-key, mixed>|null $purchase_tax_ids
 * @property array<array-key, mixed>|null $sales_tax_ids
 * @property bool $status
 * @property string|null $description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ProductBrand|null $brand
 * @property-read \App\Models\ProductCategory $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadProduct> $leadProducts
 * @property-read int|null $lead_products_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockMovement> $stockMovements
 * @property-read int|null $stock_movements_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Stock> $stocks
 * @property-read int|null $stocks_count
 * @property-read \App\Models\Unit $unit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereProductBrandId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereProductCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product wherePurchasePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product wherePurchaseTaxIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereReorderLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereSalesPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereSalesTaxIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereUpdatedAt($value)
 */
	class Product extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereUpdatedAt($value)
 */
	class ProductBrand extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int|null $parent_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ProductCategory> $children
 * @property-read int|null $children_count
 * @property-read ProductCategory|null $parent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductCategory whereUpdatedAt($value)
 */
	class ProductCategory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductCategory> $categories
 * @property-read int|null $categories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductType whereUpdatedAt($value)
 */
	class ProductType extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profession whereUpdatedAt($value)
 */
	class Profession extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $project_no
 * @property string $name
 * @property numeric|null $price_per_unit
 * @property numeric|null $purchase_price
 * @property int|null $unit_id
 * @property numeric|null $size
 * @property array<array-key, mixed>|null $taxes
 * @property string|null $location
 * @property string|null $address
 * @property string $status
 * @property string|null $description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @property-read \App\Models\Unit|null $unit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project wherePricePerUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereProjectNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project wherePurchasePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereUpdatedAt($value)
 */
	class Project extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $purchase_order_id
 * @property int|null $requisition_item_id
 * @property int $item_id
 * @property string $unit
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property array<array-key, mixed>|null $taxes
 * @property numeric|null $tax_amount
 * @property numeric|null $line_total
 * @property int|null $warehouse_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GoodsReceivedNoteItem> $goodsReceivedNoteItems
 * @property-read int|null $goods_received_note_items_count
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\PurchaseOrder $purchaseOrder
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereRequisitionItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereWarehouseId($value)
 */
	class PurchaseItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $order_id
 * @property int|null $requisition_id
 * @property bool $is_requisition_based
 * @property int $vendor_id
 * @property int|null $warehouse_id
 * @property numeric $sub_total
 * @property numeric|null $order_tax
 * @property numeric|null $order_discount
 * @property numeric|null $shipping_cost
 * @property numeric $grand_total
 * @property string|null $order_date
 * @property string|null $expected_delivery
 * @property string|null $document
 * @property string|null $note
 * @property string $status
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchaseItem> $purchaseItems
 * @property-read int|null $purchase_items_count
 * @property-read \App\Models\Requisition|null $requisition
 * @property-read \App\Models\Tax|null $tax
 * @property-read \App\Models\Vendor $vendor
 * @property-read \App\Models\Warehouse|null $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereDocument($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereExpectedDelivery($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereIsRequisitionBased($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereShippingCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereVendorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereWarehouseId($value)
 */
	class PurchaseOrder extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $return_no
 * @property int $vendor_id
 * @property int|null $purchase_order_id
 * @property int|null $bill_id
 * @property int $warehouse_id
 * @property string $return_date
 * @property numeric $subtotal
 * @property numeric $tax_amount
 * @property numeric $grand_total
 * @property string $status
 * @property int|null $created_by
 * @property int|null $approved_by
 * @property string|null $document
 * @property string|null $note
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\Bill|null $bill
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\VendorDebitNote|null $debitNote
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchaseReturnItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\PurchaseOrder|null $purchaseOrder
 * @property-read \App\Models\AccountsReceivable|null $receivable
 * @property-read \App\Models\Vendor $vendor
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereDocument($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereReturnDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereReturnNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereVendorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereWarehouseId($value)
 */
	class PurchaseReturn extends \Eloquent {}
}

namespace App\Models{
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
 */
	class PurchaseReturnItem extends \Eloquent {}
}

namespace App\Models{
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
 */
	class RequestForQuotation extends \Eloquent {}
}

namespace App\Models{
/**
 * @property-read \App\Models\RequisitionItem|null $requisitionItem
 * @property-read \App\Models\RequestForQuotation|null $rfq
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotationItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotationItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequestForQuotationItem query()
 */
	class RequestForQuotationItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $requisition_id
 * @property string $required_date
 * @property int $requested_by
 * @property string|null $attachments
 * @property string $status
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\RequisitionItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\User $requestedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereRequestedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereRequiredDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereUpdatedAt($value)
 */
	class Requisition extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $requisition_id
 * @property int $product_id
 * @property numeric $previously_requisitioned
 * @property numeric|null $remaining_quantity
 * @property numeric $quantity
 * @property int $item_id
 * @property string $unit
 * @property \Carbon\CarbonImmutable|null $required_date
 * @property string $priority
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\Requisition $requisition
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem wherePreviouslyRequisitioned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereRemainingQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereRequiredDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereUpdatedAt($value)
 */
	class RequisitionItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereGuardName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereUpdatedAt($value)
 */
	class Role extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property numeric $basic_salary
 * @property numeric $transport_allowance
 * @property numeric $family_allowance
 * @property numeric $others_allowance
 * @property numeric $overtime
 * @property numeric $gross_salary
 * @property numeric $loan_deduction
 * @property numeric $salary_advance
 * @property numeric $state_tax
 * @property numeric $social_security
 * @property string|null $total_absent
 * @property numeric $absent_deduction
 * @property numeric $total_consecutive_late
 * @property numeric $consecutive_late_deduction
 * @property numeric $total_late_minutes
 * @property numeric $late_minutes_deduction
 * @property numeric $total_remaining_minutes
 * @property numeric $remaining_minutes_deduction
 * @property numeric $unpaid_leave
 * @property numeric $unpaid_leave_deduction
 * @property numeric $total_deductions
 * @property numeric $net_salary
 * @property string $status
 * @property string $month
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereAbsentDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereConsecutiveLateDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereFamilyAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereGrossSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereLateMinutesDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereLoanDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereNetSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereOthersAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereOvertime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereRemainingMinutesDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereSalaryAdvance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereSocialSecurity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereStateTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalAbsent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalConsecutiveLate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalLateMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalRemainingMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTransportAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUnpaidLeave($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUnpaidLeaveDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUserId($value)
 */
	class Salary extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property numeric $amount
 * @property string $month
 * @property string $status
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $updateBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereUserId($value)
 */
	class SalaryAdvance extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $increment_type
 * @property numeric $increment_value
 * @property numeric $increment_amount
 * @property numeric $old_basic_salary
 * @property numeric $new_basic_salary
 * @property string $effective_date
 * @property string $status
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\Department|null $department
 * @property-read \App\Models\Designation|null $designation
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereEffectiveDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereIncrementAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereIncrementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereIncrementValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereNewBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereOldBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereUserId($value)
 */
	class SalaryIncrement extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $invoice_payment_id
 * @property int $invoice_id
 * @property int $user_id
 * @property numeric $collection_amount
 * @property string|null $commission_type
 * @property numeric $commission_rate
 * @property numeric $commission_amount
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Invoice $invoice
 * @property-read \App\Models\InvoicePayment $payment
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCollectionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCommissionAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCommissionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereInvoicePaymentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommission whereUserId($value)
 */
	class SalesCommission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $commission_type
 * @property numeric|null $commission_rate
 * @property string|null $note
 * @property string $status
 * @property int $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $createdBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCommissionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereUserId($value)
 */
	class SalesCommissionConfigure extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $invoice_no
 * @property int $client_id
 * @property int $warehouse_id
 * @property \Carbon\CarbonImmutable $invoice_date
 * @property numeric $subtotal
 * @property numeric $discount
 * @property numeric $tax
 * @property numeric $adjustment_amount
 * @property numeric $grand_total
 * @property numeric $paid_amount
 * @property numeric $due_amount
 * @property string $status
 * @property string $payment_status
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client $client
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesInvoiceItem> $items
 * @property-read int|null $items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesPayment> $payments
 * @property-read int|null $payments_count
 * @property-read \App\Models\AccountsReceivable|null $receivable
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesReturn> $returns
 * @property-read int|null $returns_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereAdjustmentAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereDueAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereInvoiceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereInvoiceNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereWarehouseId($value)
 */
	class SalesInvoice extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $sales_invoice_id
 * @property int $product_id
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $discount
 * @property numeric $tax
 * @property array<array-key, mixed>|null $tax_ids
 * @property numeric $line_total
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SalesInvoice $invoice
 * @property-read \App\Models\Product $product
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesReturnItem> $returnItems
 * @property-read int|null $return_items_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereSalesInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereTaxIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereUpdatedAt($value)
 */
	class SalesInvoiceItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $payment_no
 * @property int $sales_invoice_id
 * @property \Carbon\CarbonImmutable $payment_date
 * @property numeric $amount
 * @property string $status
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $approved_at
 * @property string $payment_method
 * @property string|null $reference
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\FinanceTransaction|null $financeTransaction
 * @property-read \App\Models\SalesInvoice $invoice
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment wherePaymentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment wherePaymentNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereSalesInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereUpdatedAt($value)
 */
	class SalesPayment extends \Eloquent {}
}

namespace App\Models{
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
 */
	class SalesReturn extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $sales_return_id
 * @property int $sales_invoice_item_id
 * @property int $product_id
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $line_total
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SalesInvoiceItem $invoiceItem
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\SalesReturn $salesReturn
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereSalesInvoiceItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereSalesReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereUpdatedAt($value)
 */
	class SalesReturnItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget whereUpdatedAt($value)
 */
	class SalesTarget extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property string|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesTeamMember> $members
 * @property-read int|null $members_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereUpdatedAt($value)
 */
	class SalesTeam extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $sales_team_id
 * @property int $user_id
 * @property string $role
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $joined_at
 * @property \Carbon\CarbonImmutable|null $left_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SalesTeam $team
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereJoinedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereLeftAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereSalesTeamId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereUserId($value)
 */
	class SalesTeamMember extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sector whereUpdatedAt($value)
 */
	class Sector extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $shift_start_time
 * @property string $shift_end_time
 * @property string $first_half_shift_end_time
 * @property string $second_half_shift_start_time
 * @property string $weekends
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereFirstHalfShiftEndTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereSecondHalfShiftStartTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereShiftEndTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereShiftStartTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Shift whereWeekends($value)
 */
	class Shift extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $lead_id
 * @property int|null $project_id
 * @property string $scheduled_at
 * @property string|null $visit_date
 * @property string $visit_status
 * @property int|null $accompanied_by
 * @property int $transport_provided
 * @property int|null $feedback_rating
 * @property string|null $interest_level
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereAccompaniedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereFeedbackRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereInterestLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereTransportProvided($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereVisitDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereVisitStatus($value)
 */
	class SiteVisit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $warehouse_id
 * @property int $item_id
 * @property string|null $unit
 * @property numeric $quantity
 * @property numeric $reserved_quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read float $available
 * @property-read float $available_quantity
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereReservedQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereWarehouseId($value)
 */
	class Stock extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $adjustment_id
 * @property int $warehouse_id
 * @property int|null $adjusted_by
 * @property \Carbon\CarbonImmutable $adjustment_date
 * @property string|null $reason
 * @property string|null $note
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $adjustedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockAdjustmentItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustmentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAdjustmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereWarehouseId($value)
 */
	class StockAdjustment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $stock_adjustment_id
 * @property int $item_id
 * @property string|null $unit
 * @property string $adjustment_type
 * @property numeric $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\StockAdjustment $stockAdjustment
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereAdjustmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereStockAdjustmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereUpdatedAt($value)
 */
	class StockAdjustmentItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $warehouse_id
 * @property int $item_id
 * @property string|null $unit
 * @property numeric $quantity
 * @property string $movement
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property string|null $remarks
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Product|null $product
 * @property-read \Illuminate\Database\Eloquent\Model|\Eloquent|null $reference
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereMovement($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereReferenceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereReferenceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockMovement whereWarehouseId($value)
 */
	class StockMovement extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $stock_transfer_id
 * @property int $from_warehouse_id
 * @property int $to_warehouse_id
 * @property int $transferred_by
 * @property \Carbon\CarbonImmutable $transfer_date
 * @property numeric|null $transportation_cost
 * @property numeric $grand_total
 * @property string|null $note
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Warehouse $fromWarehouse
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockTransferItem> $items
 * @property-read int|null $items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockTransferItem> $stockTransferItems
 * @property-read int|null $stock_transfer_items_count
 * @property-read \App\Models\Warehouse $toWarehouse
 * @property-read \App\Models\User $transferredBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereFromWarehouseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereStockTransferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereToWarehouseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereTransferDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereTransferredBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereTransportationCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereUpdatedAt($value)
 */
	class StockTransfer extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $stock_transfer_id
 * @property int $item_id
 * @property string $unit
 * @property numeric $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\StockTransfer $stockTransfer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereStockTransferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereUpdatedAt($value)
 */
	class StockTransferItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property numeric $rate
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tax whereUpdatedAt($value)
 */
	class Tax extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Unit whereUpdatedAt($value)
 */
	class Unit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $department_id
 * @property int|null $designation_id
 * @property int|null $reporting_officer
 * @property string|null $employee_id
 * @property string $role
 * @property numeric|null $account_balance
 * @property int $working_hours
 * @property string $name
 * @property string $email
 * @property string|null $image
 * @property int|null $shift_id
 * @property string|null $language
 * @property string|null $phone
 * @property string|null $mobile
 * @property string|null $emergency_contact
 * @property string|null $national_id
 * @property string $pay_frequency
 * @property string|null $gender
 * @property string|null $marital_status
 * @property string|null $blood_group
 * @property string|null $health_condition
 * @property string|null $joining_date
 * @property string|null $probation_period_end_date
 * @property string|null $address
 * @property string|null $bank_name
 * @property string|null $account_number
 * @property string|null $branch_address
 * @property string|null $tin_number
 * @property string|null $basic_salary
 * @property string|null $transport_allowance
 * @property string|null $family_allowance
 * @property string|null $others_allowance
 * @property string|null $gross_salary
 * @property string $status
 * @property string $attendance_type
 * @property \Carbon\CarbonImmutable|null $email_verified_at
 * @property string $password
 * @property string|null $last_login_at
 * @property string|null $remember_token
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attendance> $attendances
 * @property-read int|null $attendances_count
 * @property-read \App\Models\Department|null $department
 * @property-read \App\Models\Designation|null $designation
 * @property-read \App\Models\Document|null $document
 * @property-read mixed $image_url
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadFollowupNotification> $leadFollowupsNotifications
 * @property-read int|null $lead_followups_notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeaveRequest> $leaveRequests
 * @property-read int|null $leave_requests_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leave> $leaves
 * @property-read int|null $leaves_count
 * @property-read \App\Models\LoanInterest|null $loanInterest
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Loan> $loans
 * @property-read int|null $loans_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read User|null $reportingOfficer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalaryAdvance> $salaryAdvances
 * @property-read int|null $salary_advances_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalaryIncrement> $salaryIncrements
 * @property-read int|null $salary_increments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesTeamMember> $salesTeams
 * @property-read int|null $sales_teams_count
 * @property-read \App\Models\Shift|null $shift
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $teams
 * @property-read int|null $teams_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserLeave> $userLeave
 * @property-read int|null $user_leave_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, ?string $guard = null, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User team($teams, bool $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAccountBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAccountNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAttendanceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBankName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBloodGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBranchAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDepartmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmergencyContact($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmployeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFamilyAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGrossSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereHealthCondition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereJoiningDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLanguage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastLoginAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMaritalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMobile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereNationalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereOthersAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePayFrequency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProbationPeriodEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereReportingOfficer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereShiftId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTinNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTransportAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereWorkingHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, ?string $guard = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutTeam($teams)
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $leave_id
 * @property string|null $start_date
 * @property string|null $end_date
 * @property int $remaining_days
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leave> $leaves
 * @property-read int|null $leaves_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereLeaveId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereRemainingDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereUserId($value)
 */
	class UserLeave extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $vendor_id
 * @property string $name
 * @property string|null $company_name
 * @property string $email
 * @property string $phone
 * @property string|null $address
 * @property string|null $state
 * @property string|null $city
 * @property string|null $country
 * @property string|null $image
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vendor whereVendorId($value)
 */
	class Vendor extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $credit_no
 * @property int $vendor_id
 * @property int|null $purchase_return_id
 * @property numeric $amount
 * @property numeric $used_amount
 * @property numeric $remaining_amount
 * @property string $status
 * @property string|null $note
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\PurchaseReturn|null $purchaseReturn
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\VendorRefund> $refunds
 * @property-read int|null $refunds_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\VendorCreditUsage> $usages
 * @property-read int|null $usages_count
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereCreditNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit wherePurchaseReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereRemainingAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereUsedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereVendorId($value)
 */
	class VendorCredit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $vendor_credit_id
 * @property int $bill_id
 * @property numeric $amount
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @property-read \App\Models\VendorCredit $vendorCredit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereVendorCreditId($value)
 */
	class VendorCreditUsage extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $debit_note_no
 * @property int $purchase_return_id
 * @property int $vendor_id
 * @property \Carbon\CarbonImmutable $debit_note_date
 * @property \Carbon\CarbonImmutable $due_date
 * @property numeric $subtotal
 * @property numeric $tax_amount
 * @property numeric $grand_total
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\PurchaseReturn $purchaseReturn
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereDebitNoteDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereDebitNoteNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote wherePurchaseReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereVendorId($value)
 */
	class VendorDebitNote extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $refund_no
 * @property int $vendor_id
 * @property int|null $vendor_credit_id
 * @property numeric $amount
 * @property string $refund_date
 * @property int|null $account_id
 * @property string|null $reference
 * @property string|null $note
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Vendor $vendor
 * @property-read \App\Models\VendorCredit|null $vendorCredit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereRefundDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereRefundNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereVendorCreditId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereVendorId($value)
 */
	class VendorRefund extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string|null $phone
 * @property string|null $address
 * @property bool $status
 * @property bool $is_default
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockMovement> $stockMovements
 * @property-read int|null $stock_movements_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Stock> $stocks
 * @property-read int|null $stocks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Warehouse whereUpdatedAt($value)
 */
	class Warehouse extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $ip_address
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WifiIp whereUpdatedAt($value)
 */
	class WifiIp extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $start_date
 * @property string $end_date
 * @property numeric $days
 * @property string $status
 * @property string|null $reason
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereUserId($value)
 */
	class WorkFromHome extends \Eloquent {}
}

