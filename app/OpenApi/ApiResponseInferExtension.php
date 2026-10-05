<?php

namespace App\OpenApi;

use App\Http\Responses\ApiResponse;
use Dedoc\Scramble\Infer\Extensions\Event\StaticMethodCallEvent;
use Dedoc\Scramble\Infer\Extensions\StaticMethodReturnTypeExtension;
use Dedoc\Scramble\Support\Type\ArrayItemType_;
use Dedoc\Scramble\Support\Type\ArrayType;
use Dedoc\Scramble\Support\Type\Generic;
use Dedoc\Scramble\Support\Type\IntegerType;
use Dedoc\Scramble\Support\Type\KeyedArrayType;
use Dedoc\Scramble\Support\Type\Literal\LiteralBooleanType;
use Dedoc\Scramble\Support\Type\Literal\LiteralIntegerType;
use Dedoc\Scramble\Support\Type\NullType;
use Dedoc\Scramble\Support\Type\ObjectType;
use Dedoc\Scramble\Support\Type\StringType;
use Dedoc\Scramble\Support\Type\Type;
use Dedoc\Scramble\Support\Type\Union;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

class ApiResponseInferExtension implements StaticMethodReturnTypeExtension
{
    public function shouldHandle(ObjectType|string $type): bool
    {
        return $type === ApiResponse::class
            || (is_string($type) === false && $type->isInstanceOf(ApiResponse::class));
    }

    public function getStaticMethodReturnType(StaticMethodCallEvent $event): ?Type
    {
        if ($event->getName() !== 'success') {
            return null;
        }

        $status = $event->getArg('status', 3, new LiteralIntegerType(200));

        $responseShape = [
            new ArrayItemType_('success', new LiteralBooleanType(true)),
            new ArrayItemType_('message', new StringType),
        ];

        // Check if "data" was actually passed
        if ($this->hasArgument($event, 'data', 1)) {
            $dataType = $event->getArg('data', 1);
            $responseShape[] = new ArrayItemType_('data', $dataType);
        }

        // Check if "meta" was actually passed
        if ($this->hasArgument($event, 'meta', 2)) {
            $metaArg = $event->getArg('meta', 2);

            if (
                $metaArg->isInstanceOf(LengthAwarePaginator::class)
                || ($metaArg instanceof ObjectType && $metaArg->isInstanceOf(LengthAwarePaginator::class))
            ) {
                $metaType = new KeyedArrayType([
                    new ArrayItemType_('current_page', new IntegerType),
                    new ArrayItemType_('last_page',   new IntegerType),
                    new ArrayItemType_('per_page',    new IntegerType),
                    new ArrayItemType_('total',       new IntegerType),
                    new ArrayItemType_('from',        new Union([new IntegerType, new NullType])),
                    new ArrayItemType_('to',          new Union([new IntegerType, new NullType])),
                ]);
            } else {
                $metaType = $metaArg;
            }

            $responseShape[] = new ArrayItemType_('meta', $metaType);
        }

        return new Generic(JsonResponse::class, [
            new KeyedArrayType($responseShape),
            $status,
            new ArrayType,
        ]);
    }

    /**
     * Safely checks whether an argument was passed (works with AutoResolvingArgumentTypeBag).
     */
    private function hasArgument(StaticMethodCallEvent $event, string $name, int $position): bool
    {
        $arguments = $event->arguments;

        // Named argument
        if (method_exists($arguments, 'has') && $arguments->has($name)) {
            return true;
        }

        // Fallback for older / different bag implementations
        try {
            $all = method_exists($arguments, 'allUnresolved')
                ? $arguments->allUnresolved()
                : (method_exists($arguments, 'all') ? $arguments->all() : []);

            // Named
            if (isset($all[$name])) {
                return true;
            }

            // Positional
            if (isset($all[$position])) {
                return true;
            }
        } catch (\Throwable) {
            // ignore
        }

        return false;
    }
}
