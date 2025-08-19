<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Apply to all requests (recommended)
        $middleware->append(\App\Http\Middleware\CorsMiddleware::class);

        // OR apply only to API routes:
        // $middleware->api([
        //     \App\Http\Middleware\CorsMiddleware::class,
        //     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ]);

        // For stateful Sanctum apps (if using cookies)
        // $middleware->web([
        //     \Illuminate\Cookie\Middleware\EncryptCookies::class,
        //     \Illuminate\Session\Middleware\StartSession::class,
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
