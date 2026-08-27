<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinanceController extends Controller
{
    public function __construct(private readonly PaymentService $payments)
    {
    }

    public function summary(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->payments->summary($request->query('from'), $request->query('to')),
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $rows = Payment::query()
            ->with('booking:id,reference,contact_email')
            ->when($request->query('type'), fn ($q, $t) => $q->where('type', $t))
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(min(100, (int) $request->query('per_page', 25)));

        return response()->json($rows);
    }

    public function recordPayment(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'method' => ['nullable', 'string', 'max:32'],
            'reference' => ['nullable', 'string', 'max:64'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $payment = $this->payments->recordManual($booking, $data, Auth::guard('api')->user());

        return response()->json([
            'data' => $this->payments->presentPayment($payment),
            'booking_status' => $booking->refresh()->status,
        ], 201);
    }

    public function refunds(Request $request): JsonResponse
    {
        $rows = RefundRequest::query()
            ->with(['booking:id,reference,contact_email', 'requester:id,name', 'reviewer:id,name'])
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(50);

        return response()->json($rows);
    }

    public function requestRefund(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $req = $this->payments->requestRefund(
            $booking,
            (float) $data['amount'],
            $data['reason'] ?? null,
            Auth::guard('api')->user(),
        );

        return response()->json(['data' => $req], 201);
    }

    public function reviewRefund(Request $request, RefundRequest $refundRequest): JsonResponse
    {
        $data = $request->validate([
            'approve' => ['required', 'boolean'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $reviewed = $this->payments->reviewRefund(
            $refundRequest,
            $data['approve'],
            Auth::guard('api')->user(),
            $data['note'] ?? null,
        );

        return response()->json(['data' => $reviewed]);
    }
}
