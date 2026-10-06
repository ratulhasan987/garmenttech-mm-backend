<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Machine\StoreMachineRequest;
use App\Http\Requests\Machine\UpdateMachineRequest;
use App\Models\Floor;
use App\Models\Machine;
use App\Models\MachineModel;
use App\Services\MachineService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineController extends Controller
{
    public function __construct(
        protected MachineService $machineService
    ) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()?->can('machine.list')) {
            abort(403, 'Unauthorized access');
        }

        $filters = $request->only(['status', 'model_id', 'floor_id', 'search']);
        $machines = $this->machineService->getPaginated($filters);

        // Fetch models and floors for the dropdowns
        $models = MachineModel::query()
            ->select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        $floors = Floor::query()
            ->with('building:id,name')
            ->orderBy('floor_number')
            ->get();

        return Inertia::render('machine/Index', [
            'data' => $machines,
            'models' => $models,
            'floors' => $floors,
        ]);
    }

    public function store(StoreMachineRequest $request)
    {
        // StoreMachineRequest handles the 'machine.create' permission

        try {
            $this->machineService->createMachine($request->validated());
            return redirect()->back()->with('success', 'Machine created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    public function update(UpdateMachineRequest $request, Machine $machine)
    {
        // UpdateMachineRequest handles the 'machine.edit' permission

        try {
            $this->machineService->updateMachine($machine, $request->validated());
            return redirect()->back()->with('success', 'Machine updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('machine.delete')) {
            abort(403, 'Unauthorized access');
        }

        $machine = Machine::findOrFail($id);
        $this->machineService->deleteMachine($machine);

        return redirect()->back()->with('success', 'Machine deleted successfully.');
    }




    
    public function downloadQr(Machine $machine)
    {
        if (!auth()->user()?->can('machine.view')) {
            abort(403, 'Unauthorized access');
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

}



    