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
        $price = $this->price;

        // Variant discount takes priority
        $discount = $this->discounts()
            ->where('active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest()->first();

        if (! $discount) {
            // Fallback: product-level discount
            $discount = $this->product->discounts()
                ->where('active', true)
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })
                ->where(function ($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
                })
                ->latest()->first();
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
}
