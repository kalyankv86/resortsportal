<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\LedgerEntry;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\User;
use App\Services\Payments\ManualGateway;
use App\Services\Payments\PaymentGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly BookingService $bookings,
        private readonly InvoiceService $invoices,
    ) {
    }

    public function gateway(?string $method = null): PaymentGateway
    {
        if ($method === 'offline') {
            return app(ManualGateway::class);
        }
        $driver = config('payments.driver', 'mock');
        $class = config("payments.gateways.$driver") ?? config('payments.gateways.mock');

        return app($class);
    }

    /** Begin a payment for the outstanding balance (or a partial amount). */
    public function initiate(Booking $booking, string $method, ?float $amount, ?User $actor = null): array
    {
        $due = $booking->balanceDue();
        if ($due <= 0) {
            throw ValidationException::withMessages(['amount' => ['This booking is already paid in full.']]);
        }
        $amount = $amount ? round(min($amount, $due), 2) : $due;

        $gateway = $this->gateway($method);

        $payment = $booking->payments()->create([
            'type' => 'payment',
            'method' => $method,
            'gateway' => $gateway->key(),
            'amount' => $amount,
            'currency' => $booking->currency,
            'status' => 'pending',
        ]);

        $result = $gateway->initiate($payment);

        if (($result['mode'] ?? null) === 'auto') {
            $this->settle($payment, ['result' => 'success'], $actor);
            $payment->refresh();
        }

        return [
            'payment' => $this->presentPayment($payment),
            'gateway' => $result,
            'booking_status' => $booking->refresh()->status,
        ];
    }

    /** Confirm a payment has cleared (gateway callback, mock auto, or poll). */
    public function settle(Payment $payment, array $payload = [], ?User $actor = null): Payment
    {
        if ($payment->status === 'paid') {
            return $payment;
        }

        return DB::transaction(function () use ($payment, $actor) {
            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'recorded_by' => $actor?->id,
            ]);

            LedgerEntry::create([
                'entry_date' => now()->toDateString(),
                'category' => $this->categoryFor($payment->booking),
                'direction' => 'credit',
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'source_type' => Payment::class,
                'source_id' => $payment->id,
                'note' => "Payment {$payment->reference} for {$payment->booking->reference}",
            ]);

            $booking = $payment->booking;
            if ($booking->balanceDue() <= 0 && $booking->status === 'pending') {
                $this->bookings->transition($booking, 'confirmed', $actor, 'Payment received in full');
                $this->invoices->generateFor($booking->refresh());
            }

            return $payment;
        });
    }

    /** Finance / reception records an offline payment. */
    public function recordManual(Booking $booking, array $data, User $staff): Payment
    {
        $payment = $booking->payments()->create([
            'type' => 'payment',
            'method' => $data['method'] ?? 'offline',
            'gateway' => 'manual',
            'gateway_ref' => $data['reference'] ?? null,
            'amount' => round((float) $data['amount'], 2),
            'currency' => $booking->currency,
            'status' => 'pending',
            'meta' => ['recorded' => true, 'note' => $data['note'] ?? null],
        ]);

        return $this->settle($payment, [], $staff);
    }

    public function requestRefund(Booking $booking, float $amount, ?string $reason, User $actor): RefundRequest
    {
        $paid = $booking->amountPaid();
        $alreadyRefunded = (float) $booking->payments()->where('type', 'refund')->where('status', 'paid')->sum('amount');
        $refundable = round($paid - $alreadyRefunded, 2);

        if ($amount <= 0 || $amount > $refundable) {
            throw ValidationException::withMessages(['amount' => ["Refundable amount is ₹".number_format($refundable, 2).'.']]);
        }

        return RefundRequest::create([
            'booking_id' => $booking->id,
            'payment_id' => $booking->payments()->paid()->latest()->value('id'),
            'amount' => round($amount, 2),
            'currency' => $booking->currency,
            'reason' => $reason,
            'status' => 'requested',
            'requested_by' => $actor->id,
        ]);
    }

    public function reviewRefund(RefundRequest $request, bool $approve, User $reviewer, ?string $note = null): RefundRequest
    {
        if ($request->status !== 'requested') {
            throw ValidationException::withMessages(['status' => ['This refund has already been reviewed.']]);
        }

        $request->update([
            'status' => $approve ? 'approved' : 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_note' => $note,
        ]);

        if ($approve) {
            DB::transaction(function () use ($request, $reviewer) {
                $refund = $request->booking->payments()->create([
                    'type' => 'refund',
                    'method' => 'refund',
                    'gateway' => 'manual',
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'status' => 'paid',
                    'paid_at' => now(),
                    'recorded_by' => $reviewer->id,
                    'meta' => ['refund_request' => $request->reference],
                ]);

                LedgerEntry::create([
                    'entry_date' => now()->toDateString(),
                    'category' => 'refund',
                    'direction' => 'debit',
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'source_type' => Payment::class,
                    'source_id' => $refund->id,
                    'note' => "Refund {$request->reference} for {$request->booking->reference}",
                ]);

                $request->update(['status' => 'processed', 'processed_at' => now()]);
            });
        }

        return $request->refresh();
    }

    public function summary(?string $from = null, ?string $to = null): array
    {
        $from = $from ?: now()->startOfMonth()->toDateString();
        $to = $to ?: now()->endOfMonth()->toDateString();

        $rows = LedgerEntry::whereBetween('entry_date', [$from, $to])->get();
        $credit = (float) $rows->where('direction', 'credit')->sum('amount');
        $debit = (float) $rows->where('direction', 'debit')->sum('amount');

        $byCategory = $rows->where('direction', 'credit')
            ->groupBy('category')
            ->map(fn ($g) => (float) $g->sum('amount'));

        $outstanding = Booking::whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->get()
            ->sum(fn (Booking $b) => $b->balanceDue());

        return [
            'range' => compact('from', 'to'),
            'currency' => 'INR',
            'collected' => round($credit, 2),
            'refunded' => round($debit, 2),
            'net' => round($credit - $debit, 2),
            'by_category' => $byCategory,
            'outstanding' => round($outstanding, 2),
            'pending_refunds' => RefundRequest::where('status', 'requested')->count(),
        ];
    }

    private function categoryFor(Booking $booking): string
    {
        if ($booking->wellness_program_id) {
            return 'package';
        }
        if ($booking->room_category_id) {
            return 'room';
        }

        return 'other';
    }

    public function presentPayment(Payment $p): array
    {
        return [
            'reference' => $p->reference,
            'type' => $p->type,
            'method' => $p->method,
            'gateway' => $p->gateway,
            'amount' => (float) $p->amount,
            'currency' => $p->currency,
            'status' => $p->status,
            'instructions' => $p->instructions,
            'paid_at' => $p->paid_at,
            'created_at' => $p->created_at,
        ];
    }
}
