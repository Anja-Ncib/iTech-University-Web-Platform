<?php
namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected function success(mixed $data = null, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'code' => $code,
            'message' => $message ?? __('messages.success'),
            'data' => $data
        ], $code);
    }

    protected function error(?string $message = null, int $code = 400, mixed $data = null): JsonResponse
    {
        return response()->json([
            'code' => $code,
            'message' => $message ?? __('messages.error'),
            'data' => $data
        ], $code);
    }
}
