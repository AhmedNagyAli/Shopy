<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'sku', 'price', 'stock', 'image', 'is_active'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    

    public function values()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_variant_values');
    }
    public function discounts()
    {
        return $this->morphMany(Discount::class, 'discountable');
    }
     public function getFinalPriceAttribute()
    {
        $activeDiscount = $this->discounts()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest()
            ->first();

        if (! $activeDiscount) {
            return $this->price;
        }

        if ($activeDiscount->type === 'percentage') {
            return round($this->price * (1 - $activeDiscount->value / 100), 2);
        }

        if ($activeDiscount->type === 'fixed') {
            return max(0, $this->price - $activeDiscount->value);
        }

        return $this->price;
    }
}
