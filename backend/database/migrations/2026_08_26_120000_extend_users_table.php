<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->string('status')->default('active')->after('avatar_url'); // active|suspended|invited
            $table->string('locale', 8)->default('en')->after('status');
            $table->boolean('is_staff')->default(false)->after('locale');
            $table->timestamp('last_login_at')->nullable()->after('is_staff');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'avatar_url', 'status', 'locale', 'is_staff', 'last_login_at']);
        });
    }
};
