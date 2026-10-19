<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Item\StoreItemRequest;
use App\Http\Requests\Item\UpdateItemRequest;
use App\Models\Item;
use App\Services\ItemService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemsController extends Controller
{
    public function __construct(
        protected ItemService $itemService
    ) {}

    public function index(Request $request): Response
    {
        $items = $this->itemService->getPaginated();
        $relations = $this->itemService->getRelationsData();


        return Inertia::render('Item/Index', array_merge([
            'data' => $items,
        ], $relations));
    }

    public function store(StoreItemRequest $request)
    {
        $this->itemService->createItem($request->validated());

        return redirect()->back()->with('success', 'Item created successfully.');
    }

    public function update(UpdateItemRequest $request, Item $item)
    {
        $this->itemService->updateItem($item, $request->validated());

        return redirect()->back()->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item)
    {
        $this->itemService->deleteItem($item);

        return redirect()->back()->with('success', 'Item deleted successfully.');
    }
}