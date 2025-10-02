<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    
    
    protected $fillable = ['product_id', 'sku', 'price', 'stock', 'image', 'is_active','is_default'];


    protected static function booted()
    {
        static::creating(function ($variant) {
            // Only generate if SKU is empty
            if (empty($variant->sku)) {
                // Get latest variant ID
                $latest = ProductVariant::latest('id')->first();
                $nextId = $latest ? $latest->id + 1 : 1;
                $variant->sku = 'SKU-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
            }
        });
    }



    protected $appends = ['final_price']; 
    protected $with = ['discounts'];


    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    

    public function values()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_variant_values')
         ->with('attribute'); 
    }
    public function discounts()
    {
        return $this->morphMany(Discount::class, 'discountable');
    }
public function getFinalPriceAttribute()
{
    // 1️⃣ Check variant-level discount
    $variantDiscount = $this->discounts()
        ->where('is_active', true)
        ->where(function ($q) {
            $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
        })
        ->where(function ($q) {
            $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
        })
        ->latest()
        ->first();

    if ($variantDiscount) {
        return $this->applyDiscount($this->price, $variantDiscount);
    }

    // 2️⃣ If no variant discount, check product-level discount
    $productDiscount = $this->product->discounts()
        ->where('is_active', true)
        ->where(function ($q) {
            $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
        })
        ->where(function ($q) {
            $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
        })
        ->latest()
        ->first();

    if ($productDiscount) {
        return $this->applyDiscount($this->price, $productDiscount);
    }

    // 3️⃣ No discount, return base price
    return $this->price;
}

// Helper method to apply a discount to a price
protected function applyDiscount(float $price, $discount): float
{
    if ($discount->type === 'percentage') {
        return round($price * (1 - $discount->value / 100), 2);
    }

    if ($discount->type === 'fixed') {
        return max(0, $price - $discount->value);
    }

    return $price;
}

}
