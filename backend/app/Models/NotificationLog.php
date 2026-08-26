<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $table = 'notification_log';
    protected $guarded = [];
    protected $casts = ['payload' => 'array', 'sent_at' => 'datetime'];
}
