<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    protected $guarded = [];
    protected $casts = [
        'entry_date' => 'date:Y-m-d',
        'amount' => 'decimal:2',
    ];
}
