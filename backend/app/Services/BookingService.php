<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\Guest;
use App\Models\PromoCode;
use App\Models\RoomCategory;
use App\Models\Setting;
use App\Models\User;
use App\Models\WellnessProgram;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Availability + pricing + persistence for the CWETR booking engine.
 * Payment capture and GST invoice generation are Milestone 7.
 */
class BookingService
{
    /** Booking statuses that consume inventory. */
    private const HOLDING = ['pending', 'confirmed', 'checked_in'];

    public function availability(string $categorySlug, string $checkIn, string $checkOut): array
    {
        $category = RoomCategory::published()->where('slug', $categorySlug)->firstOrFail();
        [$in, $out, $nights] = $this->dates($checkIn, $checkOut);

        $capacity = $category->rooms()->where('status', 'available')->count();

        $held = Booking::query()
            ->where('room_category_id', $category->id)
            ->whereIn('status', self::HOLDING)
            ->where('check_in', '<', $out)
            ->where('check_out', '>', $in)
            ->count();

        return [
            'category' => $category->only(['id', 'slug', 'name']),
            'nights' => $nights,
            'capacity' => $capacity,
            'held' => $held,
            'available' => max(0, $capacity - $held),
        ];
    }

    public function quote(array $in): array
    {
        [$checkIn, $checkOut, $nights] = $this->dates($in['check_in'], $in['check_out']);
        $adults = max(1, (int) ($in['adults'] ?? 1));
        $children = max(0, (int) ($in['children'] ?? 0));

        $category = ! empty($in['room_category'])
            ? RoomCategory::published()->where('slug', $in['room_category'])->firstOrFail()
            : null;
        $program = ! empty($in['program'])
            ? WellnessProgram::published()->where('slug', $in['program'])->firstOrFail()
            : null;

        $lines = [];
        $subtotal = 0.0;

        // The wellness package is a fixed price for the treatment guest; the room
        // is charged separately, per night, whether or not a package is chosen.
        if ($program) {
            $amount = round((float) $program->price_from, 2);
            $lines[] = ['label' => "{$program->name} — {$program->nights}-day package", 'amount' => $amount];
            $subtotal += $amount;
        }

        if ($category) {
            $plan = $category->ratePlans()->first();
            $nightly = $plan ? (float) $plan->nightly_rate : 0.0;
            $amount = round($nightly * $nights, 2);
            $lines[] = ['label' => "{$category->name} — ₹".number_format($nightly)." × {$nights} night".($nights > 1 ? 's' : ''), 'amount' => $amount];
            $subtotal += $amount;
        }

        if ($subtotal <= 0) {
            throw ValidationException::withMessages(['room_category' => ['Choose a package or a room to price your stay.']]);
        }

        $discount = 0.0;
        $promoResult = null;
        if (! empty($in['promo_code'])) {
            $promo = PromoCode::whereRaw('lower(code) = ?', [strtolower($in['promo_code'])])->first();
            if ($promo && $promo->isValidFor($subtotal, $nights, $checkIn)) {
                $discount = $promo->discountOn($subtotal);
                $promoResult = ['code' => $promo->code, 'applied' => true, 'label' => $promo->description ?? $promo->code];
            } else {
                $promoResult = ['code' => $in['promo_code'], 'applied' => false, 'label' => 'Code not valid for this stay'];
            }
        }

        // Tariffs are quoted GST-inclusive, so GST is shown as contained in the
        // total rather than added on top.
        $gst = (float) (Setting::get('tax.gst_percent', 12));
        $total = round($subtotal - $discount, 2);
        $tax = $gst > 0 ? round($total - $total / (1 + $gst / 100), 2) : 0.0;

        return [
            'check_in' => $checkIn->toDateString(),
            'check_out' => $checkOut->toDateString(),
            'check_in_time' => $in['check_in_time'] ?? null,
            'check_out_time' => $in['check_out_time'] ?? null,
            'nights' => $nights,
            'adults' => $adults,
            'children' => $children,
            'currency' => Setting::get('currency', 'INR'),
            'lines' => $lines,
            'subtotal' => round($subtotal, 2),
            'promo' => $promoResult,
            'discount' => $discount,
            'gst_percent' => $gst,
            'tax' => $tax,
            'total' => $total,
            'availability' => $category
                ? $this->availability($category->slug, $checkIn->toDateString(), $checkOut->toDateString())
                : null,
        ];
    }

