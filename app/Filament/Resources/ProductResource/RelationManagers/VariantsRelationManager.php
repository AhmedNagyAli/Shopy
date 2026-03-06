<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Models\ProductVariant;
use App\Models\AttributeValue;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $title = 'Product Variants';

    protected static ?string $recordTitleAttribute = 'sku';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Variant Details')
                    ->schema([
                        Forms\Components\TextInput::make('sku')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->label('Variant SKU')
                            ->helperText('Unique stock keeping unit for this variant'),

                        Forms\Components\TextInput::make('price')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(999999.99)
                            ->helperText('Variant-specific price'),

                        Forms\Components\TextInput::make('stock')
                            ->required()
                            ->numeric()
                            ->default(0)
                            ->minValue(0)
                            ->maxValue(999999)
                            ->helperText('Available quantity in stock'),

                        Forms\Components\FileUpload::make('image')
                            ->label('Variant Image')
                            ->image()
                            ->directory('product-variants')
                            ->maxSize(5120)
                            ->helperText('Variant-specific image (max 5MB)'),

                        Forms\Components\Toggle::make('is_active')
                            ->required()
                            ->default(true)
                            ->helperText('Enable or disable this variant'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Variant Attributes')
                    ->schema([
                        Forms\Components\Repeater::make('values')
                            ->relationship('values')
                            ->schema([
                                Forms\Components\Select::make('attribute_id')
                                    ->label('Attribute Value')
                                    ->options(function ($get, $set, $livewire) {
                                        $product = $livewire->ownerRecord;
                                        return AttributeValue::whereHas('attribute', function ($query) use ($product) {
                                                $query->whereIn('id', $product->attributes->pluck('id'));
                                            })
                                            ->with('attribute')
                                            ->get()
                                            ->groupBy('attribute.name')
                                            ->mapWithKeys(function ($values, $attributeName) {
                                                return $values->mapWithKeys(fn($value) => [
                                                    $value->id => "{$attributeName}: {$value->value}"
                                                ]);
                                            });
                                    })
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->distinct()
                                    ->disableOptionsWhenSelectedInSiblingRepeaterItems(),
                            ])
                            ->addActionLabel('Add Attribute Value')
                            ->defaultItems(0)
                            ->reorderable()
                            ->cloneable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => 
                                AttributeValue::find($state['attribute_id'])->value ?? null
                            )
                            ->helperText('Select attribute values that define this variant')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                Forms\Components\Section::make('Pricing Information')
                    ->schema([
                        Forms\Components\Placeholder::make('base_product_price')
                            ->label('Base Product Price')
                            ->content(fn ($livewire) => '$' . number_format($livewire->ownerRecord->price, 2)),

                        Forms\Components\Placeholder::make('price_difference')
                            ->label('Price Difference')
                            ->content(function ($get, $livewire) {
                                $variantPrice = $get('price') ?? 0;
                                $basePrice = $livewire->ownerRecord->price;
                                $difference = $variantPrice - $basePrice;
                                $formatted = '$' . number_format(abs($difference), 2);
                                return $difference >= 0 ? "+{$formatted}" : "-{$formatted}";
                            }),
                            // ->color(function ($get, $livewire) {
                            //     $variantPrice = $get('price') ?? 0;
                            //     $basePrice = $livewire->ownerRecord->price;
                            //     $difference = $variantPrice - $basePrice;
                            //     return $difference > 0 ? 'success' : ($difference < 0 ? 'danger' : 'gray');
                            // }),
                    ])
                    ->columns(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('sku')
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Image')
                    ->circular()
                    ->size(50)
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->sku) . '&color=7F9CF5&background=EBF4FF'),

                Tables\Columns\TextColumn::make('sku')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->description(fn ($record) => self::generateVariantName($record)),

                Tables\Columns\TextColumn::make('price')
                    ->money('USD')
                    ->sortable()
                    ->color('success')
                    ->alignEnd(),

                Tables\Columns\TextColumn::make('stock')
                    ->sortable()
                    ->alignCenter()
                    ->color(fn ($state) => $state == 0 ? 'danger' : ($state < 10 ? 'warning' : 'success'))
                    ->formatStateUsing(fn ($state) => $state == 0 ? 'Out of Stock' : $state),

                Tables\Columns\TextColumn::make('values_count')
                    ->label('Attributes')
                    ->counts('values')
                    ->sortable()
                    ->alignCenter()
                    ->color('primary'),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->sortable()
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status'),

                Tables\Filters\Filter::make('low_stock')
                    ->label('Low Stock (< 10)')
                    ->query(fn (Builder $query): Builder => $query->where('stock', '<', 10)),

                Tables\Filters\Filter::make('out_of_stock')
                    ->label('Out of Stock')
                    ->query(fn (Builder $query): Builder => $query->where('stock', 0)),

                Tables\Filters\Filter::make('has_attributes')
                    ->label('Has Attributes')
                    ->query(fn (Builder $query): Builder => $query->whereHas('values')),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->modalHeading('Create Product Variant')
                    ->modalWidth('6xl'),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit Product Variant')
                        ->modalWidth('6xl'),

                    Tables\Actions\Action::make('updateStock')
                        ->label('Update Stock')
                        ->icon('heroicon-o-archive-box')
                        ->color('warning')
                        ->form([
                            Forms\Components\TextInput::make('stock')
                                ->numeric()
                                ->required()
                                ->minValue(0)
                                ->default(fn ($record) => $record->stock),
                        ])
                        ->action(function (Model $record, array $data): void {
                            $record->update(['stock' => $data['stock']]);
                        })
                        ->modalHeading('Update Stock Level'),

                    Tables\Actions\Action::make('toggleActive')
                        ->label(fn ($record) => $record->is_active ? 'Deactivate' : 'Activate')
                        ->icon(fn ($record) => $record->is_active ? 'heroicon-o-eye-slash' : 'heroicon-o-eye')
                        ->color(fn ($record) => $record->is_active ? 'warning' : 'success')
                        ->action(function (Model $record) {
                            $record->update(['is_active' => !$record->is_active]);
                        })
                        ->requiresConfirmation()
                        ->modalHeading(fn ($record) => $record->is_active ? 'Deactivate Variant' : 'Activate Variant'),

                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete Product Variant')
                        ->modalDescription('Are you sure you want to delete this product variant?'),
                ])
                    ->label('Actions')
                    ->icon('heroicon-m-ellipsis-vertical')
                    ->size('sm')
                    ->color('primary')
                    ->button(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('activate')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->requiresConfirmation()
                        ->color('success')
                        ->icon('heroicon-o-eye'),

                    Tables\Actions\BulkAction::make('deactivate')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->requiresConfirmation()
                        ->color('warning')
                        ->icon('heroicon-o-eye-slash'),

                    Tables\Actions\BulkAction::make('updateStockBulk')
                        ->label('Update Stock')
                        ->icon('heroicon-o-archive-box')
                        ->color('info')
                        ->form([
                            Forms\Components\TextInput::make('stock')
                                ->numeric()
                                ->required()
                                ->minValue(0),
                        ])
                        ->action(function ($records, array $data) {
                            foreach ($records as $record) {
                                $record->update(['stock' => $data['stock']]);
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Update Stock for Selected Variants'),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->modalWidth('6xl'),
            ])
            ->defaultSort('created_at', 'desc');
    }

    /**
     * Generate a readable variant name from its attributes
     */
    private static function generateVariantName(ProductVariant $variant): string
    {
        if ($variant->values->count() === 0) {
            return 'Default Variant';
        }

        return $variant->values
            ->sortBy('attribute.name')
            ->map(fn($value) => "{$value->attribute->name}: {$value->value}")
            ->join(', ');
    }
}