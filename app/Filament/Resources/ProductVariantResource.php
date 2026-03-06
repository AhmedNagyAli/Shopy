<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductVariantResource\Pages;
use App\Filament\Resources\ProductVariantResource\RelationManagers;
use App\Models\ProductVariant;
use App\Models\Product;
use App\Models\AttributeValue;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductVariantResource extends Resource
{
    protected static ?string $model = ProductVariant::class;

    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    
    protected static ?string $navigationGroup = 'Products';
    
    protected static ?string $navigationLabel = 'Variants';
    
    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Variant Information')
                    ->schema([
                        Forms\Components\Select::make('product_id')
                            ->relationship('product', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->native(false)
                            ->live()
                            ->afterStateUpdated(fn ($state, Forms\Set $set) => $set('sku', '')),
                        
                        Forms\Components\TextInput::make('sku')
                            ->label('SKU')
                            ->placeholder('Leave empty to auto-generate')
                            ->helperText('Auto-generated as SKU-00001 if empty')
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('price')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->minValue(0)
                            ->step(0.01),
                        
                        Forms\Components\TextInput::make('stock')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->default(0),
                        
                        Forms\Components\FileUpload::make('image')
                            ->label('Variant Image')
                            ->image()
                            ->directory('product-variants')
                            ->visibility('public')
                            ->maxSize(5120)
                            ->imageResizeMode('cover'),
                    ])->columns(2),
                
                Forms\Components\Section::make('Variant Attributes')
                    ->schema([
                        Forms\Components\Select::make('values')
                            ->relationship('values', 'value')
                            ->multiple()
                            ->preload()
                            ->searchable()
                            ->native(false)
                            ->getOptionLabelFromRecordUsing(fn (AttributeValue $record) => 
                                $record->attribute->name . ': ' . $record->value
                            ),
                    ]),
                
                Forms\Components\Section::make('Status')
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->required(),
                        
                        Forms\Components\Toggle::make('is_default')
                            ->label('Default Variant')
                            ->helperText('Set as default variant for the product')
                            ->default(false),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Image')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder-variant.jpg')),
                
                Tables\Columns\TextColumn::make('sku')
                    ->searchable()
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('product.name')
                    ->searchable()
                    ->sortable()
                    ->url(fn (ProductVariant $record) => 
                        ProductResource::getUrl('edit', ['record' => $record->product_id])
                    ),
                
                Tables\Columns\TextColumn::make('price')
                    ->money('USD')
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('final_price')
                    ->label('Final Price')
                    ->money('USD')
                    ->sortable()
                    ->color('success')
                    ->tooltip('Includes active discounts'),
                
                Tables\Columns\TextColumn::make('stock')
                    ->numeric()
                    ->sortable()
                    ->color(fn (ProductVariant $record) => $record->stock > 10 ? 'success' : ($record->stock > 0 ? 'warning' : 'danger')),
                
                Tables\Columns\TextColumn::make('values.value')
                    ->label('Attributes')
                    ->listWithLineBreaks()
                    ->limitList(2)
                    ->expandableLimitedList()
                    ->getStateUsing(fn (ProductVariant $record) => 
                        $record->values->map(fn ($value) => $value->attribute->name . ': ' . $value->value)
                    ),
                
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),
                
                Tables\Columns\IconColumn::make('is_default')
                    ->label('Default')
                    ->boolean()
                    ->sortable(),
                
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
                Tables\Filters\SelectFilter::make('product')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->multiple(),
                
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status'),
                
                Tables\Filters\TernaryFilter::make('is_default')
                    ->label('Default Variant'),
                
                Tables\Filters\Filter::make('low_stock')
                    ->label('Low Stock (≤ 10)')
                    ->query(fn (Builder $query) => $query->where('stock', '<=', 10)),
                
                Tables\Filters\Filter::make('out_of_stock')
                    ->label('Out of Stock')
                    ->query(fn (Builder $query) => $query->where('stock', 0)),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\Action::make('manageDiscounts')
                    ->label('Discounts')
                    ->icon('heroicon-o-tag')
                    ->url(fn (ProductVariant $record) => 
                        DiscountResource::getUrl('index', [
                            'tableFilters[discountable_type][value]' => 'product_variant',
                            'tableFilters[discountable_id][value]' => $record->id,
                        ])
                    ),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label('Activate Selected')
                        ->icon('heroicon-o-check')
                        ->action(fn ($records) => $records->each->update(['is_active' => true])),
                    
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('Deactivate Selected')
                        ->icon('heroicon-o-x-mark')
                        ->action(fn ($records) => $records->each->update(['is_active' => false])),
                    
                    Tables\Actions\BulkAction::make('updateStock')
                        ->label('Update Stock')
                        ->icon('heroicon-o-archive-box')
                        ->form([
                            Forms\Components\TextInput::make('stock')
                                ->label('New Stock Quantity')
                                ->numeric()
                                ->required()
                                ->minValue(0),
                        ])
                        ->action(fn ($records, array $data) => 
                            $records->each->update(['stock' => $data['stock']])
                        ),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\DiscountsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProductVariants::route('/'),
            'create' => Pages\CreateProductVariant::route('/create'),
            'edit' => Pages\EditProductVariant::route('/{record}/edit'),
        ];
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