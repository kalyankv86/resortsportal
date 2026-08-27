<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $guarded = [];
    protected $casts = [
        'dob' => 'date',
        'address' => 'array',
        'emergency_contact' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function dietCharts()
    {
        return $this->hasMany(DietChart::class)->latest();
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class)->latest();
    }

    public function progressEntries()
    {
        return $this->hasMany(ProgressEntry::class)->orderBy('entry_date');
    }

    public function doshaAssessments()
    {
        return $this->hasMany(DoshaAssessment::class)->latest();
    }

    public function loyaltyLedger()
    {
        return $this->hasMany(LoyaltyLedger::class)->latest();
    }

    public function wishlist()
    {
        return $this->hasMany(WishlistItem::class)->latest();
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function awardPoints(int $points, string $reason, ?Model $source = null): void
    {
        $balance = $this->loyalty_points + $points;
        $this->loyaltyLedger()->create([
            'points' => $points,
            'balance_after' => $balance,
            'reason' => $reason,
            'source_type' => $source ? $source::class : null,
            'source_id' => $source?->getKey(),
        ]);
        $this->update([
            'loyalty_points' => $balance,
            'loyalty_tier' => match (true) {
                $balance >= 20000 => 'Sanctuary',
                $balance >= 8000 => 'Forest',
                default => 'Green',
            },
        ]);
    }
}
