<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        // Preserve the existing customer predictive-search JSON response.
        if ($request->wantsJson()) {
            return $this->customerSuggestions($request);
        }

        // Validate Filters
        $validated = $request->validate([
            'customer_id' => [
                'nullable',
                'integer',
                'min:1',
                'exists:clients,id',
            ],

            'profession_id' => [
                'nullable',
                'integer',
                'exists:professions,id',
            ],

            'lead_designation_id' => [
                'nullable',
                'integer',
                'exists:lead_designations,id',
            ],

            'area_id' => [
                'nullable',
                'integer',
                'exists:areas,id',
            ],

            'sector_id' => [
                'nullable',
                'integer',
                'exists:sectors,id',
            ],

            'status' => [
                'nullable',
                Rule::in(['active', 'inactive']),
            ],

            'gender' => [
                'nullable',
                Rule::in(['male', 'female', 'other']),
            ],

            'marital_status' => [
                'nullable',
                Rule::in([
                    'single',
                    'married',
                    'divorced',
                    'widowed',
                ]),
            ],

            'source' => [
                'nullable',
                Rule::in(['lead', 'direct']),
            ],

            'company_name' => [
                'nullable',
                'string',
                'max:100',
            ],

            'date_from' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'date_to' => [
                'nullable',
                'date_format:Y-m-d',

                ...(
                    $request->filled('date_from')
                    ? ['after_or_equal:date_from']
                    : []
                ),
            ],

            'sort' => [
                'nullable',
                Rule::in([
                    'latest',
                    'oldest',
                    'name_asc',
                    'name_desc',
                ]),
            ],
        ]);

        // Selected Filter Values
        $customerId = isset($validated['customer_id'])
            ? (int) $validated['customer_id']
            : null;

        $professionId = isset($validated['profession_id'])
            ? (int) $validated['profession_id']
            : null;

        $designationId = isset($validated['lead_designation_id'])
            ? (int) $validated['lead_designation_id']
            : null;

        $areaId = isset($validated['area_id'])
            ? (int) $validated['area_id']
            : null;

        $sectorId = isset($validated['sector_id'])
            ? (int) $validated['sector_id']
            : null;

        $status = $validated['status'] ?? null;

        $gender = $validated['gender'] ?? null;

        $maritalStatus = $validated['marital_status'] ?? null;

        $source = $validated['source'] ?? null;

        $companyName = trim(
            (string) ($validated['company_name'] ?? '')
        );

        $dateFrom = $validated['date_from'] ?? null;

        $dateTo = $validated['date_to'] ?? null;

        $sort = $validated['sort'] ?? 'latest';

        // Customer Query
        $query = Client::accessible(auth()->user())

            ->when(
                $customerId !== null,
                fn($q) => $q->where(
                    'id',
                    $customerId
                )
            )

            ->when(
                $professionId !== null,
                fn($q) => $q->where(
                    'profession_id',
                    $professionId
                )
            )

            ->when(
                $designationId !== null,
                fn($q) => $q->where(
                    'lead_designation_id',
                    $designationId
                )
            )

            ->when(
                $areaId !== null,
                fn($q) => $q->where(
                    'area_id',
                    $areaId
                )
            )

            ->when(
                $sectorId !== null,
                fn($q) => $q->where(
                    'sector_id',
                    $sectorId
                )
            )

            ->when(
                $status !== null,
                fn($q) => $q->where(
                    'status',
                    $status
                )
            )

            ->when(
                $gender !== null,
                fn($q) => $q->where(
                    'gender',
                    $gender
                )
            )

            ->when(
                $maritalStatus !== null,
                fn($q) => $q->where(
                    'marital_status',
                    $maritalStatus
                )
            )

            ->when(
                $companyName !== '',
                fn($q) => $q->where(
                    'company_name',
                    'like',
                    "%{$companyName}%"
                )
            )

            ->when(
                $dateFrom !== null,
                fn($q) => $q->whereDate(
                    'created_at',
                    '>=',
                    $dateFrom
                )
            )

            ->when(
                $dateTo !== null,
                fn($q) => $q->whereDate(
                    'created_at',
                    '<=',
                    $dateTo
                )
            );

        /*
        | Customer Source
        |
        | lead_id is not null = Converted from Lead
        | lead_id is null     = Created Directly
        |
        */

        if ($source === 'lead') {
            $query->whereNotNull('lead_id');

        } elseif ($source === 'direct') {
            $query->whereNull('lead_id');
        }

        // Sorting
        switch ($sort) {

            case 'oldest':

                $query->orderBy('id');

                break;

            case 'name_asc':

                $query
                    ->orderBy('name')
                    ->orderBy('id');

                break;

            case 'name_desc':

                $query
                    ->orderByDesc('name')
                    ->orderByDesc('id');

                break;

            default:

                $query->latest('id');
        }


        $customers = $query
            ->paginate(30)
            ->withQueryString();

        // Selected Customer Suggestion
        $selectedCustomer = null;

        if ($customerId !== null) {

            $customer = Client::query()
                ->select([
                    'id',
                    'client_no',
                    'name',
                    'company_name',
                    'phone',
                ])
                ->find($customerId);

            if ($customer) {

                $selectedCustomer = [

                    'id' => $customer->id,

                    'client_no' => $customer->client_no,

                    'name' => $customer->name,

                    'company_name' => $customer->company_name,

                    'phone' => $customer->phone,

                    'label' => $this->customerLabel(
                        $customer
                    ),
                ];
            }
        }

        /*
        | Selected Suggestion Values
        |
        | These preserve the selected Profession, Designation,
        | Area and Sector names after applying filters.
        |
        | Only selected records are fetched.
        | Entire master lists are not loaded.
        |
        */

        $selectedOption = static function (string $table, ?int $id): ?object {

            return $id === null
                ? null
                : DB::table($table)
                    ->where('id', $id)
                    ->first(['id', 'name']);
        };


        return Inertia::render(
            'operations/sales/customers/index',
            [

                'data' => $customers,

                'filters' => [

                    'customer_id' => $customerId,

                    'profession_id' => $professionId,

                    'lead_designation_id' => $designationId,

                    'area_id' => $areaId,

                    'sector_id' => $sectorId,

                    'status' => $status,

                    'gender' => $gender,

                    'marital_status' => $maritalStatus,

                    'source' => $source,

                    'company_name' => $companyName,

                    'date_from' => $dateFrom,

                    'date_to' => $dateTo,

                    'sort' => $sort,
                ],

                'selectedCustomer' => $selectedCustomer,

                'filterSelections' => [

                    'profession' => $selectedOption(
                        'professions',
                        $professionId
                    ),

                    'designation' => $selectedOption(
                        'lead_designations',
                        $designationId
                    ),

                    'area' => $selectedOption(
                        'areas',
                        $areaId
                    ),

                    'sector' => $selectedOption(
                        'sectors',
                        $sectorId
                    ),
                ],
            ]
        );
    }

    public function create(): Response
    {
        return Inertia::render(
            'operations/sales/customers/create'
        );
    }

    public function store(Request $request)
    {
        $validated = $this->validateCustomer($request);

        DB::transaction(function () use ($request, $validated) {
            /*
             * client_no is generated by system.
             * lead_id is only set during Lead conversion.
             */
            $validated['client_no'] = $this->generateCustomerCode();
            $validated['lead_id'] = null;

            $validated['created_by'] = auth()->id();
            $validated['updated_by'] = auth()->id();

            if ($request->hasFile('image')) {
                $validated['image'] = $request
                    ->file('image')
                    ->store('clients', 'public');
            }

            Client::create($validated);
        });

        return redirect()
            ->route('operations.sales.customers.index')
            ->with('notification', [
                'message' => 'Customer created successfully.',
                'type' => 'success',
            ]);
    }

    public function show($id)
    {
        $client = Client::with([
            'profession:id,name',
            'designation:id,name',
            'area:id,name',
            'sector:id,name',
            'createdBy:id,name',
            'updatedby:id,name',
        ])->findOrFail($id);

        return response()->json([
            'id' => $client->id,

            // Basic Information
            'client_no' => $client->client_no,
            'name' => $client->name,
            'phone' => $client->phone,
            'email' => $client->email,
            'company_name' => $client->company_name,
            'image' => $client->image,
            'status' => $client->status,

            // Identity & Personal Information
            'nid_no' => $client->nid_no,
            'passport_no' => $client->passport_no,
            'tin_no' => $client->tin_no,
            'date_of_birth' => $client->date_of_birth,
            'gender' => $client->gender,
            'marital_status' => $client->marital_status,

            // Occupation & Location
            'profession_id' => $client->profession_id,
            'profession' => $client->profession
                ? [
                    'id' => $client->profession->id,
                    'name' => $client->profession->name,
                ]
                : null,

            'lead_designation_id' => $client->lead_designation_id,
            'designation' => $client->designation
                ? [
                    'id' => $client->designation->id,
                    'name' => $client->designation->name,
                ]
                : null,

            'area_id' => $client->area_id,
            'area' => $client->area
                ? [
                    'id' => $client->area->id,
                    'name' => $client->area->name,
                ]
                : null,

            'sector_id' => $client->sector_id,
            'sector' => $client->sector
                ? [
                    'id' => $client->sector->id,
                    'name' => $client->sector->name,
                ]
                : null,

            // Address & CRM Reference
            'present_address' => $client->present_address,
            'permanent_address' => $client->permanent_address,
            'lead_id' => $client->lead_id,

            // Audit
            'created_by' => $client->createdBy?->name,
            'updated_by' => $client->updatedby?->name,
            'created_at' => $client->created_at,
            'updated_at' => $client->updated_at,
        ]);
    }

    public function edit(Client $client)
    {

        $client->load([
            'area:id,name',
            'sector:id,name',
            'profession:id,name',
            'designation:id,name',
        ]);


        return Inertia::render(
            'operations/sales/customers/edit',
            [
                "customer" => $client
            ]
        );
    }

    public function update(
        Request $request,
        Client $client
    ) {
        $validated = $this->validateCustomer(
            $request,
            $client
        );

        DB::transaction(function () use ($request, $validated, $client) {
            $validated['updated_by'] = auth()->id();

            if ($request->hasFile('image')) {
                $this->deleteImage($client->image);

                $validated['image'] = $request
                    ->file('image')
                    ->store('clients', 'public');
            } else {
                unset($validated['image']);
            }

            /*
             * Never modify generated client_no or lead reference
             * from the normal customer edit form.
             */
            unset(
                $validated['client_no'],
                $validated['lead_id'],
                $validated['created_by']
            );

            $client->update($validated);
        });

        return redirect()
            ->back()
            ->with('notification', [
                'message' => 'Customer updated successfully.',
                'type' => 'success',
            ]);
    }

    public function destroy(Client $client)
    {
        if ($client->salesInvoices()->exists()) {
            return redirect()
                ->back()
                ->with('notification', [
                    'message' => 'Customer cannot be deleted because sales invoices are using this customer.',
                    'type' => 'error',
                ]);
        }

        DB::transaction(function () use ($client) {
            $this->deleteImage($client->image);

            $client->delete();
        });

        return redirect()
            ->back()
            ->with('notification', [
                'message' => 'Customer deleted successfully.',
                'type' => 'success',
            ]);
    }

    private function customerSuggestions(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'keyword' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        $keyword = trim(
            (string) ($validated['keyword'] ?? '')
        );

        $customers = Client::query()
            ->select([
                'id',
                'client_no',
                'name',
                'company_name',
                'phone',
            ])
            ->when(
                $keyword !== '',
                function ($query) use ($keyword) {
                    $query->where(function ($query) use ($keyword) {
                        $query
                            ->where(
                                'name',
                                'like',
                                "%{$keyword}%"
                            )
                            ->orWhere(
                                'client_no',
                                'like',
                                "%{$keyword}%"
                            )
                            ->orWhere(
                                'company_name',
                                'like',
                                "%{$keyword}%"
                            )
                            ->orWhere(
                                'phone',
                                'like',
                                "%{$keyword}%"
                            );
                    });
                }
            )
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(function (Client $customer) {
                return [
                    'id' => $customer->id,
                    'client_no' => $customer->client_no,
                    'name' => $customer->name,
                    'company_name' => $customer->company_name,
                    'phone' => $customer->phone,
                    'label' => $this->customerLabel($customer),
                ];
            })
            ->values();

        return response()->json($customers);
    }

    private function validateCustomer(
        Request $request,
        ?Client $client = null
    ): array {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('clients', 'phone')
                    ->ignore($client?->id),
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('clients', 'email')
                    ->ignore($client?->id),
            ],

            'nid_no' => [
                'nullable',
                'string',
                'max:255',
            ],

            'passport_no' => [
                'nullable',
                'string',
                'max:255',
            ],

            'tin_no' => [
                'nullable',
                'string',
                'max:255',
            ],

            'date_of_birth' => [
                'nullable',
                'date',
            ],

            'gender' => [
                'nullable',
                Rule::in([
                    'male',
                    'female',
                    'other',
                ]),
            ],

            'marital_status' => [
                'nullable',
                Rule::in([
                    'single',
                    'married',
                    'divorced',
                    'widowed',
                ]),
            ],

            'profession_id' => [
                'nullable',
                'integer',
                'exists:professions,id',
            ],

            'lead_designation_id' => [
                'nullable',
                'integer',
                'exists:lead_designations,id',
            ],

            'company_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'present_address' => [
                'nullable',
                'string',
            ],

            'permanent_address' => [
                'nullable',
                'string',
            ],

            'area_id' => [
                'nullable',
                'integer',
                'exists:areas,id',
            ],

            'sector_id' => [
                'nullable',
                'integer',
                'exists:sectors,id',
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);
    }

    private function generateCustomerCode(): string
    {
        $lastCustomer = Client::query()
            ->whereNotNull('client_no')
            ->where('client_no', 'like', 'CUST-%')
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        $nextNumber = 1;

        if (
            $lastCustomer &&
            preg_match(
                '/^CUST-(\d+)$/',
                $lastCustomer->client_no,
                $matches
            )
        ) {
            $nextNumber = (int) $matches[1] + 1;
        }

        do {
            $customerCode = 'CUST-' . str_pad(
                (string) $nextNumber,
                6,
                '0',
                STR_PAD_LEFT
            );

            $nextNumber++;
        } while (
            Client::query()
                ->where('client_no', $customerCode)
                ->exists()
        );

        return $customerCode;
    }

    private function customerLabel(Client $customer): string
    {
        return $customer->client_no
            ? "{$customer->client_no} - {$customer->name}"
            : $customer->name;
    }

    private function deleteImage(?string $image): void
    {
        if (!$image) {
            return;
        }

        $disk = Storage::disk('public');

        if ($disk->exists($image)) {
            $disk->delete($image);
        }
    }
}
