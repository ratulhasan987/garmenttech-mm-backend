<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuildingController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DesignationController;
use App\Http\Controllers\Api\FloorController;
use App\Http\Controllers\Api\MachineCategoryController;
use App\Http\Controllers\Api\MachineModelController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [UserController::class, 'me'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('roles/create-data', [RoleController::class, 'createData']);
    Route::apiResource('roles', RoleController::class);

    Route::post('/users/{user}/status', [UserController::class, 'status']);
    Route::apiResource('users', UserController::class);
    Route::get('/get-employees', [UserController::class, 'employees']);

    // general settings
    Route::get('/departments/search', [DepartmentController::class, 'search']);
    Route::apiResource('departments', DepartmentController::class);

    Route::get('/designations/search', [DesignationController::class, 'search']);
    Route::apiResource('designations', DesignationController::class);

    Route::get('/shifts/search', [ShiftController::class, 'search']);
    Route::apiResource('shifts', ShiftController::class);

    Route::apiResource('machine-categories', MachineCategoryController::class);

    Route::apiResource('machine-models', MachineModelController::class);

    Route::apiResource('buildings', BuildingController::class);

    Route::apiResource('floors', FloorController::class);
});
