<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('type')->default('payment')->after('reference'); // payment|refund
            $table->string('gateway')->nullable()->after('method');
            $table->text('instructions')->nullable()->after('gateway_ref');
            $table->foreignId('recorded_by')->nullable()->after('instructions')->constrained('users')->nullOnDelete();
            $table->timestamp('failed_at')->nullable()->after('paid_at');
        });

        Schema::create('refund_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('INR');
            $table->text('reason')->nullable();
            $table->string('status')->default('requested'); // requested|approved|rejected|processed
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();
        });

        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->date('entry_date');
            $table->string('category'); // room|package|therapy|dining|gift_card|other|refund
            $table->string('direction')->default('credit'); // credit|debit
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('INR');
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
            $table->index(['entry_date', 'category']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('status')->default('issued')->after('number'); // issued|paid|void
            $table->string('financial_year', 9)->nullable()->after('status');
            $table->string('buyer_name')->nullable()->after('financial_year');
            $table->string('buyer_state')->nullable()->after('buyer_name');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', fn (Blueprint $t) => $t->dropColumn(['status', 'financial_year', 'buyer_name', 'buyer_state']));
        Schema::dropIfExists('ledger_entries');
        Schema::dropIfExists('refund_requests');
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('recorded_by');
            $table->dropColumn(['type', 'gateway', 'instructions', 'failed_at']);
        });
    }
};
