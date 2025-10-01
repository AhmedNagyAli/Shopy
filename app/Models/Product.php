<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'main_image', 'is_active'
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class);
    }
    

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }
    public function discounts()
    {
        return $this->morphMany(Discount::class, 'discountable');
    }
    
    public function wishlistedBy()
{
    return $this->belongsToMany(User::class, 'wishlists')
                ->withTimestamps();
}

}
