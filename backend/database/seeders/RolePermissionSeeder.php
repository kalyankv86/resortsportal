<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /** All CWETR roles (master prompt § User Roles). */
    private const ROLES = [
        'super-admin', 'director', 'resort-manager', 'reception', 'doctor',
        'therapist', 'nutritionist', 'yoga-trainer', 'restaurant-manager',
        'housekeeping', 'finance', 'inventory-manager', 'marketing',
        'guest', 'corporate-guest', 'travel-agent',
    ];

    /** permission groups → actions */
    private const GROUPS = [
        'bookings' => ['view', 'create', 'update', 'cancel', 'checkin', 'checkout'],
        'payments' => ['view', 'record', 'refund'],
        'invoices' => ['view', 'issue'],
        'guests' => ['view', 'create', 'update'],
        'therapies' => ['view', 'manage'],
        'programs' => ['view', 'manage'],
        'doctors' => ['view', 'manage'],
        'appointments' => ['view', 'manage'],
        'medical-records' => ['view', 'manage'],
        'housekeeping' => ['view', 'manage'],
        'restaurant' => ['view', 'manage'],
        'inventory' => ['view', 'manage'],
        'finance' => ['view', 'manage'],
        'reports' => ['view'],
        'cms' => ['view', 'manage'],
        'media' => ['view', 'manage'],
        'crm' => ['view', 'manage'],
        'users' => ['view', 'manage'],
        'settings' => ['view', 'manage'],
        'audit' => ['view'],
    ];

    private const ROLE_GRANTS = [
        'director' => ['*'],
        'resort-manager' => [
            'bookings.*', 'payments.view', 'invoices.view', 'guests.*', 'therapies.*',
            'programs.*', 'doctors.*', 'appointments.*', 'housekeeping.*', 'restaurant.*',
            'inventory.view', 'reports.view', 'cms.*', 'media.*', 'crm.*',
        ],
        'reception' => ['bookings.*', 'guests.*', 'appointments.view', 'payments.record', 'crm.view'],
        'doctor' => ['appointments.*', 'medical-records.*', 'guests.view', 'programs.view', 'therapies.view'],
        'therapist' => ['appointments.view', 'therapies.view', 'guests.view'],
        'nutritionist' => ['appointments.view', 'guests.view', 'medical-records.view'],
        'yoga-trainer' => ['appointments.view', 'guests.view'],
        'restaurant-manager' => ['restaurant.*', 'inventory.view', 'guests.view'],
        'housekeeping' => ['housekeeping.*'],
        'finance' => ['finance.*', 'payments.*', 'invoices.*', 'reports.view'],
        'inventory-manager' => ['inventory.*', 'reports.view'],
        'marketing' => ['cms.*', 'media.*', 'crm.*', 'reports.view'],
        'guest' => [],
        'corporate-guest' => [],
        'travel-agent' => ['bookings.view', 'bookings.create'],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permNames = [];
        foreach (self::GROUPS as $group => $actions) {
            foreach ($actions as $action) {
                $permNames[] = "{$group}.{$action}";
            }
        }
        foreach ($permNames as $name) {
            Permission::findOrCreate($name, 'api');
        }

        foreach (self::ROLES as $roleName) {
            $role = Role::findOrCreate($roleName, 'api');

            if ($roleName === 'super-admin') {
                $role->syncPermissions(Permission::all());
                continue;
            }

            $grants = self::ROLE_GRANTS[$roleName] ?? [];
            if ($grants === ['*']) {
                $role->syncPermissions(Permission::all());
                continue;
            }

            $resolved = [];
            foreach ($grants as $pattern) {
                if (str_ends_with($pattern, '.*')) {
                    $prefix = substr($pattern, 0, -1); // "bookings."
                    $resolved = array_merge($resolved, array_filter($permNames, fn ($p) => str_starts_with($p, $prefix)));
                } else {
                    $resolved[] = $pattern;
                }
            }
            $role->syncPermissions(array_values(array_unique($resolved)));
        }

        DB::table('settings')->updateOrInsert(
            ['key' => 'rbac.roles'],
            ['group' => 'security', 'type' => 'json', 'is_public' => false, 'value' => json_encode(self::ROLES), 'updated_at' => now(), 'created_at' => now()],
        );
    }
}
