<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


    class Discount extends Model
{
    protected $fillable = ['type', 'value', 'starts_at', 'ends_at', 'active'];

    public function discountable()
    {
        return $this->morphTo();
    }

    public function isActive(): bool
    {
        return $this->active &&
            (! $this->starts_at || $this->starts_at <= now()) &&
            (! $this->ends_at || $this->ends_at >= now());
    }
}

