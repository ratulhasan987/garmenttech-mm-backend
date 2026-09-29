<?php

namespace App\Exports;

use App\Models\Lead;
use Maatwebsite\Excel\Concerns\Exportable;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class LeadExport implements FromView, ShouldAutoSize
{
    use Exportable;

    public function view(): View
    {
        // Retrieve the filtered leads directly from the session
        $leads = session('filtered_leads', []);

        // dd($leads);

        return view('pages.lead.leadExport', [
            'leads' => $leads
        ]);
    }

}
