<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCategory extends Model
{
    protected $guarded = [];
    protected $casts = ['amenities' => 'array'];

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function ratePlans()
    {
        return $this->hasMany(RatePlan::class)->where('is_active', true);
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
