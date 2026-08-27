<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $guarded = [];
    protected $casts = ['items' => 'array', 'issued_at' => 'datetime'];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
