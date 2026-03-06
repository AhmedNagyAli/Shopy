<?php

namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use Filament\Resources\Pages\CreateRecord;

class CreateSetting extends CreateRecord
{
    protected static string $resource = SettingResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return $this->processValueData($data);
    }

    protected function processValueData(array $data): array
    {
        // Convert multiple images to JSON array
        if ($data['type'] === 'images' && isset($data['value']) && is_array($data['value'])) {
            $data['value'] = array_values($data['value']);
        }

        // Convert image string
        if ($data['type'] === 'image' && isset($data['value']) && is_string($data['value'])) {
            $data['value'] = $data['value'];
        }

        // Booleans
        if ($data['type'] === 'boolean') {
            $data['value'] = (bool)$data['value'];
        }

        // Numbers
        if ($data['type'] === 'number') {
            $data['value'] = (float)$data['value'];
        }

        // JSON (KeyValue)
        if ($data['type'] === 'json' && is_array($data['value'])) {
            $data['value'] = $data['value'];
        }

        return $data;
    }
}