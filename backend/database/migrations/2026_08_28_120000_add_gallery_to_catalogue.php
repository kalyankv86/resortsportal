<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-managed photo galleries for rooms, services (therapies) and packages.
 * Stores an ordered array of media_assets ids; resolved to URLs on read.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['room_categories', 'therapies', 'wellness_programs'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->json('gallery')->nullable()->after('media_category');
            });
        }
    }

    public function down(): void
    {
        foreach (['room_categories', 'therapies', 'wellness_programs'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('gallery');
            });
        }
    }
};
