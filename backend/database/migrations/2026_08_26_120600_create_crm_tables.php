<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('topic')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('new'); // new|contacted|converted|closed
            $table->string('source')->default('web');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('status')->default('pending'); // pending|subscribed|unsubscribed
            $table->string('source')->default('web');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('therapist_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('therapy_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('consultation'); // consultation|therapy|follow_up
            $table->timestamp('scheduled_at');
            $table->unsignedInteger('duration_min')->default(30);
            $table->string('status')->default('scheduled'); // scheduled|completed|no_show|cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['scheduled_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('newsletter_subscribers');
        Schema::dropIfExists('enquiries');
    }
};
