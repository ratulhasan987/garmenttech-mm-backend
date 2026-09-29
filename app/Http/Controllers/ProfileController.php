<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Advance;
use App\Models\DailyExpense;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Illuminate\Support\Facades\Hash;

use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function show(Request $request): Response
    {
        if (is_null($this->user) || !$this->user->can('user.my_profile')) {
            abort('403', 'Unauthorized access');
        }

        $user = $request->user();

        return Inertia::render('profile/show-profile', [
            "user" => $user
        ]);
    }

    public function edit(Request $request): Response
    {
        if (is_null($this->user) || !$this->user->can('user.edit_profile')) {
            abort('403', 'Unauthorized access');
        }

        return Inertia::render('profile/edit-profile', [
            "user" => $request->user()
        ]);
    }

    public function updateInformation(Request $request): RedirectResponse
    {
        if (is_null($this->user) || !$this->user->can('user.edit_profile')) {
            abort('403', 'Unauthorized access');
        }

        $validate = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'phone' => ['nullable'],
        ]);

        $request->user()->update($validate);



        return redirect()->route('profile.edit')->with("notification", [
            'type' => 'success',
            'message' => 'Profile Informations Update Successfully!'
        ]);

    }

    public function updatePassword(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('user.edit_profile')) {
            abort('403', 'Unauthorized access');
        }

        $validate = $request->validate([
            'current_password' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'password_confirmation' => ['required', 'string', 'max:255']
        ]);

        $enteredPassword = request('current_password');
        $hashedPassword = $request->user()->password;

        if (Hash::check($enteredPassword, $hashedPassword)) {
            if ($request->password === $request->password_confirmation) {
                $request->user()->update([
                    'password' => Hash::make($validate['password']),
                ]);

                return redirect()->route('profile.edit')->with("notification", [
                    'message' => 'Passwords Update Successfully!',
                    'type' => 'success'
                ]);
            } else {


                return redirect()->route('profile.edit')->with("notification", [
                    'message' => 'Passwords do not match!',
                    'type' => 'error'
                ]);
            }
        } else {

            return redirect()->route('profile.edit')->with("notification", [
                'message' => 'Your Current Passwords do not match!',
                'type' => 'error'
            ]);
        }
    }

    public function updateImage(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('user.edit_profile')) {
            abort('403', 'Unauthorized access');
        }

        $validate = $request->validate([
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg'],
        ]);

        if ($request->hasFile('image')) {
            $old_image = $request->user()->image;
            File::deleteFile($old_image);

            $request->user()->update([
                'image' => File::fileUpload($request->file('image'), 'Users')
            ]);

        }


        return redirect()->route('profile.edit')->with("notification", [
            'message' => 'Profile Picture Update Successfully!',
            'type' => 'success'
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if (is_null($this->user) || !$this->user->can('user.edit_profile')) {
            abort('403', 'Unauthorized access');
        }

        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('dashboard');
    }
}
