# CWETR API

REST API for the Centurion Wellness Eco Tourism Resorts portal — bookings,
payments, guest and staff portals, and the site CMS.

**Stack:** Laravel 13 · PHP 8.3 · PostgreSQL 16 · Redis · JWT auth
(`php-open-source-saver/jwt-auth`) · RBAC (`spatie/laravel-permission`).

## Local setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
# point DB_* at a local PostgreSQL, then:
php artisan migrate --seed
php artisan serve
```

`php artisan migrate --seed` provisions roles, permissions, sample staff and
guest accounts, the room / therapy / programme catalogue, the CMS pages and a
demonstration in-house stay.

## Layout

| Path | |
|------|---|
| `routes/api.php` | all endpoints |
| `app/Http/Controllers/Api` | public + guest controllers |
| `app/Http/Controllers/Api/Staff` | doctor / therapist / housekeeping / restaurant |
| `app/Http/Controllers/Api/Admin` | overview, bookings, finance, CMS, users, settings, audit |
| `app/Services` | `BookingService`, `PaymentService`, `InvoiceService` |
| `app/Services/Payments` | pluggable payment gateway (`PaymentGateway` interface) |
| `database/migrations` | schema |
| `database/seeders` | seed data |

## Payments

`config/payments.php` selects the gateway driver via `PAYMENT_DRIVER`. Add a
class implementing `App\Services\Payments\PaymentGateway`, map it in the config,
and set the env var — no other code changes are needed.

## Deployment

See `../deploy/` — native install on Ubuntu (no containers). `deploy-backend.sh`
handles `composer install`, config publishing, migrations and cache warming.
