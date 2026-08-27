<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressEntry extends Model
{
    protected $guarded = [];
    protected $casts = ['entry_date' => 'date:Y-m-d', 'metrics' => 'array'];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }
}
