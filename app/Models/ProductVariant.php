<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    
    
    protected $fillable = ['product_id', 'sku', 'price', 'stock', 'image', 'is_active','is_default'];


    protected static function booted()
    {
        // Auto-generate SKU
        static::creating(function ($variant) {
            if (empty($variant->sku)) {
                $latest = ProductVariant::latest('id')->first();
                $nextId = $latest ? $latest->id + 1 : 1;
                $variant->sku = 'SKU-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
            }

            // If it's the first variant for this product → make it default
            if (!self::where('product_id', $variant->product_id)->exists()) {
                $variant->is_default = true;
            }
        });

        // Ensure only one default per product
        static::saved(function ($variant) {
            if ($variant->is_default) {
                self::where('product_id', $variant->product_id)
                    ->where('id', '!=', $variant->id)
                    ->update(['is_default' => false]);
            }
        });

        // When deleting a variant → ensure another one becomes default
        static::deleted(function ($variant) {
            if ($variant->is_default) {
                $another = self::where('product_id', $variant->product_id)->first();
                if ($another) {
                    $another->update(['is_default' => true]);
                }
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
