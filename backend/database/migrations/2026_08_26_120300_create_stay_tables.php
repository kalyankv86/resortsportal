<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->unsignedTinyInteger('base_occupancy')->default(2);
            $table->unsignedTinyInteger('max_occupancy')->default(3);
            $table->unsignedInteger('size_sqft')->nullable();
            $table->json('amenities')->nullable();
            $table->string('media_category')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_category_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('floor')->nullable();
            $table->string('view')->nullable();
            $table->string('status')->default('available'); // available|maintenance|blocked
            $table->timestamps();
        });

        Schema::create('rate_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('currency', 3)->default('INR');
            $table->decimal('nightly_rate', 10, 2);
            $table->unsignedTinyInteger('min_nights')->default(1);
            $table->unsignedTinyInteger('max_nights')->default(30);
            $table->boolean('refundable')->default(true);
            $table->json('inclusions')->nullable();
            $table->json('season')->nullable(); // [{from,to,multiplier}]
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('room_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('status')->default('open'); // open|held|booked|closed
            $table->foreignId('booking_id')->nullable();
            $table->decimal('price_override', 10, 2)->nullable();
            $table->timestamps();
            $table->unique(['room_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_availability');
        Schema::dropIfExists('rate_plans');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('room_categories');
    }
};
