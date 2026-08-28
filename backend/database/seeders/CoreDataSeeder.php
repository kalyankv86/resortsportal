<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Experience;
use App\Models\Faq;
use App\Models\Guest;
use App\Models\RatePlan;
use App\Models\Room;
use App\Models\RoomCategory;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\Therapist;
use App\Models\Therapy;
use App\Models\TherapyCategory;
use App\Models\User;
use App\Models\WellnessProgram;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CoreDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->settings();
        $this->staff();
        $this->rooms();
        $this->wellness();
        $this->experiences();
        $this->social();
        $this->promos();
    }

    private function promos(): void
    {
        \App\Models\PromoCode::updateOrCreate(['code' => 'WELCOME10'], [
            'description' => 'Welcome offer — 10% off',
            'type' => 'percent', 'value' => 10, 'min_nights' => 3, 'is_active' => true,
        ]);
        \App\Models\PromoCode::updateOrCreate(['code' => 'MONSOON5000'], [
            'description' => 'Monsoon season — ₹5,000 off',
            'type' => 'fixed', 'value' => 5000, 'min_amount' => 40000, 'min_nights' => 5, 'is_active' => true,
        ]);
    }

    private function settings(): void
    {
        $rows = [
            ['general', 'site.name', 'string', true, 'Centurion Wellness Eco Tourism'],
            ['general', 'site.tagline', 'string', true, 'Heal • Stay • Reconnect with Nature'],
            ['general', 'contact.email', 'string', true, 'prasant.panda@cutm.ac.in'],
            ['general', 'contact.phone', 'string', true, '+91 63717 45061'],
            ['general', 'contact.address', 'string', true, 'Village Alluri Nagar, P.O. – R Sitapur, Via – Uppalada, Paralakhemundi, Gajapati, Odisha, India – 761211'],
            ['booking', 'booking.min_nights', 'int', false, 2],
            ['booking', 'booking.max_nights', 'int', false, 21],
            ['booking', 'booking.checkin_time', 'string', true, '14:00'],
            ['booking', 'booking.checkout_time', 'string', true, '11:00'],
            ['finance', 'tax.gst_percent', 'float', false, 12],
            ['finance', 'currency', 'string', true, 'INR'],
        ];
        foreach ($rows as [$group, $key, $type, $public, $value]) {
            Setting::updateOrCreate(['key' => $key], compact('group', 'type', 'value') + ['is_public' => $public]);
        }
    }

    private function staff(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@wellness.cutm.ac.in'],
            ['name' => 'Centurion Wellness Administrator', 'password' => Hash::make('ChangeMe!CWETR2026'), 'is_staff' => true, 'status' => 'active'],
        );
        $admin->syncRoles(['super-admin']);

        $doctorUser = User::updateOrCreate(
            ['email' => 'doctor@wellness.cutm.ac.in'],
            ['name' => 'Dr. A. Mohanty', 'password' => Hash::make('ChangeMe!CWETR2026'), 'is_staff' => true, 'status' => 'active'],
        );
        $doctorUser->syncRoles(['doctor']);
        Doctor::updateOrCreate(
            ['slug' => 'dr-a-mohanty'],
            [
                'user_id' => $doctorUser->id,
                'name' => 'Dr. A. Mohanty',
                'title' => 'Chief Medical Officer',
                'qualifications' => 'MD (Ayurveda)',
                'bio' => 'Two decades in Panchakarma and chronic-pain management.',
                'specialities' => ['Panchakarma', 'Pain management', 'Rasayana'],
                'years_experience' => 20,
            ],
        );

        $therapistUser = User::updateOrCreate(
            ['email' => 'therapist@wellness.cutm.ac.in'],
            ['name' => 'S. Nayak', 'password' => Hash::make('ChangeMe!CWETR2026'), 'is_staff' => true, 'status' => 'active'],
        );
        $therapistUser->syncRoles(['therapist']);
        Therapist::updateOrCreate(
            ['slug' => 's-nayak'],
            ['user_id' => $therapistUser->id, 'name' => 'S. Nayak', 'speciality' => 'Panchakarma technician'],
        );

        foreach (['reception', 'finance', 'housekeeping', 'restaurant-manager'] as $role) {
            $u = User::updateOrCreate(
                ['email' => "{$role}@wellness.cutm.ac.in"],
                ['name' => Str::headline($role), 'password' => Hash::make('ChangeMe!CWETR2026'), 'is_staff' => true, 'status' => 'active'],
            );
            $u->syncRoles([$role]);
        }

        $guestUser = User::updateOrCreate(
            ['email' => 'guest@example.com'],
            ['name' => 'Test Guest', 'password' => Hash::make('ChangeMe!CWETR2026'), 'is_staff' => false, 'status' => 'active', 'phone' => '+91 98000 00000'],
        );
        $guestUser->syncRoles(['guest']);
        Guest::updateOrCreate(
            ['user_id' => $guestUser->id],
            ['first_name' => 'Test', 'last_name' => 'Guest', 'email' => 'guest@example.com', 'phone' => '+91 98000 00000'],
        );
    }

    private function rooms(): void
    {
        $categories = [
            ['forest-deluxe', 'Forest Deluxe', 'Canopy-level room opening to a planted balcony.', 2, 3, 380, 12000, ['King or twin bed', 'Private verandah', 'Rain shower', 'Work nook']],
            ['premium-cottage', 'Premium Cottage', 'Standalone cottage with a garden sit-out.', 2, 3, 520, 16000, ['Garden sit-out', 'Outdoor shower', 'Lounge chairs']],
            ['lake-cottage', 'Lake Cottage', 'Water-facing cottage with a private deck.', 2, 3, 560, 19000, ['Private lake deck', 'Daybed', 'Outdoor bath']],
            ['bamboo-villa', 'Bamboo Villa', 'Two-room villa built in engineered bamboo.', 3, 4, 900, 26000, ['Two rooms + lounge', 'Screened bath court', 'Private garden']],
            ['family-suite', 'Family Suite', 'Connected rooms for four with a shared lounge.', 4, 5, 850, 24000, ['Connecting rooms', 'Shared lounge', 'Two bathrooms']],
            ['executive-wellness-suite', 'Executive Wellness Suite', 'Largest suite, with an in-room therapy space.', 2, 3, 1100, 34000, ['In-room therapy space', 'Outdoor bath', 'Private garden', 'Butler service']],
        ];

        foreach ($categories as $i => [$slug, $name, $summary, $base, $max, $size, $rate, $amen]) {
            $cat = RoomCategory::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'summary' => $summary,
                'base_occupancy' => $base,
                'max_occupancy' => $max,
                'size_sqft' => $size,
                'amenities' => $amen,
                'media_category' => 'rooms',
                'position' => $i,
                'status' => 'published',
            ]);

            RatePlan::updateOrCreate(
                ['room_category_id' => $cat->id, 'name' => 'Standard'],
                ['currency' => 'INR', 'nightly_rate' => $rate, 'min_nights' => 2, 'max_nights' => 21, 'refundable' => true, 'inclusions' => ['Breakfast', 'Wi-Fi', 'Yoga'], 'is_active' => true],
            );

            for ($n = 1; $n <= 6; $n++) {
                Room::updateOrCreate(
                    ['code' => strtoupper(substr($slug, 0, 2)).'-'.str_pad((string) $n, 2, '0', STR_PAD_LEFT)],
                    ['room_category_id' => $cat->id, 'floor' => (string) ceil($n / 3), 'view' => $i % 2 ? 'Forest' : 'Garden', 'status' => 'available'],
                );
            }
        }
    }

    private function wellness(): void
    {
        $tc = TherapyCategory::updateOrCreate(['slug' => 'signature'], ['name' => 'Signature Therapies', 'position' => 0]);
        TherapyCategory::updateOrCreate(['slug' => 'panchakarma'], ['name' => 'Panchakarma', 'position' => 1]);

        $therapies = [
            ['shirodhara', 'Shirodhara', 'A steady stream of warm medicated oil over the forehead to still the mind.', 60, 3500, ['Calms the nervous system', 'Improves sleep', 'Eases anxiety']],
            ['abhyanga', 'Abhyanga', 'Full-body synchronised massage with dosha-specific herbal oils.', 60, 3000, ['Improves circulation', 'Relieves stiffness', 'Nourishes skin']],
            ['pizhichil', 'Pizhichil', 'Warm oil bath — deeply nourishing for the nervous system and joints.', 75, 5000, ['Joint mobility', 'Deep relaxation', 'Rejuvenation']],
            ['kati-basti', 'Kati Basti', 'A warm oil pool held over the lower back for pain and stiffness.', 45, 2500, ['Lower-back pain relief', 'Reduces stiffness']],
            ['nasya', 'Nasya', 'Nasal administration of medicated oils for the head and sinuses.', 30, 2000, ['Clears sinuses', 'Relieves headaches']],
            ['udwarthanam', 'Udwarthanam', 'Herbal-powder massage for metabolism and lymphatic flow.', 60, 3200, ['Supports metabolism', 'Lymphatic drainage']],
            ['elakizhi', 'Elakizhi', 'Herbal-leaf poultice fomentation for musculoskeletal pain.', 60, 3400, ['Muscle pain relief', 'Improves flexibility']],
            ['netra-tarpana', 'Netra Tarpana', 'Medicated ghee bath for the eyes — for strain and dryness.', 30, 2200, ['Relieves eye strain', 'Soothes dryness']],
        ];
        foreach ($therapies as $i => [$slug, $name, $summary, $dur, $price, $benefits]) {
            Therapy::updateOrCreate(['slug' => $slug], [
                'therapy_category_id' => $tc->id,
                'name' => $name,
                'summary' => $summary,
                'benefits' => $benefits,
                'contraindications' => 'Pregnancy, acute fever, and certain skin conditions — assessed on arrival.',
                'duration_min' => $dur,
                'preparation' => 'Light meal 2 hours prior; arrive 15 minutes early.',
                'aftercare' => 'Rest, warm water, avoid cold exposure for 2 hours.',
                'price' => $price,
                'media_category' => 'spa',
                'status' => 'published',
                'position' => $i,
            ]);
        }

        $programs = [
            ['panchakarma-detox', 'Panchakarma Detox', 'Deep classical cleanse under full medical supervision.', 7, 'Detoxification', 86000],
            ['stress-relief', 'Stress Relief', 'Nervous-system reset with Shirodhara, yoga nidra and forest therapy.', 5, 'Stress', 52000],
            ['weight-management', 'Weight Management', 'Metabolic reset through Udwarthanam, diet and movement.', 7, 'Metabolic', 78000],
            ['immunity-boost', 'Immunity Boost', 'Rasayana rejuvenation and seasonal cleansing.', 5, 'Immunity', 54000],
            ['digital-detox', 'Digital Detox', 'Device-free days, journaling and guided silence.', 4, 'Rest', 40000],
            ['couple-retreat', 'Couple Retreat', 'Shared therapies and private dining for two.', 5, 'Couple', 96000],
        ];
        foreach ($programs as $i => [$slug, $name, $summary, $nights, $goal, $price]) {
            WellnessProgram::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'summary' => $summary,
                'nights' => $nights,
                'goal' => $goal,
                'price_from' => $price,
                'currency' => 'INR',
                'doctor_led' => true,
                'inclusions' => ['Doctor consultation & assessment', 'Daily therapies', 'Prescribed meals', 'Yoga & meditation', 'Accommodation'],
                'daily_schedule' => ['06:30 Yoga', '08:00 Breakfast', '10:00 Therapy', '13:00 Lunch', '16:00 Consultation / therapy', '18:00 Meditation', '19:30 Dinner'],
                'media_category' => 'ayurveda',
                'status' => 'published',
                'position' => $i,
            ]);
        }
    }

    private function experiences(): void
    {
        $items = [
            ['waterfall-trek', 'Waterfall Trek', 'Half-day hike to a seasonal cascade.', 'Half day', 'waterfalls'],
            ['forest-sound-bath', 'Forest Sound Bath', 'Reclined session with singing bowls under the trees.', '90 min', 'forest'],
            ['organic-farm-walk', 'Organic Farm Walk', 'Hands in the soil — sowing, harvesting, composting.', '2 hours', 'organic-farm'],
            ['sunrise-yoga-deck', 'Sunrise Yoga Deck', 'Gentle asana and pranayama above the lake.', '60 min', 'yoga'],
            ['bamboo-craft-studio', 'Bamboo Craft Studio', 'Studio session with campus artisans.', '2 hours', 'events'],
            ['star-gazing-meadow', 'Star Gazing Meadow', 'Low light pollution, high meadow, reclining chairs.', 'Evening', 'drone'],
        ];
        foreach ($items as $i => [$slug, $name, $summary, $dur, $cat]) {
            Experience::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'summary' => $summary, 'duration_label' => $dur,
                'category' => $cat, 'status' => 'published', 'position' => $i,
            ]);
        }
    }

    private function social(): void
    {
        $testimonials = [
            ['Ananya R.', 'Bengaluru', 'Fifteen days of Panchakarma and I left lighter in every sense. The forest does half the healing.', 5],
            ['Michael T.', 'Melbourne', 'The most thoughtfully run wellness centre I have visited in India. Doctors who actually listen.', 5],
            ['Priya S.', 'Hyderabad', 'Our corporate cohort came for a digital detox and went home a team. Food was extraordinary.', 5],
        ];
        foreach ($testimonials as [$name, $origin, $quote, $rating]) {
            Testimonial::updateOrCreate(['name' => $name, 'quote' => $quote], [
                'origin' => $origin, 'rating' => $rating, 'status' => 'published', 'published_at' => now(),
            ]);
        }

        $faqs = [
            ['booking', 'How do I choose a programme?', 'Tell us your goal and dates via the enquiry form or booking flow; a wellness advisor recommends a programme, and your on-site doctor confirms it.'],
            ['booking', 'Do I need to be unwell to come?', 'No. Many guests come for preventive rest. Programmes scale from a 3-night reset to full clinical Panchakarma.'],
            ['booking', 'Is there a medical questionnaire?', 'Yes — it is part of booking, so the clinical team can prepare your plan.'],
            ['booking', 'What about food?', 'All meals are vegetarian and mostly organic. Programme guests eat to their prescribed diet chart.'],
            ['booking', 'What is the cancellation policy?', 'Full refund up to 14 days before arrival, 50% up to 7 days, non-refundable inside 72 hours, with medical exceptions.'],
        ];
        foreach ($faqs as $i => [$group, $q, $a]) {
            Faq::updateOrCreate(['question' => $q], ['group' => $group, 'answer' => $a, 'position' => $i, 'status' => 'published']);
        }
    }
}
