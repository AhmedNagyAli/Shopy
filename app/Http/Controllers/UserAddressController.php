<?php

namespace App\Http\Controllers;

use App\Models\UserAddress;
use App\Models\Country;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserAddressController extends Controller
{
    /**
     * Show the create address page.
     */
    public function create()
    {
        $user = Auth::user();

        // Fetch available countries and cities (optional)
        $countries = Country::select('id', 'name')->get();
        $cities = City::select('id', 'name', 'country_id')->get();

        return Inertia::render('Addresses/Create', [
            'countries' => $countries,
            'cities' => $cities,
            'user' => $user,
        ]);
    }

    /**
     * Store a new address for the user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'city_id' => 'required|exists:cities,id',
            'address' => 'required|string|max:255',
            'street' => 'nullable|string|max:255',
            'building' => 'nullable|string|max:255',
            'apartment' => 'nullable|string|max:255',
            'extra' => 'nullable|string|max:255',
            'zipcode' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        $user = Auth::user();

        // If this address is marked as default, remove default flag from others
        if (!empty($validated['is_default'])) {
            UserAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $validated['user_id'] = $user->id;

        $address = UserAddress::create($validated);

        return redirect()
            ->route('cart.index')
            ->with('success', 'Address added successfully. You can now place your order.');
    }
}
