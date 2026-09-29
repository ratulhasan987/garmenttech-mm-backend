<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use Inertia\Response;

class TaxController extends Controller
{
    public $user;
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.taxes')) {
            abort('403', 'Unauthorized access');
        }


        $data = Tax::query()
            ->when(
                $request->filled('tax_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->tax_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('settings/tax/index', [
            "data" => $data,
            'filters' => [
                'tax_id' => $request->tax_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.taxes')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', 'unique:taxes,name', 'string', 'max:255'],
            'rate' => ['required', 'numeric', 'min:1'],
        ]);

        $tax = new Tax();
        $tax->name = ucfirst($request->name);
        $tax->rate = $request->rate;
        $tax->created_by = auth()->user()->id;
        $tax->save();

        return redirect()->back()->with("notification", [
            'message' => 'New tax Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit(Tax $tax)
    {
        if (is_null($this->user) || !$this->user->can('settings.taxes')) {
            abort('403', 'Unauthorized access');
        }
        return response()->json($tax);
    }

    public function updateTax(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.taxes')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', "unique:taxes,name, $request->id", 'string', 'max:255'],
            'rate' => ['required', 'numeric', 'min:1'],
        ]);

        $tax = Tax::whereId($request->id)->first();
        $tax->name = ucfirst($request->name);
        $tax->rate = $request->rate;
        $tax->created_by = auth()->user()->id;
        $tax->save();

        return redirect()->back()->with("notification", [
            'message' => 'Tax Updated Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy(Tax $tax)
    {
        if (is_null($this->user) || !$this->user->can('settings.taxes')) {
            abort('403', 'Unauthorized access');
        }

        $deleteTax = $tax->delete();

        if ($deleteTax) {

            return redirect()->back()->with("notification", [
                'message' => 'Tax Deleted successfully!',
                'type' => 'success'
            ]);
        }
    }

    public function getTaxes(Request $request)
    {
        $keyword = $request->keyword;

        $query = Tax::query()
            ->select(
                'id',
                'name',
            );

        if (!empty($keyword)) {
            $query->where(function ($query) use ($keyword) {
                $query
                    ->where(
                        'name',
                        'like',
                        "%{$keyword}%"
                    )
                ;
            });
        }

        $taxes = $query
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($taxes);
    }
}

