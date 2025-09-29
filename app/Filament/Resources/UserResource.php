<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'User Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('username')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\TextInput::make('phone')
                            ->tel()
                            ->maxLength(255),
                        Forms\Components\Select::make('role')
                            ->options(UserRole::class)
                            ->required()
                            ->native(false),
                        Forms\Components\FileUpload::make('avatar')
                            ->image()
                            ->avatar()
                            ->directory('avatars')
                            ->maxSize(2048),
                        Forms\Components\Toggle::make('is_active')
                            ->required()
                            ->default(true),
                    ])->columns(2),
                
                Forms\Components\Section::make('Security')
                    ->schema([
                        Forms\Components\TextInput::make('password')
                            ->password()
                            ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn (string $context): bool => $context === 'create')
                            ->maxLength(255)
                            ->confirmed(),
                        Forms\Components\TextInput::make('password_confirmation')
                            ->password()
                            ->required(fn (string $context): bool => $context === 'create')
                            ->maxLength(255)
                            ->dehydrated(false),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('avatar')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&color=7F9CF5&background=EBF4FF'),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('username')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('phone')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('role')
                    ->badge()
                    ->color(fn (UserRole $state): string => match ($state) {
                        UserRole::Admin => 'danger',
                        UserRole::Moderator => 'warning',
                        UserRole::User => 'success',
                    }),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('addresses_count')
                    ->label('Addresses')
                    ->counts('addresses')
                    ->sortable(),
                Tables\Columns\TextColumn::make('orders_count')
                    ->label('Orders')
                    ->counts('orders')
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
                Tables\Filters\SelectFilter::make('role')
                    ->options(UserRole::class),
                Tables\Filters\TernaryFilter::make('is_active'),
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
                Tables\Filters\Filter::make('has_addresses')
                    ->label('Has Addresses')
                    ->query(fn (Builder $query): Builder => $query->whereHas('addresses')),
                Tables\Filters\Filter::make('has_orders')
                    ->label('Has Orders')
                    ->query(fn (Builder $query): Builder => $query->whereHas('orders')),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make()
                        ->modalHeading('View User')
                        ->modalWidth('4xl'),
                    Tables\Actions\EditAction::make()
                        ->modalHeading('Edit User')
                        ->modalWidth('4xl'),
                    Tables\Actions\Action::make('activate')
                        ->action(fn (User $record) => $record->update(['is_active' => true]))
                        ->requiresConfirmation()
                        ->modalHeading('Activate User')
                        ->modalDescription('Are you sure you want to activate this user?')
                        ->color('success')
                        ->icon('heroicon-o-check-circle')
                        ->visible(fn (User $record): bool => !$record->is_active),
                    Tables\Actions\Action::make('deactivate')
                        ->action(fn (User $record) => $record->update(['is_active' => false]))
                        ->requiresConfirmation()
                        ->modalHeading('Deactivate User')
                        ->modalDescription('Are you sure you want to deactivate this user?')
                        ->color('warning')
                        ->icon('heroicon-o-x-circle')
                        ->visible(fn (User $record): bool => $record->is_active),
                    Tables\Actions\Action::make('changePassword')
                        ->form([
                            Forms\Components\TextInput::make('password')
                                ->password()
                                ->required()
                                ->confirmed()
                                ->maxLength(255),
                            Forms\Components\TextInput::make('password_confirmation')
                                ->password()
                                ->required()
                                ->maxLength(255),
                        ])
                        ->action(function (User $record, array $data): void {
                            $record->update([
                                'password' => Hash::make($data['password']),
                            ]);
                        })
                        ->modalHeading('Change Password')
                        ->modalDescription('Enter a new password for this user.')
                        ->icon('heroicon-o-key'),
                    Tables\Actions\DeleteAction::make()
                        ->modalHeading('Delete User')
                        ->modalDescription('Are you sure you want to delete this user? This action cannot be undone.'),
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
                        ->icon('heroicon-o-check-circle'),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->requiresConfirmation()
                        ->color('warning')
                        ->icon('heroicon-o-x-circle'),
                ]),
            ])
            ->emptyStateActions([
                Tables\Actions\CreateAction::make()
                    ->modalWidth('4xl'),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            // Relation managers removed for now
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}