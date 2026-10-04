<?php

use App\Http\Controllers\AccountsDashboardController;
use App\Http\Controllers\AiConfigController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BillPaymentController;
use App\Http\Controllers\ConfigureController;
use App\Http\Controllers\CrmDashboardController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DesignationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EmployeeDashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\FinanceDocumentController;
use App\Http\Controllers\GoodsReceivedNoteController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\HrDashboardController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LeadConversationController;
use App\Http\Controllers\LeadDesignationController;
use App\Http\Controllers\LeadExportImportController;
use App\Http\Controllers\LeadFollowupNotificationController;
use App\Http\Controllers\LeadSourceController;
use App\Http\Controllers\LeadStageController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LeaveManagementController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\LoanInstallmentController;
use App\Http\Controllers\LoanInterestController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\ProductBrandController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfessionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseReportController;
use App\Http\Controllers\PurchaseReturnController;
use App\Http\Controllers\RequisitionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalaryAdvanceController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\SalaryIncrementController;
use App\Http\Controllers\SalesCommissionConfigureController;
use App\Http\Controllers\SalesInvoiceController;
use App\Http\Controllers\SalesPaymentController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\SalesReturnController;
use App\Http\Controllers\SalesTeamController;
use App\Http\Controllers\SectorController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\Web\BuildingController;
use App\Http\Controllers\WifiIpController;
use App\Http\Controllers\WorkFromHomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        $user = Auth::user();

        // If user has HR permission, redirect to HR dashboard
        if ($user->can('accounts.dashboard')) {
            return redirect()->route('dashboard.accounts');
        }

        // If user has HR permission, redirect to HR dashboard
        if ($user->can('hr.dashboard')) {
            return redirect()->route('dashboard.hr');
        }

        // If user has HR permission, redirect to HR dashboard
        if ($user->can('crm.dashboard')) {
            return redirect()->route('dashboard.crm');
        }

        // Default: redirect to employee dashboard
        return redirect()->route('dashboard.default');
    })->name('dashboard');

    // accounts Dashboard
    Route::get(
        '/dashboard/accounts',
        [
            AccountsDashboardController::class,
            'index',
        ]
    )->name('dashboard.accounts');

    // CRM Dashboard
    Route::get(
        '/dashboard/crm',
        [
            CrmDashboardController::class,
            'dashboard',
        ]
    )->name('dashboard.crm');

    // HR Dashboard
    Route::get(
        '/dashboard/hr',
        [
            HrDashboardController::class,
            'dashboard',
        ]
    )->name('dashboard.hr');

    // Employee Default Dashboard
    Route::get(
        '/dashboard',
        [
            EmployeeDashboardController::class,
            'dashboard',
        ]
    )->name('dashboard.default');

    Route::get('/test-ui', function () {
        return Inertia::render('test-ui');
    });

    Route::prefix('operations')
        ->name('operations.')
        ->group(function () {

            // Sales
            Route::prefix('sales')
                ->name('sales.')
                ->group(function () {

                    // Customers
                    Route::resource(
                        '/customers',
                        CustomerController::class
                    )
                        ->parameters([
                            'customers' => 'client',
                        ])
                        ->only([
                            'index',
                            'create',
                            'store',
                            'show',
                            'edit',
                            'update',
                            'destroy',
                        ]);

                    // Sales invoices
                    Route::get(
                        '/invoices',
                        [
                            SalesInvoiceController::class,
                            'index',
                        ]
                    )->name('invoices.index');

                    Route::get(
                        '/invoices/create',
                        [
                            SalesInvoiceController::class,
                            'create',
                        ]
                    )->name('invoices.create');

                    Route::post(
                        '/invoices',
                        [
                            SalesInvoiceController::class,
                            'store',
                        ]
                    )->name('invoices.store');

                    Route::get(
                        '/invoices/{salesInvoice}',
                        [
                            SalesInvoiceController::class,
                            'show',
                        ]
                    )->name('invoices.show');

                    Route::get(
                        '/invoices/{salesInvoice}/edit',
                        [
                            SalesInvoiceController::class,
                            'edit',
                        ]
                    )->name('invoices.edit');

                    Route::put(
                        '/invoices/{salesInvoice}',
                        [
                            SalesInvoiceController::class,
                            'update',
                        ]
                    )->name('invoices.update');

                    Route::patch(
                        '/invoices/{salesInvoice}/status',
                        [
                            SalesInvoiceController::class,
                            'updateStatus',
                        ]
                    )->name('invoices.status');

                    Route::delete(
                        '/invoices/{salesInvoice}',
                        [
                            SalesInvoiceController::class,
                            'destroy',
                        ]
                    )->name('invoices.destroy');

                    Route::get(
                        '/invoices/{salesInvoice}/download',
                        [
                            SalesInvoiceController::class,
                            'downloadPdf',
                        ]
                    )->name('invoices.download');

                    Route::get(
                        '/invoices/{salesInvoice}/print',
                        [
                            SalesInvoiceController::class,
                            'streamPdf',
                        ]
                    )->name('invoices.print');

                    // Sales Return
                    Route::get(
                        '/returns',
                        [
                            SalesReturnController::class,
                            'index',
                        ]
                    )->name('returns.index');

                    Route::get(
                        '/returns/create',
                        [
                            SalesReturnController::class,
                            'create',
                        ]
                    )->name('returns.create');

                    /*
                    | Sales Return Invoice Search
                    */

                    Route::get(
                        '/returns/search-invoices',
                        [
                            SalesReturnController::class,
                            'searchInvoices',
                        ]
                    )->name('returns.search-invoices');

                    Route::post(
                        '/returns',
                        [
                            SalesReturnController::class,
                            'store',
                        ]
                    )->name('returns.store');

                    Route::get(
                        '/returns/{salesReturn}',
                        [
                            SalesReturnController::class,
                            'show',
                        ]
                    )->name('returns.show');

                    Route::get(
                        '/returns/{salesReturn}/edit',
                        [
                            SalesReturnController::class,
                            'edit',
                        ]
                    )->name('returns.edit');

                    Route::put(
                        '/returns/{salesReturn}',
                        [
                            SalesReturnController::class,
                            'update',
                        ]
                    )->name('returns.update');

                    Route::patch(
                        '/returns/{salesReturn}/status',
                        [
                            SalesReturnController::class,
                            'updateStatus',
                        ]
                    )->name('returns.status');

                    Route::delete(
                        '/returns/{salesReturn}',
                        [
                            SalesReturnController::class,
                            'destroy',
                        ]
                    )->name('returns.destroy');

                    Route::get(
                        '/returns/{salesReturn}/download',
                        [
                            SalesReturnController::class,
                            'downloadPdf',
                        ]
                    )->name('returns.download');

                    Route::get(
                        '/returns/{salesReturn}/print',
                        [
                            SalesReturnController::class,
                            'streamPdf',
                        ]
                    )->name('returns.print');

                    // Sales Payment
                    Route::get(
                        '/payments',
                        [
                            SalesPaymentController::class,
                            'index',
                        ]
                    )->name('payments.index');

                    Route::get(
                        '/payments/create',
                        [
                            SalesPaymentController::class,
                            'create',
                        ]
                    )->name('payments.create');

                    Route::post(
                        '/payments',
                        [
                            SalesPaymentController::class,
                            'store',
                        ]
                    )->name('payments.store');

                    Route::get(
                        '/payments/{salesPayment}',
                        [
                            SalesPaymentController::class,
                            'show',
                        ]
                    )->name('payments.show');

                    Route::get(
                        '/payments/{salesPayment}/edit',
                        [
                            SalesPaymentController::class,
                            'edit',
                        ]
                    )->name('payments.edit');

                    Route::put(
                        '/payments/{salesPayment}',
                        [
                            SalesPaymentController::class,
                            'update',
                        ]
                    )->name('payments.update');

                    Route::patch(
                        '/payments/{salesPayment}/status',
                        [
                            SalesPaymentController::class,
                            'updateStatus',
                        ]
                    )->name('payments.status');

                    Route::delete(
                        '/payments/{salesPayment}',
                        [
                            SalesPaymentController::class,
                            'destroy',
                        ]
                    )->name('payments.destroy');

                    Route::get(
                        '/payments/{salesPayment}/download',
                        [
                            SalesPaymentController::class,
                            'downloadPdf',
                        ]
                    )->name('payments.download');

                    Route::get(
                        '/payments/{salesPayment}/print',
                        [
                            SalesPaymentController::class,
                            'streamPdf',
                        ]
                    )->name('payments.print');

                    Route::get(
                        '/report',
                        [
                            SalesReportController::class,
                            'index',
                        ]
                    )->name('report.index');

                    Route::post(
                        '/report',
                        [
                            SalesReportController::class,
                            'report',
                        ]
                    )->name('report.show');

                    Route::post(
                        '/report/pdf',
                        [
                            SalesReportController::class,
                            'downloadPdf',
                        ]
                    )->name('report.pdf');

                });

            // Products
            Route::get(
                '/products/search',
                [
                    ProductController::class,
                    'search',
                ]
            )->name(
                'products.search'
            );

            Route::resource(
                '/products',
                ProductController::class
            )->only([
                'index',
                'create',
                'store',
                'edit',
                'update',
                'destroy',
            ]);

            // Categories
            Route::resource(
                '/product-categories',
                ProductCategoryController::class
            )
                ->parameters([
                    'product-categories' => 'productCategory',
                ])
                ->only([
                    'index',
                    'store',
                    'update',
                    'destroy',
                ]);

            // Brands
            Route::resource(
                '/product-brands',
                ProductBrandController::class
            )
                ->parameters([
                    'product-brands' => 'productBrand',
                ])
                ->only([
                    'index',
                    'store',
                    'update',
                    'destroy',
                ]);

            //  Warehouses
            Route::resource(
                '/warehouses',
                WarehouseController::class
            )->only([
                'index',
                'store',
                'update',
                'destroy',
            ]);
        });

    // Human Resources

    Route::middleware([
        'auth',
        'verified',
    ])
        ->prefix('hr')
        ->name('hr.')
        ->group(function () {

            // Salary Overview

            Route::get(
                '/salary-overview',
                [
                    SalaryController::class,
                    'index',
                ]
            )->name(
                'salary.overview'
            );

            // Salary Increment

            Route::get(
                '/increment',
                [
                    SalaryIncrementController::class,
                    'index',
                ]
            )->name(
                'increment.index'
            );

            Route::post(
                '/increment',
                [
                    SalaryIncrementController::class,
                    'store',
                ]
            )->name(
                'increment.store'
            );

            Route::get(
                '/increment/create',
                [
                    SalaryIncrementController::class,
                    'create',
                ]
            )->name(
                'increment.create'
            );

            Route::get(
                '/increment/{increment}',
                [
                    SalaryIncrementController::class,
                    'show',
                ]
            )->name(
                'increment.show'
            );

            Route::get(
                '/increment/{increment}/edit',
                [
                    SalaryIncrementController::class,
                    'edit',
                ]
            )->name(
                'increment.edit'
            );

            Route::put(
                '/increment/{increment}',
                [
                    SalaryIncrementController::class,
                    'update',
                ]
            )->name(
                'increment.update'
            );

            Route::delete(
                '/increment/{increment}',
                [
                    SalaryIncrementController::class,
                    'destroy',
                ]
            )->name(
                'increment.destroy'
            );

            Route::patch(
                '/increment/{increment}/status',
                [
                    SalaryIncrementController::class,
                    'updateStatus',
                ]
            )->name(
                'increment.status'
            );

            // Salary Advance

            Route::get(
                '/salary-advance',
                [
                    SalaryAdvanceController::class,
                    'index',
                ]
            )->name(
                'salary.advance.index'
            );

            Route::post(
                '/salary-advance',
                [
                    SalaryAdvanceController::class,
                    'store',
                ]
            )->name(
                'salary.advance.store'
            );

            Route::get(
                '/salary-advance/{salaryAdvance}/edit',
                [
                    SalaryAdvanceController::class,
                    'edit',
                ]
            )->name(
                'salary.advance.edit'
            );

            Route::put(
                '/salary-advance/{salaryAdvance}',
                [
                    SalaryAdvanceController::class,
                    'update',
                ]
            )->name(
                'salary.advance.update'
            );

            Route::delete(
                '/salary-advance/{salaryAdvance}',
                [
                    SalaryAdvanceController::class,
                    'destroy',
                ]
            )->name(
                'salary.advance.destroy'
            );

            // Salary Generate

            Route::get(
                '/salary-generate',
                [
                    SalaryController::class,
                    'generate',
                ]
            )->name(
                'salary.generate.index'
            );

            Route::post(
                '/salary-generate',
                [
                    SalaryController::class,
                    'generateSalaries',
                ]
            )->name(
                'salary.generate'
            );

            // Manage Payslip
            Route::get(
                '/payslip',
                [
                    SalaryController::class,
                    'payslipIndex',
                ]
            )->name(
                'payslip.index'
            );

            Route::get(
                '/payslip/{salary}',
                [
                    SalaryController::class,
                    'payslip',
                ]
            )->name(
                'payslip.show'
            );

            Route::get(
                '/payslip/{salary}/download',
                [
                    SalaryController::class,
                    'payslipDownload',
                ]
            )->name(
                'payslip.download'
            );

            Route::patch(
                '/payslip/{salary}/status',
                [
                    SalaryController::class,
                    'updateStatus',
                ]
            )->name(
                'payslip.status'
            );

            // Salary Chart

            Route::get(
                '/salary-generate/chart/{month}',
                [
                    SalaryController::class,
                    'salaryChart',
                ]
            )->name(
                'salary.chart'
            );

            // User Salary Report
            Route::get(
                '/salary-report',
                [
                    SalaryController::class,
                    'userSalaryReport',
                ]
            )->name(
                'salary.report'
            );

            Route::post(
                '/salary-report',
                [
                    SalaryController::class,
                    'generateUserSalaryReport',
                ]
            )->name(
                'salary.report.generate'
            );
        });

    // Human Resources - Attendance
    Route::middleware([
        'auth',
        'verified',
    ])->group(function () {

        // My Attendance

        Route::get(
            '/hr/attendance',
            [
                AttendanceController::class,
                'index',
            ]
        )->name(
            'attendance.index'
        );

        Route::post(
            '/hr/attendance',
            [
                AttendanceController::class,
                'store',
            ]
        )->name(
            'attendance.store'
        );

        // Employee Attendance

        Route::get(
            '/hr/attendance/employees',
            [
                AttendanceController::class,
                'employeeAttendance',
            ]
        )->name(
            'hr.employee-attendance'
        );

        // Manual Attendance
        Route::get(
            '/hr/attendance/manual',
            [
                AttendanceController::class,
                'manualAttendance',
            ]
        )->name(
            'attendance.manual'
        );

        Route::get(
            '/hr/attendance/manual/{userId}/check/{date}',
            [
                AttendanceController::class,
                'attendanceCheck',
            ]
        )->name(
            'attendance.manual.check'
        );

        Route::post(
            '/hr/attendance/manual',
            [
                AttendanceController::class,
                'manualAttendanceStore',
            ]
        )->name(
            'attendance.manual.store'
        );

        // Attendance Reports - Page
        Route::get(
            '/hr/attendance/reports',
            [
                AttendanceController::class,
                'reports',
            ]
        )->name(
            'hr.attendance.reports'
        );

        // All Employee Report
        Route::post(
            '/hr/report/attendance/all',
            [
                AttendanceController::class,
                'allAttendanceReport',
            ]
        )->name(
            'hr.report.attendance.all'
        );

        // Individual Employee Report
        Route::post(
            '/hr/report/attendance/individual',
            [
                AttendanceController::class,
                'individualAttendanceReport',
            ]
        )->name(
            'hr.report.attendance.individual'
        );

        // Monthly Employee Report
        Route::post(
            '/hr/report/attendance/monthly',
            [
                AttendanceController::class,
                'monthlyAttendanceReport',
            ]
        )->name(
            'hr.report.attendance.monthly'
        );
    });

    // Department
    Route::resource('/department', DepartmentController::class);
    Route::post('/department-update', [DepartmentController::class, 'updatedepartment'])->name('department.update-department');
    Route::get('/get-departments', [DepartmentController::class, 'getDepartments'])->name('department.get-departments');

    // Designation
    Route::resource('/designation', DesignationController::class);
    Route::post('/designation-update', [DesignationController::class, 'updateDesignation'])->name('designation.update-designation');
    // Get All Designations
    Route::get('/get-designations', [DesignationController::class, 'getDesignations']);

    // Configer
    Route::get('configure', [ConfigureController::class, 'index'])->name('configure.index');
    Route::post('configure/update', [ConfigureController::class, 'update'])->name('configure.update');

    Route::middleware('can:settings.ai_config')->group(function () {
        Route::get('/settings/ai-config', [AiConfigController::class, 'index'])->name('settings.ai-config.index');
        Route::post('/settings/ai-config', [AiConfigController::class, 'store'])->name('settings.ai-config.store');
        Route::get('/settings/ai-config/{groqApiKey}/reveal', [AiConfigController::class, 'reveal'])->name('settings.ai-config.reveal');
        Route::delete('/settings/ai-config/{groqApiKey}', [AiConfigController::class, 'destroy'])->name('settings.ai-config.destroy');
    });

    // Setup Time Zone
    Route::get('/setup/timezone', [ConfigureController::class, 'timeZoneIndex'])->name('setup.timezone.index');
    Route::post('/setup/timezone', [ConfigureController::class, 'timeZone'])->name('setup.timezone');

    // Commission
    Route::resource('/commission', SalesCommissionConfigureController::class);
    Route::post('/commission-update', [SalesCommissionConfigureController::class, 'updateCommission'])->name('commission.update-commission');

    // Interest
    Route::resource('/loan-interest', LoanInterestController::class);
    Route::post('/interest-update', [LoanInterestController::class, 'updateInterest'])->name('interest.update-interest');

    // Unit
    Route::resource('/unit', UnitController::class);
    Route::post('/unit-update', [UnitController::class, 'updateUnit'])->name('unit.update-unit');
    Route::get('/get-units', [UnitController::class, 'getUnits'])->name('department.get-units');

    // Currency
    Route::resource('/currency', CurrencyController::class);
    Route::post('/currency-update', [CurrencyController::class, 'updateCurrency'])->name('currency.update-currency');
    Route::get('/get-currencies', [CurrencyController::class, 'getCurrencies'])->name('currency.get-currencies');

    // Tax
    Route::resource('/tax', TaxController::class);
    Route::post('/tax-update', [TaxController::class, 'updateTax'])->name('tax.update-tax');
    Route::get('/get-taxes', [TaxController::class, 'getTaxes'])->name('tax.get-taxes');

    // Wifi IPs
    Route::get('/wifi-ips', [WifiIpController::class, 'index'])->name('wifiIp.index');
    Route::post('/wifi-ips', [WifiIpController::class, 'store'])->name('wifiIp.store');
    Route::get('/wifi-ips/{wifiIp}/edit', [WifiIpController::class, 'edit'])->name('wifiIp.edit');
    Route::post('/wifi-ips-update', [WifiIpController::class, 'update'])->name('wifiIp.update');
    Route::delete('/wifi-ips/{wifiIp}', [WifiIpController::class, 'destroy'])->name('wifiIp.destroy');

    // Leave
    Route::get('/leave', [LeaveController::class, 'index'])->name('leave.index');
    Route::post('/leave-store', [LeaveController::class, 'store'])->name('leave.store');
    Route::get('/leave/{leave}/edit', [LeaveController::class, 'edit'])->name('leave.edit');
    Route::post('/leave', [LeaveController::class, 'update'])->name('leave.update');
    Route::delete('/leave/{leave}', [LeaveController::class, 'destroy'])->name('leave.destroy');

    // Holiday
    Route::get('/holiday', [HolidayController::class, 'index'])->name('holiday.index');
    Route::post('/holiday-store', [HolidayController::class, 'store'])->name('holiday.store');
    Route::get('/holiday/{holiday}/edit', [HolidayController::class, 'edit'])->name('holiday.edit');
    Route::post('/holiday', [HolidayController::class, 'update'])->name('holiday.update');
    Route::delete('/holiday/{holiday}', [HolidayController::class, 'destroy'])->name('holiday.destroy');

    // Working Shift
    Route::resource('/shift', ShiftController::class);
    Route::post('/shift-update', [ShiftController::class, 'updateShift'])->name('shift.update-shift');

    /*
|--------------------------------------------------------------------------
| User & Role Permission Routes
|--------------------------------------------------------------------------
*/
    Route::resource('/user', UserController::class);
    Route::post('/user/assingrole/{user}', [UserController::class, 'setRolePermission'])->name('setRolePermission');
    // route::post('/get-permissions/{role}', [UserController::class, 'getRolePermissions']);
    Route::get('/user-status/{user}', [UserController::class, 'status']);

    // Get All Employees
    Route::get('/get-employees', [UserController::class, 'getEmployees']);

    Route::resource('/roles', RoleController::class);

    // Profile Update
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/update/information', [ProfileController::class, 'updateInformation'])->name('profile.update.information');
    Route::patch('/profile/update/password', [ProfileController::class, 'updatePassword'])->name('profile.update.password');
    Route::patch('/profile/update/image', [ProfileController::class, 'updateImage'])->name('profile.update.image');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Vendor
    Route::resource('/vendor', VendorController::class);
    Route::post('/vendor-update', [VendorController::class, 'updatedeVendor'])->name('vendor.update-vendor');

    // Get All Clients
    Route::get('/get-vendors', [VendorController::class, 'getVendors']);

    // Vendor
    Route::resource('/requisition', RequisitionController::class);

    Route::get(
        '/requisition-get-product-brands',
        [
            RequisitionController::class,
            'getProductBrands',
        ]
    );

    Route::get(
        '/requisition-get-product-categories',
        [
            RequisitionController::class,
            'getProductCategories',
        ]
    );

    Route::get(
        '/requisition-get-product-subcategories',
        [
            RequisitionController::class,
            'getProductSubcategories',
        ]
    );

    Route::get(
        '/requisition-get-product',
        [
            RequisitionController::class,
            'getProducts',
        ]
    );

    Route::get(
        '/get-requisitions',
        [
            RequisitionController::class,
            'getRequisitions',
        ]
    )->name(
        'requisition.get-requisitions'
    );

    Route::post(
        '/requisition-status',
        [
            RequisitionController::class,
            'updateRequisitionStatus',
        ]
    )->name(
        'requisition.status'
    );

    Route::post(
        '/requisition-item-status',
        [
            RequisitionController::class,
            'updateRequisitionItemStatus',
        ]
    )->name(
        'requisition.item-status'
    );

    Route::get(
        '/requisition/{id}/download-pdf',
        [
            RequisitionController::class,
            'downloadPdf',
        ]
    )->name(
        'requisition.download_pdf'
    );

    Route::get(
        '/requisition/{id}/stream-pdf',
        [
            RequisitionController::class,
            'streamPdf',
        ]
    )->name(
        'requisition.stream_pdf'
    );

    /*
|--------------------------------------------------------------------------
| Purchase Reports
|--------------------------------------------------------------------------
*/

    Route::get(
        '/purchase/report',
        [
            PurchaseReportController::class,
            'index',
        ]
    )->name('purchase.report.index');

    Route::post(
        '/purchase/report',
        [
            PurchaseReportController::class,
            'report',
        ]
    )->name('purchase.report.show');

    Route::post(
        '/purchase/report/pdf',
        [
            PurchaseReportController::class,
            'downloadPdf',
        ]
    )->name('purchase.report.pdf');

    // Purchase Order
    Route::get('purchase-order', [PurchaseOrderController::class, 'index'])->name('purchase.order.index');
    Route::get('purchase-order/create', [PurchaseOrderController::class, 'create'])->name('purchase.order.create');
    Route::post('purchase-order', [PurchaseOrderController::class, 'store'])->name('purchase.order.store');
    Route::get('purchase-order/{id}/show', [PurchaseOrderController::class, 'show'])->name('purchase.order.show');
    Route::get('purchase-order/{id}/edit', [PurchaseOrderController::class, 'edit'])->name('purchase.order.edit');
    Route::put('purchase-order/{id}/update', [PurchaseOrderController::class, 'update'])->name('purchase.order.update');
    Route::delete('purchase-order/{id}/destroy', [PurchaseOrderController::class, 'destroy'])->name('purchase.order.destroy');
    Route::post('/purchase-order/{id}/payment', [PurchaseOrderController::class, 'makePayment'])->name('purchase.order.nakepayment');
    Route::post('/purchase-order/{id}/download-pdf', [PurchaseOrderController::class, 'downloadPdf'])->name('purchase.order.download_pdf');
    Route::get('/purchase-order/{id}/stream-pdf', [PurchaseOrderController::class, 'streamPdf'])->name('purchase.order.stream_pdf');

    Route::post('purchase-order/status', [PurchaseOrderController::class, 'updateStatus'])->name('purchase.order.status');

    // Requisition to Purchase Order
    Route::get('/purchase-order/{id}/create', [PurchaseOrderController::class, 'requisitionToMakePurchaseOrder'])->name('requisition.purchase.order.index');

    // Get All Purchase orders
    Route::get('/get-purchase-orders', [PurchaseOrderController::class, 'getPurchaseOrders']);

    // Get Requisition for make PO
    Route::get('/get-approved-requisitions', [PurchaseOrderController::class, 'getApprovedRequisitions']);
    Route::get('/get-requisition-items-for-po', [PurchaseOrderController::class, 'getRequisitionItemsForPo']);

    // GRN For Accountnat
    Route::get('/grn', [GoodsReceivedNoteController::class, 'index'])->name('grn.index');
    Route::get('/grn/{id}/show', [GoodsReceivedNoteController::class, 'show'])->name('grn.show');
    Route::post('/grn/status', [GoodsReceivedNoteController::class, 'updateStatus'])->name('grn.status');

    Route::get('/grn/create', [GoodsReceivedNoteController::class, 'create'])->name('grn.create');
    Route::post('/grn', [GoodsReceivedNoteController::class, 'store'])->name('grn.store');
    Route::get('/grn/edit/{id}', [GoodsReceivedNoteController::class, 'store'])->name('grn.edit');
    Route::get('/grn/edit/{id}', [GoodsReceivedNoteController::class, 'edit'])->name('grn.edit');
    Route::put('/grn/edit/{id}', [GoodsReceivedNoteController::class, 'update'])->name('grn.update');
    Route::delete('/grn/{id}', [GoodsReceivedNoteController::class, 'destroy'])->name('grn.destroy');
    Route::post('/grn/{id}/download-pdf', [GoodsReceivedNoteController::class, 'downloadPdf'])->name('grn.download_pdf');
    Route::get('/grn/{id}/stream-pdf', [GoodsReceivedNoteController::class, 'streamPdf'])->name('grn.stream_pdf');

    Route::get('/grn-get-purchase-orders', [GoodsReceivedNoteController::class, 'getProjectPurchaseOrders']);
    Route::get('/grn-get-po-items-for-grn', [GoodsReceivedNoteController::class, 'getPoItemsForGrn']);
    Route::get(
        '/get-grns',
        [GoodsReceivedNoteController::class, 'getGrns']
    )->name('grn.search');

    // Bills
    Route::get('/bill', [BillController::class, 'index'])->name('bill.name');
    Route::get('/bill/{id}', [BillController::class, 'show'])->name('bill.show');
    Route::get('/bill/{id}/edit', [BillController::class, 'edit'])->name('bill.edit');
    Route::put('/bill/{id}/edit', [BillController::class, 'update'])->name('bill.update');
    Route::post('/bill/{id}/download-pdf', [BillController::class, 'downloadPdf'])->name('bill.download_pdf');
    Route::get('/bill/{id}/stream-pdf', [BillController::class, 'streamPdf'])->name('bill.stream_pdf');
    Route::get(
        '/get-bills',
        [BillController::class, 'getBills']
    )->name('bill.search');

    // Bill Payment
    Route::post('/bill/{bill}/payments', [BillPaymentController::class, 'store'])->name('bill.payment.store');
    Route::post('/bill/{bill}/payments/{payment}/update', [BillPaymentController::class, 'update'])->name('bill.payment.update');
    Route::delete('/bill/{bill}/payments/{payment}', [BillPaymentController::class, 'destroy'])->name('bill.payment.destroy');

    Route::get('/bill-payment/{id}/download-pdf', [BillPaymentController::class, 'downloadPdf'])->name('bill.payment.download-pdf');
    Route::get('/bill-payment/{id}/stream-pdf', [BillPaymentController::class, 'streamPdf'])->name('bill.payment.stream-pdf');

    // Stock Reports
    Route::get(
        '/inventory/stocks/report',
        [
            StockReportController::class,
            'index',
        ]
    )->name('stocks.report.index');

    Route::post(
        '/inventory/stocks/report',
        [
            StockReportController::class,
            'report',
        ]
    )->name('stocks.report.show');

    Route::post(
        '/inventory/stocks/report/pdf',
        [
            StockReportController::class,
            'downloadPdf',
        ]
    )->name('stocks.report.pdf');

    Route::get('/inventory/stocks', [StockController::class, 'index'])->name('stocks.index');
    Route::get('/inventory/stocks/{product}', [StockController::class, 'showProductStock'])->name('stocks.show');
    Route::get('/inventory/reorder-alerts', [StockController::class, 'reorderAlerts'])->name('reorder-alerts.index');

    Route::get('/inventory/stock-transfers', [StockController::class, 'transfers'])->name('stock-transfers.index');
    Route::get('/inventory/stock-transfers/create', [StockController::class, 'createTransfer'])->name('stock-transfers.create');
    Route::get('/inventory/stock-transfers/{stockTransfer}', [StockController::class, 'showStockTransfer'])->name('stocks-transfers.show');
    Route::post('/inventory/stock-transfers', [StockController::class, 'storeTransfer'])->name('stock-transfers.store');
    Route::post('/inventory/stock-transfers/{stockTransfer}/post', [StockController::class, 'postTransfer'])->name('stock-transfers.post');
    Route::delete('/inventory/stock-transfers/{stockTransfer}', [StockController::class, 'destroyTransfer'])->name('stock-transfers.destroy');

    Route::get('/inventory/stock-adjustments', [StockController::class, 'adjustments'])->name('stock-adjustments.index');
    Route::get('/inventory/stock-adjustments/create', [StockController::class, 'createAdjustment'])->name('stock-adjustments.create');
    Route::get('/inventory/stock-adjustments/{stockAdjustment}', [StockController::class, 'showAdjustment'])->name('stocks-adjustments.show');
    Route::post('/inventory/stock-adjustments', [StockController::class, 'storeAdjustment'])->name('stock-adjustments.store');
    Route::post('/inventory/stock-adjustments/{stockAdjustment}/post', [StockController::class, 'postAdjustment'])->name('stock-adjustments.post');
    Route::delete('/inventory/stock-adjustments/{stockAdjustment}', [StockController::class, 'destroyAdjustment'])->name('stock-adjustments.destroy');
    Route::get('/inventory/stock-ledger', [StockController::class, 'ledger'])->name('stock-ledger.index');

    Route::get('/purchase-returns', [PurchaseReturnController::class, 'index'])
        ->name('purchase-returns.index');

    Route::get('/purchase-returns/create', [PurchaseReturnController::class, 'create'])
        ->name('purchase-returns.create');

    Route::get('/purchase-return-search-po', [PurchaseReturnController::class, 'getPurchaseOrders'])
        ->name('purchase-returns.search-po');
    Route::get('/purchase-return-search-po-items', [PurchaseReturnController::class, 'getPurchaseOrderItems'])
        ->name('purchase-returns.search-po-items');
    Route::post('/purchase-returns', [PurchaseReturnController::class, 'store'])
        ->name('purchase-returns.store');

    Route::get('/purchase-returns/{purchaseReturn}/show', [PurchaseReturnController::class, 'show'])
        ->name('purchase-returns.show');

    Route::get(
        '/purchase-returns/{purchaseReturn}/edit',
        [
            PurchaseReturnController::class,
            'edit',
        ]
    )
        ->name(
            'purchase-returns.edit'
        );

    Route::put(
        '/purchase-returns/{purchaseReturn}',
        [
            PurchaseReturnController::class,
            'update',
        ]
    )
        ->name(
            'purchase-returns.update'
        );

    Route::post(
        '/purchase-returns/{purchaseReturn}/status',
        [
            PurchaseReturnController::class,
            'updateStatus',
        ]
    )
        ->name(
            'purchase-returns.update-status'
        );

    Route::delete('/purchase-returns/{purchaseReturn}', [PurchaseReturnController::class, 'destroy'])
        ->name('purchase-returns.destroy');

    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('/payables', [FinanceController::class, 'payables'])->name('payables.index');
        Route::get('/payables/{payable}', [FinanceController::class, 'payable'])->name('payables.show');
        Route::post('/payables/{payable}/pay', [FinanceController::class, 'pay'])->name('payables.pay');
        Route::get('/receivables', [FinanceController::class, 'receivables'])->name('receivables.index');
        Route::get('/receivables/{receivable}', [FinanceController::class, 'receivable'])->name('receivables.show');
        Route::post('/receivables/{receivable}/collect', [FinanceController::class, 'collect'])->name('receivables.collect');
        Route::get('/transactions', [FinanceController::class, 'transactions'])->name('transactions.index');
        Route::post('/sales-returns/{salesReturn}/refund', [FinanceController::class, 'refund'])->name('sales-returns.refund');
        Route::get('/profit-loss', [FinanceController::class, 'profitLoss'])->name('profit-loss.index');
        Route::get('/sales-invoices/{salesInvoice}/{mode}', [FinanceDocumentController::class, 'salesInvoice'])->name('sales-invoices.pdf');
        Route::get('/vendor-debit-notes/{vendorDebitNote}/{mode}', [FinanceDocumentController::class, 'vendorDebitNote'])->name('vendor-debit-notes.pdf');
    });

    // document
    Route::get('/document', [DocumentController::class, 'index'])->name('document.index');
    Route::get('/document/edit', [DocumentController::class, 'edit'])->name('document.edit');
    Route::get('/document/{id}/show', [DocumentController::class, 'show'])->name('document.show');
    Route::post('/document/update', [DocumentController::class, 'update'])->name('document.update');
    Route::get('/document/{id}/show', [DocumentController::class, 'show'])->name('document.show');

    // ====================== SALES TEAMS ROUTES ======================

    Route::resource('sales-teams', SalesTeamController::class)->except(['show']);
    Route::get('/get-sales-teams', [SalesTeamController::class, 'getSalesTeams'])->name('sales-team.get-sales-teams');

    // Additional Member Management Routes
    Route::prefix('sales-teams/{sales_team}')->name('sales-teams.')->group(function () {

        // Team Members Management
        Route::get('/members', [SalesTeamController::class, 'getMembers'])
            ->name('members.index');

        Route::post('/members', [SalesTeamController::class, 'addMember'])
            ->name('members.store');

        Route::delete('/members/{user}', [SalesTeamController::class, 'removeMember'])
            ->name('members.destroy');
    });

    // Predictive Search for Available Users
    Route::get('/get-available-users/{sales_team}', [SalesTeamController::class, 'getAvailableUsers'])
        ->name('sales-teams.available-users');

    // Lead Source
    Route::resource('/lead-source', LeadSourceController::class);
    Route::post('/lead-source-update', [LeadSourceController::class, 'updateSource'])->name('lead-source.update-lead-source');
    Route::get('/get-lead-sources', [LeadSourceController::class, 'getLeadSources'])->name('lead-source.get-sources');

    // Lead Stage
    Route::resource('/lead-stage', LeadStageController::class);
    Route::post('/lead-stage-update', [LeadStageController::class, 'updateStage'])->name('lead-stage.update-lead-stage');
    Route::get('/get-lead-stages', [LeadStageController::class, 'getLeadStages'])->name('lead-stage.get-stages');

    // Sectors
    Route::resource('/sector', SectorController::class);
    Route::post('/sector-update', [SectorController::class, 'updateSector'])->name('sector.update-sector');
    Route::get('/get-lead-sectors', [SectorController::class, 'getLeadSectors'])->name('sector.get-sectors');

    // Areas
    Route::resource('/area', AreaController::class);
    Route::post('/area-update', [AreaController::class, 'updateArea'])->name('area.update-area');
    Route::get('/get-lead-area', [AreaController::class, 'getLeadArea'])->name('area.get-area');

    // Professions
    Route::resource('/profession', ProfessionController::class);
    Route::post('/profession-update', [ProfessionController::class, 'updateProfession'])->name('profession.update-profession');
    Route::get('/get-lead-professions', [ProfessionController::class, 'getLeadProfessions'])->name('profession.get-professions');

    // Lead Designation
    Route::resource('/lead-designation', LeadDesignationController::class);
    Route::post('/lead-designation-update', [LeadDesignationController::class, 'updateDesignation'])->name('lead-designation.update-lead-designation');
    Route::get('/get-lead-designations', [LeadDesignationController::class, 'getLeadDesignations'])->name('lead-designation.get-designations');

    // Leads
    Route::prefix('/lead')->name('lead.')->group(function () {
        Route::get('/assigned', [LeadController::class, 'assigned'])->name('assigned');
        Route::get('/untouch', [LeadController::class, 'untouch'])->name('untouch');
        Route::get('/lost', [LeadController::class, 'lost'])->name('lost');
        Route::get('/lead-follow-up', [LeadController::class, 'leadFolllowUp'])->name('lead-follow-up');
        Route::get('/follow-up-due', [LeadController::class, 'followUpDue'])->name('follow-up-due');
        Route::get('/conversation', [LeadController::class, 'conversation'])->name('conversation');
        Route::get('/conversion', [LeadController::class, 'conversion'])->name('conversion');
    });

    Route::post(
        '/lead-designations/resolve',
        [
            LeadController::class,
            'resolveDesignation',
        ],
    )->name('lead-designations.resolve');

    Route::post(
        '/lead-areas/resolve',
        [LeadController::class, 'resolveArea'],
    )->name('lead-areas.resolve');

    Route::post('/leads/bulk-assign', [LeadController::class, 'bulkAssign'])
        ->name('leads.bulk.assign');

    Route::post('/leads/bulk-unassign', [LeadController::class, 'bulkUnassign'])
        ->name('leads.bulk.unassign');

    // Lead Conversation
    Route::get('/lead-conversation/{lead}', [LeadConversationController::class, 'create'])->name('lead.conversation.create');
    Route::post('/lead-conversation/{lead}', [LeadConversationController::class, 'store'])->name('lead.conversation.store');

    Route::delete('/lead-followup-notification/{id}', [LeadFollowupNotificationController::class, 'destroy'])->name('lead.followup.notification.delete');

    // Leads
    Route::resource('/lead', LeadController::class);
    Route::post('/lead/parse-card', [LeadController::class, 'parseCardData']);
    Route::get('/leads/check-phone', [LeadController::class, 'checkPhone'])
        ->name('leads.check-phone');

    // Get All Leads
    Route::get('/get-leads', [LeadController::class, 'getLeads']);

    // Lead Imports
    Route::get('/lead.bulk-import', [LeadExportImportController::class, 'leadImport'])->name('lead.bulk-import.crete');
    Route::post('/lead.bulk-import', [LeadExportImportController::class, 'leadImportStore'])->name('lead.bulk-import.store');

    Route::get('/get-products', [ProductController::class, 'getProducts'])->name('product.get-products');

    // Exprot Excel
    Route::post('/lead/export-excel', [LeadController::class, 'exportExcel'])->name('lead-export');

    // Notices
    Route::resource('notice', NoticeController::class);
    Route::get('/get-notices', [NoticeController::class, 'getNotices'])->name('notice.search');
    // User Notice View
    Route::get('hr/notice', [NoticeController::class, 'notice'])->name('hr.notice');
    // Notice Resource (Handles index, create, store, show, edit, update, destroy)
    Route::resource('notice', NoticeController::class);

    // Work From Home Request
    Route::get('hr/all-wfh', [WorkFromHomeController::class, 'index'])->name('hr.workFromHomeRequest.index');
    Route::get('hr/wfh', [WorkFromHomeController::class, 'workFromHomeRequest'])->name('hr.workFromHomeRequest');
    Route::post('hr/wfh', [WorkFromHomeController::class, 'store'])->name('hr.workFromHomeRequest.store');
    Route::post(
        '/hr/wfh/manual',
        [WorkFromHomeController::class, 'manualStore']
    )
        ->middleware('permission:WFH.status')
        ->name('hr.wfh.manual.store');
    Route::get('hr/wfh/{workFromHome}/edit', [WorkFromHomeController::class, 'edit'])->name('hr.workFromHomeRequest.edit');
    Route::post('hr/wfh/update', [WorkFromHomeController::class, 'update'])->name('hr.workFromHomeRequest.update');
    Route::get('hr/wfh/{workFromHome}/show', [WorkFromHomeController::class, 'show'])->name('hr.workFromHomeRequest.show');
    Route::delete('hr/wfh/{workFromHome}', [WorkFromHomeController::class, 'destroy'])->name('hr.workFromHomeRequest.destroy');
    Route::post('hr/wfh-status', [WorkFromHomeController::class, 'updateRequestStatus'])->name('hr.workFromHomeRequest.status');

    // Leave Management
    Route::get('/hr/leave-management', [LeaveManagementController::class, 'index'])->name('hr.leaveManagement.index');
    Route::post('/hr/leave-management', [LeaveManagementController::class, 'store'])->name('hr.leaveManagement.store');
    Route::get('/hr-leave-management/{user}/edit', [LeaveManagementController::class, 'edit'])->name('hr.leaveManagement.edit');
    Route::post('/hr-leave-management/update', [LeaveManagementController::class, 'update'])->name('hr.leaveManagement.update');
    Route::delete('/hr-leave-management/{user}', [LeaveManagementController::class, 'destroy'])->name('hr.leaveManagement.destroy');
    Route::get('/get-unassign-leave-employees', [LeaveManagementController::class, 'getEmployees'])->name('leaveManagement.getEmployees');

    // User Leave Request
    Route::get('hr/leave-request', [LeaveRequestController::class, 'leaveRequest'])->name('hr.leaveRequest');
    Route::post('hr/leave-request', [LeaveRequestController::class, 'store'])->name('hr.leaveRequest.store');
    Route::get('hr/leave-request/{id}/show', [LeaveRequestController::class, 'show'])->name('hr.leaveRequest.show');

    // HR Leave Request
    Route::get('hr/all-leave-request', [LeaveRequestController::class, 'index'])->name('hr.leaveRequest.index');
    Route::get('hr/leave-request/{id}/edit', [LeaveRequestController::class, 'edit'])->name('hr.leaveRequest.edit');
    Route::post('hr/leave-request/update', [LeaveRequestController::class, 'update'])->name('hr.leaveRequest.update');
    Route::delete('hr/leave-request/{leaveRequest}', [LeaveRequestController::class, 'destroy'])->name('hr.leaveRequest.destroy');
    Route::post('hr/leave-request-status', [LeaveRequestController::class, 'updateLeaveStatus'])->name('hr.leaveRequest.status');
    Route::post('hr/manually-leave-request', [LeaveRequestController::class, 'manuallyStoreLeave'])->name('hr.leaveRequest.manually.store');
    Route::get('/hr/get-user-leaves/{userId}', [LeaveRequestController::class, 'getUserLeaves'])->name('hr.getUserLeaves');

    // HR Loan
    Route::get('hr/all-loan-request', [LoanController::class, 'index'])->name('hr.loanRequest.index');
    Route::get('hr/loan-request', [LoanController::class, 'loanRequest'])->name('hr.loanRequest');
    Route::post('hr/loan-request', [LoanController::class, 'store'])->name('hr.loanRequest.store');
    Route::post('hr/manually-loan-request', [LoanController::class, 'manuallyStoreLoan'])->name('hr.loanRequest.manually.store');
    Route::get('hr/loan-request/{loan}/edit', [LoanController::class, 'edit'])->name('hr.loanRequest.edit');
    Route::post('hr/loan-request/update', [LoanController::class, 'update'])->name('hr.loanRequest.update');
    Route::get('hr/loan-request/{loan}/show', [LoanController::class, 'show'])->name('hr.loanRequest.show');
    Route::delete('hr/loan-request/{loan}', [LoanController::class, 'destroy'])->name('hr.loanRequest.destroy');
    Route::post('hr/loan-request-status', [LoanController::class, 'updateRequestStatus'])->name('hr.loanRequest.status');

    // Loan Installment
    Route::get('hr/loan-installment/{loan}/show', [LoanInstallmentController::class, 'index'])->name('hr.loan.installment');

    // Machine Maintenance
    Route::get('/building', [BuildingController::class, 'index'])->name('building.index');
    Route::post('/building', [BuildingController::class, 'store'])->name('building.store');
    Route::put('/building/{building}', [BuildingController::class, 'update'])->name('building.update');
    Route::delete('/building/{id}', [BuildingController::class, 'destroy'])->name('building.destroy');

    Route::post('/notifications/mark-as-read', function () {
        auth()->user()->unreadNotifications->markAsRead();

        return redirect()->back();
    });

    Route::post('/notifications/{id}/mark-as-read', function ($id) {
        $notification = auth()->user()->notifications()->find($id);
        if ($notification) {
            $notification->markAsRead();
        }

        return redirect()->back();
    });

    Route::post('/lead-followup-notifications/mark-as-read', function () {
        auth()->user()
            ->leadFollowupsNotifications()
            ->update(['read_at' => now()]);

        return back();
    });

    Route::post('/lead-followup-notifications/{id}/mark-as-read', function ($id) {
        auth()->user()
            ->leadFollowupsNotifications()
            ->whereKey($id)
            ->update(['read_at' => now()]);

        return back();
    });
});
