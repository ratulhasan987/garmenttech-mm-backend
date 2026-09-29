<?php

namespace App\Http\Controllers;

use App\Models\WifiIp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;
use Inertia\Response;

class WifiIpController extends Controller
{
    public $user;
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();
            return $next($request);
        });
    }

    public function index()
    {
        if (is_null($this->user) || !$this->user->can('settings.wifi_ip')) {
            abort('403', 'Unauthorized access');
        }

        $wifiIps = WifiIp::latest()->paginate(20);


        return Inertia::render('settings/wifi-ips/index', [
            "data" => $wifiIps,
        ]);
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.wifi_ip')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'ip_address' => ['required', 'unique:wifi_ips,ip_address', 'string', 'max:255']
        ]);

        $ip = new WifiIp();
        $ip->ip_address = $request->ip_address;
        $ip->save();


        return redirect()->back()->with("notification", [
            'message' => 'New IP Address Save Successfully',
            'type' => 'success'
        ]);
    }

    public function edit(WifiIp $wifiIp)
    {
        if (is_null($this->user) || !$this->user->can('settings.wifi_ip')) {
            abort('403', 'Unauthorized access');
        }
        return response()->json($wifiIp);
    }

    public function update(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('settings.wifi_ip')) {
            abort('403', 'Unauthorized access');
        }

        $request->validate([
            'ip_address' => ['required', "unique:wifi_ips,ip_address, $request->id", 'string', 'max:255']
        ]);

        $wifiIps = WifiIp::whereId($request->id)->first();
        $wifiIps->ip_address = $request->ip_address;
        $wifiIps->save();


        return redirect()->back()->with("notification", [
            'message' => 'IP Address Updated Successfully',
            'type' => 'success'
        ]);
    }

    public function destroy(WifiIp $wifiIp)
    {
        if (is_null($this->user) || !$this->user->can('settings.wifi_ip')) {
            abort('403', 'Unauthorized access');
        }

        $deleteIpAddress = $wifiIp->delete();

        if ($deleteIpAddress) {

            return redirect()->back()->with("notification", [
                'message' => 'IP Address Deleted successfully!',
                'type' => 'warning'
            ]);
        }
    }

}

