<?php

namespace App\Filament\Resources\SettingResource\Pages;

use App\Filament\Resources\SettingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSetting extends EditRecord
{
    protected static string $resource = SettingResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return $this->processValueData($data);
    }

    protected function processValueData(array $data): array
    {
        if ($data['type'] === 'images' && is_array($data['value'])) {
            $data['value'] = array_values($data['value']);
        }

        if ($data['type'] === 'image' && is_string($data['value'])) {
            $data['value'] = $data['value'];
        }

        if ($data['type'] === 'boolean') {
            $data['value'] = (bool)$data['value'];
        }

        if ($data['type'] === 'number') {
            $data['value'] = (float)$data['value'];
        }

        if ($data['type'] === 'json' && is_array($data['value'])) {
            $data['value'] = $data['value'];
        }

        return $data;
    }
}