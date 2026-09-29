<?php

namespace App\Http\Controllers;

use App\Models\Configure;
use App\Models\Currency;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
use App\Models\Warehouse;

use Barryvdh\DomPDF\Facade\Pdf;

use Carbon\Carbon;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

use Inertia\Inertia;
use Inertia\Response;

class PurchaseReportController extends Controller
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
    | Report Index
    |--------------------------------------------------------------------------
    */

    public function index(): Response
    {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('purchase.reports')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }
        */

        /*
        |--------------------------------------------------------------------------
        | Vendors
        |--------------------------------------------------------------------------
        */

        $vendors =
            Vendor::query()
                ->select([
                    'id',
                    'vendor_id',
                    'name',
                ])
                ->orderBy(
                    'name'
                )
                ->get();

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
        | Inertia
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/purchase/report/index',
            [
                'vendors' =>
                    $vendors,

                'warehouses' =>
                    $warehouses,

                'reportUrl' =>
                    route(
                        'purchase.report.show'
                    ),

                'downloadPdfUrl' =>
                    route(
                        'purchase.report.pdf'
                    ),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Preview PDF
    |--------------------------------------------------------------------------
    */

    public function report(
        Request $request
    ) {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('purchase.reports')
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
                'pdf.purchase.report',
                $data
            )
                ->setPaper(
                    'a4',
                    'landscape'
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
        $data =
            $this->buildReportData(
                $request
            );

        $pdf =
            Pdf::loadView(
                'pdf.purchase.report',
                $data
            )
                ->setPaper(
                    'a4',
                    'landscape'
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
                    'vendor',
                    'warehouse',
                    'date',
                ]),
            ],

            'start_date' => [
                'required',
                'date_format:Y-m-d',
            ],

            'end_date' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:start_date',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Vendor Validation
        |--------------------------------------------------------------------------
        */

        if (
            $request->input(
                'report_type'
            ) === 'vendor'
        ) {
            $rules['vendor_id'] = [
                'required',
                'integer',
                'exists:vendors,id',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Warehouse Validation
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

        $validated =
            $request->validate(
                $rules
            );

        /*
        |--------------------------------------------------------------------------
        | Dates
        |--------------------------------------------------------------------------
        */

        $startDate =
            Carbon::createFromFormat(
                'Y-m-d',
                $validated['start_date']
            )->format('Y-m-d');

        $endDate =
            Carbon::createFromFormat(
                'Y-m-d',
                $validated['end_date']
            )->format('Y-m-d');

        /*
        |--------------------------------------------------------------------------
        | Selected Vendor
        |--------------------------------------------------------------------------
        */

        $vendor = null;

        if (
            $validated['report_type'] ===
            'vendor'
        ) {
            $vendor =
                Vendor::query()
                    ->select([
                        'id',
                        'vendor_id',
                        'name',
                    ])
                    ->findOrFail(
                        $validated[
                            'vendor_id'
                        ]
                    );
        }

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
        | Purchase Order Query
        |--------------------------------------------------------------------------
        */

        $query =
            PurchaseOrder::query()
                ->with([
                    'vendor:id,vendor_id,name',

                    'warehouse:id,code,name',

                    'purchaseItems.product:id,code,name',
                ])

                /*
                |--------------------------------------------------------------------------
                | Approved Purchases Only
                |--------------------------------------------------------------------------
                */

                ->whereIn(
                    'status',
                    ['Approved', 'Received']
                )

                /*
                |--------------------------------------------------------------------------
                | Date Range
                |--------------------------------------------------------------------------
                */

                ->whereBetween(
                    'order_date',
                    [
                        $startDate,
                        $endDate,
                    ]
                );

        /*
        |--------------------------------------------------------------------------
        | Vendor Wise
        |--------------------------------------------------------------------------
        */

        if (
            $validated['report_type'] ===
            'vendor'
        ) {
            $query->where(
                'vendor_id',
                $validated[
                    'vendor_id'
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Warehouse Wise
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
        | Get Purchase Orders
        |--------------------------------------------------------------------------
        */

        $purchaseOrders =
            $query
                ->orderBy(
                    'order_date',
                    'asc'
                )
                ->orderBy(
                    'id',
                    'asc'
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
        | Currency
        |--------------------------------------------------------------------------
        */

        $activeCurrency =
            Currency::query()
                ->where(
                    'is_active',
                    true
                )
                ->first();

        /*
        |--------------------------------------------------------------------------
        | Return Data
        |--------------------------------------------------------------------------
        */

        return [
            'purchaseOrders' =>
                $purchaseOrders,

            'start_date' =>
                $startDate,

            'end_date' =>
                $endDate,

            'report_type' =>
                $validated[
                    'report_type'
                ],

            'configure' =>
                $configure,

            'activeCurrency' =>
                $activeCurrency,

            /*
            |--------------------------------------------------------------------------
            | Vendor
            |--------------------------------------------------------------------------
            */

            'vendor_id' =>
                $validated[
                    'vendor_id'
                ]
                ?? null,

            'vendor_name' =>
                $vendor?->name
                ?? '',

            'vendor_code' =>
                $vendor?->vendor_id
                ?? '',

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
                $warehouse?->name
                ?? '',

            'warehouse_code' =>
                $warehouse?->code
                ?? '',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | PDF File Name
    |--------------------------------------------------------------------------
    */

    private function generateFileName(
        array $data
    ): string {
        $type =
            match (
            $data['report_type']
            ) {
                'vendor' =>
                'Vendor_Wise',

                'warehouse' =>
                'Warehouse_Wise',

                default =>
                'Date_Wise',
            };

        return
            'Purchase_Report_' .
            $type .
            '_' .
            $data['start_date'] .
            '_to_' .
            $data['end_date'] .
            '.pdf';
    }
}
