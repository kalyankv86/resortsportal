<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    protected $table = 'enquiries';
    protected $guarded = [];

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
