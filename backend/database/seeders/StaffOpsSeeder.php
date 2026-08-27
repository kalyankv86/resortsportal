<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\HousekeepingTask;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class StaffOpsSeeder extends Seeder
{
    public function run(): void
    {
        if (HousekeepingTask::count() > 0) {
            $this->command->info('  StaffOpsSeeder: housekeeping tasks present, skipping.');

            return;
        }

        $rooms = Room::orderBy('id')->limit(10)->get();
        $today = CarbonImmutable::now();

        foreach ($rooms as $i => $room) {
            $hk = match ($i % 4) {
                0 => 'dirty',
                1 => 'in_progress',
                2 => 'inspected',
                default => 'clean',
            };
            $room->update(['housekeeping_status' => $hk]);

            if (in_array($hk, ['dirty', 'in_progress'], true)) {
                HousekeepingTask::create([
                    'room_id' => $room->id,
                    'type' => $i % 3 === 0 ? 'cleaning' : ($i % 3 === 1 ? 'turndown' : 'amenities'),
                    'priority' => $i % 5 === 0 ? 'high' : 'normal',
                    'status' => $hk === 'in_progress' ? 'in_progress' : 'pending',
                    'note' => $hk === 'dirty' ? 'Checkout clean' : 'In progress',
                    'checklist' => [
                        ['label' => 'Linen change', 'done' => false],
                        ['label' => 'Bathroom', 'done' => $hk === 'in_progress'],
                        ['label' => 'Restock amenities', 'done' => false],
                        ['label' => 'Verandah sweep', 'done' => false],
                    ],
                    'due_at' => $today->setTime(11 + $i % 6, 0),
                ]);
            }
        }

        // A maintenance task not tied to a room
        HousekeepingTask::create([
            'type' => 'maintenance',
            'priority' => 'high',
            'status' => 'pending',
            'note' => 'Yoga deck handrail loose — reported by guest.',
            'due_at' => $today->setTime(15, 0),
        ]);

        $this->command->info('  StaffOpsSeeder: '.HousekeepingTask::count().' housekeeping tasks, room statuses set.');
    }
}
