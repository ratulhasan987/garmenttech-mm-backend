<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendors = [
            [
                'vendor_id' => 'VEN-0001',
                'name' => 'Rahim Ahmed',
                'company_name' => 'Rahim Traders',
                'email' => 'rahim@rahimtraders.com',
                'phone' => '01710000001',
                'address' => 'Banani',
                'state' => 'Dhaka',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0002',
                'name' => 'Karim Hasan',
                'company_name' => 'Karim Enterprise',
                'email' => 'karim@karimenterprise.com',
                'phone' => '01710000002',
                'address' => 'Uttara',
                'state' => 'Dhaka',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0003',
                'name' => 'Abdul Jabbar',
                'company_name' => 'Jabbar Corporation',
                'email' => 'jabbar@jabbarcorp.com',
                'phone' => '01710000003',
                'address' => 'Agrabad',
                'state' => 'Chattogram',
                'city' => 'Chattogram',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0004',
                'name' => 'Mehedi Hasan',
                'company_name' => 'MH Supplies',
                'email' => 'mehedi@mhsupplies.com',
                'phone' => '01710000004',
                'address' => 'Dhanmondi',
                'state' => 'Dhaka',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0005',
                'name' => 'Tanvir Islam',
                'company_name' => 'Tanvir Trading',
                'email' => 'tanvir@tanvirtrading.com',
                'phone' => '01710000005',
                'address' => 'Mirpur',
                'state' => 'Dhaka',
                'city' => 'Dhaka',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0006',
                'name' => 'Sabbir Hossain',
                'company_name' => 'Sabbir Brothers',
                'email' => 'sabbir@sabbirbrothers.com',
                'phone' => '01710000006',
                'address' => 'Zindabazar',
                'state' => 'Sylhet',
                'city' => 'Sylhet',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0007',
                'name' => 'Shakil Ahmed',
                'company_name' => 'Shakil International',
                'email' => 'shakil@shakilintl.com',
                'phone' => '01710000007',
                'address' => 'Sonadanga',
                'state' => 'Khulna',
                'city' => 'Khulna',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0008',
                'name' => 'Imran Hossain',
                'company_name' => 'Imran Suppliers',
                'email' => 'imran@imransuppliers.com',
                'phone' => '01710000008',
                'address' => 'Boalia',
                'state' => 'Rajshahi',
                'city' => 'Rajshahi',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0009',
                'name' => 'Nazmul Islam',
                'company_name' => 'Nazmul Trading',
                'email' => 'nazmul@nazmultrading.com',
                'phone' => '01710000009',
                'address' => 'Sadar',
                'state' => 'Rangpur',
                'city' => 'Rangpur',
                'country' => 'Bangladesh',
                'image' => null,
            ],

            [
                'vendor_id' => 'VEN-0010',
                'name' => 'Rakib Hasan',
                'company_name' => 'Rakib Enterprise',
                'email' => 'rakib@rakibenterprise.com',
                'phone' => '01710000010',
                'address' => 'Sadar Road',
                'state' => 'Barishal',
                'city' => 'Barishal',
                'country' => 'Bangladesh',
                'image' => null,
            ],
        ];

        foreach ($vendors as $vendor) {
            Vendor::updateOrCreate(
                [
                    'vendor_id' => $vendor['vendor_id'],
                ],
                $vendor
            );
        }
    }
}
