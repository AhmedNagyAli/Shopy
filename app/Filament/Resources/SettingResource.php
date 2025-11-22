<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SettingResource\Pages;
use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingResource extends Resource
{
    protected static ?string $model = Setting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 100;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Setting Information')
                    ->schema([
                        Forms\Components\TextInput::make('key')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->prefixIcon('heroicon-o-key')
                            ->helperText('Use dot notation for nested settings (e.g., app.name, mail.host)'),
                        
                        Forms\Components\Select::make('type')
                            ->label('Value Type')
                            ->options([
                                'text' => 'Text',
                                'textarea' => 'Long Text',
                                'image' => 'Single Image',
                                'images' => 'Multiple Images',
                                'boolean' => 'Yes/No',
                                'number' => 'Number',
                                'json' => 'JSON Data',
                            ])
                            ->reactive()
                            ->required()
                            ->afterStateUpdated(fn ($state, callable $set) => $set('value', null)),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Setting Value')
                    ->schema(function (callable $get) {
                        $type = $get('type');

                        return match ($type) {
                            'text' => [
                                Forms\Components\TextInput::make('value')
                                    ->label('Text Value')
                                    ->maxLength(500),
                            ],
                            'textarea' => [
                                Forms\Components\Textarea::make('value')
                                    ->label('Long Text Value')
                                    ->rows(5)
                                    ->columnSpanFull(),
                            ],
                            'image' => [
                                Forms\Components\FileUpload::make('value')
                                    ->label('Image')
                                    ->image()
                                    ->directory('settings')
                                    ->preserveFilenames()
                                    //->maxSize(2048)
                                    ->helperText('Upload a single image (max 2MB)')
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
                            ],
                            'images' => [
                                Forms\Components\FileUpload::make('value')
                                    ->label('Images')
                                    ->image()
                                    ->multiple()
                                    ->directory('settings')
                                    ->preserveFilenames()
                                    //->maxSize(2048)
                                    ->maxFiles(10)
                                    ->helperText('Upload multiple images (max 10 files, 2MB each)')
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
                            ],
                            'boolean' => [
                                Forms\Components\Toggle::make('value')
                                    ->label('Enabled')
                                    ->default(false),
                            ],
                            'number' => [
                                Forms\Components\TextInput::make('value')
                                    ->label('Number Value')
                                    ->numeric()
                                    ->step(0.01),
                            ],
                            'json' => [
                                Forms\Components\KeyValue::make('value')
                                    ->label('Key-Value Pairs')
                                    ->keyLabel('Key')
                                    ->valueLabel('Value')
                                    ->addActionLabel('Add Item'),
                            ],
                            default => [
                                Forms\Components\TextInput::make('value')
                                    ->label('Value')
                                    ->maxLength(500),
                            ],
                        };
                    }),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Setting $record) => self::getValuePreview($record)),

                Tables\Columns\TextColumn::make('value_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'text', 'string' => 'gray',
                        'textarea', 'longtext' => 'blue',
                        'image' => 'success',
                        'images' => 'info',
                        'boolean' => 'warning',
                        'number', 'integer', 'decimal' => 'primary',
                        'json', 'array' => 'purple',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => Str::title($state))
                    ->getStateUsing(fn (Setting $record) => self::detectValueType($record)),

                Tables\Columns\IconColumn::make('value_boolean')
                    ->label('Boolean')
                    ->boolean()
                    ->getStateUsing(fn (Setting $record) => 
                        $record->value === true || $record->value === 'true' || $record->value === 1
                ),
                //    ->visible(fn (Setting $record) => self::detectValueType($record) === 'boolean'),

                Tables\Columns\ImageColumn::make('value_image')
                    ->label('Image')
                    ->getStateUsing(fn (Setting $record) => 
                        is_string($record->value) && (Str::startsWith($record->value, 'settings/') || Str::contains($record->value, '.'))
                            ? Storage::url($record->value) 
                            : null
            ),
                    //->visible(fn (Setting $record) => self::detectValueType($record) === 'image'),

                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'text' => 'Text',
                        'textarea' => 'Long Text',
                        'image' => 'Image',
                        'images' => 'Multiple Images',
                        'boolean' => 'Boolean',
                        'number' => 'Number',
                        'json' => 'JSON',
                    ])
                    ->query(function ($query, $data) {
                        if (!empty($data['value'])) {
                            // This is a simplified filter - you might want to store type in database
                            // or implement more sophisticated filtering
                            $query->where('key', 'like', '%' . $data['value'] . '%');
                        }
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function (Tables\Actions\DeleteAction $action, Setting $record) {
                        // Delete associated files when deleting the setting
                        if (self::detectValueType($record) === 'image' && $record->value) {
                            Storage::delete($record->value);
                        } elseif (self::detectValueType($record) === 'images' && is_array($record->value)) {
                            foreach ($record->value as $file) {
                                Storage::delete($file);
                            }
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->before(function (Tables\Actions\DeleteBulkAction $action, $records) {
                            foreach ($records as $record) {
                                if (self::detectValueType($record) === 'image' && $record->value) {
                                    Storage::delete($record->value);
                                } elseif (self::detectValueType($record) === 'images' && is_array($record->value)) {
                                    foreach ($record->value as $file) {
                                        Storage::delete($file);
                                    }
                                }
                            }
                        }),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSettings::route('/'),
            'create' => Pages\CreateSetting::route('/create'),
            'edit' => Pages\EditSetting::route('/{record}/edit'),
        ];
    }

    protected static function getValuePreview(Setting $record): string
    {
        $value = $record->value;
        $type = self::detectValueType($record);

        if ($type === 'boolean') {
            return $value ? 'Yes' : 'No';
        }

        if ($type === 'image') {
            return 'Image: ' . (is_string($value) ? basename($value) : 'N/A');
        }

        if ($type === 'images') {
            return 'Images: ' . (is_array($value) ? count($value) . ' files' : 'N/A');
        }

        if ($type === 'json') {
            return 'JSON: ' . (is_array($value) ? count($value) . ' items' : 'N/A');
        }

        if (is_array($value)) {
            return 'Array: ' . count($value) . ' items';
        }

        if (is_string($value)) {
            return Str::limit($value, 50) ?: 'Empty';
        }

        if (is_numeric($value)) {
            return 'Number: ' . $value;
        }

        if (is_bool($value)) {
            return $value ? 'True' : 'False';
        }

        return gettype($value);
    }

    protected static function detectValueType(Setting $record): string
    {
        $value = $record->value;

        if (is_bool($value)) {
            return 'boolean';
        }

        if (is_numeric($value)) {
            return 'number';
        }

        if (is_array($value)) {
            // Check if it's an array of image paths
            if (!empty($value) && is_string($value[0] ?? null) && Str::contains($value[0], '.')) {
                return 'images';
            }
            return 'json';
        }

        if (is_string($value)) {
            // Check if it's an image path
            if (Str::contains($value, '.') && (Str::startsWith($value, 'settings/') || Str::contains($value, ['jpg', 'jpeg', 'png', 'gif', 'webp']))) {
                return 'image';
            }

            // Check if it's long text
            if (strlen($value) > 100) {
                return 'textarea';
            }

            return 'text';
        }

        return 'text';
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'primary';
    }
}