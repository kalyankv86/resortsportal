<?php

use App\Http\Controllers\Api\Admin\BookingAdminController;
use App\Http\Controllers\Api\Admin\OverviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\WaitlistController;
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
Route::post('waitlist', [WaitlistController::class, 'store'])->middleware('throttle:10,1');

/* ---- Booking engine -------------------------------------------------- */
Route::post('bookings/quote', [BookingController::class, 'quote'])->middleware('throttle:60,1');
Route::post('bookings', [BookingController::class, 'store'])->middleware('throttle:20,1');
Route::get('bookings/{reference}', [BookingController::class, 'show']);
Route::get('bookings/{reference}/pass', [BookingController::class, 'pass']);
Route::middleware('auth:api')->group(function () {
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('bookings/{booking}/reschedule', [BookingController::class, 'reschedule']);
    Route::post('bookings/{booking}/documents', [BookingController::class, 'uploadDocument']);
});

/* ---- Authenticated guest --------------------------------------------- */
Route::middleware('auth:api')->prefix('me')->group(function () {
    Route::get('/', [MeController::class, 'profile']);
    Route::patch('/', [MeController::class, 'updateProfile']);
    Route::get('bookings', [MeController::class, 'bookings']);
});

/* ---- Admin ---------------------------------------------------------------- */
Route::middleware(['auth:api', 'role:super-admin|director|resort-manager|reception'])
    ->prefix('admin')
    ->group(function () {
        Route::get('overview', [OverviewController::class, 'index']);
        Route::get('bookings', [BookingAdminController::class, 'index']);
        Route::get('bookings/{booking}', [BookingAdminController::class, 'show']);
        Route::patch('bookings/{booking}/status', [BookingAdminController::class, 'updateStatus']);
    });
