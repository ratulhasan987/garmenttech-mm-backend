<?php

namespace Database\Seeders;

use App\Models\LeadStage;
use Illuminate\Database\Seeder;

class LeadStageSeeder extends Seeder
{
    public function run(): void
    {
        $stages = [
            [
                'name' => 'New',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 10,
                'order' => 1,
                'color' => '#0d6efd',
                'is_active' => true,
                'is_default' => true,
                'is_convert_to_customer' => false,
            ],
            [
                'name' => 'Contacted',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 20,
                'order' => 2,
                'color' => '#6f42c1',
                'is_active' => true,
                'is_convert_to_customer' => false,
            ],
            [
                'name' => 'Qualified',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 40,
                'order' => 3,
                'color' => '#0dcaf0',
                'is_active' => true,
                'is_convert_to_customer' => false,
            ],
            [
                'name' => 'Proposal Sent',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 60,
                'order' => 4,
                'color' => '#fd7e14',
                'is_active' => true,
                'is_convert_to_customer' => false,
            ],
            [
                'name' => 'Negotiation',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 80,
                'order' => 5,
                'color' => '#ffc107',
                'is_active' => true,
                'is_convert_to_customer' => false,
            ],
            [
                'name' => 'Won',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 100,
                'order' => 6,
                'color' => '#198754',
                'is_active' => true,
                'is_convert_to_customer' => true,
            ],
            [
                'name' => 'Lost',
                'pipeline_type' => null,
                'project_type' => null,
                'probability_percent' => 0,
                'order' => 7,
                'color' => '#dc3545',
                'is_active' => true,
                'is_convert_to_customer' => false,
            ],
        ];

        foreach ($stages as $stage) {
            LeadStage::updateOrCreate(
                [
                    'name' => $stage['name'],
                ],
                $stage,
            );
        }
    }
}
