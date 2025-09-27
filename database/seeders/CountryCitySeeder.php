<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CountryCitySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            [
                'name' => 'Egypt',
                'iso_code' => 'EG',
                'cities' => ['Cairo', 'Alexandria', 'Giza', 'Luxor']
            ],
            [
                'name' => 'United States',
                'iso_code' => 'US',
                'cities' => ['New York', 'Los Angeles', 'Chicago', 'Houston']
            ],
            [
                'name' => 'Germany',
                'iso_code' => 'DE',
                'cities' => ['Berlin', 'Munich', 'Hamburg', 'Frankfurt']
            ]
        ];

        foreach ($countries as $data) {
            $country = Country::create([
                'name' => $data['name'],
                'iso_code' => $data['iso_code'],
            ]);

            foreach ($data['cities'] as $city) {
                City::create([
                    'country_id' => $country->id,
                    'name' => $city,
                ]);
            }
        }
    }
}