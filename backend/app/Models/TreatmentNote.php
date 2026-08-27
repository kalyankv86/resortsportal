<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreatmentNote extends Model
{
    protected $guarded = [];
    protected $casts = ['consumables' => 'array'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function therapy()
    {
        return $this->belongsTo(Therapy::class);
    }
}
