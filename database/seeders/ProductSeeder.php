<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Classic White T-Shirt', 'price' => 20, 'description' => 'Soft cotton white t-shirt'],
            ['name' => 'Black Hoodie', 'price' => 45, 'description' => 'Warm hoodie for winter'],
            ['name' => 'Running Shoes', 'price' => 60, 'description' => 'Lightweight running shoes'],
        ];

        foreach ($products as $prod) {
            $product = Product::create([
                'name' => $prod['name'],
                'slug' => Str::slug($prod['name']),
                'description' => $prod['description'],
                'price' => $prod['price'],
                'main_image' => 'products/default.jpg',
                'is_active' => true,
            ]);

            // Attach product to random category
            $category = Category::inRandomOrder()->first();
            if ($category) {
                $product->categories()->attach($category->id);
            }

            // Add sample image
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => 'products/sample.jpg',
                'is_main' => true,
            ]);

            // Add a product variant
            ProductVariant::create([
                'product_id' => $product->id,
                'sku' => 'SKU-' . strtoupper(Str::random(6)),
                'price' => $prod['price'],
                'stock' => rand(10, 50),
                'image' => 'products/variant.jpg',
                'is_active' => true,
            ]);
        }
    }
}