<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $guarded = [];
    protected $casts = ['published_at' => 'datetime', 'rating' => 'integer'];

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
