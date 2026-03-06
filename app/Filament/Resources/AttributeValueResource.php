<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AttributeValueResource\Pages;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

class AttributeValueResource extends Resource
{
    protected static ?string $model = AttributeValue::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'Catalog';
    protected static ?string $modelLabel = 'Attribute Value';

    protected static ?string $pluralModelLabel = 'Attribute Values';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationParentItem = 'Attributes';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Value Information')
                    ->description('Define the attribute value and its parent attribute')
                    ->schema([
                        Forms\Components\Select::make('attribute_id')
                            ->relationship('attribute', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->native(false)
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($state, $set) {
                                        if (filled($state)) {
                                            $set('slug', Str::slug($state));
                                        }
                                    }),
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique('attributes', 'slug'),
                            ])
                            ->createOptionUsing(function (array $data): int {
                                $attribute = Attribute::create($data);
                                return $attribute->id;
                            })
                            ->reactive()
                            ->afterStateUpdated(fn ($state) => $state),

                        Forms\Components\TextInput::make('value')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set, $get) {
                                if (filled($state) && !$get('is_slug_manual')) {
                                    $set('slug', Str::slug($state));
                                }
                            })
                            ->placeholder('e.g., Red, Large, Cotton'),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('The slug is used for internal references. Auto-generated from value.')
                            ->suffixAction(
                                Forms\Components\Actions\Action::make('generateSlug')
                                    ->icon('heroicon-m-arrow-path')
                                    ->action(function ($set, $get) {
                                        $value = $get('value');
                                        if (filled($value)) {
                                            $set('slug', Str::slug($value));
                                        }
                                    })
                            ),

                        Forms\Components\Hidden::make('is_slug_manual')
                            ->default(false),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Additional Information')
                    ->schema([
                        Forms\Components\ColorPicker::make('color_code')
                            ->label('Color Code')
                            //->hidden(fn ($get) => !self::isColorAttribute($get('attribute_id')))
                            ->helperText('Hex color code for color attributes'),

                        Forms\Components\TextInput::make('extra_price')
                            ->numeric()
                            ->prefix('$')
                            ->step(0.01)
                            ->helperText('Additional price when this value is selected'),

                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Order in which values appear (lower numbers first)'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Statistics')
                    ->schema([
                        Forms\Components\Placeholder::make('variants_count')
                            ->label('Used in Variants')
                            ->content(fn ($record) => $record?->variants_count ?? '0'),

                        Forms\Components\Placeholder::make('created_at')
                            ->label('Created At')
                            ->content(fn ($record) => $record?->created_at?->format('M j, Y H:i') ?? 'N/A'),

                        Forms\Components\Placeholder::make('updated_at')
                            ->label('Updated At')
                            ->content(fn ($record) => $record?->updated_at?->format('M j, Y H:i') ?? 'N/A'),
                    ])
                    ->columns(3)
                    ->visible(fn ($record) => $record !== null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('attribute.name')
                    ->label('Attribute')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->attribute->slug ?? '')
                    ->weight('semibold'),

                Tables\Columns\TextColumn::make('value')
                    ->searchable()
                    ->sortable()
                    ->limit(30),

                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->sortable()
                    ->color('gray')
                    ->copyable()
                    ->copyMessage('Slug copied to clipboard'),

                Tables\Columns\ColorColumn::make('color_code')
                    ->label('Color'),
                    //->hidden(fn ($record) => !self::isColorAttribute($record->attribute_id)),

                Tables\Columns\TextColumn::make('extra_price')
                    ->money('USD')
                    ->alignEnd()
                    ->sortable()
                    ->color(fn ($state) => $state > 0 ? 'success' : 'gray'),

                Tables\Columns\TextColumn::make('variants_count')
                    ->label('Variants')
                    ->counts('variants')
                    ->sortable()
                    ->alignCenter()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('sort_order')
                    ->sortable()
                    ->alignCenter()
                    ->toggleable(isToggledHiddenByDefault: true),

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
                Tables\Filters\SelectFilter::make('attribute')
                    ->relationship('attribute', 'name')
                    ->searchable()
                    ->preload()
                    ->multiple(),

                Tables\Filters\Filter::make('has_variants')
                    ->label('Used in Variants')
                    ->query(fn (Builder $query): Builder => $query->whereHas('variants')),

                Tables\Filters\Filter::make('has_extra_price')
                    ->label('Has Extra Price')
                    ->query(fn (Builder $query): Builder => $query->where('extra_price', '>', 0)),

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

                Tables\Filters\Filter::make('color_values')
                    ->label('Color Values Only')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('color_code')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->modalHeading('View Attribute Value')
                        ->modalWidth('4xl'),

                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit Attribute Value')
                        ->modalWidth('4xl'),

                    Tables\Actions\Action::make('duplicate')
                        ->label('Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->color('info')
                        ->action(function (AttributeValue $record) {
                            $newValue = $record->replicate();
                            $newValue->value = $record->value . ' (Copy)';
                            $newValue->slug = $record->slug . '-copy';
                            $newValue->save();
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Duplicate Value')
                        ->modalDescription('This will create a copy of this attribute value.'),

                    Tables\Actions\Action::make('updateSlug')
                        ->label('Update Slug')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->action(function (AttributeValue $record) {
                            $record->update([
                                'slug' => Str::slug($record->value),
                            ]);
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Update Slug')
                        ->modalDescription('This will update the slug based on the current value name.'),

                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete Attribute Value')
                        ->modalDescription('Are you sure you want to delete this attribute value? This may affect product variants that use this value.'),
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
                            // Check if any values are used in variants
                            $usedValues = $records->filter(fn ($record) => $record->variants_count > 0);
                            if ($usedValues->count() > 0) {
                                throw new \Exception('Some values are used in product variants and cannot be deleted.');
                            }
                        }),

                    Tables\Actions\BulkAction::make('updateSlugs')
                        ->label('Update Slugs')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                $record->update([
                                    'slug' => Str::slug($record->value),
                                ]);
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Update Slugs')
                        ->modalDescription('This will update the slugs for all selected values based on their current names.'),

                    Tables\Actions\BulkAction::make('clearExtraPrices')
                        ->label('Clear Extra Prices')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                $record->update([
                                    'extra_price' => 0,
                                ]);
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Clear Extra Prices')
                        ->modalDescription('This will set extra price to 0 for all selected values.'),

                    Tables\Actions\BulkAction::make('exportValues')
                        ->label('Export Values')
                        ->icon('heroicon-o-arrow-down-tray')
                        ->color('success')
                        ->action(function ($records) {
                            // Export logic would go here
                        }),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->modalWidth('2xl'),
            ])
            ->defaultSort('attribute_id')
            ->groups([
                Tables\Grouping\Group::make('attribute.name')
                    ->label('Attribute')
                    ->collapsible(),
            ])
            ->reorderable('sort_order');
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
            'index' => Pages\ListAttributeValues::route('/'),
            'create' => Pages\CreateAttributeValue::route('/create'),
            'edit' => Pages\EditAttributeValue::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount(['variants'])
            ->with(['attribute']);
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'primary';
    }

    public static function shouldRegisterNavigation(): bool
    {
        // Only register if there are attributes to avoid empty navigation
        return Attribute::count() > 0;
    }

    /**
     * Check if attribute is a color attribute to show color picker
     */
    private static function isColorAttribute(?int $attributeId): bool
    {
        if (!$attributeId) {
            return false;
        }

        $attribute = Attribute::find($attributeId);
        if (!$attribute) {
            return false;
        }

        $colorKeywords = ['color', 'colour', 'colors', 'colours'];
        return in_array(strtolower($attribute->name), $colorKeywords);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['value', 'slug', 'attribute.name'];
    }
}