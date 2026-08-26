<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(RoomCategory::class, 'room_category_id');
    }
}
