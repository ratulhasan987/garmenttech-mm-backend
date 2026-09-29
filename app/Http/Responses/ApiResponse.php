<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ApiResponse
{
    public static function success(
        string $message = 'Success',
        mixed $data = null,
        mixed $meta = null,
        int $status = 200
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta instanceof LengthAwarePaginator) {
            $response['meta'] = [
                'current_page' => $meta->currentPage(),
                'last_page' => $meta->lastPage(),
                'per_page' => $meta->perPage(),
                'total' => $meta->total(),
                'from' => $meta->firstItem(),
                'to' => $meta->lastItem(),
            ];
        } elseif ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    public static function error(
        string $message,
        int $status = 400,
        mixed $errors = null
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
