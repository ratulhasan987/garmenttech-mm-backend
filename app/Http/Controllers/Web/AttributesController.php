<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attribute\StoreAttributeRequest;
use App\Http\Requests\Attribute\UpdateAttributeRequest;
use App\Models\Attribute;
use App\Services\AttributeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttributesController extends Controller
{
    public function __construct(protected AttributeService $attributeService) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Item/settings/attributes/Index', [
            'data' => $this->attributeService->getPaginated(),
        ]);
    }

    public function store(StoreAttributeRequest $request)
    {
        $this->attributeService->createAttribute($request->validated());
        return redirect()->back()->with('success', 'Attribute created successfully.');
    }

    public function update(UpdateAttributeRequest $request, Attribute $attribute)
    {
        $this->attributeService->updateAttribute($attribute, $request->validated());
        return redirect()->back()->with('success', 'Attribute updated successfully.');
    }

    public function destroy(Attribute $attribute)
    {
        $this->attributeService->deleteAttribute($attribute);
        return redirect()->back()->with('success', 'Attribute deleted successfully.');
    }
}