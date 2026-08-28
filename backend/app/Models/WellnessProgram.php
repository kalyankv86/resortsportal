<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WellnessProgram extends Model
{
    protected $guarded = [];
    protected $casts = [
        'inclusions' => 'array',
        'daily_schedule' => 'array',
        'doctor_led' => 'boolean',
        'price_from' => 'decimal:2',
        'gallery' => 'array',
    ];

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
