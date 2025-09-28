<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'phone' => '0100000000',
                'avatar' => null,
                'is_active' => true,
                'role' => UserRole::Admin,
                'password' => Hash::make('password'),
            ]
        );

        // Moderator User
        User::updateOrCreate(
            ['email' => 'moderator@example.com'],
            [
                'name' => 'Moderator User',
                'username' => 'moderator',
                'phone' => '0111111111',
                'avatar' => null,
                'is_active' => true,
                'role' => UserRole::Moderator,
                'password' => Hash::make('password'),
            ]
        );

        // Normal User
        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Normal User',
                'username' => 'user',
                'phone' => '0122222222',
                'avatar' => null,
                'is_active' => true,
                'role' => UserRole::User,
                'password' => Hash::make('password'),
            ]
        );
    }
}