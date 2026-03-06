import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, Home, Navigation, Building, Hash, MessageSquare, Star } from 'lucide-react';

export default function Create({ countries = [], cities = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    country_id: '',
    city_id: '',
    address: '',
    street: '',
    building: '',
    apartment: '',
    extra: '',
    zipcode: '',
    is_default: true,
  });

  const [filteredCities, setFilteredCities] = useState([]);

  const handleCountryChange = (e) => {
    const id = e.target.value;
    setData('country_id', id);
    setData('city_id', '');
    setFilteredCities(cities.filter((c) => c.country_id == id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('addresses.store'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => router.get(route('addresses.index'))}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Addresses</span>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Address</h1>
          <p className="text-gray-600">Enter your delivery address details</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Home className="w-5 h-5" />
                <span className="font-semibold">Address Information</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">Step 1 of 1</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Navigation className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Country */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Country
                  </label>
                  <select
                    value={data.country_id}
                    onChange={handleCountryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country_id && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      ⚠️ {errors.country_id}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    City
                  </label>
                  <select
                    value={data.city_id}
                    onChange={(e) => setData('city_id', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !data.country_id 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-gray-300'
                    }`}
                    disabled={!data.country_id}
                  >
                    <option value="">Select City</option>
                    {filteredCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      ⚠️ {errors.city_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
              </div>

              {/* Main Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="e.g. 123 Main Street, Downtown District"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    ⚠️ {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    type="text"
                    value={data.street}
                    onChange={(e) => setData('street', e.target.value)}
                    placeholder="Street name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Building
                  </label>
                  <input
                    type="text"
                    value={data.building}
                    onChange={(e) => setData('building', e.target.value)}
                    placeholder="Building no."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Apartment</label>
                  <input
                    type="text"
                    value={data.apartment}
                    onChange={(e) => setData('apartment', e.target.value)}
                    placeholder="Apt, Suite"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Zip/Postal Code</label>
                  <input
                    type="text"
                    value={data.zipcode}
                    onChange={(e) => setData('zipcode', e.target.value)}
                    placeholder="e.g. 12345"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Delivery Instructions</label>
                <textarea
                  value={data.extra}
                  onChange={(e) => setData('extra', e.target.value)}
                  rows="3"
                  placeholder="Gate code, landmarks, floor number, delivery preferences..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none placeholder-gray-400"
                ></textarea>
              </div>
            </div>

            {/* Default Address Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <label htmlFor="is_default" className="text-sm font-semibold text-gray-900 cursor-pointer">
                    Set as default address
                  </label>
                  <p className="text-xs text-gray-600">Use this address for all future orders</p>
                </div>
              </div>
              <div className="relative">
                <input
                  id="is_default"
                  type="checkbox"
                  checked={data.is_default}
                  onChange={(e) => setData('is_default', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                  data.is_default ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setData('is_default', !data.is_default)}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-transform duration-200 ${
                    data.is_default ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Address...
                </div>
              ) : (
                'Save Delivery Address'
              )}
            </button>

            {/* Help Text */}
            <p className="text-center text-xs text-gray-500">
              Your address information is secure and encrypted
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}