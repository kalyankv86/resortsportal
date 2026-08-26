<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $guarded = [];

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
