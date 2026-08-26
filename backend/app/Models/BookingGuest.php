<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingGuest extends Model
{
    protected $guarded = [];
    protected $casts = ['is_primary' => 'boolean'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
