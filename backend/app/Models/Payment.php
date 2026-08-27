<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payment extends Model
{
    protected $guarded = [];
    protected $casts = [
        'meta' => 'array',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Payment $p) {
            $prefix = ($p->type ?? 'payment') === 'refund' ? 'RFD' : 'PAY';
            $p->reference ??= $prefix.'-'.now()->format('ymd').'-'.strtoupper(Str::random(6));
        });
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function scopePayments($q)
    {
        return $q->where('type', 'payment');
    }

    public function scopePaid($q)
    {
        return $q->where('status', 'paid');
    }
}
