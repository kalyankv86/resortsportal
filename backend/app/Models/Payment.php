<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payment extends Model
{
    protected $guarded = [];
    protected $casts = ['meta' => 'array', 'paid_at' => 'datetime', 'amount' => 'decimal:2'];

    protected static function booted(): void
    {
        static::creating(function (Payment $p) {
            $p->reference ??= 'PAY-'.now()->format('ymd').'-'.strtoupper(Str::random(6));
        });
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
