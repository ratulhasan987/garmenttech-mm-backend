<?php

namespace App\Services;

use App\Models\MachineModel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MachineModelService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return MachineModel::query()
            ->latest()
            ->paginate(30);
    }

    public function createModel(array $data): MachineModel
    {
        return MachineModel::create($data);
    }

    public function updateModel(MachineModel $model, array $data): MachineModel
    {
        $model->update($data);

        return $model->fresh();
    }

    public function deleteModel(MachineModel $model): bool
    {
        return $model->delete();
    }

}
