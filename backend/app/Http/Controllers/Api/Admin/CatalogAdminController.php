<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Models\RatePlan;
use App\Models\RoomCategory;
use App\Models\Therapy;
use App\Models\WellnessProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Admin CRUD for the bookable catalogue: rooms, services (therapies) and
 * packages (wellness programmes). Photos are picked from the media library
 * (App\Http\Controllers\Api\Admin\MediaController) and stored as an ordered
 * list of media-asset ids on each item's `gallery` column.
 */
class CatalogAdminController extends Controller
{
    /** media ids -> [{id,url,alt}] in the given order */
    private function photos(?array $ids): array
    {
        $ids = array_values(array_filter(array_map('intval', $ids ?? [])));
        if (! $ids) {
            return [];
        }
        $byId = MediaAsset::whereIn('id', $ids)->get(['id', 'url', 'alt'])->keyBy('id');

        return collect($ids)->map(fn ($id) => $byId->get($id))->filter()->values()->all();
    }

    private function uniqueSlug(string $model, string $base): string
    {
        $base = Str::slug($base) ?: 'item';
        $slug = $base;
        for ($i = 2; $model::where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    /* ------------------------------- rooms ------------------------------- */

    public function rooms(): JsonResponse
    {
        $rows = RoomCategory::with('ratePlans')->orderBy('position')->orderBy('id')->get()
            ->map(function ($c) {
                $c->photos = $this->photos($c->gallery);
                $c->nightly_rate = optional($c->ratePlans->first())->nightly_rate;

                return $c;
            });

        return response()->json(['data' => $rows]);
    }

    public function saveRoom(Request $request, ?RoomCategory $room = null): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:400'],
            'description' => ['nullable', 'string', 'max:6000'],
            'base_occupancy' => ['nullable', 'integer', 'min:1', 'max:10'],
            'max_occupancy' => ['nullable', 'integer', 'min:1', 'max:12'],
            'size_sqft' => ['nullable', 'integer', 'min:0'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:80'],
            'nightly_rate' => ['nullable', 'numeric', 'min:0'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['integer'],
            'status' => ['nullable', 'in:published,draft'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);

        $rate = $data['nightly_rate'] ?? null;
        unset($data['nightly_rate']);
        $data['status'] ??= 'published';

        if ($room) {
            $room->update($data);
        } else {
            $data['slug'] = $this->uniqueSlug(RoomCategory::class, $data['name']);
            $room = RoomCategory::create($data);
        }

        if ($rate !== null) {
            RatePlan::updateOrCreate(
                ['room_category_id' => $room->id, 'name' => 'Standard'],
                ['nightly_rate' => $rate, 'currency' => 'INR', 'is_active' => true],
            );
        }

        $room->load('ratePlans');
        $room->photos = $this->photos($room->gallery);

        return response()->json(['data' => $room], $room->wasRecentlyCreated ? 201 : 200);
    }

    public function deleteRoom(RoomCategory $room): JsonResponse
    {
        $room->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /* ----------------------------- services ---------------------------- */

    public function services(): JsonResponse
    {
        $rows = Therapy::orderBy('position')->orderBy('id')->get()->map(function ($t) {
            $t->photos = $this->photos($t->gallery);

            return $t;
        });

        return response()->json(['data' => $rows]);
    }

    public function saveService(Request $request, ?Therapy $service = null): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:400'],
            'description' => ['nullable', 'string', 'max:6000'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string', 'max:120'],
            'duration_min' => ['nullable', 'integer', 'min:5', 'max:600'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['integer'],
            'status' => ['nullable', 'in:published,draft'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);
        $data['status'] ??= 'published';

        if ($service) {
            $service->update($data);
        } else {
            $data['slug'] = $this->uniqueSlug(Therapy::class, $data['name']);
            $service = Therapy::create($data);
        }
        $service->photos = $this->photos($service->gallery);

        return response()->json(['data' => $service], $service->wasRecentlyCreated ? 201 : 200);
    }

    public function deleteService(Therapy $service): JsonResponse
    {
        $service->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /* ----------------------------- packages ---------------------------- */

    public function packages(): JsonResponse
    {
        $rows = WellnessProgram::orderBy('position')->orderBy('id')->get()->map(function ($p) {
            $p->photos = $this->photos($p->gallery);

            return $p;
        });

        return response()->json(['data' => $rows]);
    }

    public function savePackage(Request $request, ?WellnessProgram $package = null): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:400'],
            'description' => ['nullable', 'string', 'max:6000'],
            'nights' => ['nullable', 'integer', 'min:1', 'max:60'],
            'goal' => ['nullable', 'string', 'max:120'],
            'price_from' => ['nullable', 'numeric', 'min:0'],
            'doctor_led' => ['nullable', 'boolean'],
            'inclusions' => ['nullable', 'array'],
            'inclusions.*' => ['string', 'max:160'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['integer'],
            'status' => ['nullable', 'in:published,draft'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);
        $data['status'] ??= 'published';
        $data['doctor_led'] ??= true;

        if ($package) {
            $package->update($data);
        } else {
            $data['slug'] = $this->uniqueSlug(WellnessProgram::class, $data['name']);
            $package = WellnessProgram::create($data);
        }
        $package->photos = $this->photos($package->gallery);

        return response()->json(['data' => $package], $package->wasRecentlyCreated ? 201 : 200);
    }

    public function deletePackage(WellnessProgram $package): JsonResponse
    {
        $package->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
