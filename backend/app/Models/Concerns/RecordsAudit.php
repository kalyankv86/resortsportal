<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

/**
 * Lightweight audit trail. Add to a model and every create/update/delete is
 * written to audit_logs with the changed attributes (secrets excluded).
 */
trait RecordsAudit
{
    protected static array $auditIgnore = ['updated_at', 'created_at', 'password', 'remember_token', 'qr_token'];

    public static function bootRecordsAudit(): void
    {
        static::created(fn ($m) => $m->writeAudit('created', [], $m->auditable()));
        static::updated(function ($m) {
            $changes = collect($m->getChanges())->except(static::$auditIgnore);
            if ($changes->isEmpty()) {
                return;
            }
            $old = collect($m->getOriginal())->only($changes->keys())->all();
            $m->writeAudit('updated', ['old' => $old, 'new' => $changes->all()]);
        });
        static::deleted(fn ($m) => $m->writeAudit('deleted', []));
    }

    protected function auditable(): array
    {
        return collect($this->getAttributes())->except(static::$auditIgnore)->all();
    }

    protected function writeAudit(string $action, array $values): void
    {
        try {
            $request = request();
            AuditLog::create([
                'user_id' => Auth::guard('api')->id(),
                'action' => class_basename($this).'.'.$action,
                'auditable_type' => static::class,
                'auditable_id' => $this->getKey(),
                'old_values' => $values['old'] ?? null,
                'new_values' => $values['new'] ?? ($values ?: null),
                'ip' => $request?->ip(),
                'user_agent' => substr((string) $request?->userAgent(), 0, 255),
            ]);
        } catch (\Throwable) {
            // never let auditing break a write
        }
    }
}
