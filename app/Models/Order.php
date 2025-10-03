<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
         'user_address_id',
          'order_number',
        'subtotal',
         'discount',
          'tax',
           'shipping_cost',
            'total_amount',
        'payment_status',
         'payment_method',
          'transaction_id',
        'shipping_status',
         'tracking_number',
          'carrier',
        'status',
         'notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(UserAddress::class, 'user_address_id');
    }
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
