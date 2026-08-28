<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Therapy extends Model
{
    protected $table = 'therapies';
    protected $guarded = [];
    protected $casts = ['benefits' => 'array', 'price' => 'decimal:2', 'gallery' => 'array'];

    public function category()
    {
        return $this->belongsTo(TherapyCategory::class, 'therapy_category_id');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
