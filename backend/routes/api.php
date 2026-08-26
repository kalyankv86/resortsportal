<?php

use App\Http\Controllers\Api\Admin\OverviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MeController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'ok' => true,
    'service' => 'cwetr-api',
    'time' => now()->toIso8601String(),
]));

/* ---- Auth ---------------------------------------------------------------- */
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

/* ---- Public catalogue -------------------------------------------------- */
Route::get('rooms', [CatalogController::class, 'rooms']);
Route::get('rooms/{slug}', [CatalogController::class, 'room']);
Route::get('therapies', [CatalogController::class, 'therapies']);
Route::get('therapies/{slug}', [CatalogController::class, 'therapy']);
Route::get('programs', [CatalogController::class, 'programs']);
Route::get('programs/{slug}', [CatalogController::class, 'program']);
Route::get('experiences', [CatalogController::class, 'experiences']);

Route::get('pages/{slug}', [ContentController::class, 'page']);
Route::get('testimonials', [ContentController::class, 'testimonials']);
Route::get('faqs', [ContentController::class, 'faqs']);

Route::post('enquiries', [LeadController::class, 'enquiry'])->middleware('throttle:10,1');
Route::post('newsletter', [LeadController::class, 'newsletter'])->middleware('throttle:10,1');

/* ---- Authenticated guest --------------------------------------------- */
Route::middleware('auth:api')->prefix('me')->group(function () {
    Route::get('/', [MeController::class, 'profile']);
    Route::patch('/', [MeController::class, 'updateProfile']);
    Route::get('bookings', [MeController::class, 'bookings']);
});

/* ---- Admin ---------------------------------------------------------------- */
Route::middleware(['auth:api', 'role:super-admin|director|resort-manager'])
    ->prefix('admin')
    ->group(function () {
        Route::get('overview', [OverviewController::class, 'index']);
    });
