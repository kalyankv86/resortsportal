<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RefundRequest extends Model
{
    use \App\Models\Concerns\RecordsAudit;
    protected $guarded = [];
    protected $casts = [
        'amount' => 'decimal:2',
        'reviewed_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(fn (self $r) => $r->reference ??= 'REF-'.now()->format('ymd').'-'.strtoupper(Str::random(5)));
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
