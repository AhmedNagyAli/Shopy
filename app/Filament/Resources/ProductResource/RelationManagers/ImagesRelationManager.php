<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Models\ProductImage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ImagesRelationManager extends RelationManager
{
    protected static string $relationship = 'images';

    protected static ?string $title = 'Product Images';

    protected static ?string $recordTitleAttribute = 'image_path';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\FileUpload::make('image_path')
                    ->label('Image')
                    ->image()
                    ->required()
                    ->directory('products/gallery')
                    ->maxSize(5120)
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('1:1')
                    ->imageResizeTargetWidth('800')
                    ->imageResizeTargetHeight('800')
                    ->helperText('Upload product image (max 5MB)'),

                Forms\Components\Toggle::make('is_main')
                    ->label('Set as main image')
                    ->helperText('This will replace the current main image')
                    ->afterStateUpdated(function ($state, $set, $get, $livewire) {
                        if ($state) {
                            // Update other images to not be main
                            $productId = $livewire->ownerRecord->id;
                            ProductImage::where('product_id', $productId)
                                ->where('id', '!=', $get('id'))
                                ->update(['is_main' => false]);
                        }
                    }),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('image_path')
            ->columns([
                Tables\Columns\ImageColumn::make('image_path')
                    ->label('Image')
                    ->square()
                    ->size(60),

                Tables\Columns\IconColumn::make('is_main')
                    ->label('Main Image')
                    ->boolean()
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('is_main')
                    ->label('Main Images Only')
                    ->query(fn (Builder $query): Builder => $query->where('is_main', true)),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->modalHeading('Add Product Image')
                    ->modalWidth('2xl'),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit Product Image')
                        ->modalWidth('2xl'),

                    Tables\Actions\Action::make('setAsMain')
                        ->label('Set as Main')
                        ->action(function (Model $record) {
                            // Update all images to not be main
                            $record->product->images()->update(['is_main' => false]);
                            // Set this as main
                            $record->update(['is_main' => true]);
                            // Update product main_image
                            $record->product->update(['main_image' => $record->image_path]);
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Set as Main Image')
                        ->modalDescription('This will set this image as the main product image and update the product.')
                        ->color('primary')
                        ->icon('heroicon-o-star')
                        ->visible(fn (Model $record): bool => !$record->is_main),

                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete Product Image')
                        ->modalDescription('Are you sure you want to delete this product image?'),
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

                    Tables\Actions\BulkAction::make('setOneAsMain')
                        ->label('Set One as Main')
                        ->action(function ($records) {
                            if ($records->count() > 0) {
                                $firstRecord = $records->first();
                                // Update all images to not be main
                                $firstRecord->product->images()->update(['is_main' => false]);
                                // Set the first selected as main
                                $firstRecord->update(['is_main' => true]);
                                // Update product main_image
                                $firstRecord->product->update(['main_image' => $firstRecord->image_path]);
                            }
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Set as Main Image')
                        ->modalDescription('The first selected image will be set as the main product image.')
                        ->color('primary')
                        ->icon('heroicon-o-star')
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->modalWidth('2xl'),
            ])
            ->defaultSort('is_main', 'desc');
    }
}