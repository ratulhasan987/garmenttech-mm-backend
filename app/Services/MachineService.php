<?php

namespace App\Services;

use App\Models\Machine;
use App\Models\MachineLocation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use Endroid\QrCode\ErrorCorrectionLevel;

class MachineService
{
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        return Machine::query()
            ->with(['model', 'currentLocation.floor.building'])
            ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
            ->when(isset($filters['model_id']), fn($q) => $q->where('model_id', $filters['model_id']))
            ->when(isset($filters['floor_id']), function ($q) use ($filters) {
                $q->whereHas('currentLocation', fn($q) => $q->where('floor_id', $filters['floor_id']));
            })
            ->when(isset($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(function ($q) use ($search) {
                    $q->where('machine_id', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(30);
    }

    public function createMachine(array $data): Machine
    {
        return DB::transaction(function () use ($data) {
            $locationData = $data['location'] ?? null;
            unset($data['location']);

            // Auto generate machine_id + qr_code
            $data['machine_id'] = $this->generateMachineId();

            $machine = Machine::create($data);

            if ($locationData) {
                $this->assignLocation($machine, $locationData);
            }

            return $machine->load(['model', 'currentLocation.floor.building']);
        });
    }

    public function updateMachine(Machine $machine, array $data): Machine
    {
        return DB::transaction(function () use ($machine, $data) {
            $locationData = $data['location'] ?? null;
            unset($data['location']);

            // Never allow changing machine_id or qr_code
            unset($data['machine_id']);

            $machine->update($data);

            if ($locationData) {
                $this->moveMachine($machine, $locationData);
            }

            return $machine->fresh(['model', 'currentLocation.floor.building']);
        });
    }

    public function deleteMachine(Machine $machine): bool
    {
        return DB::transaction(function () use ($machine) {
            $this->removeFromCurrentLocation($machine, 'Machine deleted');
            return $machine->delete();
        });
    }

    public function assignLocation(Machine $machine, array $data): MachineLocation
    {
        if ($machine->currentLocation()->exists()) {
            throw ValidationException::withMessages([
                'location' => 'Machine already has an active location. Use move instead.',
            ]);
        }

        return $this->createLocationRecord($machine, $data);
    }

    public function moveMachine(Machine $machine, array $data): MachineLocation
    {
        return DB::transaction(function () use ($machine, $data) {
            $this->removeFromCurrentLocation(
                $machine,
                $data['remarks'] ?? 'Moved to new location'
            );

            return $this->createLocationRecord($machine, $data);
        });
    }

    public function removeFromCurrentLocation(Machine $machine, ?string $remarks = null): void
    {
        $current = $machine->currentLocation;

        if (!$current) {
            return;
        }

        $current->update([
            'removed_at' => now(),
            'remarks' => $remarks ?? $current->remarks,
        ]);
    }

    public function getLocationHistory(Machine $machine)
    {
        return $machine->locations()
            ->with('floor.building')
            ->latest('assigned_at')
            ->get();
    }

    /**
     * Generate QR Code image for download
     * Returns SVG or PNG content
     */
    public function generateQrCode(Machine $machine, string $format = 'svg', int $size = 300)
    {
        $content = $machine->machine_id;

        $builder = new Builder(
            writer: $format === 'png' ? new PngWriter() : new SvgWriter(),
            data: $content,
            size: $size,
            margin: 10,
            errorCorrectionLevel: ErrorCorrectionLevel::High
        );

        $result = $builder->build();

        return $result->getString(); // binary for PNG, SVG string for SVG
    }

    // -------------------------------------------------------
    // Protected helpers
    // -------------------------------------------------------

    /**
     * Industrial machine_id generator
     * Format: MCH-YYMM-XXXXX  (example: MCH-2510-00087)
     */
    protected function generateMachineId(): string
    {
        $prefix = 'MCH-' . now()->format('ym') . '-';

        // Get the last machine created this month
        $lastMachine = Machine::where('machine_id', 'like', $prefix . '%')
            ->orderByDesc('machine_id')
            ->value('machine_id');

        if ($lastMachine) {
            $lastNumber = (int) substr($lastMachine, -5);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $machineId = $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

        // Extra safety (very rare race condition)
        while (Machine::where('machine_id', $machineId)->exists()) {
            $nextNumber++;
            $machineId = $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
        }

        return $machineId;
    }

    protected function createLocationRecord(Machine $machine, array $data): MachineLocation
    {
        return MachineLocation::create([
            'machine_id' => $machine->id,
            'floor_id' => $data['floor_id'],
            'sl_no' => $data['sl_no'],
            'assigned_at' => $data['assigned_at'] ?? now(),
            'remarks' => $data['remarks'] ?? null,
            'removed_at' => null,
        ]);
    }
}
