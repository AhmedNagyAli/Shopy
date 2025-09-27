<?php

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // Relationships
    $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();  
    $table->foreignIdFor(UserAddress::class)->constrained()->cascadeOnDelete();  

    // Order details
    $table->string('order_number')->unique(); // e.g. ORD-2025-0001
    $table->decimal('subtotal', 12, 2)->default(0); // before discounts/taxes
    $table->decimal('discount', 12, 2)->default(0);
    $table->decimal('tax', 12, 2)->default(0);
    $table->decimal('shipping_cost', 12, 2)->default(0);
    $table->decimal('total_amount', 12, 2)->default(0);

    // Payment
    $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
    $table->string('payment_method')->nullable(); // cash, card, paypal, etc.
    $table->string('transaction_id')->nullable(); // external gateway ref

    // Shipping
    $table->enum('shipping_status', ['pending', 'shipped', 'delivered', 'returned'])->default('pending');
    $table->string('tracking_number')->nullable();
    $table->string('carrier')->nullable(); // DHL, FedEx, Aramex, etc.

    // Order status
    $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
    $table->text('notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
