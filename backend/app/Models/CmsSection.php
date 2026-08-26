<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsSection extends Model
{
    protected $guarded = [];
    protected $casts = ['data' => 'array'];

    public function page()
    {
        return $this->belongsTo(CmsPage::class, 'cms_page_id');
    }
}
