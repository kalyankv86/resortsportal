<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::query()
            ->with('user:id,name')
            ->when($request->query('action'), fn ($q, $a) => $q->where('action', 'ilike', "%{$a}%"))
            ->when($request->query('type'), fn ($q, $t) => $q->where('auditable_type', 'ilike', "%{$t}%"))
            ->latest()
            ->paginate(min(100, (int) $request->query('per_page', 40)));

        $logs->getCollection()->transform(fn (AuditLog $l) => [
            'id' => $l->id,
            'action' => $l->action,
            'entity' => class_basename((string) $l->auditable_type).' #'.$l->auditable_id,
            'by' => $l->user?->name ?? 'system',
            'changes' => $l->new_values,
            'old' => $l->old_values,
            'ip' => $l->ip,
            'at' => $l->created_at,
        ]);

        return response()->json($logs);
    }
}
