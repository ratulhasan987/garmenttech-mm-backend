<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Responses\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;


use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;



return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__ . '/../routes/channels.php',
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // $middleware->preventRequestForgery(except: [
        //     '/lead-designations/resolve',
        //     '/lead-professions/resolve',
        //     '/lead-areas/resolve',
        // ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Spatie Permission Middleware
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) =>
                $request->is('api/*') || $request->expectsJson(),
        );

        // Authentication failed
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    message: 'Unauthenticated.',
                    status: 401,
                );
            }
        });

        // 404 - Route or model not found
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {

                if ($e->getPrevious() instanceof ModelNotFoundException) {
                    return ApiResponse::error(
                        message: 'Data not found.',
                        status: 404,
                    );
                }

                return ApiResponse::error(
                    message: 'Endpoint not found.',
                    status: 404,
                );
            }
        });

        // 405 - Method not allowed
        $exceptions->render(function (MethodNotAllowedHttpException $e, $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error(
                    message: 'Method not allowed.',
                    status: 405,
                );
            }
        });

        // 422 - Validation failed
        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                $errors = $e->errors();

                $errorMessages = collect($errors)->flatten();

                $errorCount = $errorMessages->count();

                $message = $errorMessages->first() ?? 'Validation failed.';

                if ($errorCount > 1) {
                    $message .= ' and ' . ($errorCount - 1) . ' more error' .
                        ($errorCount > 2 ? 's' : '') . '.';
                }

                return ApiResponse::error(
                    message: $message,
                    status: 422,
                    errors: $errors,
                );
            }
        });


        // web exceptions
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if ($e->getStatusCode() === 403) {
                return Inertia::render('errors/forbidden-access')
                    ->toResponse($request)
                    ->setStatusCode(403);
            }
            if ($e->getStatusCode() === 404) {
                return Inertia::render('errors/not-found')
                    ->toResponse($request)
                    ->setStatusCode(404);
            }
            if ($e->getStatusCode() === 500) {
                return Inertia::render('errors/server-error')
                    ->toResponse($request)
                    ->setStatusCode(500);
            }
            if ($e->getStatusCode() === 400) {
                return Inertia::render('errors/bad-request')
                    ->toResponse($request)
                    ->setStatusCode(400);
            }
            if ($e->getStatusCode() === 503) {
                return Inertia::render('errors/service-unavailable')
                    ->toResponse($request)
                    ->setStatusCode(503);
            }

            return null;
        });
    })->create();
