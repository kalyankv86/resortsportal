<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $token = Auth::guard('api')->attempt($data);
        if (! $token) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();

        if ($user->status !== 'active') {
            Auth::guard('api')->logout();
            throw ValidationException::withMessages([
                'email' => ['This account is not active.'],
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->saveQuietly();

        return $this->tokenResponse($token, $user);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'is_staff' => false,
        ]);
        $user->assignRole('guest');

        [$first, $last] = array_pad(explode(' ', $data['name'], 2), 2, '');
        Guest::create([
            'user_id' => $user->id,
            'first_name' => $first ?: $data['name'],
            'last_name' => $last,
            'email' => $user->email,
            'phone' => $user->phone,
        ]);

        $token = Auth::guard('api')->login($user);

        return $this->tokenResponse($token, $user, 201);
    }

    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        return response()->json(['data' => $this->userPayload($user)]);
    }

    public function refresh(): JsonResponse
    {
        $token = Auth::guard('api')->refresh();

        return $this->tokenResponse($token, Auth::guard('api')->user());
    }

    public function logout(): JsonResponse
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Signed out.']);
    }

    private function tokenResponse(string $token, User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => $this->userPayload($user),
        ], $status);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'is_staff' => $user->is_staff,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'home' => $this->homeFor($user),
        ];
    }

    /** Post-login landing route, resolved from the account's role. */
    private function homeFor(User $user): string
    {
        if (! $user->is_staff) {
            return '/guest';
        }
        $roles = $user->getRoleNames();

        return match (true) {
            $roles->contains('doctor') => '/doctor',
            $roles->contains('therapist') => '/therapist',
            $roles->contains('housekeeping') => '/housekeeping',
            $roles->contains('restaurant-manager') => '/restaurant',
            default => '/admin',
        };
    }
}
