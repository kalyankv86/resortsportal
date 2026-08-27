<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyLedger extends Model
{
    protected $table = 'loyalty_ledger';
    protected $guarded = [];

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }
}
