<?php

namespace App\Helpers;

use App\Models\ProductVariant;
use App\Models\Coupon;

class PriceHelper
{
    /**
     * Calculate final price of a variant with discounts
     */
    public static function calculateFinalPrice(ProductVariant $variant): float
    {
        $price = $variant->price;

        // Variant-level discount takes priority
        $discount = $variant->discounts()
            ->where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest()
            ->first();

        if (! $discount) {
            // Fall back to product discount
            $discount = $variant->product->discounts()
                ->where('active', true)
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                })
                ->latest()
                ->first();
        }

        if ($discount) {
            if ($discount->type === 'percentage') {
                $price -= ($price * ($discount->value / 100));
            } else {
                $price -= $discount->value;
            }
        }

        return max(0, $price);
    }

    /**
     * Apply coupon to a cart total
     */
    public static function applyCoupon(?Coupon $coupon, float $cartTotal): float
    {
        if (! $coupon || ! $coupon->isValid($cartTotal)) {
            return $cartTotal;
        }

        if ($coupon->type === 'percentage') {
            $cartTotal -= ($cartTotal * ($coupon->value / 100));
        } else {
            $cartTotal -= $coupon->value;
        }

        return max(0, $cartTotal);
    }
}
