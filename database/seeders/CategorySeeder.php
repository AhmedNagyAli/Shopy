<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'T-Shirts', 'description' => 'Casual and stylish T-Shirts'],
            ['name' => 'Hoodies', 'description' => 'Warm and cozy hoodies'],
            ['name' => 'Shoes', 'description' => 'Comfortable and trendy shoes'],
            ['name' => 'Accessories', 'description' => 'Fashionable accessories'],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'description' => $cat['description'],
            ]);
        }
    }
}