    public function create(array $in, ?User $user = null): Booking
    {
        $quote = $this->quote($in);

        $category = ! empty($in['room_category'])
            ? RoomCategory::where('slug', $in['room_category'])->first()
            : null;
        $program = ! empty($in['program'])
            ? WellnessProgram::where('slug', $in['program'])->first()
            : null;

        if ($category) {
            $avail = $this->availability($category->slug, $quote['check_in'], $quote['check_out']);
            if ($avail['available'] < 1) {
                throw ValidationException::withMessages([
                    'room_category' => ['This room category is sold out for those dates. Join the waitlist or pick another category.'],
                ]);
            }
        }

        return DB::transaction(function () use ($in, $quote, $category, $program, $user) {
            $primaryName = trim(($in['first_name'] ?? '').' '.($in['last_name'] ?? '')) ?: ($in['name'] ?? 'Guest');

            $guest = null;
            if ($user) {
                $guest = $user->guestProfile ?: Guest::create([
                    'user_id' => $user->id,
                    'first_name' => $in['first_name'] ?? $user->name,
                    'last_name' => $in['last_name'] ?? '',
                    'email' => $in['email'] ?? $user->email,
                    'phone' => $in['phone'] ?? $user->phone,
                ]);
            } else {
                $guest = Guest::create([
                    'first_name' => $in['first_name'] ?? $primaryName,
                    'last_name' => $in['last_name'] ?? '',
                    'email' => $in['email'] ?? null,
                    'phone' => $in['phone'] ?? null,
                    'nationality' => $in['nationality'] ?? null,
                ]);
            }

            $booking = Booking::create([
                'guest_id' => $guest->id,
                'wellness_program_id' => $program?->id,
                'room_category_id' => $category?->id,
                'check_in' => $quote['check_in'],
                'check_out' => $quote['check_out'],
                'check_in_time' => $quote['check_in_time'] ?? null,
                'check_out_time' => $quote['check_out_time'] ?? null,
                'nights' => $quote['nights'],
                'adults' => $quote['adults'],
                'children' => $quote['children'],
                'status' => 'pending',
                'source' => 'web',
                'booking_type' => $in['booking_type'] ?? 'individual',
                'promo_code' => $quote['promo']['applied'] ?? false ? $quote['promo']['code'] : null,
                'subtotal' => $quote['subtotal'],
                'discount' => $quote['discount'],
                'tax' => $quote['tax'],
                'total' => $quote['total'],
                'currency' => $quote['currency'],
                'questionnaire' => $in['questionnaire'] ?? null,
                'special_requests' => $in['special_requests'] ?? null,
                'contact_email' => $in['email'] ?? $guest->email,
                'contact_phone' => $in['phone'] ?? $guest->phone,
                'created_by' => $user?->id,
            ]);

            $booking->guestsList()->create(['name' => $primaryName, 'is_primary' => true, 'age' => $in['age'] ?? null]);
            foreach ($in['companions'] ?? [] as $c) {
                if (! empty($c['name'])) {
                    $booking->guestsList()->create(['name' => $c['name'], 'age' => $c['age'] ?? null]);
                }
            }

            BookingStatusHistory::create([
                'booking_id' => $booking->id,
                'from_status' => null,
                'to_status' => 'pending',
                'note' => 'Booking created via website',
                'user_id' => $user?->id,
            ]);

            if (($quote['promo']['applied'] ?? false)) {
                PromoCode::whereRaw('lower(code) = ?', [strtolower($quote['promo']['code'])])->increment('redeemed');
            }

            return $booking->load(['guest', 'program', 'roomCategory', 'guestsList']);
        });
    }

