<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    protected $guarded = [];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }
}
