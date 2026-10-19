<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\MachineCategory\StoreMachineCategoryRequest;
use App\Http\Requests\MachineCategory\UpdateMachineCategoryRequest;
use App\Models\MachineCategory;
use App\Services\MachineCategoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineCategoryController extends Controller
{
    public function __construct(
        protected MachineCategoryService $categoryService
    ) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()?->can('machine_category.list')) {
            abort(403, 'Unauthorized access');
        }

        $categories = $this->categoryService->getPaginated();
        
        // Fetch all categories for the Parent Category dropdown
        $parentOptions = MachineCategory::query()
            ->select('id', 'name', 'parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('machine/settings/machine-category/Index', [
            'data' => $categories,
            'parentOptions' => $parentOptions,
        ]);
    }

    public function store(StoreMachineCategoryRequest $request)
    {
        if (!auth()->user()?->can('machine_category.create')) {
            abort(403, 'Unauthorized access');
        }

        $this->categoryService->createCategory($request->validated());

        return redirect()->back()->with('success', 'Machine category created successfully.');
    }

    public function update(UpdateMachineCategoryRequest $request, MachineCategory $machineCategory)
    {
        if (!auth()->user()?->can('machine_category.edit')) {
            abort(403, 'Unauthorized access');
        }

        try {
            $this->categoryService->updateCategory($machineCategory, $request->validated());
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->withErrors(['parent_id' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', 'Machine category updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('machine_category.delete')) {
            abort(403, 'Unauthorized access');
        }

        $category = MachineCategory::findOrFail($id);
        
        // Reassign children to parent before deleting
        $this->categoryService->deleteCategory($category, reassignChildrenToParent: true);

        return redirect()->back()->with('success', 'Machine category deleted successfully.');
    }
}