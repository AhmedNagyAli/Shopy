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
        Schema::table('attribute_values', function (Blueprint $table) {
            $table->string('color_code')->nullable();
            $table->decimal('extra_price', 8, 2)->default(0);
            $table->integer('sort_order')->default(0);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attribute_values', function (Blueprint $table) {
             $table->dropColumn(['color_code', 'extra_price', 'sort_order']);
        });
    }
};
