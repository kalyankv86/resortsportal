<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaAsset extends Model
{
    protected $guarded = [];
    protected $casts = ['meta' => 'array'];

    public function category()
    {
        return $this->belongsTo(MediaCategory::class, 'media_category_id');
    }
}
