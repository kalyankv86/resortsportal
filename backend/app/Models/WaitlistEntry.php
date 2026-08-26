<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitlistEntry extends Model
{
    protected $guarded = [];
    protected $casts = [
        'preferred_check_in' => 'date',
        'preferred_check_out' => 'date',
    ];

    public function program()
    {
        return $this->belongsTo(WellnessProgram::class, 'wellness_program_id');
    }

    public function roomCategory()
    {
        return $this->belongsTo(RoomCategory::class);
    }
}
