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
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('first_name_ar')->nullable();
            $table->string('last_name_ar')->nullable();
            $table->string('address_ar')->nullable();
            $table->string('grad_ar')->nullable();
            $table->string('department_ar')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn([
                'first_name_ar',
                'last_name_ar',
                'address_ar',
                'grad_ar',
                'department_ar',
            ]);
        });
    }
};
