<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomAvailability extends Model
{
    protected $table = 'room_availability';
    protected $guarded = [];
    protected $casts = ['date' => 'date'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
