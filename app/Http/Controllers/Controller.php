<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;


    protected function authorizePermission(
        string ...$permissions
    ): void {

        $user = Auth::guard('web')->user();


        if (
            is_null($user)
        ) {

            abort(
                403,
                'Unauthorized access'
            );

        }


        foreach ($permissions as $permission) {

            if (
                !$user->can($permission)
            ) {

                abort(
                    403,
                    'Unauthorized access'
                );

            }

        }

    }
}
