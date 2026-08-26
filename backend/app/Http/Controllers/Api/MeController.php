<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MeController extends Controller
{
    public function profile(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();
        $user->load('guestProfile');

        return response()->json(['data' => [
            'user' => $user->only(['id', 'name', 'email', 'phone', 'avatar_url', 'is_staff']),
            'roles' => $user->getRoleNames(),
            'guest' => $user->guestProfile,
        ]]);
    }

    public function bookings(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();
        $guest = $user->guestProfile;

        $bookings = $guest
            ? $guest->bookings()->with(['program:id,slug,name', 'roomCategory:id,slug,name', 'invoice'])->latest('check_in')->get()
            : collect();

        return response()->json(['data' => $bookings]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:32'],
        ]);

        $user->fill($data)->save();

        return response()->json(['data' => $user->only(['id', 'name', 'email', 'phone'])]);
    }
}
