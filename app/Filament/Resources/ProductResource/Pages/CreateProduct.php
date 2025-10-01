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
        // Ensure the product always has at least one variant
        if ($this->record->variants()->count() === 0) {
            $this->record->variants()->create([
                'sku'   => strtoupper(Str::random(8)), // auto SKU
                'price' => $this->record->price,       // use base product price
                'stock' => 0,
                'is_active' => true,
            ]);
        }
    }
}
