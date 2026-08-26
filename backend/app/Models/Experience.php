<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $guarded = [];

    public function media()
    {
        return $this->belongsTo(MediaAsset::class, 'media_id');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
