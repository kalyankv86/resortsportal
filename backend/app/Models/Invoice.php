<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $guarded = [];
    protected $casts = ['line_items' => 'array', 'issued_at' => 'datetime'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function gstType(): string
    {
        return ((float) $this->igst) > 0 ? 'igst' : 'cgst_sgst';
    }
}
