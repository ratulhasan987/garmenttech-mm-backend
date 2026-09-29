<?php

namespace App\Http\Controllers;

use App\Models\Configure;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Warehouse;

use Barryvdh\DomPDF\Facade\Pdf;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use Inertia\Inertia;
use Inertia\Response;

class StockReportController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(
            function ($request, $next) {
                $this->user =
                    auth()
                        ->guard('web')
                        ->user();

                return $next($request);
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    public function index(): Response
    {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('stock.reports')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }
        */

        /*
        |--------------------------------------------------------------------------
        | Warehouses
        |--------------------------------------------------------------------------
        */

        $warehouses =
            Warehouse::query()
                ->select([
                    'id',
                    'code',
                    'name',
                ])
                ->orderBy(
                    'name'
                )
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $products =
            Product::query()
                ->with([
                    'unit:id,name',
                ])
                ->select([
                    'id',
                    'code',
                    'name',
                    'unit_id',
                    'reorder_level',
                ])
                ->orderBy(
                    'name'
                )
                ->get()
                ->map(
                    function (
                        Product $product
                    ) {
                        return [
                            'id' =>
                                $product->id,

                            'code' =>
                                $product->code,

                            'name' =>
                                $product->name,

                            'unit' =>
                                $product
                                    ->unit
                                    ?->name
                                ?? '',

                            'reorder_level' =>
                                (float) (
                                    $product
                                        ->reorder_level
                                    ?? 0
                                ),
                        ];
                    }
                )
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/inventory/report/stocks/index',
            [
                'warehouses' =>
                    $warehouses,

                'products' =>
                    $products,

                /*
                |--------------------------------------------------------------------------
                | Avoid hard-coded frontend URLs
                |--------------------------------------------------------------------------
                */

                'reportUrl' =>
                    route(
                        'stocks.report.show'
                    ),

                'downloadPdfUrl' =>
                    route(
                        'stocks.report.pdf'
                    ),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Stream Report
    |--------------------------------------------------------------------------
    |
    | Opens the PDF inside the browser PDF viewer.
    |
    */

    public function report(
        Request $request
    ) {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('stock.reports')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }
        */

        $data =
            $this->buildReportData(
                $request
            );

        $pdf =
            Pdf::loadView(
                'pdf.stock.report',
                $data
            )
                ->setPaper(
                    'a4',
                    'portrait'
                );

        return $pdf->stream(
            $this->generateFileName(
                $data
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Download PDF
    |--------------------------------------------------------------------------
    */

    public function downloadPdf(
        Request $request
    ) {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('stock.reports')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }
        */

        $data =
            $this->buildReportData(
                $request
            );

        $pdf =
            Pdf::loadView(
                'pdf.stock.report',
                $data
            )
                ->setPaper(
                    'a4',
                    'portrait'
                );

        return $pdf->download(
            $this->generateFileName(
                $data
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Build Report Data
    |--------------------------------------------------------------------------
    */

    private function buildReportData(
        Request $request
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $rules = [
            'report_type' => [
                'required',

                Rule::in([
                    'warehouse',
                    'product',
                    'all',
                ]),
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Warehouse
        |--------------------------------------------------------------------------
        */

        if (
            $request->input(
                'report_type'
            ) === 'warehouse'
        ) {
            $rules['warehouse_id'] = [
                'required',
                'integer',
                'exists:warehouses,id',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Product
        |--------------------------------------------------------------------------
        */

        if (
            $request->input(
                'report_type'
            ) === 'product'
        ) {
            $rules['product_id'] = [
                'required',
                'integer',
                'exists:products,id',
            ];
        }

        $validated =
            $request->validate(
                $rules
            );

        /*
        |--------------------------------------------------------------------------
        | Selected Warehouse
        |--------------------------------------------------------------------------
        */

        $warehouse = null;

        if (
            $validated['report_type'] ===
            'warehouse'
        ) {
            $warehouse =
                Warehouse::query()
                    ->select([
                        'id',
                        'code',
                        'name',
                    ])
                    ->findOrFail(
                        $validated[
                            'warehouse_id'
                        ]
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Selected Product
        |--------------------------------------------------------------------------
        */

        $product = null;

        if (
            $validated['report_type'] ===
            'product'
        ) {
            $product =
                Product::query()
                    ->with([
                        'unit:id,name',
                    ])
                    ->select([
                        'id',
                        'code',
                        'name',
                        'unit_id',
                        'reorder_level',
                    ])
                    ->findOrFail(
                        $validated[
                            'product_id'
                        ]
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Stock Query
        |--------------------------------------------------------------------------
        */

        $query =
            Stock::query()
                ->with([
                    'warehouse:id,code,name',

                    'product:id,code,name,reorder_level,unit_id',

                    'product.unit:id,name',
                ]);

        /*
        |--------------------------------------------------------------------------
        | Warehouse Filter
        |--------------------------------------------------------------------------
        */

        if (
            $validated['report_type'] ===
            'warehouse'
        ) {
            $query->where(
                'warehouse_id',
                $validated[
                    'warehouse_id'
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Product Filter
        |--------------------------------------------------------------------------
        */

        if (
            $validated['report_type'] ===
            'product'
        ) {
            $query->where(
                'item_id',
                $validated[
                    'product_id'
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Stock Results
        |--------------------------------------------------------------------------
        */

        $stocks =
            $query
                ->orderBy(
                    'warehouse_id'
                )
                ->orderBy(
                    'item_id'
                )
                ->get();

        /*
        |--------------------------------------------------------------------------
        | Configuration
        |--------------------------------------------------------------------------
        */

        $configure =
            Configure::first();

        /*
        |--------------------------------------------------------------------------
        | Report Data
        |--------------------------------------------------------------------------
        */

        return [
            'stocks' =>
                $stocks,

            'configure' =>
                $configure,

            'report_type' =>
                $validated[
                    'report_type'
                ],

            /*
            |--------------------------------------------------------------------------
            | Warehouse
            |--------------------------------------------------------------------------
            */

            'warehouse_id' =>
                $validated[
                    'warehouse_id'
                ]
                ?? null,

            'warehouse_name' =>
                $warehouse
                    ?->name
                ?? '',

            'warehouse_code' =>
                $warehouse
                    ?->code
                ?? '',

            /*
            |--------------------------------------------------------------------------
            | Product
            |--------------------------------------------------------------------------
            */

            'product_id' =>
                $validated[
                    'product_id'
                ]
                ?? null,

            'product_name' =>
                $product
                    ?->name
                ?? '',

            'product_code' =>
                $product
                    ?->code
                ?? '',

            'product_unit' =>
                $product
                    ?->unit
                    ?->name
                ?? '',

            'product_reorder_level' =>
                (float) (
                    $product
                        ?->reorder_level
                    ?? 0
                ),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | File Name
    |--------------------------------------------------------------------------
    */

    private function generateFileName(
        array $data
    ): string {
        $type =
            match (
                $data[
                    'report_type'
                ]
            ) {
                'warehouse' =>
                    'Warehouse_Wise',

                'product' =>
                    'Product_Wise',

                default =>
                    'All_Current_Stock',
            };

        return
            'Stock_Report_' .
            $type .
            '_' .
            now()->format(
                'Y-m-d'
            ) .
            '.pdf';
    }
}
