<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Booking;
use App\Models\DietChart;
use App\Models\Doctor;
use App\Models\DoshaAssessment;
use App\Models\Guest;
use App\Models\Prescription;
use App\Models\ProgressEntry;
use App\Models\Therapist;
use App\Models\Therapy;
use App\Models\User;
use App\Models\WellnessProgram;
use App\Services\BookingService;
use App\Services\PaymentService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class GuestCareSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'guest@example.com')->first();
        if (! $user) {
            return;
        }
        $guest = $user->guestProfile ?? Guest::create([
            'user_id' => $user->id, 'first_name' => 'Test', 'last_name' => 'Guest', 'email' => $user->email,
        ]);

        // Skip if already seeded
        if ($guest->bookings()->where('status', 'confirmed')->exists()) {
            $this->command->info('  GuestCareSeeder: sample stay already present, skipping.');

            return;
        }

        $doctor = Doctor::first();
        $therapist = Therapist::first();
        $program = WellnessProgram::where('slug', 'immunity-boost')->first();

        $checkIn = CarbonImmutable::now()->toDateString();          // starts today
        $checkOut = CarbonImmutable::now()->addDays(5)->toDateString();

        /** @var BookingService $bookingSvc */
        $bookingSvc = app(BookingService::class);
        $booking = $bookingSvc->create([
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'adults' => 1,
            'program' => $program?->slug,
            'first_name' => 'Test',
            'last_name' => 'Guest',
            'email' => $user->email,
            'phone' => $user->phone ?? '+91 98000 00000',
        ], $user);

        // Pay in full → confirms + invoice + loyalty
        app(PaymentService::class)->recordManual($booking, [
            'amount' => $booking->total, 'method' => 'offline', 'reference' => 'SEED', 'note' => 'Seed data',
        ], User::where('email', 'finance@resorts.cutm.ac.in')->first() ?? $user);

        $booking->refresh();

        // Dosha assessment
        DoshaAssessment::create([
            'guest_id' => $guest->id, 'booking_id' => $booking->id, 'doctor_id' => $doctor?->id,
            'vata' => 45, 'pitta' => 35, 'kapha' => 20,
            'prakriti' => 'Vata-Pitta', 'vikriti' => 'Vata aggravation',
            'notes' => 'Irregular digestion and sleep. Focus on grounding routine and warm, unctuous diet.',
            'assessed_at' => now()->subDays(2),
        ]);

        // Diet chart
        DietChart::create([
            'guest_id' => $guest->id, 'booking_id' => $booking->id, 'doctor_id' => $doctor?->id,
            'title' => 'Vata-pacifying diet',
            'meals' => [
                ['meal' => 'Early morning', 'time' => '06:30', 'items' => ['Warm water with ginger', 'Soaked almonds (5)']],
                ['meal' => 'Breakfast', 'time' => '08:00', 'items' => ['Ragi porridge with ghee', 'Stewed apple']],
                ['meal' => 'Lunch', 'time' => '12:30', 'items' => ['Moong dal khichdi', 'Steamed vegetables', 'Buttermilk']],
                ['meal' => 'Evening', 'time' => '16:30', 'items' => ['Herbal tea', 'Date & sesame ladoo (1)']],
                ['meal' => 'Dinner', 'time' => '19:00', 'items' => ['Vegetable soup', 'Soft chapati with ghee']],
            ],
            'avoid' => ['Raw salads', 'Cold drinks', 'Caffeine after noon', 'Dry crackers'],
            'notes' => 'Eat in a calm setting; largest meal at midday.',
            'status' => 'active',
            'effective_from' => $checkIn,
        ]);

        // Prescription
        Prescription::create([
            'guest_id' => $guest->id, 'booking_id' => $booking->id, 'doctor_id' => $doctor?->id,
            'items' => [
                ['medicine' => 'Ashwagandha churna', 'dose' => '3 g', 'timing' => 'Twice daily after food', 'duration' => '4 weeks', 'anupana' => 'Warm milk'],
                ['medicine' => 'Triphala churna', 'dose' => '3 g', 'timing' => 'At bedtime', 'duration' => '4 weeks', 'anupana' => 'Warm water'],
                ['medicine' => 'Chyawanprash', 'dose' => '1 tsp', 'timing' => 'Morning', 'duration' => '8 weeks', 'anupana' => '—'],
            ],
            'advice' => 'Sleep by 22:00. Daily abhyanga before shower. Gentle pranayama, avoid strenuous exercise this week.',
            'status' => 'active',
            'issued_at' => now()->subDays(2),
        ]);

        // Appointments across the stay
        $start = CarbonImmutable::parse($checkIn);
        Appointment::create([
            'booking_id' => $booking->id, 'guest_id' => $guest->id, 'doctor_id' => $doctor?->id,
            'type' => 'consultation', 'scheduled_at' => $start->setTime(9, 0), 'duration_min' => 45, 'status' => 'completed',
        ]);
        $therapies = Therapy::limit(3)->pluck('id', 'name');
        $day = 0;
        foreach ($therapies as $name => $tid) {
            Appointment::create([
                'booking_id' => $booking->id, 'guest_id' => $guest->id,
                'therapist_id' => $therapist?->id, 'therapy_id' => $tid,
                'type' => 'therapy',
                'scheduled_at' => $start->addDays($day)->setTime(10, 30),
                'duration_min' => 60,
                'status' => $day < 2 ? 'completed' : 'scheduled',
            ]);
            $day++;
        }
        Appointment::create([
            'booking_id' => $booking->id, 'guest_id' => $guest->id, 'doctor_id' => $doctor?->id,
            'type' => 'follow_up', 'scheduled_at' => CarbonImmutable::parse($checkOut)->setTime(9, 30), 'duration_min' => 30, 'status' => 'scheduled',
        ]);

        // Progress entries
        $metrics = [
            ['weight_kg' => 68.5, 'sleep_hours' => 5.5, 'sleep_score' => 62, 'stress_score' => 71, 'water_l' => 1.8],
            ['weight_kg' => 68.2, 'sleep_hours' => 6.2, 'sleep_score' => 68, 'stress_score' => 64, 'water_l' => 2.2],
            ['weight_kg' => 67.9, 'sleep_hours' => 6.8, 'sleep_score' => 74, 'stress_score' => 58, 'water_l' => 2.5],
            ['weight_kg' => 67.6, 'sleep_hours' => 7.1, 'sleep_score' => 79, 'stress_score' => 49, 'water_l' => 2.6],
        ];
        foreach ($metrics as $i => $m) {
            ProgressEntry::create([
                'guest_id' => $guest->id, 'booking_id' => $booking->id,
                'entry_date' => $start->addDays($i)->toDateString(),
                'metrics' => $m,
                'note' => $i === 0 ? 'Baseline on arrival.' : ($i === 3 ? 'Sleeping through the night; calmer.' : null),
                'recorded_by' => $doctor?->user_id,
            ]);
        }

        $this->command->info('  GuestCareSeeder: sample stay + care records for guest@example.com created.');
    }
}
