<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
                // Roles / Permissions
                // Must be before UserSeeder because UserSeeder calls assignRole().
            RolePermissionSeeder::class,

                // Shift
                // Must be before UserSeeder because Super Admin needs the General Shift during user creation.
            ShiftSeeder::class,

                // User
            UserSeeder::class,

                // Configuration / Organization
            ConfigureSeeder::class,
            DepartmentSeeder::class,
            DesignationSeeder::class,

                // Accounting
            ChartOfAccountSeeder::class,
            CurrencySeeder::class,

                // Master Data
            CustomerSeeder::class,
            UnitSeeder::class,
            VendorSeeder::class,
            ProductSeeder::class,
            WarehouseSeeder::class,
            TaxSeeder::class,

            LeadDesignationSeeder::class,
            LeadSourceSeeder::class,
            LeadStageSeeder::class,
            ProfessionSeeder::class,
            SectorSeeder::class,
            AreaSeeder::class,
        ]);
    }
}
