<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_cart_value',
        'usage_limit', 'used_count',
        'starts_at', 'ends_at', 'active'
    ];

    public function isValid($cartTotal): bool
    {
        return $this->active
            && (! $this->starts_at || $this->starts_at <= now())
            && (! $this->ends_at || $this->ends_at >= now())
            && (! $this->min_cart_value || $cartTotal >= $this->min_cart_value)
            && (! $this->usage_limit || $this->used_count < $this->usage_limit);
    }

    public function applyDiscount($cartTotal)
    {
        if (! $this->isValid($cartTotal)) {
            return $cartTotal;
        }

        if ($this->type === 'percentage') {
            return $cartTotal - ($cartTotal * ($this->value / 100));
        }

        return max(0, $cartTotal - $this->value);
    }
}
