<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Only add if they don't already exist
            if (!Schema::hasColumn('orders', 'created_at') && !Schema::hasColumn('orders', 'updated_at')) {
                $table->timestamps(); // adds created_at & updated_at
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Safely drop them if they exist
            if (Schema::hasColumn('orders', 'created_at')) {
                $table->dropColumn('created_at');
            }
            if (Schema::hasColumn('orders', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
};
