<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemCategory\StoreItemCategoryRequest;
use App\Http\Requests\ItemCategory\UpdateItemCategoryRequest;
use App\Models\ItemCategory;
use App\Services\ItemCategoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ItemCategoriesController extends Controller
{
    public function __construct(
        protected ItemCategoryService $itemCategoryService
    ) {}

    public function index(Request $request): Response
    {
        $itemCategories = $this->itemCategoryService->getPaginated();
        $itemTypes = $this->itemCategoryService->getItemTypes();
        $parentCategories = $this->itemCategoryService->getParentCategories();

        // Make sure this matches your exact folder path: Item/settings/item-categories/Index
        return Inertia::render('Item/settings/item-categories/Index', [
            'data' => $itemCategories,
            'itemTypes' => $itemTypes,
            'parentCategories' => $parentCategories,
        ]);
    }

    public function store(StoreItemCategoryRequest $request)
    {
        $this->itemCategoryService->createItemCategory($request->validated());

        return redirect()->back()->with('success', 'Item Category created successfully.');
    }

    public function update(UpdateItemCategoryRequest $request, ItemCategory $itemCategory)
    {
        $this->itemCategoryService->updateItemCategory($itemCategory, $request->validated());

        return redirect()->back()->with('success', 'Item Category updated successfully.');
    }

    public function destroy(ItemCategory $itemCategory)
    {
        $this->itemCategoryService->deleteItemCategory($itemCategory);

        return redirect()->back()->with('success', 'Item Category deleted successfully.');
    }
}