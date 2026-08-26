<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingAdminController extends Controller
{
    public function __construct(private readonly BookingService $bookings)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with(['guest:id,first_name,last_name,email', 'program:id,slug,name', 'roomCategory:id,slug,name'])
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('q'), function ($q, $term) {
                $q->where(function ($w) use ($term) {
                    $w->where('reference', 'ilike', "%{$term}%")
                        ->orWhere('contact_email', 'ilike', "%{$term}%");
                });
            })
            ->when($request->query('from'), fn ($q, $d) => $q->where('check_in', '>=', $d))
            ->when($request->query('to'), fn ($q, $d) => $q->where('check_in', '<=', $d))
            ->latest()
            ->paginate(min(100, (int) $request->query('per_page', 25)));

        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['guest', 'program', 'roomCategory', 'guestsList', 'statusHistory.user:id,name', 'payments', 'documents', 'invoice']);

        return response()->json(['data' => $booking]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:confirmed,checked_in,checked_out,cancelled'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->bookings->transition($booking, $data['status'], Auth::guard('api')->user(), $data['note'] ?? null);

        return response()->json(['data' => $booking->refresh()->load('statusHistory')]);
    }
}
