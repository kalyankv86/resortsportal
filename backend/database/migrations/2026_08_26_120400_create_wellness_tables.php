<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('therapy_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('therapies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('therapy_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->json('benefits')->nullable();
            $table->text('contraindications')->nullable();
            $table->unsignedInteger('duration_min')->default(60);
            $table->text('preparation')->nullable();
            $table->text('aftercare')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->default('INR');
            $table->string('media_category')->nullable();
            $table->string('status')->default('published');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('wellness_programs', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->unsignedInteger('nights')->default(3);
            $table->string('goal')->nullable();
            $table->decimal('price_from', 10, 2)->nullable();
            $table->string('currency', 3)->default('INR');
            $table->boolean('doctor_led')->default(true);
            $table->json('inclusions')->nullable();
            $table->json('daily_schedule')->nullable();
            $table->string('media_category')->nullable();
            $table->string('status')->default('published');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('qualifications')->nullable();
            $table->text('bio')->nullable();
            $table->json('specialities')->nullable();
            $table->foreignId('photo_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->unsignedTinyInteger('years_experience')->nullable();
            $table->string('status')->default('active');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('therapists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('speciality')->nullable();
            $table->text('bio')->nullable();
            $table->foreignId('photo_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('status')->default('active');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('therapists');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('wellness_programs');
        Schema::dropIfExists('therapies');
        Schema::dropIfExists('therapy_categories');
    }
};
