<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->string('type')->default('percent'); // percent|fixed
            $table->decimal('value', 10, 2);
            $table->decimal('min_amount', 12, 2)->nullable();
            $table->unsignedTinyInteger('min_nights')->nullable();
            $table->unsignedInteger('max_redemptions')->nullable();
            $table->unsignedInteger('redeemed')->default(0);
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('booking_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('kind')->default('medical_report'); // medical_report|id_proof|other
            $table->string('original_name');
            $table->string('path');
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('waitlist_entries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->foreignId('wellness_program_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('room_category_id')->nullable()->constrained()->nullOnDelete();
            $table->date('preferred_check_in')->nullable();
            $table->date('preferred_check_out')->nullable();
            $table->unsignedTinyInteger('guests')->default(1);
            $table->string('status')->default('waiting'); // waiting|offered|converted|expired
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_type')->default('individual')->after('source'); // individual|corporate|international
            $table->decimal('discount', 12, 2)->default(0)->after('subtotal');
            $table->string('qr_token', 64)->nullable()->unique()->after('reference');
            $table->string('contact_email')->nullable()->after('special_requests');
            $table->string('contact_phone')->nullable()->after('contact_email');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['booking_type', 'discount', 'qr_token', 'contact_email', 'contact_phone']);
        });
        Schema::dropIfExists('waitlist_entries');
        Schema::dropIfExists('booking_documents');
        Schema::dropIfExists('promo_codes');
    }
};
