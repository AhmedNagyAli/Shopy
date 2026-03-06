<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // Relationship to order
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();

            // Product + variant (nullable)
            $table->foreignIdFor(Product::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ProductVariant::class)->nullable()->constrained()->nullOnDelete();

            // Item details
            $table->string('product_name'); // snapshot of name at purchase time
            $table->json('variant_values')->nullable(); // snapshot of chosen attributes like size/color
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2); // per-item price at purchase time
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2); // final line total = (unit_price - discount + tax) * quantity

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
