<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealOrder extends Model
{
    protected $guarded = [];
    protected $casts = ['items' => 'array', 'service_date' => 'date:Y-m-d'];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function dietChart()
    {
        return $this->belongsTo(DietChart::class);
    }
}
