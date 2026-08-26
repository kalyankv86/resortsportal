<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Doctor;
use App\Models\Enquiry;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\RoomCategory;
use App\Models\Therapy;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class OverviewController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => [
            'counts' => [
                'users' => User::count(),
                'guests' => Guest::count(),
                'bookings' => Booking::count(),
                'bookings_pending' => Booking::where('status', 'pending')->count(),
                'bookings_confirmed' => Booking::where('status', 'confirmed')->count(),
                'room_categories' => RoomCategory::count(),
                'therapies' => Therapy::count(),
                'doctors' => Doctor::count(),
                'enquiries_new' => Enquiry::where('status', 'new')->count(),
            ],
            'revenue' => [
                'paid_total' => (float) Payment::where('status', 'paid')->sum('amount'),
                'currency' => 'INR',
            ],
            'recent_bookings' => Booking::with('guest:id,first_name,last_name')
                ->latest()->limit(8)->get(['id', 'reference', 'guest_id', 'status', 'check_in', 'check_out', 'total']),
            'recent_enquiries' => Enquiry::latest()->limit(8)->get(['id', 'name', 'email', 'topic', 'status', 'created_at']),
        ]]);
    }
}
