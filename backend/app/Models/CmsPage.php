<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsPage extends Model
{
    use \App\Models\Concerns\RecordsAudit;
    protected $guarded = [];
    protected $casts = ['seo' => 'array', 'published_at' => 'datetime'];

    public function sections()
    {
        return $this->hasMany(CmsSection::class)->orderBy('position');
    }

    public function scopePublished($q)
    {
        return $q->where('status', 'published');
    }
}
