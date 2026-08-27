<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Support\Str;

/** Auto-approving gateway for building and testing the payment flow. */
class MockGateway implements PaymentGateway
{
    public function initiate(Payment $payment): array
    {
        $payment->update(['gateway_ref' => 'MOCK-'.strtoupper(Str::random(12))]);

        return [
            'mode' => 'auto',
            'gateway_ref' => $payment->gateway_ref,
            'message' => 'Test gateway — payment will be marked successful.',
        ];
    }

    public function verify(Payment $payment, array $payload): bool
    {
        return ($payload['result'] ?? 'success') === 'success';
    }

    public function key(): string
    {
        return 'mock';
    }
}
