<?php

namespace App\Services\Payments;

use App\Models\Payment;

/** Offline settlement — guest gets instructions, finance staff records receipt. */
class ManualGateway implements PaymentGateway
{
    public function initiate(Payment $payment): array
    {
        $text = config('payments.manual_instructions');
        $payment->update(['instructions' => $text]);

        return [
            'mode' => 'instructions',
            'text' => $text,
            'reference_note' => $payment->booking->reference,
        ];
    }

    /** Manual payments are cleared by staff via record-payment, not a callback. */
    public function verify(Payment $payment, array $payload): bool
    {
        return false;
    }

    public function key(): string
    {
        return 'manual';
    }
}
