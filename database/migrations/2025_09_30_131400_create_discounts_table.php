<?php

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
     
        Schema::create('discounts', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->enum('type', ['percentage', 'fixed']); // % or fixed
    $table->decimal('value', 10, 2);              // discount amount
    $table->morphs('discountable');               // discountable_id + discountable_type
    $table->timestamp('starts_at')->nullable();
    $table->timestamp('ends_at')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
