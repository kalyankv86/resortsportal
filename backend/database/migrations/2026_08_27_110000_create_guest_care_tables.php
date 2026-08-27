<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dosha_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('vata')->default(0);
            $table->unsignedTinyInteger('pitta')->default(0);
            $table->unsignedTinyInteger('kapha')->default(0);
            $table->string('prakriti')->nullable();  // constitutional
            $table->string('vikriti')->nullable();   // current imbalance
            $table->text('notes')->nullable();
            $table->timestamp('assessed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('diet_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->default('Prescribed diet');
            $table->json('meals')->nullable();   // [{meal, items[], time, notes}]
            $table->json('avoid')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('active'); // active|superseded
            $table->date('effective_from')->nullable();
            $table->timestamps();
        });

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $table->json('items');   // [{medicine, dose, timing, duration, anupana}]
            $table->text('advice')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();
        });

        Schema::create('progress_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->date('entry_date');
            $table->json('metrics')->nullable(); // {weight_kg, sleep_hours, sleep_score, stress_score, water_l}
            $table->text('note')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['guest_id', 'entry_date']);
        });

        Schema::create('loyalty_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->integer('points'); // +earn / -redeem
            $table->integer('balance_after');
            $table->string('reason');
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->timestamps();
        });

        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->string('kind'); // program|therapy|experience|room
            $table->string('ref');  // slug
            $table->string('label');
            $table->timestamps();
            $table->unique(['guest_id', 'kind', 'ref']);
        });

        Schema::table('guests', function (Blueprint $table) {
            $table->integer('loyalty_points')->default(0)->after('notes');
            $table->string('loyalty_tier')->default('Green')->after('loyalty_points');
        });
    }

    public function down(): void
    {
        Schema::table('guests', fn (Blueprint $t) => $t->dropColumn(['loyalty_points', 'loyalty_tier']));
        Schema::dropIfExists('wishlist_items');
        Schema::dropIfExists('loyalty_ledger');
        Schema::dropIfExists('progress_entries');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('diet_charts');
        Schema::dropIfExists('dosha_assessments');
    }
};
