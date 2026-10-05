<?php

namespace App\Services;

use App\Models\Brand;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class BrandService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return Brand::query()
            ->latest()
            ->paginate(30);
    }

    public function createBrand(array $data): Brand
    {
        return Brand::create($data);
    }

    public function updateBrand(Brand $brand, array $data): Brand
    {
        $brand->update($data);

        return $brand->fresh();
    }

    public function deleteBrand(Brand $brand): bool
    {
        return $brand->delete();
    }

    public function searchBrands(Request $request)
    {
        $keyword = $request->keyword;

        $query = Brand::query()
            ->select(
                'id',
                'country',
                'name'
            );

        if (!empty($keyword)) {
            $query->where(function ($query) use ($keyword) {
                $query
                    ->where(
                        'name',
                        'like',
                        "%{$keyword}%"
                    )
                    ->orWhere(
                        'country',
                        'like',
                        "%{$keyword}%"
                    );
            });
        }

        return $query
            ->orderBy('name')
            ->limit(20)
            ->get();


    }

}
