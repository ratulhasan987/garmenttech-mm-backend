<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Illuminate\Validation\ValidationException;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureAuthentication();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
    }

    /**
     * Configure user authentication.
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(
            function (Request $request) {
                $username = Fortify::username();

                /*
                |--------------------------------------------------------------------------
                | Find User
                |--------------------------------------------------------------------------
                |
                | Do NOT filter by status here.
                | We first need to verify the credentials.
                |
                */

                $user = User::query()
                    ->where(
                        $username,
                        $request->input($username)
                    )
                    ->first();

                /*
                |--------------------------------------------------------------------------
                | Invalid Credentials
                |--------------------------------------------------------------------------
                |
                | Keep Fortify's default:
                | "These credentials do not match our records."
                |
                */

                if (
                    !$user ||
                    !Hash::check(
                        $request->password,
                        $user->password
                    )
                ) {
                    return null;
                }

                /*
                |--------------------------------------------------------------------------
                | Inactive User
                |--------------------------------------------------------------------------
                |
                | Email + password are correct, but account is inactive.
                |
                */

                if ($user->status !== 'active') {
                    throw ValidationException::withMessages([
                        $username => [
                            'Your account is inactive. Please contact the administrator.',
                        ],
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | Authentication Successful
                |--------------------------------------------------------------------------
                */

                return $user;
            }
        );
    }



    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {

        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

    }
}
