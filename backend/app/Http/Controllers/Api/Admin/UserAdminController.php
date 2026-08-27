<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class UserAdminController extends Controller
{
    public function roles(): JsonResponse
    {
        return response()->json(['data' => Role::orderBy('name')->pluck('name')]);
    }

    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->with('roles:id,name')
            ->when($request->query('q'), fn ($q, $t) => $q->where(fn ($w) => $w
                ->where('name', 'ilike', "%{$t}%")->orWhere('email', 'ilike', "%{$t}%")))
            ->when($request->query('role'), fn ($q, $r) => $q->whereHas('roles', fn ($w) => $w->where('name', $r)))
            ->orderBy('name')
            ->paginate(min(100, (int) $request->query('per_page', 30)));

        $users->getCollection()->transform(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'phone' => $u->phone,
            'status' => $u->status,
            'is_staff' => $u->is_staff,
            'roles' => $u->roles->pluck('name'),
            'last_login_at' => $u->last_login_at,
        ]);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        $tempPassword = Str::random(12);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($tempPassword),
            'is_staff' => ! in_array('guest', $data['roles'], true),
            'status' => 'active',
        ]);
        $user->syncRoles($data['roles']);

        return response()->json([
            'data' => ['id' => $user->id, 'email' => $user->email, 'roles' => $data['roles']],
            'temp_password' => $tempPassword,
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
            'status' => ['sometimes', 'in:active,suspended,invited'],
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user->fill(collect($data)->only(['name', 'phone', 'status'])->all());
        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
            $user->is_staff = ! in_array('guest', $data['roles'], true) || count($data['roles']) > 1;
        }
        $user->save();

        return response()->json(['data' => $user->fresh()->load('roles:id,name')]);
    }

    public function resetPassword(User $user): JsonResponse
    {
        $temp = Str::random(12);
        $user->update(['password' => Hash::make($temp)]);

        return response()->json(['temp_password' => $temp]);
    }
}
