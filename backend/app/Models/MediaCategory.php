<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaCategory extends Model
{
    protected $guarded = [];

    public function assets()
    {
        return $this->hasMany(MediaAsset::class)->orderBy('position');
    }
}
