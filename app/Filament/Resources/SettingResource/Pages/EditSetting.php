<?php

namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSetting extends EditRecord
{
    protected static string $resource = SettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Process the value based on type
        return \App\Filament\Resources\SettingResource\Pages\CreateSetting::processValueData($data);
    }

    protected function afterSave(): void
    {
        // Clear settings cache if you're using caching
        // cache()->forget('app_settings');
    }
}