<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\TreatmentNote;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TherapistController extends Controller
{
    private function therapistId(): ?int
    {
        return Auth::guard('api')->user()?->therapist?->id;
    }

    public function dashboard(Request $request): JsonResponse
    {
        $date = $request->date('date') ?: CarbonImmutable::now();

        $appts = Appointment::query()
            ->where('type', 'therapy')
            ->when($this->therapistId(), fn ($q, $id) => $q->where('therapist_id', $id))
            ->whereDate('scheduled_at', $date)
            ->with(['guest:id,first_name,last_name', 'therapy:id,name,duration_min', 'booking:id,reference'])
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn (Appointment $a) => [
                'id' => $a->id,
                'guest' => ['id' => $a->guest_id, 'name' => $a->guest?->full_name],
                'therapy' => $a->therapy?->name ?? 'Therapy',
                'booking' => $a->booking?->reference,
                'scheduled_at' => $a->scheduled_at,
                'duration_min' => $a->duration_min,
                'status' => $a->status,
                'has_note' => TreatmentNote::where('appointment_id', $a->id)->exists(),
            ]);

        return response()->json(['data' => [
            'date' => CarbonImmutable::parse($date)->toDateString(),
            'appointments' => $appts,
            'summary' => [
                'total' => $appts->count(),
                'completed' => $appts->where('status', 'completed')->count(),
            ],
        ]]);
    }

    public function complete(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'observations' => ['nullable', 'string', 'max:2000'],
            'tolerance' => ['nullable', 'integer', 'min:1', 'max:5'],
            'consumables' => ['nullable', 'array'],
            'consumables.*.item' => ['required_with:consumables', 'string', 'max:120'],
            'consumables.*.qty' => ['nullable', 'numeric', 'min:0'],
            'consumables.*.unit' => ['nullable', 'string', 'max:20'],
        ]);

        $appointment->update(['status' => 'completed']);

        $note = TreatmentNote::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'guest_id' => $appointment->guest_id,
                'booking_id' => $appointment->booking_id,
                'therapist_id' => $this->therapistId(),
                'therapy_id' => $appointment->therapy_id,
                'observations' => $data['observations'] ?? null,
                'tolerance' => $data['tolerance'] ?? null,
                'consumables' => $data['consumables'] ?? null,
            ],
        );

        return response()->json(['data' => ['appointment' => $appointment, 'note' => $note]]);
    }
}
