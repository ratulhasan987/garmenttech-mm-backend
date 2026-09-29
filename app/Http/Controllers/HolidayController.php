<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();

            return $next($request);
        });
    }

    public function index()
    {
        if (is_null($this->user) || ! $this->user->can('settings.holiday')) {
            abort('403', 'Unauthorized access');
        }

        $currentYear = now()->year;

        $holidays = Holiday::orderBy('date', 'asc')
            ->paginate(20)
            ->through(function ($holiday) use ($currentYear) {
                if ($holiday->is_recurring) {
                    $holiday->display_date = Carbon::parse($holiday->date)->setYear($currentYear)->format('Y-m-d');
                } else {
                    $holiday->display_date = $holiday->date;
                }

                return $holiday;
            });

        return Inertia::render('settings/holiday/index', [
            'data' => $holidays,
        ]);

    }

    public function store(Request $request)
    {
        if (is_null($this->user) || ! $this->user->can('settings.holiday')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'unique:holidays,date'],
            'is_recurring' => ['nullable', 'boolean'],
        ]);

        $holiday = new Holiday;
        $holiday->name = $request->name;
        $holiday->date = $request->date;
        $holiday->is_recurring = $request->is_recurring ?? false;
        $holiday->save();

        return redirect()->back()->with('notification', [
            'message' => 'New Holiday Save Successfully',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    public function edit(Holiday $holiday)
    {
        if (is_null($this->user) || ! $this->user->can('settings.holiday')) {
            abort('403', 'Unauthorized access');
        }

        return response()->json($holiday);
    }

    public function update(Request $request)
    {
        if (is_null($this->user) || ! $this->user->can('settings.holiday')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'unique:holidays,date,'.$request->id],
            'is_recurring' => ['nullable', 'boolean'],
        ]);

        $holiday = Holiday::whereId($request->id)->first();
        $holiday->name = $request->name;
        $holiday->date = $request->date;
        $holiday->is_recurring = $request->is_recurring ?? false;
        $holiday->save();

        return redirect()->back()->with('notification', [
            'message' => 'Holiday Updated Successfully',
            'type' => 'success',
            'key' => uniqid(),
        ]);
    }

    public function destroy(Holiday $holiday)
    {
        if (is_null($this->user) || ! $this->user->can('settings.holiday')) {
            abort('403', 'Unauthorized access');
        }

        $deleteHoliday = $holiday->delete();

        if ($deleteHoliday) {
            return redirect()->back()->with('notification', [
                'message' => 'Holiday Deleted successfully!',
                'type' => 'warning',
                'key' => uniqid(),
            ]);
        }
    }
}
