<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductSearchService
{
    /**
     * Fields that frontend is allowed to request.
     */
    private const ALLOWED_FIELDS = [
        'id',
        'code',
        'name',
        'purchase_price',
        'sales_price',
        'purchase_tax_ids',
        'unit',
        'unit_id',
        'product_brand_id',
        'product_category_id',
    ];

    /**
     * Default fields for normal product suggestion search.
     */
    private const DEFAULT_FIELDS = [
        'id',
        'code',
        'name',
        'purchase_price',
        'sales_price',
        'purchase_tax_ids',
        'unit',
    ];

    public function search(Request $request)
    {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                '',
            ),
        );

        $brandId = $request->integer('brand_id');

        $categoryId = $request->integer('category_id');

        $subcategoryId = $request->integer('subcategory_id');

        $limit = min(
            max(
                $request->integer('limit', 20),
                1,
            ),
            100,
        );

        $requestedFields = $this->getRequestedFields(
            $request->input('fields'),
        );

        $query = Product::query()
            ->select([
                'id',
                'code',
                'name',
                'purchase_price',
                'sales_price',
                'purchase_tax_ids',
                'unit_id',
                'product_brand_id',
                'product_category_id',
            ])
            ->with([
                'unit:id,name',
            ]);

        /*
        |----------------------------------------------------------------------
        | Product Brand Filter
        |----------------------------------------------------------------------
        */

        if ($brandId > 0) {
            $query->where(
                'product_brand_id',
                $brandId,
            );
        }

        /*
        |----------------------------------------------------------------------
        | Category / Subcategory Filter
        |----------------------------------------------------------------------
        */

        if ($subcategoryId > 0) {
            $query->where(
                'product_category_id',
                $subcategoryId,
            );
        } elseif ($categoryId > 0) {
            $categoryIds = DB::table('product_categories')
                ->where('parent_id', $categoryId)
                ->pluck('id');

            $categoryIds->push($categoryId);

            $query->whereIn(
                'product_category_id',
                $categoryIds,
            );
        }

        /*
        |----------------------------------------------------------------------
        | Optional Product Status Filter
        |
        | Example: ?status=Active
        |----------------------------------------------------------------------
        */

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->string('status')->toString(),
            );
        }

        /*
        |----------------------------------------------------------------------
        | Product Search
        |----------------------------------------------------------------------
        */

        if ($keyword !== '') {
            $query->where(
                function (Builder $query) use ($keyword) {
                    $query
                        ->where(
                            'name',
                            'like',
                            "%{$keyword}%",
                        )
                        ->orWhere(
                            'code',
                            'like',
                            "%{$keyword}%",
                        );
                },
            );
        }

        return $query
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(
                fn(Product $product) => $this->transform(
                    $product,
                    $requestedFields,
                ),
            )
            ->values();
    }

    private function getRequestedFields(mixed $fields): array
    {
        if (!is_string($fields) || trim($fields) === '') {
            return self::DEFAULT_FIELDS;
        }

        $requestedFields = collect(
            explode(',', $fields),
        )
            ->map(
                fn(string $field) => trim($field),
            )
            ->filter()
            ->intersect(self::ALLOWED_FIELDS)
            ->values()
            ->all();

        /*
        |----------------------------------------------------------------------
        | Product search input requires these fields.
        |----------------------------------------------------------------------
        */

        foreach (['id', 'code', 'name'] as $requiredField) {
            if (!in_array($requiredField, $requestedFields, true)) {
                $requestedFields[] = $requiredField;
            }
        }

        return $requestedFields;
    }

    private function transform(
        Product $product,
        array $fields,
    ): array {
        $data = [
            'id' => $product->id,
            'code' => $product->code,
            'name' => $product->name,
            'purchase_price' => $product->purchase_price,
            'sales_price' => $product->sales_price,
            'purchase_tax_ids' => $product->purchase_tax_ids ?? [],
            'unit' => $product->unit?->name ?? '',
            'unit_id' => $product->unit_id,
            'product_brand_id' => $product->product_brand_id,
            'product_category_id' => $product->product_category_id,
        ];

        return collect($data)
            ->only($fields)
            ->all();
    }
}
