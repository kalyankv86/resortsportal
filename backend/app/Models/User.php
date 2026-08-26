<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'avatar_url',
        'status', 'locale', 'is_staff', 'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_staff' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /** @return array<string,mixed> */
    public function getJWTCustomClaims(): array
    {
        return [
            'roles' => $this->getRoleNames(),
            'name' => $this->name,
        ];
    }

    public function guestProfile()
    {
        return $this->hasOne(Guest::class);
    }

    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    public function therapist()
    {
        return $this->hasOne(Therapist::class);
    }
}
