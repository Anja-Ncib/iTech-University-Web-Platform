<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
public function up(): void
{
    Schema::create('teachers', function (Blueprint $table) {
        $table->id();
        $table->char('cin', 8)->unique();
        $table->string('first_name', 100);
        $table->string('last_name', 100);
        $table->string('address', 255)->nullable();
        $table->string('email', 100)->unique()->nullable();
        $table->string('phone_number', 20)->nullable();
        $table->string('grad', 50)->nullable();       // Grade like Professor, Assistant...
        $table->string('department', 100)->nullable();
        $table->date('birth_date')->nullable();
        $table->timestamps();
        $table->boolean('is_deleted')->default(false);
    });

//CHECK constraint
DB::statement("ALTER TABLE teachers ADD CONSTRAINT chk_cin_digits CHECK (cin REGEXP '^[0-9]{8}$')");
}

public function down(): void
{
Schema::dropIfExists('teachers');
}
};
