<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TherapyCategory extends Model
{
    protected $guarded = [];

    public function therapies()
    {
        return $this->hasMany(Therapy::class);
    }
}
