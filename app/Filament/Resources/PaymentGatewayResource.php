<?php

namespace App\Filament\Resources;
use App\Filament\Resources\PaymentGatewayResource\Pages;
use App\Models\PaymentGateway;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PaymentGatewayResource extends Resource
{
    protected static ?string $model = PaymentGateway::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'System';

    protected static ?string $navigationLabel = 'Payment Gateways';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Gateway Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set) {
                                $set('slug', Str::slug($state));
                            })
                            ->placeholder('e.g., Stripe, PayPal, Razorpay'),
                        
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->disabled()
                            ->dehydrated()
                            ->placeholder('auto-generated-slug'),
                        
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true)
                            ->inline(false)
                            ->helperText('Enable or disable this payment gateway'),
                    ])
                    ->columns(1),
                
                Forms\Components\Section::make('Gateway Credentials')
                    ->schema([
                        Forms\Components\KeyValue::make('credentials')
                            ->keyLabel('Setting Name')
                            ->valueLabel('Value')
                            ->addActionLabel('Add Credential')
                            ->reorderable()
                            ->helperText('Add the required credentials for this payment gateway. These are stored securely.')
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->persistCollapsed(),

                Forms\Components\Section::make('Additional Information')
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

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                
                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->sortable()
                    ->color('gray')
                    ->badge(),
                
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->sortable(),
                
                Tables\Columns\TextColumn::make('credentials_count')
                    ->label('Credentials')
                    ->getStateUsing(fn ($record): int => count($record->credentials ?? []))
                    ->badge()
                    ->color(fn ($state): string => $state > 0 ? 'info' : 'gray'),
                
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('active')
                    ->label('Active Gateways')
                    ->query(fn ($query) => $query->where('is_active', true)),
                
                Tables\Filters\Filter::make('inactive')
                    ->label('Inactive Gateways')
                    ->query(fn ($query) => $query->where('is_active', false)),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->icon('heroicon-o-pencil-square')
                    ->color('primary'),
                
                Tables\Actions\Action::make('activate')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->action(function (PaymentGateway $record) {
                        $record->update(['is_active' => true]);
                    })
                    ->requiresConfirmation()
                    ->visible(fn (PaymentGateway $record): bool => !$record->is_active),
                
                Tables\Actions\Action::make('deactivate')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->action(function (PaymentGateway $record) {
                        $record->update(['is_active' => false]);
                    })
                    ->requiresConfirmation()
                    ->visible(fn (PaymentGateway $record): bool => $record->is_active),
                
                Tables\Actions\DeleteAction::make()
                    ->icon('heroicon-o-trash')
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->requiresConfirmation(),
                    
                    Tables\Actions\BulkAction::make('activateSelected')
                        ->label('Activate Selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(function ($records) {
                            $records->each->update(['is_active' => true]);
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    
                    Tables\Actions\BulkAction::make('deactivateSelected')
                        ->label('Deactivate Selected')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(function ($records) {
                            $records->each->update(['is_active' => false]);
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->icon('heroicon-o-plus'),
            ])
            ->emptyStateDescription('No payment gateways found. Create your first one!')
            ->emptyStateIcon('heroicon-o-credit-card')
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
            'index' => Pages\ListPaymentGateways::route('/'),
            'create' => Pages\CreatePaymentGateway::route('/create'),
            'edit' => Pages\EditPaymentGateway::route('/{record}/edit'),
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
        return 'Payment Gateway';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Payment Gateways';
    }

    // Restrict access to admin users only
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