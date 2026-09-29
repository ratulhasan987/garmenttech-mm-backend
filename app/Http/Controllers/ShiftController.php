<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
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
        if (is_null($this->user) || !$this->user->can('settings.shift')) {
            abort('403', 'Unauthorized access');
        }

        $shifts = Shift::latest()->get();

        return Inertia::render('settings/shift/index', [
            "shifts" => $shifts,
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.shift')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', 'unique:shifts,name', 'string', 'max:255'],
            'shift_start_time' => ['required'],
            'shift_end_time' => ['required'],
            'weekends' => ['required',]
        ]);

        $shift = new Shift();
        $shift->name = $request->name;
        $shift->shift_start_time = Carbon::parse($request->shift_start_time)->format('h:i A');
        $shift->shift_end_time = Carbon::parse($request->shift_end_time)->format('h:i A');
        $shift->first_half_shift_end_time = Carbon::parse($request->first_half_shift_end_time)->format('h:i A');
        $shift->second_half_shift_start_time = Carbon::parse($request->second_half_shift_start_time)->format('h:i A');
        $shift->weekends = collect(explode(',', $request->weekends))
            ->map(function ($day) {
                return ucwords(strtolower(trim($day))); // Capitalizes each day (e.g., "sunday" -> "Sunday")
            })
            ->implode(','); // Joins the days back into a comma-separated string
        $shift->save();


        return redirect()->back()->with("notification", [
            'message' => 'New Shift Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit(Shift $shift)
    {
        if (is_null($this->user) || !$this->user->can('settings.shift')) {
            abort('403', 'Unauthorized access');
        }
        return response()->json($shift);
    }

    public function updateShift(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.shift')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'name' => ['required', "unique:shifts,name, $request->id", 'string', 'max:255'],
            'shift_start_time' => ['required'],
            'shift_end_time' => ['required'],
            'weekends' => ['required',]
        ]);

        $shift = Shift::whereId($request->id)->first();
        $shift->name = $request->name;
        $shift->shift_start_time = Carbon::parse($request->shift_start_time)->format('h:i A');
        $shift->shift_end_time = Carbon::parse($request->shift_end_time)->format('h:i A');
        $shift->first_half_shift_end_time = Carbon::parse($request->first_half_shift_end_time)->format('h:i A');
        $shift->second_half_shift_start_time = Carbon::parse($request->second_half_shift_start_time)->format('h:i A');
        $shift->weekends = collect(explode(',', $request->weekends))
            ->map(function ($day) {
                return ucwords(strtolower(trim($day))); // Capitalizes each day (e.g., "sunday" -> "Sunday")
            })
            ->implode(','); // Joins the days back into a comma-separated string

        $shift->save();
        $notification = array(
            'message' => 'Shift Updated Successfully',
            'type' => 'success'
        );
        return redirect()->back()->with($notification);
    }

    public function destroy(Shift $shift)
    {
        if (is_null($this->user) || !$this->user->can('settings.shift')) {
            abort('403', 'Unauthorized access');
        }

        $deleteShift = $shift->delete();

        if ($deleteShift) {


            return redirect()->back()->with("notification", [
                'message' => 'Shift Deleted successfully!',
                'type' => 'warning'
            ]);
        }
    }
}
