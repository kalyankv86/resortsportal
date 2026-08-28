<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\Event;
use App\Models\Faq;
use App\Models\MediaAsset;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function page(string $slug): JsonResponse
    {
        return response()->json([
            'data' => CmsPage::published()->with('sections')->where('slug', $slug)->firstOrFail(),
        ]);
    }

    public function testimonials(): JsonResponse
    {
        return response()->json([
            'data' => Testimonial::published()->latest('published_at')->limit(24)->get(),
        ]);
    }

    public function events(): JsonResponse
    {
        $events = Event::where('status', 'published')
            ->with('media:id,url,alt')
            ->get()
            ->sortBy(fn ($e) => $e->starts_at?->timestamp ?? PHP_INT_MAX)
            ->values();

        return response()->json(['data' => $events]);
    }

    public function gallery(): JsonResponse
    {
        return response()->json([
            'data' => MediaAsset::with('category:id,slug,name')
                ->orderBy('position')
                ->orderByDesc('id')
                ->limit(120)
                ->get(['id', 'media_category_id', 'url', 'alt', 'width', 'height']),
        ]);
    }

    public function faqs(Request $request): JsonResponse
    {
        return response()->json([
            'data' => Faq::published()
                ->when($request->query('group'), fn ($q, $g) => $q->where('group', $g))
                ->orderBy('position')
                ->get(['id', 'group', 'question', 'answer']),
        ]);
    }
}
