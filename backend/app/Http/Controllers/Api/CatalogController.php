<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\RoomCategory;
use App\Models\Therapy;
use App\Models\WellnessProgram;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function rooms(): JsonResponse
    {
        return response()->json([
            'data' => RoomCategory::published()
                ->with('ratePlans:id,room_category_id,name,currency,nightly_rate,min_nights,inclusions')
                ->orderBy('position')
                ->get(),
        ]);
    }

    public function room(string $slug): JsonResponse
    {
        return response()->json([
            'data' => RoomCategory::published()
                ->with(['ratePlans', 'rooms:id,room_category_id,code,status'])
                ->where('slug', $slug)
                ->firstOrFail(),
        ]);
    }

    public function therapies(): JsonResponse
    {
        return response()->json([
            'data' => Therapy::published()
                ->with('category:id,slug,name')
                ->orderBy('position')
                ->get(),
        ]);
    }

    public function therapy(string $slug): JsonResponse
    {
        return response()->json([
            'data' => Therapy::published()->with('category')->where('slug', $slug)->firstOrFail(),
        ]);
    }

    public function programs(): JsonResponse
    {
        return response()->json([
            'data' => WellnessProgram::published()->orderBy('position')->get(),
        ]);
    }

    public function program(string $slug): JsonResponse
    {
        return response()->json([
            'data' => WellnessProgram::published()->where('slug', $slug)->firstOrFail(),
        ]);
    }

    public function experiences(): JsonResponse
    {
        return response()->json([
            'data' => Experience::published()->orderBy('position')->get(),
        ]);
    }
}
