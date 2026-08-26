<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $guarded = [];
    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'questionnaire' => 'array',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Booking $b) {
            $b->reference ??= 'CW-'.now()->format('ymd').'-'.strtoupper(Str::random(5));
            $b->qr_token ??= Str::random(48);
        });
    }

    public function documents()
    {
        return $this->hasMany(BookingDocument::class);
    }

    public function amountPaid(): float
    {
        return (float) $this->payments()->where('status', 'paid')->sum('amount');
    }

    public function balanceDue(): float
    {
        return round((float) $this->total - $this->amountPaid(), 2);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function program()
    {
        return $this->belongsTo(WellnessProgram::class, 'wellness_program_id');
    }

    public function roomCategory()
    {
        return $this->belongsTo(RoomCategory::class);
    }

    public function guestsList()
    {
        return $this->hasMany(BookingGuest::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(BookingStatusHistory::class)->latest();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}
