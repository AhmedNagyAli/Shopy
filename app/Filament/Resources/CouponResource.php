<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CouponResource\Pages;
use App\Models\Coupon;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

class CouponResource extends Resource
{
    protected static ?string $model = Coupon::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $navigationGroup = 'Sales';

    protected static ?string $modelLabel = 'Coupon';

    protected static ?string $pluralModelLabel = 'Coupons';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Coupon Information')
                    ->description('Basic coupon details and configuration')
                    ->schema([
                        Forms\Components\TextInput::make('code')
                            ->required()
                            ->maxLength(50)
                            ->unique(ignoreRecord: true)
                            ->placeholder('e.g., SUMMER2024')
                            ->helperText('Unique coupon code that customers will enter')
                            ->suffixAction(
                                Forms\Components\Actions\Action::make('generateCode')
                                    ->icon('heroicon-m-sparkles')
                                    ->action(function ($set) {
                                        $set('code', Str::upper(Str::random(8)));
                                    })
                            ),

                        Forms\Components\Select::make('type')
                            ->required()
                            ->options([
                                'percentage' => 'Percentage Discount',
                                'fixed' => 'Fixed Amount Discount',
                            ])
                            ->default('percentage')
                            ->live()
                            ->helperText('Choose the type of discount'),

                        Forms\Components\TextInput::make('value')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->step(0.01)
                            ->suffix(function ($get) {
                                return $get('type') === 'percentage' ? '%' : '$';
                            })
                            ->helperText(function ($get) {
                                return $get('type') === 'percentage' 
                                    ? 'Percentage discount (e.g., 10 for 10%)'
                                    : 'Fixed amount discount (e.g., 25 for $25)';
                            }),

                        Forms\Components\TextInput::make('min_cart_value')
                            ->label('Minimum Cart Value')
                            ->numeric()
                            ->minValue(0)
                            ->step(0.01)
                            ->prefix('$')
                            ->helperText('Minimum cart total required to use this coupon. Leave empty for no minimum.'),

                        Forms\Components\TextInput::make('usage_limit')
                            ->numeric()
                            ->minValue(1)
                            ->helperText('Maximum number of times this coupon can be used. Leave empty for unlimited usage.'),

                        Forms\Components\DateTimePicker::make('starts_at')
                            ->required()
                            ->default(now())
                            ->helperText('When the coupon becomes active'),

                        Forms\Components\DateTimePicker::make('ends_at')
                            ->required()
                            ->minDate(fn ($get) => $get('starts_at') ?: now())
                            ->helperText('When the coupon expires'),

                        Forms\Components\Toggle::make('active')
                            ->required()
                            ->default(true)
                            ->helperText('Enable or disable this coupon'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Usage Statistics')
                    ->schema([
                        Forms\Components\Placeholder::make('used_count')
                            ->label('Times Used')
                            ->content(fn ($record) => $record?->used_count ?? '0')
                            ->helperText('Number of times this coupon has been used'),

                        Forms\Components\Placeholder::make('remaining_uses')
                            ->label('Remaining Uses')
                            ->content(function ($record) {
                                if (!$record) return 'N/A';
                                if (!$record->usage_limit) return 'Unlimited';
                                return max(0, $record->usage_limit - $record->used_count);
                            })
                            ->helperText('How many times this coupon can still be used'),

                        Forms\Components\Placeholder::make('current_status')
                            ->label('Current Status')
                            ->content(function ($record) {
                                if (!$record) return 'N/A';
                                
                                if (!$record->active) {
                                    return 'Inactive';
                                }
                                
                                $now = now();
                                if ($record->starts_at && $record->starts_at > $now) {
                                    return 'Scheduled';
                                }
                                
                                if ($record->ends_at && $record->ends_at < $now) {
                                    return 'Expired';
                                }
                                
                                if ($record->usage_limit && $record->used_count >= $record->usage_limit) {
                                    return 'Usage Limit Reached';
                                }
                                
                                return 'Active';
                            }),
                    ])
                    ->columns(3)
                    ->visible(fn ($record) => $record !== null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->weight('semibold')
                    ->description(fn ($record) => $record->type === 'percentage' 
                        ? "{$record->value}% off" 
                        : "\${$record->value} off"
                    ),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'percentage' => 'success',
                        'fixed' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'percentage' => 'Percentage',
                        'fixed' => 'Fixed Amount',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('value')
                    ->formatStateUsing(fn ($record) => 
                        $record->type === 'percentage' 
                            ? "{$record->value}%" 
                            : "\${$record->value}"
                    )
                    ->sortable(),

                Tables\Columns\TextColumn::make('min_cart_value')
                    ->label('Min Cart')
                    ->money('USD')
                    ->sortable()
                    ->placeholder('No minimum'),

                Tables\Columns\TextColumn::make('used_count')
                    ->label('Used')
                    ->sortable()
                    ->alignCenter()
                    ->color(fn ($record) => 
                        $record->usage_limit && $record->used_count >= $record->usage_limit 
                            ? 'danger' 
                            : 'gray'
                    ),

                Tables\Columns\TextColumn::make('usage_limit')
                    ->label('Limit')
                    ->sortable()
                    ->alignCenter()
                    ->placeholder('∞')
                    ->color('gray'),

                Tables\Columns\TextColumn::make('starts_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false),

                Tables\Columns\TextColumn::make('ends_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false),

                Tables\Columns\IconColumn::make('active')
                    ->boolean()
                    ->sortable()
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->getStateUsing(function ($record) {
                        if (!$record->active) {
                            return 'Inactive';
                        }
                        
                        $now = now();
                        if ($record->starts_at && $record->starts_at > $now) {
                            return 'Scheduled';
                        }
                        
                        if ($record->ends_at && $record->ends_at < $now) {
                            return 'Expired';
                        }
                        
                        if ($record->usage_limit && $record->used_count >= $record->usage_limit) {
                            return 'Limit Reached';
                        }
                        
                        return 'Active';
                    })
                    ->color(function ($record) {
                        if (!$record->active) {
                            return 'danger';
                        }
                        
                        $now = now();
                        if ($record->starts_at && $record->starts_at > $now) {
                            return 'warning';
                        }
                        
                        if ($record->ends_at && $record->ends_at < $now) {
                            return 'danger';
                        }
                        
                        if ($record->usage_limit && $record->used_count >= $record->usage_limit) {
                            return 'danger';
                        }
                        
                        return 'success';
                    }),

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
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'percentage' => 'Percentage',
                        'fixed' => 'Fixed Amount',
                    ])
                    ->label('Discount Type'),

                Tables\Filters\TernaryFilter::make('active')
                    ->label('Active Status'),

                Tables\Filters\Filter::make('currently_active')
                    ->label('Currently Active')
                    ->query(fn (Builder $query): Builder => $query->where('active', true)
                        ->where(function ($query) {
                            $query->whereNull('starts_at')
                                ->orWhere('starts_at', '<=', now());
                        })
                        ->where(function ($query) {
                            $query->whereNull('ends_at')
                                ->orWhere('ends_at', '>=', now());
                        })
                        ->where(function ($query) {
                            $query->whereNull('usage_limit')
                                ->orWhereRaw('used_count < usage_limit');
                        })),

                Tables\Filters\Filter::make('expired')
                    ->label('Expired Coupons')
                    ->query(fn (Builder $query): Builder => $query->where('ends_at', '<', now())),

                Tables\Filters\Filter::make('scheduled')
                    ->label('Scheduled Coupons')
                    ->query(fn (Builder $query): Builder => $query->where('starts_at', '>', now())),

                Tables\Filters\Filter::make('usage_limit_reached')
                    ->label('Usage Limit Reached')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('usage_limit')
                        ->whereRaw('used_count >= usage_limit')),

                Tables\Filters\Filter::make('has_min_cart_value')
                    ->label('Has Minimum Cart Value')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('min_cart_value')
                        ->where('min_cart_value', '>', 0)),

                Tables\Filters\Filter::make('starts_at')
                    ->form([
                        Forms\Components\DatePicker::make('starts_from'),
                        Forms\Components\DatePicker::make('starts_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['starts_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('starts_at', '>=', $date),
                            )
                            ->when(
                                $data['starts_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('starts_at', '<=', $date),
                            );
                    }),

                Tables\Filters\Filter::make('ends_at')
                    ->form([
                        Forms\Components\DatePicker::make('ends_from'),
                        Forms\Components\DatePicker::make('ends_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['ends_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('ends_at', '>=', $date),
                            )
                            ->when(
                                $data['ends_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('ends_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->modalHeading('View Coupon'),

                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit Coupon'),

                    Tables\Actions\Action::make('copyCode')
                        ->label('Copy Code')
                        ->icon('heroicon-o-clipboard')
                        ->action(function ($record) {
                            // This will copy to clipboard in the browser
                            $jsCode = "navigator.clipboard.writeText('{$record->code}').then(() => { alert('Coupon code copied to clipboard!'); });";
                            
                            // For Filament v3, you can use:
                            // Notification::make()->title('Coupon code copied!')->success()->send();
                            
                            // For now, we'll just return the code
                            return $record->code;
                        })
                        ->modalHeading('Copy Coupon Code')
                        ->modalContent(fn ($record) => "Coupon code: <strong>{$record->code}</strong>")
                        ->modalActions([
                            Tables\Actions\Action::make('copy')
                                ->label('Copy to Clipboard')
                                ->submit(false),
                        ]),

                    Tables\Actions\Action::make('toggleActive')
                        ->label(fn ($record) => $record->active ? 'Deactivate' : 'Activate')
                        ->icon(fn ($record) => $record->active ? 'heroicon-o-eye-slash' : 'heroicon-o-eye')
                        ->color(fn ($record) => $record->active ? 'warning' : 'success')
                        ->action(function (Coupon $record) {
                            $record->update(['active' => !$record->active]);
                        })
                        ->requiresConfirmation()
                        ->modalHeading(fn ($record) => $record->active ? 'Deactivate Coupon' : 'Activate Coupon')
                        ->modalDescription(fn ($record) => $record->active 
                            ? 'This coupon will no longer be available for use.' 
                            : 'This coupon will become available for use.'
                        ),

                    Tables\Actions\Action::make('duplicate')
                        ->label('Duplicate')
                        ->icon('heroicon-o-document-duplicate')
                        ->color('info')
                        ->action(function (Coupon $record) {
                            $newCoupon = $record->replicate();
                            $newCoupon->code = $record->code . '-COPY-' . Str::random(4);
                            $newCoupon->used_count = 0;
                            $newCoupon->active = false; // Keep duplicated coupons inactive by default
                            $newCoupon->save();
                        })
                        ->requiresConfirmation()
                        ->modalHeading('Duplicate Coupon')
                        ->modalDescription('This will create a copy of this coupon with a new code.'),

                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete Coupon')
                        ->modalDescription('Are you sure you want to delete this coupon? This action cannot be undone.'),
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
                        ->action(fn ($records) => $records->each->update(['active' => true]))
                        ->requiresConfirmation()
                        ->color('success')
                        ->icon('heroicon-o-eye'),

                    Tables\Actions\BulkAction::make('deactivate')
                        ->action(fn ($records) => $records->each->update(['active' => false]))
                        ->requiresConfirmation()
                        ->color('warning')
                        ->icon('heroicon-o-eye-slash'),

                    Tables\Actions\BulkAction::make('resetUsage')
                        ->label('Reset Usage Count')
                        ->icon('heroicon-o-arrow-path')
                        ->color('info')
                        ->action(fn ($records) => $records->each->update(['used_count' => 0]))
                        ->requiresConfirmation()
                        ->modalHeading('Reset Usage Count')
                        ->modalDescription('This will reset the usage count for all selected coupons to zero.'),

                    Tables\Actions\BulkAction::make('exportCoupons')
                        ->label('Export Coupons')
                        ->icon('heroicon-o-arrow-down-tray')
                        ->color('success')
                        ->action(function ($records) {
                            // Export logic would go here
                            // You could generate a CSV or Excel file with coupon data
                        }),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->label('Create Coupon')
                    ->modalHeading('Create New Coupon'),
            ])
            ->defaultSort('created_at', 'desc')
            ->groups([
                Tables\Grouping\Group::make('type')
                    ->label('Discount Type')
                    ->collapsible(),
                Tables\Grouping\Group::make('active')
                    ->label('Active Status')
                    ->collapsible(),
                Tables\Grouping\Group::make('starts_at')
                    ->label('Start Date')
                    ->date()
                    ->collapsible(),
            ])
            ->reorderable('sort')
            ->deferLoading();
    }

    public static function getRelations(): array
    {
        return [
            // You could add relation managers here if you have relationships
            // For example, if you want to track which orders used which coupons
            // RelationManagers\OrdersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoupons::route('/'),
            'create' => Pages\CreateCoupon::route('/create'),
            'edit' => Pages\EditCoupon::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->when(!auth()->user()->isAdmin(), function ($query) {
                // Add any additional query constraints if needed
                return $query;
            });
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('active', true)->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['code'];
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        return [
            'Type' => $record->type === 'percentage' ? "{$record->value}%" : "\${$record->value}",
            'Status' => $record->active ? 'Active' : 'Inactive',
        ];
    }
}