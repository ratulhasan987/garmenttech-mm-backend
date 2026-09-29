<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockAdjustment;
use App\Models\StockIssue;
use App\Models\StockMovement;
use App\Models\StockReceive;
use App\Models\StockTransfer;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryStockService
{
    public function postReceive(
        StockReceive $receive
    ): void {
        DB::transaction(
            function () use ($receive) {
                $receive = StockReceive::query()
                    ->with('items.product')
                    ->lockForUpdate()
                    ->findOrFail(
                        $receive->id
                    );

                $this->ensureDraft(
                    $receive->status
                );

                foreach (
                    $receive->items
                    as $item
                ) {
                    $this->move(
                        warehouseId:
                            $receive->warehouse_id,

                        product:
                            $item->product,

                        quantity:
                            (float) $item->quantity,

                        date:
                            $receive
                                ->receive_date
                                ->format('Y-m-d'),

                        movementType:
                            'receive',

                        referenceType:
                            'stock_receive',

                        referenceId:
                            $receive->id,

                        referenceNo:
                            $receive->reference_no,

                        note:
                            $receive->remarks,
                    );
                }

                $receive->update([
                    'status' => 'posted',
                ]);
            }
        );
    }

    public function postIssue(
        StockIssue $issue
    ): void {
        DB::transaction(
            function () use ($issue) {
                $issue = StockIssue::query()
                    ->with('items.product')
                    ->lockForUpdate()
                    ->findOrFail(
                        $issue->id
                    );

                $this->ensureDraft(
                    $issue->status
                );

                foreach (
                    $issue->items
                    as $item
                ) {
                    $this->move(
                        warehouseId:
                            $issue->warehouse_id,

                        product:
                            $item->product,

                        quantity:
                            -(float)
                            $item->quantity,

                        date:
                            $issue
                                ->issue_date
                                ->format('Y-m-d'),

                        movementType:
                            'issue',

                        referenceType:
                            'stock_issue',

                        referenceId:
                            $issue->id,

                        referenceNo:
                            $issue->reference_no,

                        note:
                            $issue->remarks,
                    );
                }

                $issue->update([
                    'status' => 'posted',
                ]);
            }
        );
    }

    public function postAdjustment(
        StockAdjustment $adjustment
    ): void {
        DB::transaction(
            function () use ($adjustment) {
                $adjustment =
                    StockAdjustment::query()
                        ->with(
                            'items.product'
                        )
                        ->lockForUpdate()
                        ->findOrFail(
                            $adjustment->id
                        );

                $this->ensureDraft(
                    $adjustment->status
                );

                foreach (
                    $adjustment->items
                    as $item
                ) {
                    $quantity =
                        (float)
                        $item->quantity;

                    if (
                        $item->direction ===
                        'decrease'
                    ) {
                        $quantity *= -1;
                    }

                    $this->move(
                        warehouseId:
                            $adjustment
                                ->warehouse_id,

                        product:
                            $item->product,

                        quantity:
                            $quantity,

                        date:
                            $adjustment
                                ->adjustment_date
                                ->format('Y-m-d'),

                        movementType:
                            'adjustment_' .
                            $item->direction,

                        referenceType:
                            'stock_adjustment',

                        referenceId:
                            $adjustment->id,

                        referenceNo:
                            $adjustment
                                ->reference_no,

                        note:
                            $adjustment->remarks,
                    );
                }

                $adjustment->update([
                    'status' => 'posted',
                ]);
            }
        );
    }

    public function postTransfer(
        StockTransfer $transfer
    ): void {
        DB::transaction(
            function () use ($transfer) {
                $transfer =
                    StockTransfer::query()
                        ->with(
                            'items.product'
                        )
                        ->lockForUpdate()
                        ->findOrFail(
                            $transfer->id
                        );

                $this->ensureDraft(
                    $transfer->status
                );

                if (
                    $transfer
                        ->from_warehouse_id ===
                    $transfer
                        ->to_warehouse_id
                ) {
                    throw ValidationException
                        ::withMessages([
                            'to_warehouse_id' =>
                                'Destination warehouse must be different.',
                        ]);
                }

                foreach (
                    $transfer->items
                    as $item
                ) {
                    $quantity =
                        (float)
                        $item->quantity;

                    /*
                     * Source warehouse
                     */
                    $this->move(
                        warehouseId:
                            $transfer
                                ->from_warehouse_id,

                        product:
                            $item->product,

                        quantity:
                            -$quantity,

                        date:
                            $transfer
                                ->transfer_date
                                ->format('Y-m-d'),

                        movementType:
                            'transfer_out',

                        referenceType:
                            'stock_transfer',

                        referenceId:
                            $transfer->id,

                        referenceNo:
                            $transfer
                                ->reference_no,

                        note:
                            $transfer->remarks,
                    );

                    /*
                     * Destination
                     */
                    $this->move(
                        warehouseId:
                            $transfer
                                ->to_warehouse_id,

                        product:
                            $item->product,

                        quantity:
                            $quantity,

                        date:
                            $transfer
                                ->transfer_date
                                ->format('Y-m-d'),

                        movementType:
                            'transfer_in',

                        referenceType:
                            'stock_transfer',

                        referenceId:
                            $transfer->id,

                        referenceNo:
                            $transfer
                                ->reference_no,

                        note:
                            $transfer->remarks,
                    );
                }

                $transfer->update([
                    'status' => 'posted',
                ]);
            }
        );
    }

    private function move(
        int $warehouseId,
        Product $product,
        float $quantity,
        string $date,
        string $movementType,
        string $referenceType,
        int $referenceId,
        string $referenceNo,
        ?string $note = null,
    ): void {
        $stock = Stock::query()
            ->where(
                'warehouse_id',
                $warehouseId
            )
            ->where(
                'product_id',
                $product->id
            )
            ->lockForUpdate()
            ->first();

        if (!$stock) {
            Stock::create([
                'warehouse_id' =>
                    $warehouseId,

                'product_id' =>
                    $product->id,

                'quantity' => 0,
            ]);

            $stock = Stock::query()
                ->where(
                    'warehouse_id',
                    $warehouseId
                )
                ->where(
                    'product_id',
                    $product->id
                )
                ->lockForUpdate()
                ->firstOrFail();
        }

        $newBalance = round(
            (float) $stock->quantity +
                $quantity,
            2
        );

        if ($newBalance < 0) {
            throw ValidationException
                ::withMessages([
                    'stock' =>
                        "Insufficient stock for {$product->name}.",
                ]);
        }

        $stock->update([
            'quantity' => $newBalance,
        ]);

        StockMovement::create([
            'warehouse_id' =>
                $warehouseId,

            'product_id' =>
                $product->id,

            'movement_date' =>
                $date,

            'movement_type' =>
                $movementType,

            'reference_type' =>
                $referenceType,

            'reference_id' =>
                $referenceId,

            'reference_no' =>
                $referenceNo,

            'quantity' =>
                $quantity,

            'balance_after' =>
                $newBalance,

            'note' =>
                $note,
        ]);
    }

    private function ensureDraft(
        string $status
    ): void {
        if ($status !== 'draft') {
            throw ValidationException
                ::withMessages([
                    'status' =>
                        'Only draft documents can be posted.',
                ]);
        }
    }
}