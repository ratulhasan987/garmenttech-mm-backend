<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanInterest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
// use App\Notifications\GeneralNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoanController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('loan.list')) {
            abort('403', 'Unauthorized access');
        }

        $interestRate = optional(auth()->user()->loanInterest)->status === 'active'
            ? auth()->user()->loanInterest->rate
            : 0;

        $query = Loan::with('user:id,employee_id,name');

        if ($request->has('employee') && !empty($request->input('employee'))) {
            $query->where('user_id', $request->input('employee'));
        }

        if ($request->has('status') && !empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('sorting') && !empty($request->input('sorting'))) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        }

        // Apply date range filter only if both dates are provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();

            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Get the total number of leads for this que
        $numberOfLoans = $query->count();

        // Paginate with 30 records per page
        $loans = $query->latest()->paginate(30);

        $users = User::where('status', 'active')->orderBy('name', 'asc')->get();

        return Inertia::render('hr/loan/index', [
            'loans' => $loans,
            'numberOfLoans' => $numberOfLoans,
            'interestRate' => $interestRate,
            'filters' => $request->only([
                'employee',
                'status',
                'sorting',
                'start_date',
                'end_date',
            ]),
        ]);

        return view('pages.hr.loan.index', compact('loans', 'numberOfLoans', 'interestRate'))->with('request', $request);

    }

    public function loanRequest()
    {
        if (is_null($this->user) || !$this->user->can('user.loan')) {
            abort('403', 'Unauthorized access');
        }

        $loans = Loan::where('user_id', auth()->user()->id)->latest()->paginate(30);

        $numberOfLoans = $loans->count();

        $interestRate = optional(auth()->user()->loanInterest)->status === 'active'
            ? auth()->user()->loanInterest->rate
            : 0;

        return Inertia::render('hr/loan/loan-request', [
            'loans' => $loans,
            'interestRate' => $interestRate,
            'numberOfLoans' => $numberOfLoans,
        ]);

        return view('pages.hr.loan.loan_request', compact('loans', 'interestRate', 'numberOfLoans'));
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('user.loan')) {
            abort(403, 'Unauthorized access');
        }

        /* Employees cannot select a repayment month before the current month. 
           HR manual loan applications are not affected by this validation.
        */

        $request->validate([
            'loan_details' => [
                'required',
                'string',
                'max:500',
            ],

            'amount' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'duration' => [
                'required',
                'integer',
                'min:1',
            ],

            'repayment_from' => [
                'required',
                'date_format:Y-m',

                function ($attribute, $value, $fail) {

                    // Only compare valid YYYY-MM values.
                    if (
                        !is_string($value) ||
                        !preg_match(
                            '/^\d{4}-(0[1-9]|1[0-2])$/',
                            $value
                        )
                    ) {
                        return;
                    }

                    $currentMonth = now()->format('Y-m');

                    if ($value < $currentMonth) {
                        $fail(
                            'The repayment start month cannot be earlier than the current month.'
                        );
                    }
                },
            ],
        ]);

        // Check Existing Active Loan
        $existingRequest = Loan::where(
            'user_id',
            auth()->id()
        )
            ->where('status', 'Active')
            ->exists();

        if ($existingRequest) {

            $notification = [
                'message' => 'You have already applied for a loan. Once your current loan is finished, you can apply again.',
                'type' => 'error',
            ];

            return redirect()
                ->back()
                ->with($notification);
        }

        // Interest Rate
        $interestRate = optional(
            auth()->user()->loanInterest
        )->status === 'active'
            ? auth()->user()->loanInterest->rate
            : 0;

        // Loan Calculation
        $amount = (float) $request->amount;

        $duration = (int) $request->duration;

        $repaymentAmount =
            $amount + ($amount * $interestRate / 100);

        $monthlyInstallment =
            $repaymentAmount / $duration;

        // Create Loan Request
        $loanRequest = Loan::create([
            'user_id' => auth()->id(),

            'loan_details' => $request->loan_details,

            'amount' => $amount,

            'duration' => $duration,

            'monthly_installment' => $monthlyInstallment,

            'repayment_from' => $request->repayment_from,

            'repayment_amount' => $repaymentAmount,

            'interest' => $interestRate,

            'status' => 'Pending',
        ]);

        // HR / Admin Notification
        $data = [
            'type' => 'loan_request',

            'title' => 'New Loan Request',

            'message' => '"' .
                $loanRequest->user->name .
                '" submitted a loan request.',

            'url' => route('hr.loanRequest.index'),

            'icon' => 'bi bi-cash-stack',

            'color' => 'warning',
        ];

        $users = User::permission('loan.list')
            ->where('status', 'active')
            ->where('id', '!=', $loanRequest->user_id)
            ->get();

        // Notification::send(
        //     $users,
        //     new GeneralNotification($data)
        // );

        // Success Response
        return redirect()
            ->back()
            ->with('notification', [
                'message' => 'Loan request has been created successfully!',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
    }

    // public function store(Request $request)
    // {
    //     if (is_null($this->user) || !$this->user->can('user.loan')) {
    //         abort('403', 'Unauthorized access');
    //     }

    //     // Validate the selected dates and other inputs
    //     $request->validate([
    //         'loan_details' => 'required|string|max:500',
    //         'amount' => 'required|numeric',  // Change to 'numeric'
    //         'duration' => 'required|numeric',  // Change to 'numeric'
    //         'repayment_from' => 'required|date_format:Y-m',
    //     ]);

    //     // Check if the user already has an active loan
    //     $existingRequest = Loan::where('user_id', auth()->id())
    //         ->where('status', 'Active')->exists();

    //     if ($existingRequest) {
    //         // Redirect with error message
    //         $notification = [
    //             'message' => 'You have already applied for a loan. Once your current loan is finished, you can apply again.',
    //             'type' => 'error',
    //         ];

    //         return redirect()->back()->with($notification);
    //     }

    //     // Get the interest rate (you can fetch this dynamically if needed)
    //     $interestRate = optional(auth()->user()->loanInterest)->status === 'active'
    //         ? auth()->user()->loanInterest->rate
    //         : 0;

    //     // Cast the amount and duration to numeric types
    //     $amount = (float) $request->amount;
    //     $duration = (int) $request->duration;

    //     // Check if amount and duration are valid before calculating
    //     if ($amount > 0 && $duration > 0) {
    //         // Calculate monthly installment and repayment amount
    //         $monthlyInstallment = ($amount + ($amount * $interestRate / 100)) / $duration;
    //         $repaymentAmount = $amount + ($amount * $interestRate / 100);
    //     } else {
    //         // Handle invalid amount or duration
    //         $notification = [
    //             'message' => 'Invalid loan amount or duration.',
    //             'type' => 'error',
    //         ];

    //         return redirect()->back()->with($notification);
    //     }

    //     // Store the loan request in the database
    //     $loanRequest = Loan::create([
    //         'user_id' => auth()->id(),
    //         'loan_details' => $request->loan_details,
    //         'amount' => $request->amount,
    //         'duration' => $request->duration,
    //         'monthly_installment' => $monthlyInstallment,
    //         'repayment_from' => $request->repayment_from,
    //         'repayment_amount' => $repaymentAmount,
    //         'interest' => $interestRate,
    //         'status' => 'Pending',
    //     ]);

    //     // Send notification to HR/Admin users
    //     $data = [
    //         'type' => 'loan_request',
    //         'title' => 'New Loan Request',
    //         'message' => '"' . $loanRequest->user->name . '" submitted a loan request.',
    //         'url' => route('hr.loanRequest.index'),
    //         'icon' => 'bi bi-cash-stack',
    //         'color' => 'warning',
    //     ];

    //     $users = User::permission('loan.list')
    //         ->where('status', 'active')
    //         ->where('id', '!=', $loanRequest->user_id)
    //         ->get();

    //     // Notification::send($users, new GeneralNotification($data));

    //     return redirect()->back()->with('notification', [
    //         'message' => 'Loan request has been created successfully!',
    //         'type' => 'success',
    //         'key' => (string) str()->uuid(),
    //     ]);
    // }

    // Hr or Sumberadmin Manually Sotre loan.
    public function manuallyStoreLoan(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('loan.list')) {
            abort('403', 'Unauthorized access');
        }

        // Validate the selected dates and other inputs
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'loan_details' => 'required|string|max:500',
            'amount' => 'required|numeric',  // Change to 'numeric'
            'duration' => 'required|numeric',  // Change to 'numeric'
            'repayment_from' => 'required|date_format:Y-m',
        ]);

        // Check if the user already has an active loan
        $existingRequest = Loan::where('user_id', $request->user_id)
            ->where('status', 'Active')->exists();

        if ($existingRequest) {
            // Redirect with error message
            $notification = [
                'message' => 'This Employee have already applied for a loan. Once this current loan is finished, you can apply again.',
                'type' => 'error',
            ];

            return redirect()->back()->with($notification);
        }

        // Get the interest rate (you can fetch this dynamically if needed)
        $user = User::findOrFail($request->user_id);
        $interestRate = optional($user->loanInterest)->status === 'active'
            ? $user->loanInterest->rate
            : 0;

        // Cast the amount and duration to numeric types
        $amount = (float) $request->amount;
        $duration = (int) $request->duration;

        // Check if amount and duration are valid before calculating
        if ($amount > 0 && $duration > 0) {
            // Calculate monthly installment and repayment amount
            $monthlyInstallment = ($amount + ($amount * $interestRate / 100)) / $duration;
            $repaymentAmount = $amount + ($amount * $interestRate / 100);
        } else {
            // Handle invalid amount or duration
            $notification = [
                'message' => 'Invalid loan amount or duration.',
                'type' => 'error',
            ];

            return redirect()->back()->with($notification);
        }

        // Store the loan request in the database
        $loanRequest = Loan::create([
            'user_id' => $request->user_id,
            'loan_details' => $request->loan_details,
            'amount' => $request->amount,
            'duration' => $request->duration,
            'monthly_installment' => $monthlyInstallment,
            'repayment_from' => $request->repayment_from,
            'repayment_amount' => $repaymentAmount,
            'interest' => $interestRate,
            'status' => 'Pending',
        ]);

        // Notify Employee
        $data = [
            'type' => 'loan_request',
            'title' => 'Loan Application Registered',
            'message' => 'Your loan application has been received by HR and registered in the ERP system. Current status: ' . ucfirst($loanRequest->status) . '.',
            'url' => route('hr.loanRequest'),
            'icon' => match ($loanRequest->status) {
                'approved' => 'bi bi-check-circle',
                'rejected' => 'bi bi-x-circle',
                default => 'bi bi-hourglass-split',
            },
            'color' => match ($loanRequest->status) {
                'approved' => 'success',
                'rejected' => 'danger',
                default => 'warning',
            },
        ];

        // Send notification to the employee
        $user = User::find($loanRequest->user_id);

        // if ($user) {
        //     $user->notify(new GeneralNotification($data));
        // }

        // Redirect with success message
        $notification = [
            'message' => 'Loan request has been created successfully!',
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ];

        return redirect()->back()->with($notification);
    }

    public function show(Loan $loan)
    {
        if (is_null($this->user) || !$this->user->can('loan.view')) {
            abort('403', 'Unauthorized access');
        }

        // Eager load the related user
        $loan->load('user:id,employee_id,name,image');

        return response()->json([
            'id' => $loan->id,
            'employee_name' => $loan->user->name,
            'employee_id' => $loan->user->employee_id,
            'employee_image' => $loan->user->image,
            'applied_date' => $loan->created_at->format('l, F j, Y'),
            'loan_details' => $loan->loan_details,
            'amount' => number_format($loan->amount, 2),
            'duration' => $loan->duration,
            'status' => $loan->status,
            'monthly_installment' => number_format($loan->monthly_installment, 2),
            'repayment_from' => Carbon::createFromFormat('Y-m-d', $loan->repayment_from . '-01')->format('F, Y'),
            'repayment_amount' => number_format($loan->repayment_amount, 2)
        ]);
    }

    public function edit(Loan $loan)
    {
        if (is_null($this->user) || !$this->user->can('loan.edit')) {
            abort('403', 'Unauthorized access');
        }

        // Eager load the related user
        $loan->load('user:id,name');
        return response()->json($loan);
    }

    public function update(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('loan.edit')) {
            abort('403', 'Unauthorized access');
        }

        // Validate the selected dates and other inputs
        $request->validate([
            'loan_details' => 'required|string|max:500',
            'amount' => 'required|numeric',  // Change to 'numeric'
            'duration' => 'required|numeric',  // Change to 'numeric'
            'repayment_from' => 'required|date_format:Y-m',
        ]);

        // Get the interest rate (you can fetch this dynamically if needed)
        $interestRate = optional(auth()->user()->loanInterest)->status === 'active'
            ? auth()->user()->loanInterest->rate
            : 0;

        // Cast the amount and duration to numeric types
        $amount = (float) $request->amount;
        $duration = (int) $request->duration;

        // Check if amount and duration are valid before calculating
        if ($amount > 0 && $duration > 0) {
            // Calculate monthly installment and repayment amount
            $monthlyInstallment = ($amount + ($amount * $interestRate / 100)) / $duration;
            $repaymentAmount = $amount + ($amount * $interestRate / 100);
        } else {
            // Handle invalid amount or duration
            $notification = [
                'message' => 'Invalid loan amount or duration.',
                'type' => 'error',
            ];

            return redirect()->back()->with($notification);
        }

        // Find the leave request
        $loanRequest = Loan::findOrFail($request->id);

        // Store the loan request in the database
        $loanRequest->update([
            'loan_details' => $request->loan_details,
            'amount' => $request->amount,
            'duration' => $request->duration,
            'monthly_installment' => $monthlyInstallment,
            'repayment_from' => $request->repayment_from,
            'repayment_amount' => $repaymentAmount,
            'interest' => $interestRate,
            'status' => 'Pending',
        ]);

        // Redirect with success message
        $notification = [
            'message' => 'Loan request has been update successfully!',
            'type' => 'success',
        ];

        return redirect()->back()->with($notification);
    }

    public function destroy(Loan $loan)
    {
        if (is_null($this->user) || !$this->user->can('loan.delete')) {
            abort('403', 'Unauthorized access');
        }

        $deleteReqeust = $loan->delete();

        if ($deleteReqeust) {

            $notification = [
                'message' => 'Loan Request Deleted successfully!',
                'type' => 'warning'
            ];

            return redirect()->back()->with($notification);
        }
    }

    public function updateRequestStatus(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('loan.status')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'id' => 'required|exists:loans,id',
            'status' => 'required|in:Approved,Rejected',
        ]);

        // Find the leave request
        $loan = Loan::find($request->id);

        // Update the leave request status
        $loan->status = $request->status;
        $loan->approval_date = Carbon::now();
        $loan->save();

        // Notify Employee
        $data = [
            'type' => 'loan_request',
            'title' => 'Loan Request Update',
            'message' => 'Your loan request has been ' . ucfirst($request->status) . '.',
            'url' => route('hr.loanRequest'),
            'icon' => $request->status === 'approved'
                ? 'bi bi-check-circle'
                : ($request->status === 'rejected'
                    ? 'bi bi-x-circle'
                    : 'bi bi-hourglass-split'),
            'color' => $request->status === 'approved'
                ? 'success'
                : ($request->status === 'rejected'
                    ? 'danger'
                    : 'warning'),
        ];

        // Send notification to the employee
        $user = User::find($loan->user_id);

        // $user->notify(new GeneralNotification($data));

        // Redirect with success message
        $notification = [
            'message' => 'Loan request has been ' . $request->status . '.',
            'type' => 'success',
        ];
        return redirect()->back()->with($notification);
    }

}
