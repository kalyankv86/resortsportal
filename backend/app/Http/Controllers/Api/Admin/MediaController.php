<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Models\MediaCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Admin media library — upload / list / delete the images that power the
 * public Gallery (and any picture attached to an Event). Files are written to
 * the `media` disk (Nginx serves them at /media/…), the row keeps the public
 * URL so the frontend never needs the disk.
 */
class MediaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => MediaAsset::with('category:id,slug,name')
                ->orderBy('position')
                ->orderByDesc('id')
                ->get(['id', 'media_category_id', 'url', 'alt', 'width', 'height', 'mime', 'size', 'position']),
            'categories' => MediaCategory::orderBy('position')->get(['id', 'slug', 'name']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'alt' => ['nullable', 'string', 'max:200'],
            'category' => ['nullable', 'string', 'max:60'],
        ]);

        $file = $request->file('image');
        $name = Str::uuid().'.'.strtolower($file->getClientOriginalExtension() ?: 'jpg');
        $path = $file->storeAs('uploads', $name, 'media');

        [$width, $height] = @getimagesize($file->getRealPath()) ?: [null, null];

        $categoryId = null;
        if (! empty($data['category'])) {
            $categoryId = MediaCategory::firstOrCreate(
                ['slug' => Str::slug($data['category'])],
                ['name' => $data['category']],
            )->id;
        }

        $asset = MediaAsset::create([
            'media_category_id' => $categoryId,
            'disk' => 'media',
            'path' => $path,
            'url' => rtrim(config('filesystems.disks.media.url'), '/').'/'.$path,
            'mime' => $file->getClientMimeType(),
            'width' => $width,
            'height' => $height,
            'size' => $file->getSize(),
            'alt' => $data['alt'] ?? null,
            'position' => (int) MediaAsset::max('position') + 1,
        ]);

        return response()->json(['data' => $asset->load('category:id,slug,name')], 201);
    }

    public function destroy(MediaAsset $mediaAsset): JsonResponse
    {
        if ($mediaAsset->disk === 'media' && $mediaAsset->path) {
            Storage::disk('media')->delete($mediaAsset->path);
        }
        $mediaAsset->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
