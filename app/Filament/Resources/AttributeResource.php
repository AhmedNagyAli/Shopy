<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AttributeResource\Pages;
use App\Models\Attribute;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

class AttributeResource extends Resource
{
    protected static ?string $model = Attribute::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?string $modelLabel = 'Attribute';

    protected static ?string $pluralModelLabel = 'Attributes';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Attribute Information')
                    ->description('Define the attribute name and slug')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set) {
                                if (filled($state)) {
                                    $set('slug', Str::slug($state));
                                }
                            })
                            ->placeholder('e.g., Color, Size, Material'),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->placeholder('e.g., color, size, material')
                            ->helperText('The slug is used for internal references. It will be auto-generated from the name.'),

                        Forms\Components\Placeholder::make('values_count')
                            ->label('Total Values')
                            ->content(fn ($record) => $record?->values_count ?? '0')
                            ->visible(fn ($record) => $record !== null),

                        Forms\Components\Placeholder::make('products_count')
                            ->label('Used in Products')
                            ->content(fn ($record) => $record?->products_count ?? '0')
                            ->visible(fn ($record) => $record !== null),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Attribute Values')
                    ->description('Manage values for this attribute')
                    ->schema([
                        Forms\Components\Repeater::make('values')
                            ->relationship('values')
                            ->schema([
                                Forms\Components\TextInput::make('value')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('e.g., Red, Blue, Green'),

                                Forms\Components\ColorPicker::make('color')
                                    ->hidden(fn ($get) => !self::isColorAttribute($get('../../name')))
                                    ->helperText('Color value for color attributes'),

                                Forms\Components\TextInput::make('extra_price')
                                    ->numeric()
                                    ->prefix('$')
                                    ->helperText('Additional price for this value'),
                            ])
                            ->defaultItems(0)
                            ->addActionLabel('Add Value')
                            ->columns(2)
                            ->columnSpanFull()
                            ->reorderable()
                            ->cloneable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['value'] ?? null),
                    ])
                    ->visible(fn ($record) => $record !== null)
                    ->collapsible(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->sortable()
                    ->color('gray')
                    ->copyable()
                    ->copyMessage('Slug copied to clipboard'),

                Tables\Columns\TextColumn::make('values_count')
                    ->label('Values')
                    ->counts('values')
                    ->sortable()
                    ->color('primary')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('products_count')
                    ->label('Products')
                    ->counts('products')
                    ->sortable()
                    ->color('success')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('has_values')
                    ->label('Has Values')
                    ->query(fn (Builder $query): Builder => $query->whereHas('values')),

                Tables\Filters\Filter::make('has_products')
                    ->label('Used in Products')
                    ->query(fn (Builder $query): Builder => $query->whereHas('products')),

                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->placeholder('From date'),
                        Forms\Components\DatePicker::make('created_until')
                            ->placeholder('Until date'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->modalHeading('View Attribute')
                        ->modalWidth('4xl'),

                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit Attribute')
                        ->modalWidth('4xl'),

                    Tables\Actions\Action::make('manageValues')
                        ->label('Manage Values')
                        ->url(fn (Attribute $record): string => AttributeValueResource::getUrl('index', ['attribute_id' => $record->id]))
                        ->icon('heroicon-o-list-bullet')
                        ->color('warning')
                        ->openUrlInNewTab(),

                    Tables\Actions\Action::make('duplicate')
                        ->label('Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->color('info')
                        ->action(function (Attribute $record) {
                            $newAttribute = $record->replicate();
                            $newAttribute->name = $record->name . ' (Copy)';
                            $newAttribute->slug = $record->slug . '-copy';
                            $newAttribute->save();

                            // Duplicate values if any
                            if ($record->values->count() > 0) {
                                foreach ($record->values as $value) {
                                    $newValue = $value->replicate();
                                    $newValue->attribute_id = $newAttribute->id;
                                    $newValue->save();
                                }
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Duplicate Attribute')
                        ->modalDescription('This will create a copy of this attribute with all its values.'),
                    
                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete Attribute')
                        ->modalDescription('Are you sure you want to delete this attribute? This will also delete all associated values.')
                        ->before(function (Attribute $record) {
                            // Delete all values first
                            $record->values()->delete();
                        }),
                ])
                    ->label('Actions')
                    ->icon('heroicon-m-ellipsis-vertical')
                    ->size('sm')
                    ->color('primary')
                    ->button(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->before(function ($records) {
                            // Delete all values for selected attributes
                            foreach ($records as $record) {
                                $record->values()->delete();
                            }
                        }),

                    Tables\Actions\BulkAction::make('updateSlugs')
                        ->label('Update Slugs')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                $record->update([
                                    'slug' => Str::slug($record->name),
                                ]);
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Update Slugs')
                        ->modalDescription('This will update the slugs for all selected attributes based on their current names.'),

                    Tables\Actions\BulkAction::make('exportAttributes')
                        ->label('Export')
                        ->icon('heroicon-o-arrow-down-tray')
                        ->color('success')
                        ->action(function ($records) {
                            // Export logic would go here
                            // You could implement CSV export or other formats
                        }),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->modalWidth('2xl'),
            ])
            ->defaultSort('created_at', 'desc')
            ->groups([
                Tables\Grouping\Group::make('created_at')
                    ->label('Created Date')
                    ->date()
                    ->collapsible(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            // You can add relation managers here later if needed
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAttributes::route('/'),
            'create' => Pages\CreateAttribute::route('/create'),
            'edit' => Pages\EditAttribute::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount(['values', 'products']);
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    /**
     * Check if attribute is a color attribute to show color picker
     */
    private static function isColorAttribute(?string $attributeName): bool
    {
        if (!$attributeName) {
            return false;
        }

        $colorKeywords = ['color', 'colour', 'colors', 'colours'];
        return in_array(strtolower($attributeName), $colorKeywords);
    }
}