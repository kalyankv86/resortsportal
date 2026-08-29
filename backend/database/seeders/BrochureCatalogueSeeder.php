<?php

namespace Database\Seeders;

use App\Models\Therapy;
use App\Models\WellnessProgram;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Catalogue loaded verbatim from the official "Centurion Wellness & Eco Tourism"
 * brochure — individual treatment tariffs and the five wellness packages.
 * Rates are exactly as printed (₹, GST-inclusive for packages).
 *
 * Run manually:  php artisan db:seed --class="Database\Seeders\BrochureCatalogueSeeder"
 */
class BrochureCatalogueSeeder extends Seeder
{
    public function run(): void
    {
        // Individual Wellness Treatments — [name, tariff ₹]
        $treatments = [
            ['Fitness Review & Ayurvedic Consultation (One-Time)', 1000],
            ['Abhyanga Swedana', 2200],
            ['Elakizhi', 2500],
            ['Njavarakizhi', 2800],
            ['Sirodhara', 3200],
            ['Njavara Facial', 1200],
            ['Herbal Facial', 1000],
            ['Customized Diet Plan (Per Day)', 800],
        ];
        foreach ($treatments as $i => [$name, $price]) {
            Therapy::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'price' => $price,
                    'currency' => 'INR',
                    'status' => 'published',
                    'position' => $i,
                ],
            );
        }

        // Wellness Packages — [name, days, price ₹ (GST incl.), inclusions[]]
        $packages = [
            ['Wellness Introduction', 1, 5000, [
                'Consultation', '1-Day Diet Plan', 'Abhyanga Swedana', 'Herbal Facial',
            ]],
            ['Spine & Joint Starter', 3, 11500, [
                'Consultation', '3-Day Diet Plan', 'Abhyanga Swedana', 'Elakizhi', 'Abhyanga Swedana', 'Njavara Facial',
            ]],
            ['De-Stress & Detox', 5, 18600, [
                'Consultation', '5-Day Diet Plan', 'Abhyanga Swedana (2 Days)', 'Elakizhi (2 Days)', 'Sirodhara', 'Herbal Facial',
            ]],
            ['Complete Mind-Body Wellness', 7, 26000, [
                'Consultation', '7-Day Diet Plan', 'Abhyanga Swedana (2 Days)', 'Elakizhi (2 Days)', 'Njavarakizhi (2 Days)', 'Sirodhara', 'Njavara Facial',
            ]],
            ['Intensive Panchakarma Transformation', 14, 51200, [
                'Consultation & Mid-Program Check', '14-Day Diet Plan', 'Abhyanga Swedana (4 Days)', 'Elakizhi (4 Days)', 'Njavarakizhi (3 Days)', 'Sirodhara (3 Days)', 'Njavara Facial',
            ]],
        ];
        foreach ($packages as $i => [$name, $days, $price, $inclusions]) {
            WellnessProgram::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'nights' => $days,
                    'price_from' => $price,
                    'currency' => 'INR',
                    'doctor_led' => true,
                    'inclusions' => $inclusions,
                    'status' => 'published',
                    'position' => $i,
                ],
            );
        }

        $this->command->info('  BrochureCatalogueSeeder: '.Therapy::count().' treatments, '.WellnessProgram::count().' packages.');
    }
}
