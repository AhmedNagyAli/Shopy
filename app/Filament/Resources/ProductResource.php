<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use App\Models\Category;
use App\Models\AttributeValue;
use App\Models\ProductVariant;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?string $modelLabel = 'Product';

    protected static ?string $pluralModelLabel = 'Products';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // ───── Product Information ─────
                Forms\Components\Section::make('Product Information')
                    ->description('Basic product details')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->placeholder('Enter product name')
                            ->afterStateUpdated(function ($set, $state, $operation) {
                                if ($operation === 'create' || !$set('is_slug_manual', false)) {
                                    $set('slug', Str::slug($state));
                                }
                            }),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('URL-friendly version of the name')
                            ->suffixAction(
                                Forms\Components\Actions\Action::make('generateSlug')
                                    ->icon('heroicon-m-arrow-path')
                                    ->action(function ($set, $get) {
                                        $name = $get('name');
                                        if (filled($name)) {
                                            $set('slug', Str::slug($name));
                                            $set('is_slug_manual', false);
                                        }
                                    })
                            ),

                        Forms\Components\Hidden::make('is_slug_manual')
                            ->default(false),

                        Forms\Components\RichEditor::make('description')
                            ->maxLength(65535)
                            ->columnSpanFull()
                            ->fileAttachmentsDirectory('product-attachments')
                            ->toolbarButtons([
                                'blockquote', 'bold', 'bulletList', 'codeBlock',
                                'h2', 'h3', 'italic', 'link', 'orderedList',
                                'redo', 'strike', 'underline', 'undo',
                            ]),

                        Forms\Components\TextInput::make('price')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(999999.99)
                            ->helperText('Base price for the product (used if no variants exist)'),

                        Forms\Components\FileUpload::make('main_image')
                            ->label('Main Product Image')
                            ->image()
                            ->directory('products/main')
                            ->maxSize(5120)
                            ->imageResizeMode('cover')
                            ->imageCropAspectRatio('1:1')
                            ->imageResizeTargetWidth('800')
                            ->imageResizeTargetHeight('800')
                            ->getUploadedFileNameForStorageUsing(
                                fn (TemporaryUploadedFile $file): string => (string) str($file->getClientOriginalName())
                                    ->prepend('product-main-'),
                            )
                            ->helperText('Main product image (max 5MB)')
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->validationMessages([
                                'maxSize' => 'The image must not exceed 5MB.',
                            ]),

                        Forms\Components\Toggle::make('is_active')
                            ->required()
                            ->default(true)
                            ->helperText('Enable or disable this product'),
                    ])
                    ->columns(2),

                // ───── Categories ─────
                Forms\Components\Section::make('Categories')
                    ->description('Organize your product into categories')
                    ->schema([
                        Forms\Components\Select::make('categories')
                            ->relationship('categories', 'name')
                            ->multiple()
                            ->preload()
                            ->searchable()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique('categories', 'slug'),
                                Forms\Components\Textarea::make('description')
                                    ->maxLength(65535),
                            ])
                            ->createOptionUsing(fn (array $data) => Category::create($data)->id),
                    ]),

                // ───── Variants ─────
                Forms\Components\Section::make('Product Variants')
                    ->description('Define product variations with attributes like Color: Red, Size: XL')
                    ->schema([
                        Forms\Components\Repeater::make('variants')
                            ->relationship('variants')
                            ->schema([
                                // Variant Image
                                Forms\Components\FileUpload::make('image')
                                    ->label('Variant Image')
                                    ->image()
                                    ->directory('products/variants')
                                    ->maxSize(5120)
                                    ->imageResizeMode('cover')
                                    ->imageCropAspectRatio('1:1')
                                    ->imageResizeTargetWidth('600')
                                    ->imageResizeTargetHeight('600')
                                    ->getUploadedFileNameForStorageUsing(
                                        fn (TemporaryUploadedFile $file): string => (string) str($file->getClientOriginalName())
                                            ->prepend('variant-'),
                                    )
                                    ->helperText('Variant-specific image (max 5MB)')
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                                    ->columnSpanFull(),

                                // Variant Details
                                Forms\Components\TextInput::make('sku')
                                    ->label('SKU')
                                    ->required()
                                    ->maxLength(50)
                                    ->unique(
                                        table: 'product_variants',
                                        column: 'sku',
                                        ignoreRecord: true
                                    )
                                    ->helperText('Unique stock keeping unit'),

                                Forms\Components\TextInput::make('price')
                                    ->label('Variant Price')
                                    ->numeric()
                                    ->minValue(0)
                                    ->prefix('$')
                                    ->helperText('Leave empty to use product base price'),

                                Forms\Components\TextInput::make('stock')
                                    ->label('Stock Quantity')
                                    ->numeric()
                                    ->required()
                                    ->minValue(0)
                                    ->default(0),

                                // Attribute Values
                                Forms\Components\Select::make('values')
                                    ->label('Attribute Values')
                                    ->multiple()
                                    ->relationship(
                                        name: 'values',
                                        titleAttribute: 'value',
                                        modifyQueryUsing: fn ($query) => $query->with('attribute')
                                    )
                                    ->getOptionLabelFromRecordUsing(fn (AttributeValue $record) => 
                                        $record->attribute->name . ': ' . $record->value
                                    )
                                    ->preload()
                                    ->searchable()
                                    ->helperText('Select attribute values for this variant')
                                    ->required()
                                    ->minItems(1)
                                    ->columnSpanFull()
                                    ->createOptionForm([
                                        Forms\Components\Select::make('attribute_id')
                                            ->relationship('attribute', 'name')
                                            ->required()
                                            ->preload()
                                            ->searchable(),
                                        Forms\Components\TextInput::make('value')
                                            ->required()
                                            ->maxLength(255),
                                    ])
                                    ->createOptionUsing(function (array $data) {
                                        return AttributeValue::create($data)->id;
                                    }),
                            ])
                            ->columns(2)
                            ->columnSpanFull()
                            ->collapsible()
                            ->itemLabel(fn (array $state): string => 
                                ($state['sku'] ?? 'New Variant') . 
                                (isset($state['values']) && count($state['values']) ? 
                                    ' (' . collect($state['values'])->map(function ($valueId) {
                                        $value = AttributeValue::with('attribute')->find($valueId);
                                        return $value ? $value->attribute->name . ': ' . $value->value : '';
                                    })->filter()->join(', ') . ')' : '')
                            )
                            ->createItemButtonLabel('Add Variant')
                            ->deleteAction(
                                fn (Forms\Components\Actions\Action $action) => $action->requiresConfirmation(),
                            )
                            ->reorderable()
                            ->cloneable()
                            ->grid(2)
                            ->minItems(0)
                            ->defaultItems(0),
                    ])
                    ->collapsed(fn ($operation) => $operation === 'edit'),

                // ───── Stats ─────
                Forms\Components\Section::make('Product Statistics')
                    ->schema([
                        Forms\Components\Placeholder::make('variants_count')
                            ->label('Total Variants')
                            ->content(fn ($record) => $record?->variants_count ?? '0'),

                        Forms\Components\Placeholder::make('images_count')
                            ->label('Additional Images')
                            ->content(fn ($record) => $record?->images_count ?? '0'),

                        Forms\Components\Placeholder::make('categories_count')
                            ->label('Categories')
                            ->content(fn ($record) => $record?->categories_count ?? '0'),

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
                Tables\Columns\ImageColumn::make('main_image')
                    ->label('Main Image')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&color=7F9CF5&background=EBF4FF'),

                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold')
                    ->description(fn ($record) => Str::limit($record->slug, 30)),

                Tables\Columns\TextColumn::make('price')
                    ->money('USD')
                    ->sortable()
                    ->color('success')
                    ->alignEnd(),

                Tables\Columns\TextColumn::make('categories.name')
                    ->badge()
                    ->separator(',')
                    ->color('primary')
                    ->limitList(2)
                    ->expandableLimitedList(),

                Tables\Columns\TextColumn::make('variants_count')
                    ->label('Variants')
                    ->counts('variants')
                    ->sortable()
                    ->alignCenter()
                    ->color(fn ($state) => $state > 0 ? 'success' : 'gray'),

                Tables\Columns\TextColumn::make('variants_with_images_count')
                    ->label('Variants with Images')
                    ->getStateUsing(fn ($record) => $record->variants->whereNotNull('image')->count())
                    ->alignCenter()
                    ->color('warning'),

                Tables\Columns\TextColumn::make('variants_attributes')
                    ->label('Available Attributes')
                    ->getStateUsing(function ($record) {
                        if ($record->variants_count === 0) return 'No variants';
                        
                        $attributes = $record->variants->flatMap(function ($variant) {
                            return $variant->values->map(function ($value) {
                                return $value->attribute->name . ': ' . $value->value;
                            });
                        })->unique()->sort();
                        
                        return $attributes->join(', ');
                    })
                    ->limit(50)
                    ->tooltip(function ($state) {
                        return $state;
                    }),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->sortable()
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
                Tables\Filters\SelectFilter::make('categories')
                    ->relationship('categories', 'name')
                    ->multiple()
                    ->searchable()
                    ->preload(),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status'),

                Tables\Filters\Filter::make('has_variants')
                    ->label('Has Variants')
                    ->query(fn (Builder $query): Builder => $query->whereHas('variants')),

                Tables\Filters\Filter::make('has_variants_with_images')
                    ->label('Has Variants with Images')
                    ->query(fn (Builder $query): Builder => $query->whereHas('variants', function ($query) {
                        $query->whereNotNull('image');
                    })),

                Tables\Filters\Filter::make('no_variants')
                    ->label('No Variants')
                    ->query(fn (Builder $query): Builder => $query->whereDoesntHave('variants')),

                Tables\Filters\Filter::make('has_images')
                    ->label('Has Additional Images')
                    ->query(fn (Builder $query): Builder => $query->whereHas('images')),

                Tables\Filters\Filter::make('price_range')
                    ->form([
                        Forms\Components\TextInput::make('min_price')
                            ->numeric()
                            ->placeholder('Min price'),
                        Forms\Components\TextInput::make('max_price')
                            ->numeric()
                            ->placeholder('Max price'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['min_price'],
                                fn (Builder $query, $price): Builder => $query->where('price', '>=', $price),
                            )
                            ->when(
                                $data['max_price'],
                                fn (Builder $query, $price): Builder => $query->where('price', '<=', $price),
                            );
                    }),

                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from'),
                        Forms\Components\DatePicker::make('created_until'),
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
                        ->modalHeading('View Product')
                        ->modalWidth('6xl'),

                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit Product')
                        ->modalWidth('6xl'),

                    Tables\Actions\Action::make('manageVariants')
                        ->label('Manage Variants')
                        ->url(fn (Product $record): string => \App\Filament\Resources\ProductVariantResource::getUrl('index', ['product_id' => $record->id]))
                        ->icon('heroicon-o-squares-2x2')
                        ->color('warning')
                        ->openUrlInNewTab(),

                    Tables\Actions\Action::make('duplicate')
                        ->label('Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->color('info')
                        ->action(function (Product $record) {
                            $newProduct = $record->replicate();
                            $newProduct->name = $record->name . ' (Copy)';
                            $newProduct->slug = $record->slug . '-copy-' . Str::random(6);
                            $newProduct->save();

                            // Duplicate categories
                            if ($record->categories->count() > 0) {
                                $newProduct->categories()->attach($record->categories->pluck('id'));
                            }

                            // Duplicate variants with their attributes and images
                            if ($record->variants->count() > 0) {
                                foreach ($record->variants as $variant) {
                                    $newVariant = $variant->replicate();
                                    $newVariant->product_id = $newProduct->id;
                                    $newVariant->sku = $variant->sku . '-copy-' . Str::random(6);
                                    $newVariant->save();

                                    // Duplicate variant attributes
                                    if ($variant->values->count() > 0) {
                                        $newVariant->values()->attach($variant->values->pluck('id'));
                                    }
                                }
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Duplicate Product')
                        ->modalDescription('This will create a copy of this product with the same categories and variants.'),

                    Tables\Actions\Action::make('toggleActive')
                        ->label(fn ($record) => $record->is_active ? 'Deactivate' : 'Activate')
                        ->icon(fn ($record) => $record->is_active ? 'heroicon-o-eye-slash' : 'heroicon-o-eye')
                        ->color(fn ($record) => $record->is_active ? 'warning' : 'success')
                        ->action(function (Product $record) {
                            $record->update(['is_active' => !$record->is_active]);
                        })
                        ->requiresConfirmation()
                        ->modalHeading(fn ($record) => $record->is_active ? 'Deactivate Product' : 'Activate Product')
                        ->modalDescription(fn ($record) => $record->is_active 
                            ? 'This product will be hidden from customers.' 
                            : 'This product will be visible to customers.'
                        ),

                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete Product')
                        ->modalDescription('Are you sure you want to delete this product? This will also delete all variants and images.'),
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

                    Tables\Actions\BulkAction::make('updatePrices')
                        ->label('Update Prices')
                        ->icon('heroicon-o-currency-dollar')
                        ->color('info')
                        ->form([
                            Forms\Components\TextInput::make('new_price')
                                ->numeric()
                                ->required()
                                ->minValue(0)
                                ->prefix('$'),
                            Forms\Components\Select::make('update_type')
                                ->options([
                                    'fixed' => 'Set to fixed price',
                                    'increase' => 'Increase by percentage',
                                    'decrease' => 'Decrease by percentage',
                                ])
                                ->required()
                                ->default('fixed'),
                            Forms\Components\TextInput::make('percentage')
                                ->numeric()
                                ->minValue(0)
                                ->maxValue(100)
                                ->suffix('%')
                                ->visible(fn ($get) => in_array($get('update_type'), ['increase', 'decrease'])),
                        ])
                        ->action(function ($records, array $data) {
                            foreach ($records as $record) {
                                $newPrice = match ($data['update_type']) {
                                    'fixed' => $data['new_price'],
                                    'increase' => $record->price * (1 + ($data['percentage'] / 100)),
                                    'decrease' => $record->price * (1 - ($data['percentage'] / 100)),
                                    default => $record->price,
                                };
                                $record->update(['price' => round($newPrice, 2)]);
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Update Prices for Selected Products'),

                    Tables\Actions\BulkAction::make('exportProducts')
                        ->label('Export Products')
                        ->icon('heroicon-o-arrow-down-tray')
                        ->color('success')
                        ->action(function ($records) {
                            // Export logic would go here
                        }),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->modalWidth('6xl'),
            ])
            ->defaultSort('created_at', 'desc')
            ->groups([
                Tables\Grouping\Group::make('categories.name')
                    ->label('Category')
                    ->collapsible(),
                Tables\Grouping\Group::make('is_active')
                    ->label('Active Status')
                    ->collapsible(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ImagesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount(['variants', 'images', 'categories']);
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'slug'];
    }
}