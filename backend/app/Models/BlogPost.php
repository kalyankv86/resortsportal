<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $guarded = [];
    protected $casts = ['published_at' => 'datetime'];

    public function cover()
    {
        return $this->belongsTo(MediaAsset::class, 'cover_media_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
