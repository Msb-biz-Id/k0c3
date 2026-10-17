<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RegionController extends Controller
{
    /**
     * Get all 38 provinces in Indonesia (Cached Forever).
     */
    public function provinces(): JsonResponse
    {
        $cacheKey = 'indonesia_provinces_list_v2';
        $provinces = null;

        try {
            $cached = Cache::get($cacheKey);
            if (is_array($cached)) {
                $provinces = $cached;
            }
        } catch (\Throwable) {}

        if ($provinces === null) {
            $provinces = DB::table('indonesia_provinces')
                ->select('id', 'code', 'name')
                ->orderBy('name', 'asc')
                ->get()
                ->map(fn ($item) => (array) $item)
                ->toArray();

            try {
                Cache::forever($cacheKey, $provinces);
            } catch (\Throwable) {}
        }

        return response()->json([
            'status' => 'success',
            'data' => $provinces,
        ]);
    }

    /**
     * Get all cities in a province (Cached Forever per province).
     */
    public function cities(string $provinceCode): JsonResponse
    {
        $cacheKey = "indonesia_cities_v2_{$provinceCode}";
        $cities = null;

        try {
            $cached = Cache::get($cacheKey);
            if (is_array($cached)) {
                $cities = $cached;
            }
        } catch (\Throwable) {}

        if ($cities === null) {
            $cities = DB::table('indonesia_cities')
                ->select('id', 'code', 'province_code', 'name')
                ->where('province_code', $provinceCode)
                ->orderBy('name', 'asc')
                ->get()
                ->map(fn ($item) => (array) $item)
                ->toArray();

            try {
                Cache::forever($cacheKey, $cities);
            } catch (\Throwable) {}
        }

        return response()->json([
            'status' => 'success',
            'data' => $cities,
        ]);
    }
}
