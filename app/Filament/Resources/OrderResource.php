<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use App\Models\UserAddress;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Sales';

    protected static ?string $navigationLabel = 'Orders';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Order Information')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('Customer')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->reactive()
                            ->afterStateUpdated(function ($set, $state) {
                                if ($state) {
                                    $set('order_number', 'ORD-' . strtoupper(Str::random(8)) . '-' . time());
                                }
                            }),
                        
                        Forms\Components\Select::make('user_address_id')
                            ->label('Shipping Address')
                            ->options(function (callable $get) {
                                $userId = $get('user_id');
                                if (!$userId) {
                                    return [];
                                }
                                return UserAddress::where('user_id', $userId)
                                    ->get()
                                    ->mapWithKeys(fn ($address) => [
                                        $address->id => $address->full_address
                                    ])
                                    ->toArray();
                            })
                            ->searchable()
                            ->required(),
                        
                        Forms\Components\TextInput::make('order_number')
                            ->label('Order Number')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->default('ORD-' . strtoupper(Str::random(8)) . '-' . time())
                            ->maxLength(255),
                    ])
                    ->columns(2),
                
                Forms\Components\Section::make('Order Amounts')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('subtotal')
                                    ->numeric()
                                    ->required()
                                    ->prefix('$')
                                    ->default(0),
                                
                                Forms\Components\TextInput::make('discount')
                                    ->numeric()
                                    ->prefix('$')
                                    ->default(0),
                                
                                Forms\Components\TextInput::make('tax')
                                    ->numeric()
                                    ->prefix('$')
                                    ->default(0),
                            ]),
                        
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('shipping_cost')
                                    ->numeric()
                                    ->prefix('$')
                                    ->default(0),
                                
                                Forms\Components\TextInput::make('total_amount')
                                    ->numeric()
                                    ->required()
                                    ->prefix('$')
                                    ->default(0),
                            ]),
                    ]),
                
                Forms\Components\Section::make('Payment Information')
                    ->schema([
                        Forms\Components\Select::make('payment_status')
                            ->options([
                                'pending' => 'Pending',
                                'paid' => 'Paid',
                                'failed' => 'Failed',
                                'refunded' => 'Refunded',
                                'partially_refunded' => 'Partially Refunded',
                            ])
                            ->default('pending')
                            ->required(),
                        
                        Forms\Components\Select::make('payment_method')
                            ->options([
                                'stripe' => 'Stripe',
                                'paypal' => 'PayPal',
                                'razorpay' => 'Razorpay',
                                'cash_on_delivery' => 'Cash on Delivery',
                                'bank_transfer' => 'Bank Transfer',
                            ])
                            ->searchable(),
                        
                        Forms\Components\TextInput::make('transaction_id')
                            ->label('Transaction ID')
                            ->maxLength(255),
                    ])
                    ->columns(3),
                
                Forms\Components\Section::make('Shipping Information')
                    ->schema([
                        Forms\Components\Select::make('shipping_status')
                            ->options([
                                'pending' => 'Pending',
                                'processing' => 'Processing',
                                'shipped' => 'Shipped',
                                'delivered' => 'Delivered',
                                'cancelled' => 'Cancelled',
                            ])
                            ->default('pending')
                            ->required(),
                        
                        Forms\Components\TextInput::make('tracking_number')
                            ->maxLength(255),
                        
                        Forms\Components\TextInput::make('carrier')
                            ->maxLength(255),
                    ])
                    ->columns(3),
                
                Forms\Components\Section::make('Order Status & Notes')
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'confirmed' => 'Confirmed',
                                'processing' => 'Processing',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                                'refunded' => 'Refunded',
                            ])
                            ->default('pending')
                            ->required(),
                        
                        Forms\Components\Textarea::make('notes')
                            ->rows(3)
                            ->maxLength(1000)
                            ->placeholder('Additional notes about this order...'),
                    ])
                    ->columns(1),
                
                Forms\Components\Section::make('Order Items')
                    ->schema([
                        Forms\Components\Repeater::make('items')
                            ->relationship('items')
                            ->schema([
                                Forms\Components\Select::make('product_id')
                                    ->relationship('product', 'name')
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->reactive()
                                    ->afterStateUpdated(function ($set, $state, $get) {
                                        if ($state) {
                                            $product = \App\Models\Product::find($state);
                                            if ($product) {
                                                $set('product_name', $product->name);
                                                $set('unit_price', $product->price);
                                            }
                                        }
                                    }),
                                
                                Forms\Components\TextInput::make('product_name')
                                    ->required()
                                    ->maxLength(255),
                                
                                Forms\Components\Select::make('product_variant_id')
                                    ->label('Variant')
                                    ->relationship('variant', 'sku')
                                    ->searchable()
                                    ->preload(),
                                
                                Forms\Components\KeyValue::make('variant_values')
                                    ->keyLabel('Attribute')
                                    ->valueLabel('Value')
                                    ->addActionLabel('Add Variant'),
                                
                                Forms\Components\TextInput::make('quantity')
                                    ->numeric()
                                    ->required()
                                    ->default(1)
                                    ->minValue(1)
                                    ->reactive()
                                    ->afterStateUpdated(function ($set, $state, $get) {
                                        self::calculateItemTotal($set, $state, $get);
                                    }),
                                
                                Forms\Components\TextInput::make('unit_price')
                                    ->numeric()
                                    ->required()
                                    ->prefix('$')
                                    ->default(0)
                                    ->reactive()
                                    ->afterStateUpdated(function ($set, $state, $get) {
                                        self::calculateItemTotal($set, $state, $get);
                                    }),
                                
                                Forms\Components\TextInput::make('discount')
                                    ->numeric()
                                    ->prefix('$')
                                    ->default(0)
                                    ->reactive()
                                    ->afterStateUpdated(function ($set, $state, $get) {
                                        self::calculateItemTotal($set, $state, $get);
                                    }),
                                
                                Forms\Components\TextInput::make('tax')
                                    ->numeric()
                                    ->prefix('$')
                                    ->default(0)
                                    ->reactive()
                                    ->afterStateUpdated(function ($set, $state, $get) {
                                        self::calculateItemTotal($set, $state, $get);
                                    }),
                                
                                Forms\Components\TextInput::make('total')
                                    ->numeric()
                                    ->prefix('$')
                                    ->default(0)
                                    ->disabled()
                                    ->dehydrated(),
                            ])
                            ->columns(2)
                            ->columnSpanFull()
                            ->defaultItems(1)
                            ->minItems(1)
                            ->maxItems(50)
                            ->deleteAction(
                                fn (Forms\Components\Actions\Action $action) => $action->requiresConfirmation(),
                            ),
                    ])
                    ->collapsible(),

                Forms\Components\Section::make('Timestamps')
                    ->schema([
                        Forms\Components\Placeholder::make('created_at')
                            ->label('Created at')
                            ->content(fn ($record): string => $record?->created_at ? $record->created_at->format('M j, Y g:i A') : '-'),
                        
                        Forms\Components\Placeholder::make('updated_at')
                            ->label('Last updated at')
                            ->content(fn ($record): string => $record?->updated_at ? $record->updated_at->format('M j, Y g:i A') : '-'),
                    ])
                    ->columns(2)
                    ->visible(fn ($record) => $record !== null),
            ]);
    }

    protected static function calculateItemTotal($set, $quantity, $get): void
    {
        $unitPrice = (float) $get('unit_price') ?? 0;
        $discount = (float) $get('discount') ?? 0;
        $tax = (float) $get('tax') ?? 0;
        
        $total = ($unitPrice * $quantity) - $discount + $tax;
        $set('total', max(0, $total));
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->weight('semibold')
                    ->description(fn ($record) => $record->created_at?->format('M j, Y')),
                
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Customer')
                    ->searchable()
                    ->sortable()
                    ->url(fn ($record) => UserResource::getUrl('edit', ['record' => $record->user_id]))
                    ->openUrlInNewTab(),
                
                Tables\Columns\TextColumn::make('total_amount')
                    ->money('USD')
                    ->sortable()
                    ->color('success')
                    ->weight('medium'),
                
                Tables\Columns\TextColumn::make('payment_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'paid' => 'success',
                        'failed' => 'danger',
                        'refunded' => 'gray',
                        'partially_refunded' => 'info',
                    })
                    ->formatStateUsing(fn (string $state): string => strtoupper($state))
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('shipping_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'gray',
                        'processing' => 'info',
                        'shipped' => 'warning',
                        'delivered' => 'success',
                        'cancelled' => 'danger',
                    })
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'processing' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        'refunded' => 'gray',
                    })
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('items_count')
                    ->label('Items')
                    ->counts('items')
                    ->badge()
                    ->color('gray')
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('payment_method')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state ? Str::headline($state) : '-')
                    ->color('gray'),
                
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('payment_status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Paid',
                        'failed' => 'Failed',
                        'refunded' => 'Refunded',
                    ]),
                
                Tables\Filters\SelectFilter::make('shipping_status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'shipped' => 'Shipped',
                        'delivered' => 'Delivered',
                    ]),
                
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                    ]),
                
                Tables\Filters\SelectFilter::make('payment_method')
                    ->options([
                        'stripe' => 'Stripe',
                        'paypal' => 'PayPal',
                        'razorpay' => 'Razorpay',
                        'cash_on_delivery' => 'Cash on Delivery',
                    ]),
                
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
                        ->icon('heroicon-o-eye'),
                    
                    Tables\Actions\EditAction::make()
                        ->icon('heroicon-o-pencil'),
                    
                    Tables\Actions\Action::make('markAsPaid')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(function (Order $record) {
                            $record->update(['payment_status' => 'paid', 'status' => 'confirmed']);
                        })
                        ->requiresConfirmation()
                        ->visible(fn (Order $record): bool => $record->payment_status !== 'paid'),
                    
                    Tables\Actions\Action::make('markAsShipped')
                        ->icon('heroicon-o-truck')
                        ->color('warning')
                        ->action(function (Order $record) {
                            $record->update(['shipping_status' => 'shipped', 'status' => 'processing']);
                        })
                        ->requiresConfirmation()
                        ->visible(fn (Order $record): bool => $record->shipping_status === 'processing'),
                    
                    Tables\Actions\Action::make('markAsDelivered')
                        ->icon('heroicon-o-gift')
                        ->color('success')
                        ->action(function (Order $record) {
                            $record->update([
                                'shipping_status' => 'delivered', 
                                'status' => 'completed',
                                'payment_status' => 'paid'
                            ]);
                        })
                        ->requiresConfirmation()
                        ->visible(fn (Order $record): bool => $record->shipping_status === 'shipped'),
                    
                    Tables\Actions\DeleteAction::make()
                        ->icon('heroicon-o-trash')
                        ->requiresConfirmation(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation(),
                    
                    Tables\Actions\BulkAction::make('markAsPaid')
                        ->label('Mark as Paid')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(function ($records) {
                            $records->each->update(['payment_status' => 'paid', 'status' => 'confirmed']);
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    
                    Tables\Actions\BulkAction::make('markAsShipped')
                        ->label('Mark as Shipped')
                        ->icon('heroicon-o-truck')
                        ->color('warning')
                        ->action(function ($records) {
                            $records->each->update(['shipping_status' => 'shipped', 'status' => 'processing']);
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->icon('heroicon-o-plus'),
            ])
            ->defaultSort('created_at', 'desc')
            ->deferLoading()
            ->striped();
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
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'primary';
    }

    public static function getModelLabel(): string
    {
        return 'Order';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Orders';
    }

    // // Restrict access to admin users only
    // public static function canViewAny(): bool
    // {
    //     return Auth::user()?->isAdmin() ?? false;
    // }

    // public static function canCreate(): bool
    // {
    //     return Auth::user()?->isAdmin() ?? false;
    // }

    // public static function canEdit($record): bool
    // {
    //     return Auth::user()?->isAdmin() ?? false;
    // }

    // public static function canDelete($record): bool
    // {
    //     return Auth::user()?->isAdmin() ?? false;
    // }
}

