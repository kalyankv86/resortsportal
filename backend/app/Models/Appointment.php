<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $guarded = [];
    protected $casts = ['scheduled_at' => 'datetime'];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function therapist()
    {
        return $this->belongsTo(Therapist::class);
    }

    public function therapy()
    {
        return $this->belongsTo(Therapy::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
