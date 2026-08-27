<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DietChart extends Model
{
    protected $guarded = [];
    protected $casts = ['meals' => 'array', 'avoid' => 'array', 'effective_from' => 'date:Y-m-d'];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
}
