<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function enquiry(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:32'],
            'topic' => ['nullable', 'string', 'max:80'],
            'message' => ['nullable', 'string', 'max:4000'],
        ]);

        $enquiry = Enquiry::create($data + ['source' => 'web', 'status' => 'new']);

        return response()->json(['message' => 'Thank you — our team will be in touch.', 'id' => $enquiry->id], 201);
    }

    public function newsletter(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:160']]);

        $sub = NewsletterSubscriber::firstOrCreate(
            ['email' => strtolower($data['email'])],
            ['status' => 'pending', 'source' => 'web'],
        );

        return response()->json(['message' => 'Subscribed.', 'id' => $sub->id], 201);
    }
}
