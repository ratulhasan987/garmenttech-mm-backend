<?php
namespace App\Http\Controllers;

use App\Http\Requests\Item\StoreItemRequest;
use App\Http\Requests\Item\UpdateItemRequest;
use App\Models\Brand;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\ItemType;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $items = Item::with(['itemType', 'category', 'brand', 'unit'])
            ->when($request->search, function($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('item_code', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Item/Index', [
            'items' => $items,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Item/Create', [
            'itemTypes'     => ItemType::where('is_active', true)->get(),
            'categories'    => ItemCategory::where('is_active', true)->get(),
            'brands'        => Brand::where('is_active', true)->get(),
            'units'         => Unit::all(),
        ]);
    }

    public function store(StoreItemRequest $request)
    {
        Item::create($request->validated());

        return redirect()->route('items.index')
            ->with('success', 'Item created successfully.');
    }

    public function edit(Item $item)
    {
        return Inertia::render('Item/Edit', [
            'item'          => $item,
            'itemTypes'     => ItemType::where('is_active', true)->get(),
            'categories'    => ItemCategory::where('is_active', true)->get(),
            'brands'        => Brand::where('is_active', true)->get(),
            'units'         => Unit::all(),
        ]);
    }

    public function update(UpdateItemRequest $request, Item $item)
    {
        $item->update($request->validated());

        return redirect()->route('items.index')
            ->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return redirect()->route('items.index')
            ->with('success', 'Item deleted successfully.');
    }
}