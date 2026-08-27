<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Setting::orderBy('group')->orderBy('key')->get(['id', 'group', 'key', 'value', 'type', 'is_public']),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array', 'min:1'],
            'settings.*.key' => ['required', 'string', 'exists:settings,key'],
            'settings.*.value' => ['present'],
        ]);

        foreach ($data['settings'] as $s) {
            Setting::where('key', $s['key'])->update(['value' => $s['value']]);
        }

        return response()->json(['data' => Setting::orderBy('group')->get(['group', 'key', 'value'])]);
    }
}