    public function transition(Booking $booking, string $to, ?User $user = null, ?string $note = null): Booking
    {
        $allowed = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['checked_in', 'cancelled'],
            'checked_in' => ['checked_out'],
            'checked_out' => [],
            'cancelled' => [],
        ];

        $from = $booking->status;
        if (! in_array($to, $allowed[$from] ?? [], true)) {
            throw ValidationException::withMessages(['status' => ["Cannot move a {$from} booking to {$to}."]]);
        }

        $booking->update(['status' => $to]);
        BookingStatusHistory::create([
            'booking_id' => $booking->id,
            'from_status' => $from,
            'to_status' => $to,
            'note' => $note,
            'user_id' => $user?->id,
        ]);

        return $booking;
    }

    public function reschedule(Booking $booking, string $checkIn, string $checkOut, ?User $user = null): Booking
    {
        if (! in_array($booking->status, ['pending', 'confirmed'], true)) {
            throw ValidationException::withMessages(['status' => ['Only pending or confirmed bookings can be rescheduled.']]);
        }
        [$in, $out, $nights] = $this->dates($checkIn, $checkOut);

        if ($booking->room_category_id) {
            $cat = RoomCategory::find($booking->room_category_id);
            $held = Booking::where('room_category_id', $cat->id)
                ->whereIn('status', self::HOLDING)
                ->where('id', '!=', $booking->id)
                ->where('check_in', '<', $out)->where('check_out', '>', $in)
                ->count();
            if ($held >= $cat->rooms()->where('status', 'available')->count()) {
                throw ValidationException::withMessages(['check_in' => ['No availability for the new dates.']]);
            }
        }

        // re-price
        $quote = $this->quote([
            'check_in' => $in->toDateString(),
            'check_out' => $out->toDateString(),
            'adults' => $booking->adults,
            'children' => $booking->children,
            'room_category' => $booking->roomCategory?->slug,
            'program' => $booking->program?->slug,
            'promo_code' => $booking->promo_code,
        ]);

        $booking->update([
            'check_in' => $in->toDateString(),
            'check_out' => $out->toDateString(),
            'nights' => $nights,
            'subtotal' => $quote['subtotal'],
            'discount' => $quote['discount'],
            'tax' => $quote['tax'],
            'total' => $quote['total'],
        ]);

        BookingStatusHistory::create([
            'booking_id' => $booking->id,
            'from_status' => $booking->status,
            'to_status' => $booking->status,
            'note' => "Rescheduled to {$in->toDateString()} → {$out->toDateString()}",
            'user_id' => $user?->id,
        ]);

        return $booking->refresh();
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: int} */
    private function dates(string $checkIn, string $checkOut): array
    {
        $in = CarbonImmutable::parse($checkIn)->startOfDay();
        $out = CarbonImmutable::parse($checkOut)->startOfDay();
        $nights = $in->diffInDays($out);

        $min = (int) Setting::get('booking.min_nights', 1);
        $max = (int) Setting::get('booking.max_nights', 30);

        if ($nights < 1) {
            throw ValidationException::withMessages(['check_out' => ['Check-out must be after check-in.']]);
        }
        if ($in->isBefore(CarbonImmutable::now()->startOfDay())) {
            throw ValidationException::withMessages(['check_in' => ['Check-in cannot be in the past.']]);
        }
        if ($nights < $min) {
            throw ValidationException::withMessages(['check_out' => ["Minimum stay is {$min} nights."]]);
        }
        if ($nights > $max) {
            throw ValidationException::withMessages(['check_out' => ["Maximum stay is {$max} nights."]]);
        }

        return [$in, $out, $nights];
    }
}
