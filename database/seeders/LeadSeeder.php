<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Lead;
use App\Models\LeadDesignation;
use App\Models\LeadSource;
use App\Models\LeadStage;
use App\Models\Profession;
use App\Models\Sector;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    public function run(): void
    {
        $stages = LeadStage::pluck('id')->all();

        if (empty($stages)) {
            $this->command->warn(
                'Lead stages are required before running LeadSeeder.',
            );

            return;
        }

        $sources = LeadSource::pluck('id')->all();
        $areas = Area::pluck('id')->all();
        $sectors = Sector::pluck('id')->all();
        $professions = Profession::pluck('id')->all();
        $designations = LeadDesignation::pluck('id')->all();
        $users = User::pluck('id')->all();

        $priorities = ['low', 'medium', 'high'];
        $interestLevels = ['cold', 'warm', 'hot'];

        for ($index = 1; $index <= 40; $index++) {
            $createdAt = Carbon::now()
                ->subDays(fake()->numberBetween(1, 90))
                ->subHours(fake()->numberBetween(0, 23));

            $lastContactedAt = fake()->boolean(75)
                ? $createdAt->copy()
                    ->addDays(fake()->numberBetween(0, 15))
                    ->addHours(fake()->numberBetween(1, 8))
                : null;

            $nextFollowUpAt = fake()->boolean(85)
                ? Carbon::now()
                    ->addDays(fake()->numberBetween(0, 370))
                    ->setTime(
                        fake()->numberBetween(9, 17),
                        fake()->randomElement([0, 15, 30, 45]),
                    )
                : null;

            Lead::create([
                'lead_code' => 'LD-' . now()->format('Y') . '-' .
                    str_pad((string) $index, 4, '0', STR_PAD_LEFT),

                'name' => fake()->name(),
                'company_name' => fake()->boolean(70)
                    ? fake()->company()
                    : null,

                'phone' => '01' . fake()->numerify('#########'),
                'phone_secondary' => fake()->boolean(35)
                    ? '01' . fake()->numerify('#########')
                    : null,

                'phone_foreign' => fake()->boolean(15)
                    ? '+8801' . fake()->numerify('#########')
                    : null,

                'email' => fake()->boolean(75)
                    ? fake()->unique()->safeEmail()
                    : null,

                'area_id' => !empty($areas)
                    ? fake()->randomElement($areas)
                    : null,

                'sector_id' => !empty($sectors)
                    ? fake()->randomElement($sectors)
                    : null,

                'profession_id' => !empty($professions)
                    ? fake()->randomElement($professions)
                    : null,

                'designation_id' => !empty($designations)
                    ? fake()->randomElement($designations)
                    : null,

                'source_id' => !empty($sources)
                    ? fake()->randomElement($sources)
                    : null,

                'stage_id' => fake()->randomElement($stages),

                'assigned_to' => null,
                // 'assigned_to' => !empty($users) && fake()->boolean(70)
                //     ? fake()->randomElement($users)
                //     : null,

                'priority' => fake()->randomElement($priorities),

                'interest_level' => fake()->randomElement(
                    $interestLevels,
                ),

                'last_contacted_at' => $lastContactedAt,
                'next_follow_up_at' => now()
                    ->addDay()
                    ->setTime(16, 0, 0),

                'remarks' => fake()->boolean(65)
                    ? fake()->sentence(12)
                    : null,

                'is_converted' => false,
                'converted_at' => null,
                'customer_id' => null,

                'address' => fake()->boolean(80)
                    ? fake()->address()
                    : null,

                'created_by' => !empty($users)
                    ? fake()->randomElement($users)
                    : null,

                'updated_by' => !empty($users)
                    ? fake()->randomElement($users)
                    : null,

                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
