<?php

namespace Database\Seeders;

use App\Models\LeadSource;
use Illuminate\Database\Seeder;

class LeadSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            [
                'name' => 'ABU SAYEED-(29-30 MAY)',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => true,
            ],
            [
                'name' => 'ASK-BUILDCON-2026',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'BIID AND ICCB FAIR (08-05-25)',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'BIID SOLAR PANEL FAIR',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'BOOK',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'BANGLADESH ASSOCIATION OF INTERNTIONAL RECRUITING AGENCIES',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'BOOK5',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'BY TAWFIQ',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'FACEBOOK ADS',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'FB AD 10-2-2025',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'FB AD 24-03-25',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'ICCB AGRO FAIR',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'PHYSICS',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'TEXTILE FAIR-2026',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Physical Visit',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Website',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Facebook',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'LinkedIn',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Google Ads',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Referral',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Walk-in',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Phone Call',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Email Campaign',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'Exhibition / Event',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],
            [
                'name' => 'WhatsApp',
                'cost_per_lead' => 0,
                'is_active' => true,
                'is_default' => false,
            ],

        ];

        foreach ($sources as $source) {
            LeadSource::updateOrCreate(
                [
                    'name' => $source['name'],
                ],
                $source,
            );
        }
    }
}
