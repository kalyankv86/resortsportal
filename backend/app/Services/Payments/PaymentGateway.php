<?php

namespace App\Services\Payments;

use App\Models\Payment;

interface PaymentGateway
{
    /**
     * Begin a payment. Return an instruction set for the client:
     *   ['mode' => 'auto']                    → settled immediately (mock)
     *   ['mode' => 'redirect', 'url' => ...]  → send the guest to a hosted page
     *   ['mode' => 'instructions', 'text' => ...] → offline / manual settlement
     */
    public function initiate(Payment $payment): array;

    /**
     * Verify a gateway callback / polled status. Return true when the payment
     * has actually cleared. $payload is the raw callback body.
     */
    public function verify(Payment $payment, array $payload): bool;

    public function key(): string;
}
