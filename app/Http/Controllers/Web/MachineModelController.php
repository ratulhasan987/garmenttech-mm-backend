<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\MachineModel\StoreMachineModelRequest;
use App\Http\Requests\MachineModel\UpdateMachineModelRequest;
use App\Models\Brand;
use App\Models\MachineCategory;
use App\Models\MachineModel;
use App\Services\MachineModelService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineModelController extends Controller
{
    public function __construct(
        protected MachineModelService $modelService
    ) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()?->can('machine_model.list')) {
            abort(403, 'Unauthorized access');
        }

        $models = $this->modelService->getPaginated();
        
        // Fetch categories and brands for the dropdowns
        $categories = MachineCategory::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $brands = Brand::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('machine/settings/machine-model/Index', [
            'data' => $models,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function store(StoreMachineModelRequest $request)
    {
        if (!auth()->user()?->can('machine_model.create')) {
            abort(403, 'Unauthorized access');
        }

        $this->modelService->createModel($request->validated());

        return redirect()->back()->with('success', 'Machine model created successfully.');
    }

    public function update(UpdateMachineModelRequest $request, MachineModel $machineModel)
    {
        if (!auth()->user()?->can('machine_model.edit')) {
            abort(403, 'Unauthorized access');
        }

        $this->modelService->updateModel($machineModel, $request->validated());

        return redirect()->back()->with('success', 'Machine model updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('machine_model.delete')) {
            abort(403, 'Unauthorized access');
        }

        $model = MachineModel::findOrFail($id);
        $this->modelService->deleteModel($model);

        return redirect()->back()->with('success', 'Machine model deleted successfully.');
    }
}