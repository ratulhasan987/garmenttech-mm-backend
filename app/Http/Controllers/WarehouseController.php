<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    // Warehouse list
    public function index(): Response
    {
        $warehouses =
            Warehouse::query()
                ->latest('id')
                ->paginate(30);

        return Inertia::render(
            'operations/inventory/warehouses/index',
            [
                'data' =>
                    $warehouses,
            ]
        );
    }

    // Store warehouse
    public function store(
        Request $request
    ) {
        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'phone' => [
                    'nullable',
                    'string',
                    'max:50',
                ],

                'address' => [
                    'nullable',
                    'string',
                ],

                'status' => [
                    'required',
                    'boolean',
                ],

                'is_default' => [
                    'required',
                    'boolean',
                ],
            ]);

        DB::transaction(
            function () use (
                &$validated
            ) {
                // Generate warehouse code
                $validated['code'] =
                    $this->generateWarehouseCode();

                // First warehouse becomes default
                $hasWarehouse =
                    Warehouse::query()
                        ->exists();

                if (!$hasWarehouse) {
                    $validated['is_default'] =
                        true;

                    $validated['status'] =
                        true;
                }

                // Default warehouse must be active
                if (
                    $validated['is_default']
                ) {
                    $validated['status'] =
                        true;

                    Warehouse::query()
                        ->where(
                            'is_default',
                            true
                        )
                        ->update([
                            'is_default' =>
                                false,
                        ]);
                }

                Warehouse::create(
                    $validated
                );
            }
        );

        return redirect()
            ->back()
            ->with(
                'notification',
                [
                    'message' =>
                        'Warehouse created successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Update warehouse
    public function update(
        Request $request,
        Warehouse $warehouse
    ) {
        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'phone' => [
                    'nullable',
                    'string',
                    'max:50',
                ],

                'address' => [
                    'nullable',
                    'string',
                ],

                'status' => [
                    'required',
                    'boolean',
                ],

                'is_default' => [
                    'required',
                    'boolean',
                ],
            ]);

        // Default warehouse cannot be inactive
        if (
            $validated['is_default'] &&
            !$validated['status']
        ) {
            throw ValidationException::withMessages([
                'status' =>
                    'Default warehouse must be active.',
            ]);
        }

        // Current default cannot simply be removed
        if (
            $warehouse->is_default &&
            !$validated['is_default']
        ) {
            throw ValidationException::withMessages([
                'is_default' =>
                    'Please set another warehouse as default instead.',
            ]);
        }

        DB::transaction(
            function () use (
                $warehouse,
                $validated,
            ) {
                // Remove previous default
                if (
                    $validated['is_default']
                ) {
                    Warehouse::query()
                        ->where(
                            'id',
                            '!=',
                            $warehouse->id
                        )
                        ->where(
                            'is_default',
                            true
                        )
                        ->update([
                            'is_default' =>
                                false,
                        ]);
                }

                // Warehouse code never changes
                $warehouse->update([
                    'name' =>
                        $validated['name'],

                    'phone' =>
                        $validated['phone'] ??
                        null,

                    'address' =>
                        $validated['address'] ??
                        null,

                    'status' =>
                        $validated['status'],

                    'is_default' =>
                        $validated['is_default'],
                ]);
            }
        );

        return redirect()
            ->back()
            ->with(
                'notification',
                [
                    'message' =>
                        'Warehouse updated successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Delete warehouse
    public function destroy(
        Warehouse $warehouse
    ) {
        if (
            $warehouse->is_default
        ) {
            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Default warehouse cannot be deleted.',

                        'type' =>
                            'error',
                    ]
                );
        }

        $warehouse->delete();

        return redirect()
            ->back()
            ->with(
                'notification',
                [
                    'message' =>
                        'Warehouse deleted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Generate warehouse code
    private function generateWarehouseCode(): string
    {
        $lastWarehouse =
            Warehouse::query()
                ->where(
                    'code',
                    'like',
                    'WH-%'
                )
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

        $nextNumber =
            1;

        if (
            $lastWarehouse &&
            preg_match(
                '/^WH-(\d+)$/',
                $lastWarehouse->code,
                $matches
            )
        ) {
            $nextNumber =
                (int) $matches[1] +
                1;
        }

        do {
            $code =
                'WH-' .
                str_pad(
                    (string) $nextNumber,
                    6,
                    '0',
                    STR_PAD_LEFT
                );

            $nextNumber++;
        } while (
            Warehouse::query()
                ->where(
                    'code',
                    $code
                )
                ->exists()
        );

        return $code;
    }
}