<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DietChart;
use App\Models\DoshaAssessment;
use App\Models\Guest;
use App\Models\Prescription;
use App\Models\ProgressEntry;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    private function doctorId(): ?int
    {
        return Auth::guard('api')->user()?->doctor?->id;
    }

    public function dashboard(): JsonResponse
    {
        $today = CarbonImmutable::now();
        $mine = Appointment::query()
            ->when($this->doctorId(), fn ($q, $id) => $q->where('doctor_id', $id))
            ->whereIn('type', ['consultation', 'follow_up'])
            ->with(['guest:id,first_name,last_name', 'booking:id,reference'])
            ->orderBy('scheduled_at');

        return response()->json(['data' => [
            'today' => (clone $mine)->whereDate('scheduled_at', $today)->get()->map($this->apptRow(...)),
            'upcoming' => (clone $mine)->whereDate('scheduled_at', '>', $today)->limit(20)->get()->map($this->apptRow(...)),
            'in_house_patients' => Guest::whereHas('bookings', fn ($q) => $q
                ->where('status', 'checked_in')
                ->orWhere(fn ($w) => $w->where('status', 'confirmed')->whereDate('check_in', '<=', $today)->whereDate('check_out', '>=', $today)))
                ->get(['id', 'first_name', 'last_name'])
                ->map(fn ($g) => ['id' => $g->id, 'name' => $g->full_name]),
        ]]);
    }

    public function patient(Guest $guest): JsonResponse
    {
        $guest->load([
            'bookings:id,guest_id,reference,status,check_in,check_out',
            'doshaAssessments', 'dietCharts.doctor:id,name', 'prescriptions.doctor:id,name',
            'progressEntries',
        ]);

        return response()->json(['data' => [
            'id' => $guest->id,
            'name' => $guest->full_name,
            'email' => $guest->email,
            'phone' => $guest->phone,
            'bookings' => $guest->bookings,
            'dosha_assessments' => $guest->doshaAssessments,
            'diet_charts' => $guest->dietCharts,
            'prescriptions' => $guest->prescriptions,
            'progress' => $guest->progressEntries,
        ]]);
    }

    public function storeDosha(Request $request, Guest $guest): JsonResponse
    {
        $data = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'vata' => ['required', 'integer', 'min:0', 'max:100'],
            'pitta' => ['required', 'integer', 'min:0', 'max:100'],
            'kapha' => ['required', 'integer', 'min:0', 'max:100'],
            'prakriti' => ['nullable', 'string', 'max:60'],
            'vikriti' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $row = DoshaAssessment::create($data + [
            'guest_id' => $guest->id,
            'doctor_id' => $this->doctorId(),
            'assessed_at' => now(),
        ]);

        return response()->json(['data' => $row], 201);
    }

    public function storeDietChart(Request $request, Guest $guest): JsonResponse
    {
        $data = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'title' => ['nullable', 'string', 'max:120'],
            'meals' => ['required', 'array', 'min:1'],
            'avoid' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        DietChart::where('guest_id', $guest->id)->where('status', 'active')->update(['status' => 'superseded']);

        $row = DietChart::create($data + [
            'guest_id' => $guest->id,
            'doctor_id' => $this->doctorId(),
            'status' => 'active',
            'effective_from' => now()->toDateString(),
        ]);

        return response()->json(['data' => $row], 201);
    }

    public function storePrescription(Request $request, Guest $guest): JsonResponse
    {
        $data = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine' => ['required', 'string', 'max:120'],
            'items.*.dose' => ['nullable', 'string', 'max:60'],
            'items.*.timing' => ['nullable', 'string', 'max:80'],
            'items.*.duration' => ['nullable', 'string', 'max:60'],
            'items.*.anupana' => ['nullable', 'string', 'max:80'],
            'advice' => ['nullable', 'string', 'max:2000'],
        ]);

        $row = Prescription::create($data + [
            'guest_id' => $guest->id,
            'doctor_id' => $this->doctorId(),
            'status' => 'active',
            'issued_at' => now(),
        ]);

        return response()->json(['data' => $row], 201);
    }

    public function storeProgress(Request $request, Guest $guest): JsonResponse
    {
        $data = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'entry_date' => ['required', 'date'],
            'metrics' => ['required', 'array'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $row = ProgressEntry::updateOrCreate(
            ['guest_id' => $guest->id, 'entry_date' => $data['entry_date']],
            $data + ['guest_id' => $guest->id, 'recorded_by' => Auth::guard('api')->id()],
        );

        return response()->json(['data' => $row], 201);
    }

    public function completeAppointment(Request $request, Appointment $appointment): JsonResponse
    {
        $appointment->update([
            'status' => 'completed',
            'notes' => $request->input('notes', $appointment->notes),
        ]);

        return response()->json(['data' => $appointment]);
    }

    private function apptRow(Appointment $a): array
    {
        return [
            'id' => $a->id,
            'type' => $a->type,
            'guest' => ['id' => $a->guest_id, 'name' => $a->guest?->full_name],
            'booking' => $a->booking?->reference,
            'scheduled_at' => $a->scheduled_at,
            'duration_min' => $a->duration_min,
            'status' => $a->status,
        ];
    }
}
