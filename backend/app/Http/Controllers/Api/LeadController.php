<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\NewsletterSubscriber;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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

        $this->alert($enquiry);

        return response()->json(['message' => 'Thank you — our team will be in touch.', 'id' => $enquiry->id], 201);
    }

    /** Email the reservations desk. Never fails the request if mail is down. */
    private function alert(Enquiry $enquiry): void
    {
        $to = Setting::get('contact.email', config('mail.from.address'));
        if (! $to) {
            return;
        }

        $body = "New enquiry from the website\n\n"
            ."Name:  {$enquiry->name}\n"
            ."Email: {$enquiry->email}\n"
            .'Phone: '.($enquiry->phone ?: '—')."\n"
            .'Topic: '.($enquiry->topic ?: '—')."\n\n"
            ."Message:\n".($enquiry->message ?: '—')."\n";

        try {
            Mail::raw($body, function ($m) use ($to, $enquiry) {
                $m->to($to)
                    ->replyTo($enquiry->email, $enquiry->name)
                    ->subject('Website enquiry — '.$enquiry->name);
            });
        } catch (\Throwable $e) {
            report($e);
        }
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
