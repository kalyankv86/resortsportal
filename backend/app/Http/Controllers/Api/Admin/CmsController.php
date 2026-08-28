<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\Event;
use App\Models\Faq;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CmsController extends Controller
{
    public function pages(): JsonResponse
    {
        return response()->json([
            'data' => CmsPage::withCount('sections')->orderBy('position')->get([
                'id', 'slug', 'title', 'eyebrow', 'status', 'hero_category', 'updated_at',
            ]),
        ]);
    }

    public function page(CmsPage $page): JsonResponse
    {
        return response()->json(['data' => $page->load('sections')]);
    }

    public function updatePage(Request $request, CmsPage $page): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:160'],
            'eyebrow' => ['sometimes', 'nullable', 'string', 'max:80'],
            'summary' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'hero_category' => ['sometimes', 'nullable', 'string', 'max:40'],
            'status' => ['sometimes', 'in:draft,published'],
            'seo' => ['sometimes', 'array'],
        ]);
        if (($data['status'] ?? null) === 'published' && ! $page->published_at) {
            $data['published_at'] = now();
        }
        $page->update($data);

        return response()->json(['data' => $page->fresh()]);
    }

    public function updateSection(Request $request, CmsSection $section): JsonResponse
    {
        $data = $request->validate([
            'data' => ['required', 'array'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ]);
        $section->update($data);

        return response()->json(['data' => $section]);
    }

    public function createSection(Request $request, CmsPage $page): JsonResponse
    {
        $data = $request->validate([
            'kind' => ['required', 'string', 'max:40'],
            'data' => ['required', 'array'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);
        $section = $page->sections()->create($data + [
            'position' => $data['position'] ?? ($page->sections()->max('position') + 1),
        ]);

        return response()->json(['data' => $section], 201);
    }

    public function deleteSection(CmsSection $section): JsonResponse
    {
        $section->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /* ---- testimonials ---- */
    public function testimonials(): JsonResponse
    {
        return response()->json(['data' => Testimonial::latest()->get()]);
    }

    public function saveTestimonial(Request $request, ?Testimonial $testimonial = null): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'origin' => ['nullable', 'string', 'max:120'],
            'quote' => ['required', 'string', 'max:2000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'status' => ['nullable', 'in:draft,published'],
        ]);
        $data['published_at'] ??= now();
        $row = $testimonial?->fill($data)->save() ? $testimonial : Testimonial::create($data);

        return response()->json(['data' => $row], $testimonial ? 200 : 201);
    }

    public function deleteTestimonial(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /* ---- faqs ---- */
    public function faqs(): JsonResponse
    {
        return response()->json(['data' => Faq::orderBy('group')->orderBy('position')->get()]);
    }

    public function saveFaq(Request $request, ?Faq $faq = null): JsonResponse
    {
        $data = $request->validate([
            'group' => ['required', 'string', 'max:60'],
            'question' => ['required', 'string', 'max:300'],
            'answer' => ['required', 'string', 'max:4000'],
            'position' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'in:draft,published'],
        ]);
        $row = $faq?->fill($data)->save() ? $faq : Faq::create($data);

        return response()->json(['data' => $row], $faq ? 200 : 201);
    }

    public function deleteFaq(Faq $faq): JsonResponse
    {
        $faq->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /* ---- events ---- */
    public function events(): JsonResponse
    {
        return response()->json([
            'data' => Event::with('media:id,url,alt')->orderByDesc('starts_at')->orderByDesc('id')->get(),
        ]);
    }

    public function saveEvent(Request $request, ?Event $event = null): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:4000'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'location' => ['nullable', 'string', 'max:160'],
            'media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if (! $event) {
            $base = Str::slug($data['title']) ?: 'event';
            $slug = $base;
            for ($i = 2; Event::where('slug', $slug)->exists(); $i++) {
                $slug = "{$base}-{$i}";
            }
            $data['slug'] = $slug;
        }
        $data['status'] ??= 'published';

        $row = $event ? tap($event)->update($data) : Event::create($data);

        return response()->json(['data' => $row->load('media:id,url,alt')], $event ? 200 : 201);
    }

    public function deleteEvent(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
