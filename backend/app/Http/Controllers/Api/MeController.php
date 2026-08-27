<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\User;
use App\Models\WishlistItem;
use App\Support\Qr;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MeController extends Controller
{
    private function guest(): ?Guest
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        return $user?->guestProfile;
    }

    public function profile(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();
        $guest = $this->guest();

        return response()->json(['data' => [
            'user' => $user->only(['id', 'name', 'email', 'phone', 'avatar_url', 'is_staff']),
            'roles' => $user->getRoleNames(),
            'guest' => $guest?->only([
                'id', 'first_name', 'last_name', 'phone', 'nationality',
                'emergency_contact', 'loyalty_points', 'loyalty_tier',
            ]),
        ]]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'emergency_contact' => ['sometimes', 'array'],
        ]);
        $user->fill(collect($data)->only(['name', 'phone'])->all())->save();
        if (isset($data['emergency_contact']) && $this->guest()) {
            $this->guest()->update(['emergency_contact' => $data['emergency_contact']]);
        }

        return response()->json(['data' => $user->only(['id', 'name', 'email', 'phone'])]);
    }

    public function bookings(): JsonResponse
    {
        $guest = $this->guest();
        $bookings = $guest
            ? $guest->bookings()
                ->with(['program:id,slug,name', 'roomCategory:id,slug,name', 'invoice'])
                ->latest('check_in')->get()
            : collect();

        return response()->json(['data' => $bookings]);
    }

    /** The active or next stay with countdown, pass and schedule. */
    public function stay(): JsonResponse
    {
        $guest = $this->guest();
        if (! $guest) {
            return response()->json(['data' => null]);
        }

        $today = CarbonImmutable::now()->startOfDay();
        $booking = $guest->bookings()
            ->whereIn('status', ['confirmed', 'checked_in', 'pending'])
            ->where('check_out', '>=', $today)
            ->with(['program', 'roomCategory'])
            ->orderBy('check_in')
            ->first();

        if (! $booking) {
            return response()->json(['data' => null]);
        }

        $schedule = $guest->appointments()
            ->with(['doctor:id,name', 'therapist:id,name', 'therapy:id,name'])
            ->whereBetween('scheduled_at', [$booking->check_in->startOfDay(), $booking->check_out->endOfDay()])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'title' => $a->therapy?->name ?? ucfirst(str_replace('_', ' ', $a->type)),
                'with' => $a->doctor?->name ?? $a->therapist?->name,
                'scheduled_at' => $a->scheduled_at,
                'duration_min' => $a->duration_min,
                'status' => $a->status,
            ]);

        $passUrl = rtrim(config('app.url'), '/')."/booking/{$booking->reference}?t={$booking->qr_token}";

        return response()->json(['data' => [
            'reference' => $booking->reference,
            'status' => $booking->status,
            'programme' => $booking->program?->only(['slug', 'name']),
            'room' => $booking->roomCategory?->only(['slug', 'name']),
            'check_in' => $booking->check_in->toDateString(),
            'check_out' => $booking->check_out->toDateString(),
            'nights' => $booking->nights,
            'days_until' => max(0, $today->diffInDays($booking->check_in, false)),
            'in_stay' => $today->betweenIncluded($booking->check_in, $booking->check_out),
            'balance_due' => $booking->balanceDue(),
            'currency' => $booking->currency,
            'pass' => ['url' => $passUrl, 'qr_svg' => Qr::svg($passUrl, 200)],
            'schedule' => $schedule,
        ]]);
    }

    public function dietChart(): JsonResponse
    {
        $guest = $this->guest();
        $chart = $guest?->dietCharts()->where('status', 'active')->with('doctor:id,name')->first();

        return response()->json(['data' => $chart]);
    }

    public function prescriptions(): JsonResponse
    {
        $guest = $this->guest();

        return response()->json([
            'data' => $guest ? $guest->prescriptions()->with('doctor:id,name')->get() : [],
        ]);
    }

    public function progress(): JsonResponse
    {
        $guest = $this->guest();
        $entries = $guest ? $guest->progressEntries()->get() : collect();
        $assessment = $guest?->doshaAssessments()->first();

        return response()->json(['data' => [
            'entries' => $entries,
            'dosha' => $assessment?->only(['vata', 'pitta', 'kapha', 'prakriti', 'vikriti', 'assessed_at']),
        ]]);
    }

    public function invoices(): JsonResponse
    {
        $guest = $this->guest();
        $invoices = $guest
            ? Booking::where('guest_id', $guest->id)->whereHas('invoice')
                ->with('invoice')->get()
                ->map(fn ($b) => [
                    'booking' => $b->reference,
                    'number' => $b->invoice->number,
                    'status' => $b->invoice->status,
                    'total' => (float) $b->invoice->total,
                    'issued_at' => $b->invoice->issued_at,
                    'pdf_url' => rtrim(config('app.url'), '/')."/api/bookings/{$b->reference}/invoice.pdf",
                ])
            : [];

        return response()->json(['data' => $invoices]);
    }

    public function rewards(): JsonResponse
    {
        $guest = $this->guest();

        return response()->json(['data' => [
            'points' => $guest?->loyalty_points ?? 0,
            'tier' => $guest?->loyalty_tier ?? 'Green',
            'ledger' => $guest ? $guest->loyaltyLedger()->limit(20)->get(['points', 'balance_after', 'reason', 'created_at']) : [],
        ]]);
    }

    public function wishlist(): JsonResponse
    {
        $guest = $this->guest();

        return response()->json(['data' => $guest ? $guest->wishlist()->get() : []]);
    }

    public function addWishlist(Request $request): JsonResponse
    {
        $guest = $this->guest();
        abort_unless($guest, 403);
        $data = $request->validate([
            'kind' => ['required', 'in:program,therapy,experience,room'],
            'ref' => ['required', 'string', 'max:120'],
            'label' => ['required', 'string', 'max:160'],
        ]);
        $item = WishlistItem::updateOrCreate(
            ['guest_id' => $guest->id, 'kind' => $data['kind'], 'ref' => $data['ref']],
            ['label' => $data['label']],
        );

        return response()->json(['data' => $item], 201);
    }

    public function removeWishlist(WishlistItem $wishlistItem): JsonResponse
    {
        abort_unless($wishlistItem->guest_id === $this->guest()?->id, 403);
        $wishlistItem->delete();

        return response()->json(['message' => 'Removed.']);
    }
}
