<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\HousekeepingTask;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HousekeepingController extends Controller
{
    public function board(): JsonResponse
    {
        $rooms = Room::with('category:id,name')
            ->orderBy('code')
            ->get(['id', 'code', 'room_category_id', 'status', 'housekeeping_status'])
            ->map(fn (Room $r) => [
                'id' => $r->id,
                'code' => $r->code,
                'category' => $r->category?->name,
                'status' => $r->status,
                'housekeeping_status' => $r->housekeeping_status,
            ]);

        $tasks = HousekeepingTask::with('room:id,code')
            ->whereIn('status', ['pending', 'in_progress', 'blocked'])
            ->orderByRaw("array_position(array['high','normal','low'], priority)")
            ->orderBy('due_at')
            ->get()
            ->map($this->taskRow(...));

        return response()->json(['data' => [
            'rooms' => $rooms,
            'tasks' => $tasks,
            'summary' => [
                'dirty' => $rooms->where('housekeeping_status', 'dirty')->count(),
                'in_progress' => $rooms->where('housekeeping_status', 'in_progress')->count(),
                'open_tasks' => $tasks->count(),
            ],
        ]]);
    }

    public function createTask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'room_id' => ['nullable', 'exists:rooms,id'],
            'type' => ['required', 'in:cleaning,turndown,laundry,maintenance,amenities,inspection'],
            'priority' => ['nullable', 'in:low,normal,high'],
            'note' => ['nullable', 'string', 'max:1000'],
            'checklist' => ['nullable', 'array'],
            'due_at' => ['nullable', 'date'],
        ]);

        $task = HousekeepingTask::create($data + ['status' => 'pending']);

        return response()->json(['data' => $this->taskRow($task->load('room:id,code'))], 201);
    }

    public function updateTask(Request $request, HousekeepingTask $housekeepingTask): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,in_progress,done,blocked'],
            'checklist' => ['sometimes', 'array'],
            'note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        if (($data['status'] ?? null) === 'done') {
            $data['completed_at'] = now();
        }
        $housekeepingTask->update($data);

        // reflect room housekeeping status
        if ($housekeepingTask->room_id && isset($data['status'])) {
            $map = ['in_progress' => 'in_progress', 'done' => 'clean', 'pending' => 'dirty'];
            if (isset($map[$data['status']])) {
                Room::whereKey($housekeepingTask->room_id)->update(['housekeeping_status' => $map[$data['status']]]);
            }
        }

        return response()->json(['data' => $this->taskRow($housekeepingTask->fresh('room:id,code'))]);
    }

    public function setRoomStatus(Request $request, Room $room): JsonResponse
    {
        $data = $request->validate([
            'housekeeping_status' => ['required', 'in:clean,dirty,in_progress,inspected'],
        ]);
        $room->update($data);

        return response()->json(['data' => $room->only(['id', 'code', 'housekeeping_status'])]);
    }

    private function taskRow(HousekeepingTask $t): array
    {
        return [
            'id' => $t->id,
            'room' => $t->room?->code,
            'type' => $t->type,
            'priority' => $t->priority,
            'status' => $t->status,
            'note' => $t->note,
            'checklist' => $t->checklist,
            'due_at' => $t->due_at,
        ];
    }
}
