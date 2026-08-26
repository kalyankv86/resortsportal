<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->string('type')->default('string');
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });

        Schema::create('media_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('disk')->default('media');
            $table->string('path');
            $table->string('url');
            $table->string('mime')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->string('alt')->nullable();
            $table->string('source_ref')->nullable(); // google-photos:<id>
            $table->json('meta')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->index(['media_category_id', 'position']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            $table->index(['auditable_type', 'auditable_id']);
        });

        Schema::create('notification_log', function (Blueprint $table) {
            $table->id();
            $table->string('channel'); // mail|sms|whatsapp|push
            $table->string('to');
            $table->string('template')->nullable();
            $table->json('payload')->nullable();
            $table->string('status')->default('queued'); // queued|sent|failed
            $table->text('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_log');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('media_assets');
        Schema::dropIfExists('media_categories');
        Schema::dropIfExists('settings');
    }
};
