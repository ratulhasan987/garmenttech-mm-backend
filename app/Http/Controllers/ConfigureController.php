<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Models\Configure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ConfigureController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function index()
    {
        if (is_null($this->user) || !$this->user->can('settings.timezone')) {
            abort('403', 'Unauthorized access');
        }

        $configure = Configure::first();

        return Inertia::render('configure/index', ["data" => $configure]);
    }


    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'phone' => [
                'required',
                'string',
                'max:50',
            ],

            'address' => [
                'required',
                'string',
                'max:1000',
            ],

            'logo' => [
                'nullable',
                'file',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],

            'primary_logo' => [
                'nullable',
                'file',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],

            'secondary_logo' => [
                'nullable',
                'file',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],

            'remove_logo' => [
                'nullable',
                'boolean',
            ],

            'remove_primary_logo' => [
                'nullable',
                'boolean',
            ],

            'remove_secondary_logo' => [
                'nullable',
                'boolean',
            ],
        ]);

        $configure = Configure::firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Short Logo
        |--------------------------------------------------------------------------
        */

        if ($request->boolean('remove_logo')) {
            if ($configure->logo) {
                File::deleteFile(
                    $configure->logo
                );
            }

            $configure->logo = null;
        }

        if ($request->hasFile('logo')) {
            if ($configure->logo) {
                File::deleteFile(
                    $configure->logo
                );
            }

            $configure->logo = File::upload(
                $request->file('logo'),
                'Configure'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Primary Logo
        |--------------------------------------------------------------------------
        */

        if ($request->boolean('remove_primary_logo')) {
            if ($configure->primary_logo) {
                File::deleteFile(
                    $configure->primary_logo
                );
            }

            $configure->primary_logo = null;
        }

        if ($request->hasFile('primary_logo')) {
            if ($configure->primary_logo) {
                File::deleteFile(
                    $configure->primary_logo
                );
            }

            $configure->primary_logo = File::upload(
                $request->file('primary_logo'),
                'Configure'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Secondary Logo
        |--------------------------------------------------------------------------
        */

        if ($request->boolean('remove_secondary_logo')) {
            if ($configure->secondary_logo) {
                File::deleteFile(
                    $configure->secondary_logo
                );
            }

            $configure->secondary_logo = null;
        }

        if ($request->hasFile('secondary_logo')) {
            if ($configure->secondary_logo) {
                File::deleteFile(
                    $configure->secondary_logo
                );
            }

            $configure->secondary_logo = File::upload(
                $request->file('secondary_logo'),
                'Configure'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Configuration
        |--------------------------------------------------------------------------
        */

        $configure->name =
            $validated['name'];

        $configure->email =
            $validated['email'];

        $configure->phone =
            $validated['phone'];

        $configure->address =
            $validated['address'];

        $configure->save();

        return redirect()
            ->back()
            ->with([
                'message' =>
                    'Website Configuration Updated Successfully',

                'type' =>
                    'success',
            ]);
    }

    // public function update(Request $request)
    // {
    //     $user = $request->user();

    //     abort_unless(
    //         $user->can('superadmin.dashboard'),
    //         403,
    //         'Unauthorized'
    //     );

    //     $request->validate([
    //         'logo' => ['nullable', 'mimes:png,jpg,jpeg'],
    //         'primary_logo' => ['nullable', 'mimes:png,jpg,jpeg'],
    //         'secondary_logo' => ['nullable', 'mimes:png,jpg,jpeg'],
    //     ]);

    //     $configure = Configure::first();

    //     if ($request->hasFile('logo')) {

    //         $old_image = $configure->logo;
    //         File::deleteFile($old_image);
    //         $logoPath = File::fleUpload($request->file('logo'), 'Configure');
    //         $configure->logo = $logoPath;
    //         $configure->save();

    //     }
    //     if ($request->hasFile('primary_logo')) {

    //         $old_image = $configure->primary_logo;
    //         File::deleteFile($old_image);
    //         $logoPath = File::fleUpload($request->file('primary_logo'), 'Configure');
    //         $configure->primary_logo = $logoPath;
    //         $configure->save();

    //     }
    //     if ($request->hasFile('secondary_logo')) {

    //         $old_image = $configure->secondary_logo;
    //         File::deleteFile($old_image);
    //         $logoPath = File::fleUpload($request->file('secondary_logo'), 'Configure');
    //         $configure->secondary_logo = $logoPath;
    //         $configure->save();
    //     }


    //     $configure->name = $request->name;
    //     $configure->email = $request->email;
    //     $configure->phone = $request->phone;
    //     $configure->address = $request->address;
    //     $configure->save();



    //     $notification = array(
    //         'message' => 'Website Configuration Update Successfully',
    //         'type' => 'success'
    //     );
    //     return redirect()->back()->with($notification);
    // }

    public function timeZoneIndex()
    {
        if (is_null($this->user) || !$this->user->can('settings.timezone')) {
            abort('403', 'Unauthorized access');
        }

        $timezones = timezone_identifiers_list();

        return Inertia::render('settings/timezone/index', [
            'timezones' => $timezones,

            // Replace this later with your database setting if needed.
            'timezone' => config('app.timezone'),
        ]);
    }

    public function timeZone(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.timezone')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'timezone' => 'required|timezone',
        ]);

        $timezone = $request->input('timezone');

        // Update the config/app.php file dynamically
        $configPath = config_path('app.php');
        $configContents = file_get_contents($configPath); // Use native function instead of custom TimeZoneFile
        $updatedContents = preg_replace(
            "/'timezone' => '.*',/",
            "'timezone' => '$timezone',",
            $configContents
        );

        file_put_contents($configPath, $updatedContents); // Use native function instead of custom TimeZoneFile

        // Clear and optimize configuration
        Artisan::call('config:clear');
        Artisan::call('optimize');

        return redirect()->back()->with("notification", [
            "message" => "Timezone has been set successfully!",
            "type" => "success"
        ]);
    }

}
