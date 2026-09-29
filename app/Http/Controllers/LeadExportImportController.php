<?php

namespace App\Http\Controllers;

use App\Imports\LeadImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadExportImportController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function leadImport()
    {
        if (is_null($this->user) || !$this->user->can('lead.bulk-import')) {
            abort(403, 'Unauthorized access');
        }

        return Inertia::render('crm/leads/import/lead-import', []);
    }

    public function leadImportStore(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('lead.bulk-import')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'file' => ['required', 'mimes:xls,xlsx']
        ]);

        ini_set('max_execution_time', 0);
        set_time_limit(0);
        ini_set('memory_limit', '1024M');

        DB::disableQueryLog();

        logger()->info('Lead import starting', [
            'user_id' => auth()->id(),
        ]);

        $import = new LeadImport(auth()->id());

        Excel::import($import, request()->file('file'));


        return redirect()->back()->with('notification', [
            'message' => "Lead import has been started.",
            'type' => 'success',
            'key' => (string) str()->uuid(),
        ])->with('import_summary', [
                    'inserted' => $import->inserted,
                    'skipped' => $import->skipped,
                    'failures' => $import->failures(),
                ]);
    }
}
