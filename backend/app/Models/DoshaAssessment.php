<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoshaAssessment extends Model
{
    protected $guarded = [];
    protected $casts = ['assessed_at' => 'datetime'];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
