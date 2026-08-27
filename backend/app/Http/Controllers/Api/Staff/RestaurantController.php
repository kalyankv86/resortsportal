<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\DietChart;
use App\Models\MealOrder;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function board(Request $request): JsonResponse
    {
        $date = ($request->date('date') ?: CarbonImmutable::now())->toDateString();

        $inHouse = Booking::query()
            ->whereIn('status', ['checked_in', 'confirmed'])
            ->whereDate('check_in', '<=', $date)
            ->whereDate('check_out', '>=', $date)
            ->with(['guest:id,first_name,last_name'])
            ->get();

        $charts = DietChart::where('status', 'active')
            ->whereIn('guest_id', $inHouse->pluck('guest_id'))
            ->with('guest:id,first_name,last_name')
            ->get()
            ->map(fn (DietChart $c) => [
                'guest' => $c->guest?->full_name,
                'title' => $c->title,
                'meals' => $c->meals,
                'avoid' => $c->avoid,
            ]);

        // Ensure meal orders exist for today from active diet charts
        foreach (DietChart::where('status', 'active')->whereIn('guest_id', $inHouse->pluck('guest_id'))->get() as $chart) {
            foreach (($chart->meals ?? []) as $m) {
                MealOrder::firstOrCreate(
                    ['diet_chart_id' => $chart->id, 'service_date' => $date, 'meal' => $m['meal'] ?? 'meal'],
                    [
                        'guest_id' => $chart->guest_id,
                        'booking_id' => $chart->booking_id,
                        'time' => $m['time'] ?? null,
                        'items' => $m['items'] ?? [],
                        'status' => 'planned',
                    ],
                );
            }
        }

        $orders = MealOrder::where('service_date', $date)
            ->with('guest:id,first_name,last_name')
            ->orderBy('time')
            ->get()
            ->map(fn (MealOrder $o) => [
                'id' => $o->id,
                'guest' => $o->guest?->full_name,
                'meal' => $o->meal,
                'time' => $o->time,
                'items' => $o->items,
                'status' => $o->status,
            ]);

        return response()->json(['data' => [
            'date' => $date,
            'in_house' => $inHouse->count(),
            'diet_charts' => $charts,
            'orders' => $orders,
            'summary' => [
                'planned' => $orders->where('status', 'planned')->count(),
                'served' => $orders->where('status', 'served')->count(),
            ],
        ]]);
    }

    public function updateOrder(Request $request, MealOrder $mealOrder): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:planned,preparing,served,skipped'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);
        $mealOrder->update($data);

        return response()->json(['data' => $mealOrder->only(['id', 'meal', 'status'])]);
    }
}
