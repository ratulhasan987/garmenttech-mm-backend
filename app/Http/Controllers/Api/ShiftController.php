<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShiftController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->user();

            return $next($request);
        });
    }

    /**
     * Display shift list.
     */
    public function index()
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.shift')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $shifts = Shift::query()
            ->latest()
            ->get();

        return ApiResponse::success(
            data: $shifts,
            message: 'Shifts retrieved successfully.',
        );
    }

    /**
     * Store a new shift.
     */
    public function store(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.shift')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:shifts,name',
            ],

            'shift_start_time' => [
                'required',
                'date_format:H:i',
            ],

            'shift_end_time' => [
                'required',
                'date_format:H:i',
            ],

            'first_half_shift_end_time' => [
                'required',
                'date_format:H:i',
            ],

            'second_half_shift_start_time' => [
                'required',
                'date_format:H:i',
            ],

            'weekends' => [
                'required',
            ],
        ], [
            'name.required' => 'Please give a shift name.',
            'name.unique' => 'This shift name already exists.',

            'shift_start_time.required' => 'Shift start time is required.',
            'shift_start_time.date_format' => 'Shift start time must be in HH:mm format.',

            'shift_end_time.required' => 'Shift end time is required.',
            'shift_end_time.date_format' => 'Shift end time must be in HH:mm format.',

            'first_half_shift_end_time.required' => 'First half shift end time is required.',
            'first_half_shift_end_time.date_format' => 'First half shift end time must be in HH:mm format.',

            'second_half_shift_start_time.required' => 'Second half shift start time is required.',
            'second_half_shift_start_time.date_format' => 'Second half shift start time must be in HH:mm format.',

            'weekends.required' => 'Please select at least one weekend.',
        ]);

        $shift = Shift::create([
            'name' => $validated['name'],

            'shift_start_time' => Carbon::createFromFormat(
                'H:i',
                $validated['shift_start_time']
            )->format('h:i A'),

            'shift_end_time' => Carbon::createFromFormat(
                'H:i',
                $validated['shift_end_time']
            )->format('h:i A'),

            'first_half_shift_end_time' => Carbon::createFromFormat(
                'H:i',
                $validated['first_half_shift_end_time']
            )->format('h:i A'),

            'second_half_shift_start_time' => Carbon::createFromFormat(
                'H:i',
                $validated['second_half_shift_start_time']
            )->format('h:i A'),

            'weekends' => $this->normalizeWeekends(
                $validated['weekends']
            ),
        ]);

        return ApiResponse::success(
            data: $shift,
            message: 'Shift created successfully.',
            status: 201,
        );
    }

    /**
     * Display a single shift.
     */
    public function show(Shift $shift)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.shift')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        return ApiResponse::success(
            data: $shift,
            message: 'Shift retrieved successfully.',
        );
    }

    /**
     * Update a shift.
     */
    public function update(
        Request $request,
        Shift $shift
    ) {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.shift')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shifts', 'name')
                    ->ignore($shift->id),
            ],

            'shift_start_time' => [
                'required',
                'date_format:H:i',
            ],

            'shift_end_time' => [
                'required',
                'date_format:H:i',
            ],

            'first_half_shift_end_time' => [
                'required',
                'date_format:H:i',
            ],

            'second_half_shift_start_time' => [
                'required',
                'date_format:H:i',
            ],

            'weekends' => [
                'required',
            ],
        ], [
            'name.required' => 'Please give a shift name.',
            'name.unique' => 'This shift name already exists.',

            'shift_start_time.required' => 'Shift start time is required.',
            'shift_start_time.date_format' => 'Shift start time must be in HH:mm format.',

            'shift_end_time.required' => 'Shift end time is required.',
            'shift_end_time.date_format' => 'Shift end time must be in HH:mm format.',

            'first_half_shift_end_time.required' => 'First half shift end time is required.',
            'first_half_shift_end_time.date_format' => 'First half shift end time must be in HH:mm format.',

            'second_half_shift_start_time.required' => 'Second half shift start time is required.',
            'second_half_shift_start_time.date_format' => 'Second half shift start time must be in HH:mm format.',

            'weekends.required' => 'Please select at least one weekend.',
        ]);

        $shift->update([
            'name' => $validated['name'],

            'shift_start_time' => Carbon::createFromFormat(
                'H:i',
                $validated['shift_start_time']
            )->format('h:i A'),

            'shift_end_time' => Carbon::createFromFormat(
                'H:i',
                $validated['shift_end_time']
            )->format('h:i A'),

            'first_half_shift_end_time' => Carbon::createFromFormat(
                'H:i',
                $validated['first_half_shift_end_time']
            )->format('h:i A'),

            'second_half_shift_start_time' => Carbon::createFromFormat(
                'H:i',
                $validated['second_half_shift_start_time']
            )->format('h:i A'),

            'weekends' => $this->normalizeWeekends(
                $validated['weekends']
            ),
        ]);

        $shift->refresh();

        return ApiResponse::success(
            data: $shift,
            message: 'Shift updated successfully.',
        );
    }

    /**
     * Delete a shift.
     */
    public function destroy($id)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.shift')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        try {
            $shift = Shift::findOrFail($id);

            $shift->delete();

            return ApiResponse::success(
                message: 'Shift deleted successfully.',
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(
                message: 'Shift not found.',
            );
        }
    }

    /**
     * Search shifts.
     */
    public function search(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('settings.shift')
        ) {
            return ApiResponse::error(
                message: 'Unauthorized access'
            );
        }

        $validated = $request->validate([
            'keyword' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $keyword = $validated['keyword'] ?? null;

        $shifts = Shift::query()
            ->when(
                filled($keyword),
                function ($query) use ($keyword) {
                    $query->where(
                        'name',
                        'like',
                        "%{$keyword}%"
                    );
                }
            )
            ->orderBy('name')
            ->limit(20)
            ->get();

        return ApiResponse::success(
            data: $shifts,
            message: 'Shifts retrieved successfully.',
        );
    }

    /**
     * Normalize weekend values.
     *
     * Supports:
     * "friday,saturday"
     *
     * or:
     * ["Friday", "Saturday"]
     */
    private function normalizeWeekends(
        string|array $weekends
    ): string {
        $weekendList = is_array($weekends)
            ? $weekends
            : explode(',', $weekends);

        return collect($weekendList)
            ->map(function ($day) {
                return ucwords(
                    strtolower(trim($day))
                );
            })
            ->filter()
            ->unique()
            ->implode(',');
    }
}