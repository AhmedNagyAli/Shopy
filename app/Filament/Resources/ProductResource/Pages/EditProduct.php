<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Str;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
    protected function afterSave(): void
    {
        $this->ensureDefaultVariant();
    }

    private function ensureDefaultVariant(): void
    {
        if ($this->record->variants()->count() === 0) {
            $this->record->variants()->create([
                'product_id'=>$this->record->id,
                'sku'       => strtoupper(Str::random(8)), 
                'price'     => $this->record->price,
                'stock'     => 0,
                'is_active' => $this->record->is_active,
                'image'     => $this->record->main_image,
            ]);
        }
    }
}
