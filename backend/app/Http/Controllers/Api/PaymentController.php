<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\InvoiceService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
        private readonly InvoiceService $invoices,
    ) {
    }

    public function methods(): JsonResponse
    {
        return response()->json([
            'data' => config('payments.methods'),
            'driver' => config('payments.driver'),
        ]);
    }

    public function pay(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::with('guest')->where('reference', $reference)->firstOrFail();
        $this->authorizeBooking($request, $booking);

        $data = $request->validate([
            'method' => ['required', 'string'],
            'amount' => ['nullable', 'numeric', 'min:1'],
        ]);

        $result = $this->payments->initiate(
            $booking,
            $data['method'],
            isset($data['amount']) ? (float) $data['amount'] : null,
            Auth::guard('api')->user(),
        );

        return response()->json(['data' => $result]);
    }

    /** Gateway callback / webhook (real gateways). Secured by shared secret. */
    public function callback(Request $request, string $reference): JsonResponse
    {
        $secret = $request->header('X-Callback-Secret') ?: $request->query('secret');
        abort_unless(hash_equals(config('payments.callback_secret'), (string) $secret), 401);

        $payment = Payment::where('reference', $reference)->firstOrFail();
        $gateway = $this->payments->gateway($payment->method);

        if ($gateway->verify($payment, $request->all())) {
            $this->payments->settle($payment, $request->all());

            return response()->json(['ok' => true, 'status' => 'paid']);
        }

        $payment->update(['status' => 'failed', 'failed_at' => now()]);

        return response()->json(['ok' => false, 'status' => 'failed']);
    }

    public function invoice(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::with('invoice')->where('reference', $reference)->firstOrFail();
        $this->authorizeBooking($request, $booking);

        $invoice = $booking->invoice ?: $this->invoices->generateFor($booking);

        return response()->json(['data' => [
            'number' => $invoice->number,
            'status' => $invoice->status,
            'issued_at' => $invoice->issued_at,
            'buyer_name' => $invoice->buyer_name,
            'line_items' => $invoice->line_items,
            'subtotal' => (float) $invoice->subtotal,
            'cgst' => (float) $invoice->cgst,
            'sgst' => (float) $invoice->sgst,
            'igst' => (float) $invoice->igst,
            'total' => (float) $invoice->total,
            'pdf_url' => rtrim(config('app.url'), '/')."/api/bookings/{$reference}/invoice.pdf".$this->passThroughAuth($request),
        ]]);
    }

    public function invoicePdf(Request $request, string $reference)
    {
        $booking = Booking::with('invoice')->where('reference', $reference)->firstOrFail();
        $this->authorizeBooking($request, $booking);

        $invoice = $booking->invoice ?: $this->invoices->generateFor($booking);
        $path = $this->invoices->pdfPath($invoice);

        return response()->download($path, str_replace('/', '-', $invoice->number).'.pdf', [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /* ---------------------------------------------------------------- */

    private function authorizeBooking(Request $request, Booking $booking): void
    {
        $user = Auth::guard('api')->user();
        if ($user && ($user->is_staff || $booking->guest?->user_id === $user->id)) {
            return;
        }
        $token = (string) $request->query('t');
        if ($token !== '' && hash_equals((string) $booking->qr_token, $token)) {
            return;
        }
        $email = strtolower((string) $request->query('email'));
        if ($email !== '' && $email === strtolower((string) $booking->contact_email)) {
            return;
        }
        abort(403, 'Open this from your booking confirmation, or sign in.');
    }

    private function passThroughAuth(Request $request): string
    {
        if ($t = $request->query('t')) {
            return '?t='.urlencode($t);
        }
        if ($e = $request->query('email')) {
            return '?email='.urlencode($e);
        }

        return '';
    }
}
