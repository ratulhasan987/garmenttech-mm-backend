<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Machine\StoreMachineRequest;
use App\Http\Requests\Machine\UpdateMachineRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Machine;
use App\Services\MachineService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class MachineController extends Controller
{
    public function __construct(
        protected MachineService $machineService
    ) {
    }

    public function index(Request $request)
    {
        if (!auth()->user()?->can('machine.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $filters = $request->only(['status', 'model_id', 'floor_id', 'search']);

        $machines = $this->machineService
            ->getPaginated($filters)
            ->withQueryString();

        return ApiResponse::success(
            data: $machines->items(),
            meta: $machines,
            message: 'Machines retrieved successfully.'
        );
    }

    public function store(StoreMachineRequest $request)
    {
        $machine = $this->machineService->createMachine($request->validated());

        return ApiResponse::success(
            data: $machine,
            message: 'Machine created successfully.',
            status: 201
        );
    }

    public function show($id)
    {
        if (!auth()->user()?->can('machine.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $machine = Machine::with(['model', 'currentLocation.floor.building'])
                ->findOrFail($id);

            return ApiResponse::success(
                data: $machine,
                message: 'Machine retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine not found.', status: 404);
        }
    }

    public function update(UpdateMachineRequest $request, Machine $machine)
    {
        try {
            $updatedMachine = $this->machineService->updateMachine(
                $machine,
                $request->validated()
            );

            return ApiResponse::success(
                data: $updatedMachine,
                message: 'Machine updated successfully.'
            );
        } catch (ValidationException $e) {
            return ApiResponse::error(
                message: $e->getMessage(),
                errors: $e->errors(),
                status: 422
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(message: $e->getMessage(), status: 422);
        }
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('machine.delete')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $machine = Machine::findOrFail($id);

            $this->machineService->deleteMachine($machine);

            return ApiResponse::success(
                message: 'Machine deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine not found.', status: 404);
        }
    }

    /**
     * Get full location history of a machine
     */
    public function locationHistory($id)
    {
        if (!auth()->user()?->can('machine.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $machine = Machine::findOrFail($id);

            $history = $this->machineService->getLocationHistory($machine);

            return ApiResponse::success(
                data: $history,
                message: 'Machine location history retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine not found.', status: 404);
        }
    }

    /**
     * Download QR Code (SVG by default)
     */
    public function downloadQr(Machine $machine)
    {
        if (!auth()->user()?->can('machine.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $format = request()->input('format', 'png'); // svg or png
        $size = (int) request()->input('size', 400);

        $qrContent = $this->machineService->generateQrCode($machine, $format, $size);

        $contentType = $format === 'png' ? 'image/png' : 'image/svg+xml';
        $extension = $format === 'png' ? 'png' : 'svg';
        $filename = 'QR-' . $machine->machine_id . '.' . $extension;

        return response($qrContent)
            ->header('Content-Type', $contentType)
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Move machine to a new location (dedicated endpoint)
     */
    public function move(Request $request, Machine $machine)
    {
        if (!auth()->user()?->can('machine.edit')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $validated = $request->validate([
            'floor_id' => ['required', 'integer', 'exists:floors,id'],
            'sl_no' => ['required', 'string', 'max:50'],
            'assigned_at' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
        ]);

        try {
            $location = $this->machineService->moveMachine($machine, $validated);

            return ApiResponse::success(
                data: $location->load('floor.building'),
                message: 'Machine moved successfully.'
            );
        } catch (ValidationException $e) {
            return ApiResponse::error(
                message: $e->getMessage(),
                errors: $e->errors(),
                status: 422
            );
        }
    }

    /**
     * Remove machine from current location
     */
    public function removeLocation(Machine $machine)
    {
        if (!auth()->user()?->can('machine.edit')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $this->machineService->removeFromCurrentLocation(
            $machine,
            request('remarks', 'Removed from current location')
        );

        return ApiResponse::success(
            message: 'Machine removed from current location successfully.'
        );
    }
}
