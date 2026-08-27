<?php

use App\Http\Controllers\Api\Admin\BookingAdminController;
use App\Http\Controllers\Api\Admin\FinanceController;
use App\Http\Controllers\Api\Admin\OverviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Staff\DoctorController;
use App\Http\Controllers\Api\Staff\HousekeepingController;
use App\Http\Controllers\Api\Staff\RestaurantController;
use App\Http\Controllers\Api\Staff\TherapistController;
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
Route::get('bookings/{reference}/pass', [BookingController::class, 'pass']);
Route::get('bookings/{reference}/invoice', [PaymentController::class, 'invoice']);
Route::get('bookings/{reference}/invoice.pdf', [PaymentController::class, 'invoicePdf']);
Route::get('bookings/{reference}', [BookingController::class, 'show']);
Route::post('bookings/{reference}/pay', [PaymentController::class, 'pay'])->middleware('throttle:30,1');
Route::post('payments/{reference}/callback', [PaymentController::class, 'callback']);
Route::get('payments/methods', [PaymentController::class, 'methods']);
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
    Route::get('stay', [MeController::class, 'stay']);
    Route::get('diet-chart', [MeController::class, 'dietChart']);
    Route::get('prescriptions', [MeController::class, 'prescriptions']);
    Route::get('progress', [MeController::class, 'progress']);
    Route::get('invoices', [MeController::class, 'invoices']);
    Route::get('rewards', [MeController::class, 'rewards']);
    Route::get('wishlist', [MeController::class, 'wishlist']);
    Route::post('wishlist', [MeController::class, 'addWishlist']);
    Route::delete('wishlist/{wishlistItem}', [MeController::class, 'removeWishlist']);
});

/* ---- Staff portals -------------------------------------------------------- */
Route::middleware('auth:api')->prefix('staff')->group(function () {
    Route::middleware('role:super-admin|director|resort-manager|doctor|nutritionist')->group(function () {
        Route::get('doctor/dashboard', [DoctorController::class, 'dashboard']);
        Route::get('doctor/patients/{guest}', [DoctorController::class, 'patient']);
        Route::post('doctor/patients/{guest}/dosha', [DoctorController::class, 'storeDosha']);
        Route::post('doctor/patients/{guest}/diet-chart', [DoctorController::class, 'storeDietChart']);
        Route::post('doctor/patients/{guest}/prescription', [DoctorController::class, 'storePrescription']);
        Route::post('doctor/patients/{guest}/progress', [DoctorController::class, 'storeProgress']);
        Route::post('doctor/appointments/{appointment}/complete', [DoctorController::class, 'completeAppointment']);
    });

    Route::middleware('role:super-admin|director|resort-manager|therapist')->group(function () {
        Route::get('therapist/dashboard', [TherapistController::class, 'dashboard']);
        Route::post('therapist/appointments/{appointment}/complete', [TherapistController::class, 'complete']);
    });

    Route::middleware('role:super-admin|director|resort-manager|housekeeping')->group(function () {
        Route::get('housekeeping/board', [HousekeepingController::class, 'board']);
        Route::post('housekeeping/tasks', [HousekeepingController::class, 'createTask']);
        Route::patch('housekeeping/tasks/{housekeepingTask}', [HousekeepingController::class, 'updateTask']);
        Route::patch('housekeeping/rooms/{room}/status', [HousekeepingController::class, 'setRoomStatus']);
    });

    Route::middleware('role:super-admin|director|resort-manager|restaurant-manager|nutritionist')->group(function () {
        Route::get('restaurant/board', [RestaurantController::class, 'board']);
        Route::patch('restaurant/orders/{mealOrder}', [RestaurantController::class, 'updateOrder']);
    });
});

/* ---- Admin ---------------------------------------------------------------- */
Route::middleware(['auth:api', 'role:super-admin|director|resort-manager|reception|finance'])
    ->prefix('admin')
    ->group(function () {
        Route::get('overview', [OverviewController::class, 'index']);
        Route::get('bookings', [BookingAdminController::class, 'index']);
        Route::get('bookings/{booking}', [BookingAdminController::class, 'show']);
        Route::patch('bookings/{booking}/status', [BookingAdminController::class, 'updateStatus']);

        Route::get('finance/summary', [FinanceController::class, 'summary']);
        Route::get('payments', [FinanceController::class, 'payments']);
        Route::post('bookings/{booking}/record-payment', [FinanceController::class, 'recordPayment']);
        Route::get('refunds', [FinanceController::class, 'refunds']);
        Route::post('bookings/{booking}/refunds', [FinanceController::class, 'requestRefund']);
        Route::post('refunds/{refundRequest}/review', [FinanceController::class, 'reviewRefund']);
    });
