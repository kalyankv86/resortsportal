<?php

return [
    /*
    | Active gateway driver. Swap in the CUTM internal payment API by adding a
    | class under App\Services\Payments implementing PaymentGateway and mapping
    | its key here.
    |
    |   mock   — auto-approves; for building / testing the flow
    |   manual — offline: guest gets instructions, staff records the payment
    */
    'driver' => env('PAYMENT_DRIVER', 'mock'),

    'gateways' => [
        'mock' => \App\Services\Payments\MockGateway::class,
        'manual' => \App\Services\Payments\ManualGateway::class,
    ],

    /* Methods offered to the guest at checkout. */
    'methods' => [
        ['key' => 'upi', 'label' => 'UPI'],
        ['key' => 'card', 'label' => 'Credit / Debit card'],
        ['key' => 'netbanking', 'label' => 'Net banking'],
        ['key' => 'qr', 'label' => 'Scan & pay (QR)'],
        ['key' => 'offline', 'label' => 'Bank transfer / pay at the wellness centre'],
    ],

    /* Shared secret the gateway callback must present (mock + real webhooks). */
    'callback_secret' => env('PAYMENT_CALLBACK_SECRET', 'cwetr-dev-callback-secret'),

    'manual_instructions' => env(
        'PAYMENT_MANUAL_INSTRUCTIONS',
        "Bank transfer to Centurion University — A/C 00000000000, IFSC XXXX0000000, ".
        "or pay at the reservations desk. Quote your booking reference as the payment note."
    ),

    /* GST */
    'gst' => [
        'gstin' => env('CWETR_GSTIN', ''),
        'legal_name' => env('CWETR_LEGAL_NAME', 'Centurion University of Technology and Management'),
        'home_state' => env('CWETR_GST_STATE', 'Odisha'),
        'address' => env('CWETR_GST_ADDRESS', 'Centurion University Campus, Odisha, India'),
    ],
];
