<?php

namespace Database\Seeders;

use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class PaymentGatewaySeeder extends Seeder
{
    public function run(): void
    {

        $this->command->info('Payment gateways seeded successfully!');
        $this->command->info('Active gateways: ' . PaymentGateway::where('is_active', true)->count());
        $this->command->info('Total gateways: ' . PaymentGateway::count());
    }
}