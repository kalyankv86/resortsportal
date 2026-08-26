<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RatePlan extends Model
{
    protected $guarded = [];
    protected $casts = [
        'inclusions' => 'array',
        'season' => 'array',
        'is_active' => 'boolean',
        'refundable' => 'boolean',
        'nightly_rate' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }
}
