<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanInstallment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanInstallmentController extends Controller
{
    public function index(Loan $loan)
    {
        $loan->load('installments', 'user:id,employee_id,department_id,name,image,phone,email,emergency_contact');

        return Inertia::render('hr/loan/loan-installment/index', [
            'loan' => $loan,
        ]);

        return view('pages.hr.loan.loan_installment.index', compact('loan'));
    }

}
