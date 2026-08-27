<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treatment_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('therapist_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('therapy_id')->nullable()->constrained()->nullOnDelete();
            $table->text('observations')->nullable();
            $table->json('consumables')->nullable(); // [{item, qty, unit}]
            $table->unsignedTinyInteger('tolerance')->nullable(); // 1-5
            $table->timestamps();
        });

        Schema::create('housekeeping_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('cleaning'); // cleaning|turndown|laundry|maintenance|amenities|inspection
            $table->string('priority')->default('normal'); // low|normal|high
            $table->string('status')->default('pending'); // pending|in_progress|done|blocked
            $table->text('note')->nullable();
            $table->json('checklist')->nullable(); // [{label, done}]
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'due_at']);
        });

        Schema::create('meal_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('diet_chart_id')->nullable()->constrained()->nullOnDelete();
            $table->date('service_date');
            $table->string('meal'); // breakfast|lunch|dinner|...
            $table->string('time')->nullable();
            $table->json('items')->nullable();
            $table->string('status')->default('planned'); // planned|preparing|served|skipped
            $table->text('note')->nullable();
            $table->timestamps();
            $table->index(['service_date', 'status']);
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->string('housekeeping_status')->default('clean')->after('status'); // clean|dirty|in_progress|inspected
        });
    }

    public function down(): void
    {
        Schema::table('rooms', fn (Blueprint $t) => $t->dropColumn('housekeeping_status'));
        Schema::dropIfExists('meal_orders');
        Schema::dropIfExists('housekeeping_tasks');
        Schema::dropIfExists('treatment_notes');
    }
};
