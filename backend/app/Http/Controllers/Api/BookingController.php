<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\NotificationLog;
use App\Services\BookingService;
use App\Support\Qr;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookings)
    {
    }

    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate($this->quoteRules());

        return response()->json(['data' => $this->bookings->quote($data)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->quoteRules() + [
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['nullable', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['required', 'string', 'max:32'],
            'nationality' => ['nullable', 'string', 'max:80'],
            'booking_type' => ['nullable', 'in:individual,corporate,international'],
            'special_requests' => ['nullable', 'string', 'max:2000'],
            'companions' => ['nullable', 'array', 'max:8'],
            'companions.*.name' => ['required_with:companions', 'string', 'max:80'],
            'companions.*.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'questionnaire' => ['nullable', 'array'],
        ]);

        $booking = $this->bookings->create($data, Auth::guard('api')->user());
        $this->sendConfirmation($booking);

        return response()->json([
            'data' => $this->present($booking, includePass: true),
            'message' => 'Booking received. A confirmation has been sent to '.$booking->contact_email.'.',
        ], 201);
    }

    public function show(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::with(['guest', 'program', 'roomCategory', 'guestsList', 'statusHistory', 'payments'])
            ->where('reference', $reference)->firstOrFail();

        $user = Auth::guard('api')->user();
        $ownsIt = $user && ($user->is_staff || $booking->guest?->user_id === $user->id);
        $email = strtolower((string) $request->query('email'));
        $emailMatches = $email && $email === strtolower((string) $booking->contact_email);
        $token = (string) $request->query('t');
        $tokenMatches = $token !== '' && hash_equals((string) $booking->qr_token, $token);

        abort_unless($ownsIt || $emailMatches || $tokenMatches, 403, 'Provide the email used for this booking, or open the link from your confirmation.');

        return response()->json(['data' => $this->present($booking, includePass: true)]);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $this->authorizeGuestOrStaff($booking);
        $note = $request->string('reason')->toString() ?: 'Cancelled by guest';
        $this->bookings->transition($booking, 'cancelled', Auth::guard('api')->user(), $note);

        return response()->json(['data' => $this->present($booking->refresh())]);
    }

    public function reschedule(Request $request, Booking $booking): JsonResponse
    {
        $this->authorizeGuestOrStaff($booking);
        $data = $request->validate([
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);
        $updated = $this->bookings->reschedule($booking, $data['check_in'], $data['check_out'], Auth::guard('api')->user());

        return response()->json(['data' => $this->present($updated)]);
    }

    public function uploadDocument(Request $request, Booking $booking): JsonResponse
    {
        $this->authorizeGuestOrStaff($booking);
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,webp,heic'],
            'kind' => ['nullable', 'in:medical_report,id_proof,other'],
        ]);

        $path = $request->file('file')->store("bookings/{$booking->id}", 'local');

        $doc = $booking->documents()->create([
            'kind' => $request->input('kind', 'medical_report'),
            'original_name' => $request->file('file')->getClientOriginalName(),
            'path' => $path,
            'mime' => $request->file('file')->getMimeType(),
            'size' => $request->file('file')->getSize(),
            'uploaded_by' => Auth::guard('api')->id(),
        ]);

        return response()->json(['data' => $doc->only(['id', 'kind', 'original_name', 'size', 'created_at'])], 201);
    }

    public function pass(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::with(['guest', 'roomCategory', 'program'])->where('reference', $reference)->firstOrFail();

        $token = (string) $request->query('t');
        $user = Auth::guard('api')->user();
        abort_unless(
            hash_equals((string) $booking->qr_token, $token) || ($user && ($user->is_staff || $booking->guest?->user_id === $user->id)),
            403,
            'Invalid pass token.',
        );

        $url = rtrim(config('app.url'), '/')."/booking/{$booking->reference}?t={$booking->qr_token}";

        return response()->json(['data' => [
            'reference' => $booking->reference,
            'guest' => $booking->guest?->full_name,
            'stay' => $booking->program?->name ?? $booking->roomCategory?->name,
            'check_in' => $booking->check_in->toDateString(),
            'check_out' => $booking->check_out->toDateString(),
            'status' => $booking->status,
            'qr_svg' => Qr::svg($url, 220),
            'url' => $url,
        ]]);
    }

    /* ---------------------------------------------------------------- */

    /**
     * Booking confirmation. Mail is delivered by the configured mailer (SMTP
     * when set, otherwise logged); the attempt is always recorded in
     * notification_log.
     */
    private function sendConfirmation(Booking $booking): void
    {
        $to = $booking->contact_email;
        if (! $to) {
            return;
        }

        $url = rtrim(config('app.url'), '/')."/booking/{$booking->reference}?t={$booking->qr_token}";
        $body = "Dear {$booking->guest?->full_name},\n\n"
            ."Thank you — we've received your booking {$booking->reference}.\n"
            ."Stay: {$booking->check_in->toDateString()} to {$booking->check_out->toDateString()} ({$booking->nights} nights)\n"
            ."Total: {$booking->currency} ".number_format((float) $booking->total, 2)."\n"
            ."Status: {$booking->status}\n\n"
            ."View your booking and arrival pass: {$url}\n\n"
            ."Our team will confirm your dates and share payment instructions shortly.\n"
            ."— Centurion Wellness & Eco Tourism";

        $status = 'sent';
        $error = null;
        try {
            Mail::raw($body, function ($m) use ($to, $booking) {
                $m->to($to)->subject("Booking {$booking->reference} — Centurion Wellness");
            });
        } catch (\Throwable $e) {
            $status = 'failed';
            $error = $e->getMessage();
            Log::warning('Booking confirmation mail failed', ['ref' => $booking->reference, 'error' => $error]);
        }

        NotificationLog::create([
            'channel' => 'mail',
            'to' => $to,
            'template' => 'booking.confirmation',
            'payload' => ['reference' => $booking->reference, 'total' => (float) $booking->total],
            'status' => $status,
            'error' => $error,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    private function quoteRules(): array
    {
        return [
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'adults' => ['nullable', 'integer', 'min:1', 'max:12'],
            'children' => ['nullable', 'integer', 'min:0', 'max:12'],
            'room_category' => ['nullable', 'string', 'exists:room_categories,slug'],
            'program' => ['nullable', 'string', 'exists:wellness_programs,slug'],
            'promo_code' => ['nullable', 'string', 'max:40'],
        ];
    }

    private function authorizeGuestOrStaff(Booking $booking): void
    {
        $user = Auth::guard('api')->user();
        abort_if(! $user, 401);
        abort_unless(
            $user->is_staff || $booking->guest?->user_id === $user->id,
            403,
            'You cannot modify this booking.',
        );
    }

    private function present(Booking $booking, bool $includePass = false): array
    {
        $data = [
            'id' => $booking->id,
            'reference' => $booking->reference,
            'status' => $booking->status,
            'check_in' => $booking->check_in->toDateString(),
            'check_out' => $booking->check_out->toDateString(),
            'nights' => $booking->nights,
            'adults' => $booking->adults,
            'children' => $booking->children,
            'booking_type' => $booking->booking_type,
            'programme' => $booking->program?->only(['slug', 'name']),
            'room_category' => $booking->roomCategory?->only(['slug', 'name']),
            'subtotal' => (float) $booking->subtotal,
            'discount' => (float) $booking->discount,
            'tax' => (float) $booking->tax,
            'total' => (float) $booking->total,
            'currency' => $booking->currency,
            'amount_paid' => $booking->amountPaid(),
            'balance_due' => $booking->balanceDue(),
            'contact_email' => $booking->contact_email,
            'guests' => $booking->guestsList->map->only(['name', 'is_primary', 'age']),
            'created_at' => $booking->created_at,
        ];

        if ($booking->relationLoaded('statusHistory')) {
            $data['status_history'] = $booking->statusHistory->map->only(['from_status', 'to_status', 'note', 'created_at']);
        }
        if ($includePass) {
            $url = rtrim(config('app.url'), '/')."/booking/{$booking->reference}?t={$booking->qr_token}";
            $data['pass'] = ['url' => $url, 'qr_svg' => Qr::svg($url, 200)];
        }

        return $data;
    }
}
