<?php

namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use Filament\Resources\Pages\CreateRecord;

class CreateSetting extends CreateRecord
{
    protected static string $resource = SettingResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Process the value based on type
        return self::processValueData($data);
    }

    protected static function processValueData(array $data): array
    {
        $type = $data['type'] ?? 'text';
        
        switch ($type) {
            case 'boolean':
                $data['value'] = (bool) ($data['value'] ?? false);
                break;
            case 'number':
                $data['value'] = isset($data['value']) && is_numeric($data['value']) ? $data['value'] : null;
                break;
            case 'json':
                $data['value'] = isset($data['value']) && is_array($data['value']) ? $data['value'] : [];
                break;
            case 'text':
            case 'textarea':
                $data['value'] = $data['value'] ?? null;
                break;
            // For image/images, the file upload component handles the storage
        }

        return $data;
    }
}