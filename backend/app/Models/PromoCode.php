<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $guarded = [];
    protected $casts = [
        'value' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'is_active' => 'boolean',
    ];

    public function isValidFor(float $amount, int $nights, ?\DateTimeInterface $on = null): bool
    {
        $on ??= now();
        if (! $this->is_active) {
            return false;
        }
        if ($this->valid_from && $on < $this->valid_from) {
            return false;
        }
        if ($this->valid_to && $on > $this->valid_to->endOfDay()) {
            return false;
        }
        if ($this->min_amount && $amount < (float) $this->min_amount) {
            return false;
        }
        if ($this->min_nights && $nights < $this->min_nights) {
            return false;
        }
        if ($this->max_redemptions && $this->redeemed >= $this->max_redemptions) {
            return false;
        }

        return true;
    }

    public function discountOn(float $amount): float
    {
        $raw = $this->type === 'fixed'
            ? (float) $this->value
            : $amount * ((float) $this->value / 100);

        return round(min($raw, $amount), 2);
    }
}
