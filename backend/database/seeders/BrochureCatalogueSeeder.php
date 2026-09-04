<?php

namespace Database\Seeders;

use App\Models\RatePlan;
use App\Models\Room;
use App\Models\RoomCategory;
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
                    // The 1-day package is not offered through the online booking flow.
                    'status' => $days === 1 ? 'draft' : 'published',
                    'position' => $i,
                ],
            );
        }

        // Accommodation — [name, tariff ₹ per night (food included), base occ, max occ]
        $rooms = [
            ['Suite Room — Single Occupancy (with Food)', 5500, 1, 1],
            ['Suite Room — Double Occupancy (with Food)', 7500, 2, 2],
            ['Executive Room — Single Occupancy (with Food)', 4000, 1, 1],
            ['Executive Room — Double Occupancy (with Food)', 6500, 2, 2],
        ];
        foreach ($rooms as $i => [$name, $rate, $base, $max]) {
            $cat = RoomCategory::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'base_occupancy' => $base,
                    'max_occupancy' => $max,
                    'media_category' => 'rooms',
                    'status' => 'published',
                    'position' => $i,
                ],
            );
            RatePlan::updateOrCreate(
                ['room_category_id' => $cat->id, 'name' => 'Standard'],
                ['currency' => 'INR', 'nightly_rate' => $rate, 'is_active' => true],
            );
            for ($n = 1; $n <= 4; $n++) { // 4 rooms x 4 categories = 16
                Room::updateOrCreate(
                    ['code' => 'R'.$cat->id.'-'.str_pad((string) $n, 2, '0', STR_PAD_LEFT)],
                    ['room_category_id' => $cat->id, 'status' => 'available'],
                );
            }
        }

        // Venues — day-rate spaces, kept out of the guest booking flow (status "venue").
        $venues = [
            ['Auditorium', 22500],
            ['Seminar Hall', 11000],
            ['Board Room', 9500],
        ];
        foreach ($venues as $i => [$name, $rate]) {
            $cat = RoomCategory::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'base_occupancy' => 1,
                    'max_occupancy' => 1,
                    'status' => 'venue',
                    'position' => 100 + $i,
                ],
            );
            RatePlan::updateOrCreate(
                ['room_category_id' => $cat->id, 'name' => 'Day rate'],
                ['currency' => 'INR', 'nightly_rate' => $rate, 'is_active' => true],
            );
        }

        $this->command->info('  BrochureCatalogueSeeder: '.Therapy::count().' treatments, '.WellnessProgram::count().' packages, '.RoomCategory::count().' rooms/venues.');
    }
}
