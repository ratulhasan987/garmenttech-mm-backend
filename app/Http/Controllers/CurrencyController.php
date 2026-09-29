<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
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
        if (is_null($this->user) || !$this->user->can('settings.currency')) {
            abort('403', 'Unauthorized access');
        }

        $data = Currency::query()
            ->when(
                $request->filled('currency_id'),
                function ($query) use ($request) {
                    $query->where(
                        'id',
                        $request->currency_id
                    );
                }
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('settings/currency/index', [
            "data" => $data,
            'filters' => [
                'currency_id' => $request->currency_id,
            ],
        ]);


    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.currency')) {
            abort('403', 'Unauthorized access');
        }

        // return $request->all();
        $request->validate([
            'currency_code' => 'required|string|size:3|unique:currencies,currency_code',
            'currency_name' => 'required|string|max:50',
            'symbol' => 'nullable|string|max:5',
            'country' => 'nullable|string|max:50',
            'exchange_rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $currency = new Currency();
        $currency->currency_code = $request->currency_code;
        $currency->currency_name = ucfirst($request->currency_name);
        $currency->symbol = $request->symbol;
        $currency->country = ucfirst($request->country);
        $currency->exchange_rate = $request->exchange_rate;
        $currency->is_active = $request->is_active ?? 0;
        $currency->save();


        return redirect()->back()->with("notification", [
            'message' => 'New currency Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit(Currency $currency)
    {
        if (is_null($this->user) || !$this->user->can('settings.currency')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($currency);
    }

    public function updateCurrency(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.currency')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'currency_code' => "required|string|size:3|unique:currencies,currency_code, $request->id",
            'currency_name' => 'required|string|max:50',
            'symbol' => 'nullable|string|max:5',
            'country' => 'nullable|string|max:50',
            'exchange_rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $currency = Currency::whereId($request->id)->first();
        $currency->currency_code = $request->currency_code;
        $currency->currency_name = ucfirst($request->currency_name);
        $currency->symbol = $request->symbol;
        $currency->country = ucfirst($request->country);
        $currency->exchange_rate = $request->exchange_rate;
        $currency->is_active = $request->is_active ?? 0;
        $currency->save();


        return redirect()->back()->with("notification", [
            'message' => 'Currency Updated Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy(Currency $currency)
    {
        if (is_null($this->user) || !$this->user->can('settings.currency')) {
            abort('403', 'Unauthorized access');
        }

        // Prevent deletion if the currency is active
        if ($currency->is_active) {
            return redirect()->back()->with("notification", [
                'message' => 'This currency is active, so you cannot delete it.',
                'type' => 'error'
            ]);
        }

        // Delete the currency
        if ($currency->delete()) {
            $notification = [
                'message' => 'Currency deleted successfully!',
                'type' => 'success'
            ];
        } else {
            $notification = [
                'message' => 'Failed to delete currency.',
                'type' => 'error'
            ];
        }

        return redirect()->back()->with('notification', $notification);
    }

    public function getCurrencies(Request $request)
    {
        $keyword = $request->keyword;

        $query = Currency::query()
            ->select(
                'id',
                'currency_code',
                "currency_name",
                "country"
            );

        if (!empty($keyword)) {
            $query->where(function ($query) use ($keyword) {
                $query
                    ->where(
                        'currency_code',
                        'like',
                        "%{$keyword}%"
                    )->orWhere(
                        'currency_name',
                        'like',
                        "%{$keyword}%"
                    )->orWhere(
                        'country',
                        'like',
                        "%{$keyword}%"
                    )
                ;
            });
        }

        $currencies = $query
            ->orderBy('currency_code')
            ->limit(20)
            ->get();

        return response()->json($currencies);
    }

}
