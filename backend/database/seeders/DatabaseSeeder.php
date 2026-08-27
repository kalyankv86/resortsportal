<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            CoreDataSeeder::class,
            GuestCareSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('  CWETR seed complete.');
        $this->command->info('  Super Admin : admin@resorts.cutm.ac.in / ChangeMe!CWETR2026');
        $this->command->info('  Doctor      : doctor@resorts.cutm.ac.in / ChangeMe!CWETR2026');
        $this->command->info('  Therapist   : therapist@resorts.cutm.ac.in / ChangeMe!CWETR2026');
        $this->command->info('  Test Guest  : guest@example.com / ChangeMe!CWETR2026');
        $this->command->warn('  Change these passwords after first login.');
    }
}
