<?php

namespace App\Filament\Resources\Users\Tables;

use App\Enums\UserRole;
use App\Models\User;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\RestoreAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Actions\ActionGroup;
use Filament\Actions\ViewAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Actions\Action;
use Filament\Actions\ForceDeleteAction;


class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar')
                    ->label('')
                    ->circular()
                    ->defaultImageUrl(fn (User $record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&color=FFFFFF&background=111827'),
                
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('username')
                    ->searchable()
                    ->sortable()
                    ->color('gray'),
                
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-m-envelope')
                    ->iconColor('primary'),
                
                TextColumn::make('role')
                    ->badge()
                    ->color(fn (UserRole $state): string => match ($state) {
                        UserRole::Admin => 'danger',
                        UserRole::Moderator => 'warning',
                        UserRole::User => 'success',
                    })
                    ->formatStateUsing(fn (UserRole $state): string => ucfirst($state->value)),
                
                TextColumn::make('phone')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-m-phone')
                    ->iconColor('success'),
                
                IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
                
                TextColumn::make('orders_count')
                    ->counts('orders')
                    ->label('Orders')
                    ->sortable()
                    ->icon('heroicon-m-shopping-bag'),
                
                TextColumn::make('email_verified_at')
                    ->dateTime()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->sortable(),
                
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                // Add filters here if needed
            ])
            ->actions([
                ActionGroup::make([
                    ViewAction::make(),
                    EditAction::make(),
                    Action::make('activate')
                        ->label('Activate')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(fn (User $record) => $record->update(['is_active' => true]))
                        ->requiresConfirmation()
                        ->visible(fn (User $record): bool => !$record->is_active),
                    
                    Action::make('deactivate')
                        ->label('Deactivate')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(fn (User $record) => $record->update(['is_active' => false]))
                        ->requiresConfirmation()
                        ->visible(fn (User $record): bool => $record->is_active),
                    
                    Action::make('impersonate')
                        ->label('Impersonate')
                        ->icon('heroicon-o-user')
                        ->color('warning')
                        //->url(fn (User $record): string => route('impersonate', $record->id))
                        ->visible(fn (): bool => auth()->user()->isAdmin())
                        ->openUrlInNewTab(),
                    
                    DeleteAction::make(),
                    ForceDeleteAction::make(),
                    RestoreAction::make(),
                ]),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    // Add more bulk actions here if needed
                ]),
            ]);
    }
}