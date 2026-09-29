<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Configure;
use App\Models\Currency;
use App\Models\SalesInvoice;
use App\Models\Warehouse;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalesReportController extends Controller
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
            !$this->user->can('invoice.reports')
        ) {
            abort(
                403,
                'Unauthorized access'
            );
        }
        */

        $warehouses =
            Warehouse::query()
                ->select([
                    'id',
                    'code',
                    'name',
                ])
                ->orderBy('name')
                ->get();

        return Inertia::render(
            'operations/sales/report/sales/index',
            [
                'warehouses' =>
                    $warehouses,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Show / Preview PDF
    |--------------------------------------------------------------------------
    |
    | This method streams the PDF to the browser.
    | Because index.tsx submits using target="_blank",
    | the PDF will open in a new tab.
    |
    */

    public function report(
        Request $request
    ) {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('invoice.reports')
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
                'pdf.sales.report',
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
    |
    | Optional direct-download endpoint.
    |
    */

    public function downloadPdf(
        Request $request
    ) {
        /*
        if (
            is_null($this->user) ||
            !$this->user->can('invoice.reports')
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
                'pdf.sales.report',
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
                    'client',
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
        | Customer Validation
        |--------------------------------------------------------------------------
        */

        if (
            $request->input(
                'report_type'
            ) === 'client'
        ) {
            $rules['client'] = [
                'required',
                'integer',
                'exists:clients,id',
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
            $rules['warehouse'] = [
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
        | Date Range
        |--------------------------------------------------------------------------
        */

        $startDate =
            Carbon::createFromFormat(
                'Y-m-d',
                $validated['start_date']
            )
                ->format(
                    'Y-m-d'
                );

        $endDate =
            Carbon::createFromFormat(
                'Y-m-d',
                $validated['end_date']
            )
                ->format(
                    'Y-m-d'
                );

        /*
        |--------------------------------------------------------------------------
        | Selected Customer
        |--------------------------------------------------------------------------
        */

        $client = null;

        if (
            $validated['report_type'] ===
            'client'
        ) {
            $client =
                Client::query()
                    ->select([
                        'id',
                        'client_no',
                        'name',
                        'company_name',
                        'phone',
                    ])
                    ->findOrFail(
                        $validated['client']
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
                        $validated['warehouse']
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Sales Invoice Query
        |--------------------------------------------------------------------------
        */

        $query =
            SalesInvoice::query()
                ->with([
                    'client:id,client_no,name,company_name,phone',

                    'warehouse:id,code,name',

                    'items.product:id,code,name,unit_id',

                    'items.product.unit:id,name',
                ])

                /*
                |--------------------------------------------------------------------------
                | Actual Sales Only
                |--------------------------------------------------------------------------
                */

                ->where(
                    'status',
                    'Approved'
                )

                /*
                |--------------------------------------------------------------------------
                | Date Range
                |--------------------------------------------------------------------------
                */

                ->whereBetween(
                    'invoice_date',
                    [
                        $startDate,
                        $endDate,
                    ]
                );

        /*
        |--------------------------------------------------------------------------
        | Customer Wise Filter
        |--------------------------------------------------------------------------
        */

        if (
            $validated['report_type'] ===
            'client'
        ) {
            $query->where(
                'client_id',
                $validated['client']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Warehouse Wise Filter
        |--------------------------------------------------------------------------
        */

        if (
            $validated['report_type'] ===
            'warehouse'
        ) {
            $query->where(
                'warehouse_id',
                $validated['warehouse']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Get Invoices
        |--------------------------------------------------------------------------
        */

        $invoices =
            $query
                ->orderBy(
                    'invoice_date',
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
        | Return Report Data
        |--------------------------------------------------------------------------
        */

        return [
            'invoices' =>
                $invoices,

            'start_date' =>
                $startDate,

            'end_date' =>
                $endDate,

            'report_type' =>
                $validated['report_type'],

            'configure' =>
                $configure,

            'activeCurrency' =>
                $activeCurrency,

            /*
            |--------------------------------------------------------------------------
            | Customer
            |--------------------------------------------------------------------------
            */

            'client_id' =>
                $validated['client']
                ?? null,

            'client_name' =>
                $client?->name
                ?? '',

            'client_code' =>
                $client?->client_id
                ?? '',

            'client_phone' =>
                $client?->phone
                ?? '',

            'client_company' =>
                $client?->company_name
                ?? '',

            /*
            |--------------------------------------------------------------------------
            | Warehouse
            |--------------------------------------------------------------------------
            */

            'warehouse_id' =>
                $validated['warehouse']
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
    | Generate PDF File Name
    |--------------------------------------------------------------------------
    */

    private function generateFileName(
        array $data
    ): string {
        $type =
            match (
                $data['report_type']
            ) {
                'client' =>
                    'Customer_Wise',

                'warehouse' =>
                    'Warehouse_Wise',

                default =>
                    'Date_Wise',
            };

        return
            'Sales_Report_' .
            $type .
            '_' .
            $data['start_date'] .
            '_to_' .
            $data['end_date'] .
            '.pdf';
    }
}
