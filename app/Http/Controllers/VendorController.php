<?php

namespace App\Http\Controllers;

use App\Actions\File;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public $user;
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::guard('web')->user();
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $this->authorizePermission('vendor.list');

        $query = Vendor::query();

        if ($request->has('vendor') && !empty($request->input('vendor'))) {
            $query->where('id', $request->input('vendor'));
        }

        if ($request->has('sorting') && !empty($request->input('sorting'))) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        }

        // Apply date range filter only if both dates are provided
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();

            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Get the total number of leads for this que
        $numberOfVendors = $query->count();

        // Paginate with 300 records per page
        $vendors = $query->latest()->paginate(30);

        return Inertia::render('vendor/index', [
            "data" => $vendors
        ]);

    }

    public function store(Request $request)
    {
        $this->authorizePermission('vendor.create');

        $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'email|unique:vendors,email',
            'phone' => 'string|unique:vendors,phone|max:20',
            'state' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'extensions:jpeg,jpg,png,gif',
                'max:5120',
            ],
        ]);

        if ($request->hasFile('image')) {
            $imagePath = File::fileUpload($request->file('image'), 'Vendors');
        } else {
            $imagePath = null;
        }

        // Generate unique Vendor ID (Year-Based with prefix)
        $year = date('Y');

        $last_vendor = Vendor::where('vendor_id', 'LIKE', "VND$year%")
            ->orderBy('id', 'desc')
            ->first();

        if ($last_vendor) {
            // Extract only the numeric part after "VNDYYYY"
            $last_vendorNumber = intval(substr($last_vendor->vendor_id, 7));
            $newVendorIdNumber = $last_vendorNumber + 1;
        } else {
            $newVendorIdNumber = 1;
        }

        // Format: VND + Year + 3-digit running number
        $vendorId = "VND" . $year . sprintf('%03d', $newVendorIdNumber);


        $vendor = new Vendor();

        $vendor->vendor_id = $vendorId;
        $vendor->name = $request->name;
        $vendor->company_name = $request->company;
        $vendor->email = $request->email;
        $vendor->phone = $request->phone;
        $vendor->city = $request->city;
        $vendor->state = $request->state;
        $vendor->country = $request->country;
        $vendor->address = $request->address;
        $vendor->image = $imagePath;
        $vendor->save();

        if ($request->submit_type == 'manual') {

            return redirect()->back()->with("notification", [
                'message' => 'Vendor created successfully',
                'type' => 'success'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Vendor created successfully!',
            'vendor' => $vendor
        ]);
    }

    public function edit(Vendor $vendor)
    {
        $this->authorizePermission('vendor.edit');

        return response()->json($vendor);
    }

    public function updatedeVendor(Request $request)
    {
        $this->authorizePermission('vendor.edit');

        $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'email' => "required|email|unique:Vendors,email,$request->id",
            'phone' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'extensions:jpeg,jpg,png,gif',
                'max:5120',
            ],
        ]);

        $vendor = Vendor::whereId($request->id)->first();


        if ($request->hasFile('image')) {

            $old_image = $vendor->image;
            File::deleteFile($old_image);

            $imagePath = File::fileUpload($request->file('image'), 'Vendors');
            $vendor->image = $imagePath;
            $vendor->save();
        }

        $vendor->name = $request->name;
        $vendor->company_name = $request->company;
        $vendor->email = $request->email;
        $vendor->phone = $request->phone;
        $vendor->city = $request->city;
        $vendor->state = $request->state;
        $vendor->country = $request->country;
        $vendor->address = $request->address;
        $vendor->save();

        return redirect()->back()->with("notification", [
            'message' => 'Vendor Update successfully.',
            'type' => 'success'
        ]);
    }

    public function destroy(Vendor $vendor)
    {
        $this->authorizePermission('vendor.delete');

        $deleteVendor = $vendor->delete();

        if ($deleteVendor) {

            File::deleteFile($vendor->image);

            return redirect()->back()->with("notification", [
                'message' => 'Vendor Delete successfully.',
                'type' => 'success'
            ]);
        }
    }

    public function getVendors(Request $request)
    {
        $keyword = $request->keyword;

        $query = DB::table('vendors')->select('id', 'name', 'phone');

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('phone', 'like', "%{$keyword}%");
            });
        }

        // Always return max 20 clients
        $vendors = $query->orderBy('name')->limit(20)->get();

        return response()->json($vendors);
    }


}
