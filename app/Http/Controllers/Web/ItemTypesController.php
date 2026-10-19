<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemType\StoreItemTypeRequest;
use App\Http\Requests\ItemType\UpdateItemTypeRequest;
use App\Models\ItemType;
use App\Services\ItemTypeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemTypesController extends Controller
{
    public function __construct(
        protected ItemTypeService $itemTypeService
    ) {}

    public function index(Request $request): Response
    {
        // TEMPORARILY DISABLED: Permission check
        // if (!auth()->user()?->can('item.type.list')) {
        //     abort(403, 'Unauthorized access');
        // }

        $itemTypes = $this->itemTypeService->getPaginated();

        return Inertia::render('Item/settings/item-types/Index', [
            'data' => $itemTypes,
        ]);
    }

    public function store(StoreItemTypeRequest $request)
    {
        // TEMPORARILY DISABLED: Permission check
        // if (!auth()->user()?->can('item.type.create')) {
        //     abort(403, 'Unauthorized access');
        // }

        $this->itemTypeService->createItemType($request->validated());

        return redirect()->back()->with('success', 'Item Type created successfully.');
    }

    public function update(UpdateItemTypeRequest $request, ItemType $itemType)
    {
        // TEMPORARILY DISABLED: Permission check
        // if (!auth()->user()?->can('item.type.edit')) {
        //     abort(403, 'Unauthorized access');
        // }

        $this->itemTypeService->updateItemType($itemType, $request->validated());

        return redirect()->back()->with('success', 'Item Type updated successfully.');
    }

    public function destroy(ItemType $itemType)
    {
        // TEMPORARILY DISABLED: Permission check
        // if (!auth()->user()?->can('item.type.delete')) {
        //     abort(403, 'Unauthorized access');
        // }

        $this->itemTypeService->deleteItemType($itemType);

        return redirect()->back()->with('success', 'Item Type deleted successfully.');
    }
}