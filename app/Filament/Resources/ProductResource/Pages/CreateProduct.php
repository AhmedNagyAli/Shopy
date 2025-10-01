<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;
    protected function afterCreate(): void
    {
        // If no variants were added in the form
        if ($this->record->variants()->count() === 0) {
            $this->record->variants()->create([
                'product_id'=>$this->record->id,
                'sku'       => strtoupper(Str::random(8)), // generate unique SKU
                'price'     => $this->record->price,       // fallback to product price
                'stock'     => 1,                          // default stock
                'is_active' => $this->record->is_active,   // match product status
                'image'     => $this->record->main_image,  // fallback to product image
            ]);
        }
    }
}
