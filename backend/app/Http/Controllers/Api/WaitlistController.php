<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WaitlistEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WaitlistController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:32'],
            'program' => ['nullable', 'exists:wellness_programs,slug'],
            'room_category' => ['nullable', 'exists:room_categories,slug'],
            'preferred_check_in' => ['nullable', 'date'],
            'preferred_check_out' => ['nullable', 'date', 'after:preferred_check_in'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:12'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $entry = WaitlistEntry::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'wellness_program_id' => optional(\App\Models\WellnessProgram::where('slug', $data['program'] ?? null)->first())->id,
            'room_category_id' => optional(\App\Models\RoomCategory::where('slug', $data['room_category'] ?? null)->first())->id,
            'preferred_check_in' => $data['preferred_check_in'] ?? null,
            'preferred_check_out' => $data['preferred_check_out'] ?? null,
            'guests' => $data['guests'] ?? 1,
            'note' => $data['note'] ?? null,
        ]);

        return response()->json(['message' => 'You are on the waitlist — we will be in touch as space opens.', 'id' => $entry->id], 201);
    }
}
