<?php

namespace App\Http\Controllers;

use App\Exports\LeadExport;
use App\Models\Area;
use App\Models\Client;
use App\Models\GroqApiKey;
use App\Models\Lead;
use App\Models\LeadDesignation;
use App\Models\LeadSource;
use App\Models\LeadStage;
use App\Models\Product;
use App\Models\Profession;
use App\Models\Sector;
use App\Models\User;
use App\Services\GroqCardParser;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class LeadController extends Controller
{
    public User $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();

            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $this->authorizePermission('lead.list');

        $query = Lead::accessible(auth()->user())
            ->with([
                'createdBy:id,employee_id,name',
                'assignedUser:id,employee_id,name',
                'stage:id,name,order,color',
                'leadSource:id,name',
                'designation:id,name',
                'profession:id,name',
                'area:id,name',
                'sector:id,name',
            ]);

        // ===== Filters =====

        if ($request->has('lead') && !empty($request->input('lead'))) {
            $query->where('id', $request->input('lead'));
        }

        if ($request->has('source') && !empty($request->input('source'))) {
            $query->where('source_id', $request->input('source'));
        }

        if ($request->has('stage') && !empty($request->input('stage'))) {
            $query->where('stage_id', $request->input('stage'));
        }

        if ($request->has('sector') && !empty($request->input('sector'))) {
            $query->where('sector_id', $request->input('sector'));
        }

        if ($request->has('area') && !empty($request->input('area'))) {
            $query->where('area_id', $request->input('area'));
        }

        if ($request->has('profession') && !empty($request->input('profession'))) {
            $query->where('profession_id', $request->input('profession'));
        }

        if ($request->has('designation') && !empty($request->input('designation'))) {
            $query->where('designation_id', $request->input('designation'));
        }

        if ($request->has('user') && !empty($request->input('user'))) {
            $query->where('created_by', $request->input('user'));
        }

        if ($request->filled('product')) {
            $query->whereHas('leadProducts', function ($q) use ($request) {
                $q->where('product_id', $request->input('product'));
            });
        }

        if ($request->has('sorting') && !empty($request->input('sorting'))) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        }

        if ($request->has('interest') && !empty($request->input('interest'))) {
            $query->where('interest_level', $request->input('interest'));
        }

        if ($request->has('priority') && !empty($request->input('priority'))) {
            $query->where('priority', $request->input('priority'));
        }

        // Apply date range filter only if both dates are provided
        if ($request->filled('dates')) {
            $date = $request->input('dates');

            if (str_contains($date, 'to')) {
                [$start, $end] = array_map(
                    'trim',
                    explode('to', $date)
                );

                $query->whereBetween(
                    'created_at',
                    [
                        Carbon::parse($start)->startOfDay(),
                        Carbon::parse($end)->endOfDay(),
                    ]
                );
            } else {
                $query->whereDate(
                    'created_at',
                    Carbon::parse($date)
                );
            }
        }

        // Get the total number of leads for this que
        $numberOfLeads = $query->count();

        // Paginate with 200 records per page
        $leads = $query->latest()->paginate(200);

        $selectedLead = $request->filled('lead')
            ? Lead::query()
                ->select(['id', 'name', 'lead_code'])
                ->find($request->input('lead'))
            : null;

        $selectedSector = $request->filled('sector')
            ? Sector::query()
                ->select(['id', 'name'])
                ->find($request->input('sector'))
            : null;

        $selectedArea = $request->filled('area')
            ? Area::query()
                ->select(['id', 'name'])
                ->find($request->input('area'))
            : null;

        $selectedProfession = $request->filled('profession')
            ? Profession::query()
                ->select(['id', 'name'])
                ->find($request->input('profession'))
            : null;

        $selectedDesignation = $request->filled('designation')
            ? LeadDesignation::query()
                ->select(['id', 'name'])
                ->find($request->input('designation'))
            : null;

        $selectedUser = $request->filled('user')
            ? User::query()
                ->select(['id', 'name', 'employee_id'])
                ->find($request->input('user'))
            : null;

        $selectedProduct = $request->filled('product')
            ? Product::query()
                ->select(['id', 'name'])
                ->find($request->input('product'))
            : null;

        // For Exporting Data
        session(['filtered_leads' => $leads->items()]);

        $stages = LeadStage::orderBy('order', 'asc')->get();

        $sources = LeadSource::orderBy('name', 'asc')->get();

        return Inertia::render('crm/leads/index', [
            'leads' => $leads,
            'stages' => $stages,
            'sources' => $sources,
            'numberOfLeads' => $numberOfLeads,
            'filters' => [
                'lead' => $selectedLead,
                'source' => $request->source,
                'stage' => $request->stage,
                'priority' => $request->priority,
                'interest' => $request->interest,
                'sector' => $selectedSector,
                'area' => $selectedArea,
                'profession' => $selectedProfession,
                'designation' => $selectedDesignation,
                'user' => $selectedUser,
                'product' => $selectedProduct,
                'sorting' => $request->sorting,
                'dates' => $request->dates,

            ],
        ]);

    }

    public function create()
    {
        if (is_null($this->user) || !$this->user->can('lead.create')) {
            abort('403', 'Unauthorized access');
        }

        $data = [];
        $data['lead'] = null;
        $data['sources'] = LeadSource::orderBy('name', 'asc')->get();
        $data['stages'] = LeadStage::orderBy('order', 'asc')->get();
        $data['sectors'] = Sector::orderBy('name', 'asc')->get();
        $data['areas'] = Area::orderBy('name', 'asc')->get();
        $data['professions'] = Profession::orderBy('name', 'asc')->get();
        $data['designations'] = LeadDesignation::orderBy('name', 'asc')->get();

        return Inertia::render('crm/leads/create-lead', [
            'professions' => $data['professions'],
            'designations' => $data['designations'],
            'sources' => $data['sources'],
            'sectors' => $data['sectors'],
            'areas' => $data['areas'],
            'stages' => $data['stages'],
            'hasGroqApiKey' => GroqApiKey::query()->exists(),
        ]);

    }

    public function store(Request $request)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('lead.create')
        ) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'company_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            /*
            |--------------------------------------------------------------------------
            | Primary Phone
            |--------------------------------------------------------------------------
            */

            'phone' => [
                'required',
                'regex:/^01[3-9]\d{8}$/',
                'unique:leads,phone',
                'unique:leads,phone_secondary',
                'unique:leads,phone_foreign',
            ],

            /*
            |--------------------------------------------------------------------------
            | Secondary Phone
            |--------------------------------------------------------------------------
            */

            'phone_secondary' => [
                'nullable',
                'regex:/^01[3-9]\d{8}$/',
                'unique:leads,phone',
                'unique:leads,phone_secondary',
                'unique:leads,phone_foreign',
                'different:phone',
            ],

            /*
            |--------------------------------------------------------------------------
            | Foreign Phone
            |--------------------------------------------------------------------------
            */

            'phone_foreign' => [
                'nullable',
                'regex:/^\+?[0-9]{5,15}$/',
                'unique:leads,phone',
                'unique:leads,phone_secondary',
                'unique:leads,phone_foreign',
                'different:phone',
                'different:phone_secondary',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:leads,email',
            ],

            'area' => [
                'nullable',
                'exists:areas,id',
            ],

            'sector' => [
                'nullable',
                'exists:sectors,id',
            ],

            'profession' => [
                'nullable',
                'exists:professions,id',
            ],

            'designation' => [
                'nullable',
                'exists:lead_designations,id',
            ],

            'source' => [
                'nullable',
                'exists:lead_sources,id',
            ],

            'stage' => [
                'required',
                'exists:lead_stages,id',
            ],

            'priority' => [
                'required',
                'in:low,medium,high',
            ],

            'interest_level' => [
                'nullable',
                'in:cold,warm,hot',
            ],

            'next_follow_up_at' => [
                'nullable',
                'date',
                'after:today',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Optional Multiple Products
            |--------------------------------------------------------------------------
            */

            'items' => [
                'nullable',
                'array',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',
                'exists:products,id',
            ],

            'items.*.quantity' => [
                'nullable',
                'numeric',
                'gt:0',
            ],

            'items.*.estimated_price_per_unit' => [
                'nullable',
                'numeric',
                'min:0',
            ],
        ]);

        DB::transaction(function () use ($validated) {
            /*
            |--------------------------------------------------------------------------
            | Generate Lead Code
            |--------------------------------------------------------------------------
            */

            $year = now()->format('y');

            $lastLead = Lead::query()
                ->where(
                    'lead_code',
                    'like',
                    "L{$year}%",
                )
                ->lockForUpdate()
                ->latest('id')
                ->first();

            $lastNumber = $lastLead
                ? (int) substr($lastLead->lead_code, 3)
                : 0;

            $leadCode =
                'L' .
                $year .
                str_pad(
                    $lastNumber + 1,
                    6,
                    '0',
                    STR_PAD_LEFT,
                );

            /*
            |--------------------------------------------------------------------------
            | Create Lead
            |--------------------------------------------------------------------------
            */

            $lead = Lead::create([
                'lead_code' => $leadCode,
                'name' => $validated['name'],
                'company_name' => $validated['company_name'] ?? null,
                'phone' => $validated['phone'],
                'phone_secondary' => $validated['phone_secondary'] ?? null,
                'phone_foreign' => $validated['phone_foreign'] ?? null,
                'email' => $validated['email'] ?? null,
                'area_id' => $validated['area'] ?? null,
                'sector_id' => $validated['sector'] ?? null,
                'profession_id' => $validated['profession'] ?? null,
                'designation_id' => $validated['designation'] ?? null,
                'source_id' => $validated['source'] ?? null,
                'stage_id' => $validated['stage'],
                'priority' => $validated['priority'],
                'interest_level' => $validated['interest_level'] ?? null,
                'next_follow_up_at' => !empty($validated['next_follow_up_at'])
                    ? Carbon::parse(
                        $validated['next_follow_up_at'],
                    )
                    : null,
                'remarks' => $validated['remarks'] ?? null,
                'address' => $validated['address'] ?? null,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Save Lead Products
            |--------------------------------------------------------------------------
            */

            $productIds = collect(
                $validated['items'] ?? [],
            )->pluck('product_id');

            $products = Product::query()
                ->with([
                    'unit:id,name',
                ])
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            foreach ($validated['items'] ?? [] as $item) {
                $product = $products->get(
                    $item['product_id'],
                );

                $lead->leadProducts()->create([
                    'product_id' => $product->id,
                    'product_code' => $product->code,
                    'product_name' => $product->name,
                    'unit' => $product->unit?->name,
                    'quantity' => $item['quantity'] ?? null,
                    'estimated_price_per_unit' => $item['estimated_price_per_unit'] ?? null,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Follow-up Notification and Conversation
            |--------------------------------------------------------------------------
            */

            if (!empty($validated['next_follow_up_at'])) {
                $nextFollowUpAt = Carbon::parse(
                    $validated['next_follow_up_at'],
                );

                DB::table(
                    'lead_followup_notifications',
                )->insert([
                            'lead_id' => $lead->id,
                            'user_id' => $lead->assigned_to ??
                                auth()->id(),
                            'notify_at' => $nextFollowUpAt,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                DB::table('lead_conversations')->insert([
                    'lead_id' => $lead->id,
                    'user_id' => auth()->id(),
                    'channel' => 'note',
                    'message' => $validated['remarks'] ??
                        'Follow-up at: ' .
                        $nextFollowUpAt->format(
                            'd M Y h:i A',
                        ),
                    'requires_follow_up' => true,
                    'next_follow_up_at' => $nextFollowUpAt,
                    'stage_id' => $validated['stage'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Auto Convert To Customer
            |--------------------------------------------------------------------------
            */

            $stage = LeadStage::find(
                $validated['stage'],
            );

            if (
                !$stage ||
                !$stage->is_convert_to_customer ||
                $lead->is_converted
            ) {
                return;
            }

            $client = Client::query()
                ->where('lead_id', $lead->id)
                ->orWhere('phone', $lead->phone)
                ->first();

            if (!$client) {
                $clientYear = now()->format('y');

                $lastClient = Client::query()
                    ->where(
                        'client_no',
                        'like',
                        "C{$clientYear}%",
                    )
                    ->lockForUpdate()
                    ->latest('id')
                    ->first();

                $lastClientNumber = $lastClient
                    ? (int) substr(
                        $lastClient->client_no,
                        3,
                    )
                    : 0;

                $clientNo =
                    'C' .
                    $clientYear .
                    str_pad(
                        $lastClientNumber + 1,
                        6,
                        '0',
                        STR_PAD_LEFT,
                    );

                $client = Client::create([
                    'client_no' => $clientNo,
                    'lead_id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'email' => $lead->email,
                    'profession_id' => $lead->profession_id,
                    'designation_id' => $lead->designation_id,
                    'area_id' => $lead->area_id,
                    'sector_id' => $lead->sector_id,
                    'present_address' => $lead->address,
                    'permanent_address' => $lead->address,
                    'status' => 'active',
                    'created_by' => auth()->id(),
                ]);
            }

            $lead->update([
                'is_converted' => true,
                'converted_at' => now(),

                /*
                | Your `leads` migration has `customer_id`, not `client_id`.
                */

                'customer_id' => $client->id,
                'updated_by' => auth()->id(),
            ]);
        });

        return redirect()
            ->back()
            ->with('notification', [
                'message' => 'New lead saved successfully.',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
    }

    public function show($id)
    {
        if (is_null($this->user) || !$this->user->can('lead.view')) {
            abort('403', 'Unauthorized access');
        }

        $lead = Lead::with([
            'leadStage:id,name,color',
            'leadSource:id,name',
            'profession:id,name',
            'designation:id,name',
            'area:id,name',
            'sector:id,name',
            'leadProducts:id,lead_id,product_id,product_code,product_name,unit,quantity,estimated_price_per_unit,remarks',
            'leadProducts.product:id,code,name',
            'assignedUser:id,name',
            'createdBy:id,name',
            'updatedby:id,name',
        ])->findOrFail($id);

        return response()->json([
            'id' => $lead->id,
            'lead_code' => $lead->lead_code,
            'name' => $lead->name,
            'company_name' => $lead->company_name,
            'phone' => $lead->phone,
            'phone_secondary' => $lead->phone_secondary,
            'phone_foreign' => $lead->phone_foreign,
            'email' => $lead->email,
            'address' => $lead->address,

            /*
            |--------------------------------------------------------------------------
            | Location
            |--------------------------------------------------------------------------
            */

            'area' => $lead->area?->name,
            'sector' => $lead->sector?->name,
            'area_id' => $lead->area_id,
            'sector_id' => $lead->sector_id,

            /*
            |--------------------------------------------------------------------------
            | Others
            |--------------------------------------------------------------------------
            */

            'profession' => $lead->profession?->name,
            'designation' => $lead->designation?->name,
            'source' => $lead->leadSource?->name,
            'stage' => $lead->leadStage?->name,
            'stage_color' => $lead->leadStage?->color,

            'assigned_to' => $lead->assignedUser?->name,
            'created_by' => $lead->createdBy?->name,
            'updated_by' => $lead->updatedby?->name,

            'priority' => $lead->priority,
            'interest_level' => $lead->interest_level,

            'last_contacted_at' => $lead->last_contacted_at,
            'next_follow_up_at' => $lead->next_follow_up_at,
            'remarks' => $lead->remarks,

            'is_converted' => $lead->is_converted,
            'converted_at' => $lead->converted_at,
            'created_at' => $lead->created_at,
            'updated_at' => $lead->updated_at,

            /*
            |--------------------------------------------------------------------------
            | Interested Products
            |--------------------------------------------------------------------------
            */

            'products' => $lead->leadProducts
                ->map(function ($leadProduct) {
                    return [
                        'id' => $leadProduct->id,
                        'product_id' => $leadProduct->product_id,
                        'code' => $leadProduct->product_code,
                        'name' => $leadProduct->product_name,
                        'unit' => $leadProduct->unit,
                        'quantity' => $leadProduct->quantity,
                        'estimated_price_per_unit' => $leadProduct->estimated_price_per_unit,
                        'remarks' => $leadProduct->remarks,
                    ];
                })
                ->values(),
        ]);
    }

    public function edit(Lead $lead)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('lead.edit')
        ) {
            abort(403, 'Unauthorized access');
        }

        $lead->load([
            'leadProducts:id,lead_id,product_id,product_code,product_name,unit,quantity,estimated_price_per_unit',
            'designation:id,name',
            'area:id,name',
            'sector:id,name',
            'profession:id,name',
            'leadSource:id,name',
        ]);

        return Inertia::render(
            'crm/leads/edit-lead',
            [
                'lead' => $lead,

                'sources' => LeadSource::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),

                'stages' => LeadStage::query()
                    ->orderBy('order')
                    ->get([
                        'id',
                        'name',
                        'color',
                    ]),

                'sectors' => Sector::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),

                'areas' => Area::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),

                'professions' => Profession::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),

                'designations' => LeadDesignation::query()
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                    ]),
            ],
        );
    }

    public function update(Request $request, Lead $lead)
    {
        if (
            is_null($this->user) ||
            !$this->user->can('lead.edit')
        ) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'company_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone_secondary' => [
                'nullable',
                'regex:/^01[3-9]\d{8}$/',
                Rule::unique('leads', 'phone')
                    ->ignore($lead->id),
                Rule::unique('leads', 'phone_secondary')
                    ->ignore($lead->id),
                Rule::unique('leads', 'phone_foreign')
                    ->ignore($lead->id),
                'different:phone',
                function ($attribute, $value, $fail) use ($lead) {
                    if (
                        $lead->phone_secondary &&
                        $value !== $lead->phone_secondary
                    ) {
                        $fail(
                            'You cannot change the secondary phone number once it is saved.',
                        );
                    }
                },
            ],

            'phone_foreign' => [
                'nullable',
                'regex:/^\+?[0-9]{5,15}$/',
                Rule::unique('leads', 'phone')
                    ->ignore($lead->id),
                Rule::unique('leads', 'phone_secondary')
                    ->ignore($lead->id),
                Rule::unique('leads', 'phone_foreign')
                    ->ignore($lead->id),
                'different:phone',
                'different:phone_secondary',
                function ($attribute, $value, $fail) use ($lead) {
                    if (
                        $lead->phone_foreign &&
                        $value !== $lead->phone_foreign
                    ) {
                        $fail(
                            'You cannot change the foreign phone number once it is saved.',
                        );
                    }
                },
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('leads', 'email')
                    ->ignore($lead->id),
            ],

            'area' => [
                'nullable',
                'exists:areas,id',
            ],

            'sector' => [
                'nullable',
                'exists:sectors,id',
            ],

            'profession' => [
                'nullable',
                'exists:professions,id',
            ],

            'designation' => [
                'nullable',
                'exists:lead_designations,id',
            ],

            'source' => [
                'nullable',
                'exists:lead_sources,id',
            ],

            'stage' => [
                'required',
                'exists:lead_stages,id',
            ],

            'priority' => [
                'required',
                'in:low,medium,high',
            ],

            'interest_level' => [
                'nullable',
                'in:cold,warm,hot',
            ],

            'next_follow_up_at' => [
                'nullable',
                'date',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Optional Multiple Products
            |--------------------------------------------------------------------------
            */

            'items' => [
                'nullable',
                'array',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',
                'exists:products,id',
            ],

            'items.*.quantity' => [
                'nullable',
                'numeric',
                'gt:0',
            ],

            'items.*.estimated_price_per_unit' => [
                'nullable',
                'numeric',
                'min:0',
            ],
        ]);

        DB::transaction(function () use ($lead, $validated) {
            $lead->update([
                'name' => $validated['name'],
                'company_name' => $validated['company_name'] ?? null,
                'phone_secondary' => $validated['phone_secondary'] ?? null,
                'phone_foreign' => $validated['phone_foreign'] ?? null,
                'email' => $validated['email'] ?? null,
                'area_id' => $validated['area'] ?? null,
                'sector_id' => $validated['sector'] ?? null,
                'profession_id' => $validated['profession'] ?? null,
                'designation_id' => $validated['designation'] ?? null,
                'source_id' => $validated['source'] ?? null,
                'stage_id' => $validated['stage'],
                'priority' => $validated['priority'],
                'interest_level' => $validated['interest_level'] ?? null,
                'next_follow_up_at' => $validated['next_follow_up_at'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
                'address' => $validated['address'] ?? null,
                'updated_by' => auth()->id(),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Replace Lead Products
            |--------------------------------------------------------------------------
            */

            $lead->leadProducts()->delete();

            $productIds = collect(
                $validated['items'] ?? [],
            )->pluck('product_id');

            $products = Product::query()
                ->with('unit:id,name')
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            foreach ($validated['items'] ?? [] as $item) {
                $product = $products->get(
                    $item['product_id'],
                );

                $lead->leadProducts()->create([
                    'product_id' => $product->id,
                    'product_code' => $product->code,
                    'product_name' => $product->name,
                    'unit' => $product->unit?->name,
                    'quantity' => $item['quantity'] ?? null,
                    'estimated_price_per_unit' => $item['estimated_price_per_unit'] ?? null,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Auto Convert To Customer
            |--------------------------------------------------------------------------
            */

            $stage = LeadStage::find(
                $validated['stage'],
            );

            if (
                !$stage ||
                !$stage->is_convert_to_customer ||
                $lead->is_converted
            ) {
                return;
            }

            $client = Client::query()
                ->where('lead_id', $lead->id)
                ->orWhere('phone', $lead->phone)
                ->first();

            if (!$client) {
                $year = now()->format('y');

                $lastClient = Client::query()
                    ->where(
                        'client_no',
                        'like',
                        "C{$year}%",
                    )
                    ->lockForUpdate()
                    ->latest('id')
                    ->first();

                $lastNumber = $lastClient
                    ? (int) substr(
                        $lastClient->client_no,
                        3,
                    )
                    : 0;

                $clientNo =
                    'C' .
                    $year .
                    str_pad(
                        $lastNumber + 1,
                        6,
                        '0',
                        STR_PAD_LEFT,
                    );

                $client = Client::create([
                    'client_no' => $clientNo,
                    'lead_id' => $lead->id,
                    'name' => $lead->name,
                    'phone' => $lead->phone,
                    'email' => $lead->email,
                    'profession_id' => $lead->profession_id,
                    'designation_id' => $lead->designation_id,
                    'area_id' => $lead->area_id,
                    'sector_id' => $lead->sector_id,
                    'present_address' => $lead->address,
                    'permanent_address' => $lead->address,
                    'status' => 'active',
                    'created_by' => auth()->id(),
                ]);
            }

            $lead->update([
                'is_converted' => true,
                'converted_at' => now(),

                /*
                | Your leads table has `customer_id`.
                */

                'customer_id' => $client->id,
                'updated_by' => auth()->id(),
            ]);
        });

        return redirect()
            ->back()
            ->with('notification', [
                'message' => 'Lead updated successfully.',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
    }

    public function destroy(Lead $lead)
    {
        if (is_null($this->user) || !$this->user->can('lead.delete')) {
            abort('403', 'Unauthorized access');
        }

        $deleteLead = $lead->delete();

        if ($deleteLead) {

            $notification = [
                'message' => 'Lead deleted successfully.',
                'type' => 'success',
            ];

            return redirect()->back()->with($notification);
        }
    }

    public function assigned(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('lead.assigned')) {
            abort(403, 'Unauthorized access');
        }

        $filters = $request->only([
            'lead',
            'user',
            'assignedStatus',
            'dates',
        ]);

        $query = Lead::accessible(auth()->user())
            ->with([
                'assignedUser:id,name,employee_id',
                'createdBy:id,name,employee_id',
                'leadSource:id,name',
                'leadStage:id,name,color',
                'profession:id,name',
            ])
            ->select([
                'id',
                'name',
                'phone',
                'source_id',
                'stage_id',
                'priority',
                'interest_level',
                'profession_id',
                'assigned_to',
                'created_by',
                'created_at',
            ]);

        if ($request->has('lead') && !empty($request->input('lead'))) {
            $query->where('id', $request->input('lead'));
        }

        if ($request->has('assignedStatus') && $request->input('assignedStatus') == 'assigned') {
            $query->whereNotNull('assigned_to');
        } else {
            $query->whereNull('assigned_to');
        }

        if ($request->has('user') && !empty($request->input('user'))) {
            $query->where('assigned_to', $request->input('user'));
        }

        // if ($request->filled('lead')) {
        //     $query->where('id', $request->input('lead'));
        // }

        // if ($request->input('assignedStatus') === 'assigned') {
        //     $query->whereNotNull('assigned_to');
        // } elseif ($request->input('assignedStatus') === 'non_assigned') {
        //     $query->whereNull('assigned_to');
        // }

        // if ($request->filled('user')) {
        //     $query->where(
        //         'assigned_to',
        //         $request->input('user')
        //     );
        // }

        if ($request->filled('dates')) {
            $date = $request->input('dates');

            if (str_contains($date, 'to')) {
                [$start, $end] = array_map(
                    'trim',
                    explode('to', $date)
                );

                $query->whereBetween(
                    'created_at',
                    [
                        Carbon::parse($start)->startOfDay(),
                        Carbon::parse($end)->endOfDay(),
                    ]
                );
            } else {
                $query->whereDate(
                    'created_at',
                    Carbon::parse($date)
                );
            }
        }

        $numberOfLeads = (clone $query)->count();

        $leads = $query
            ->latest('created_at')
            ->paginate(30)
            ->withQueryString();

        $selectedLead = $request->filled('lead')
            ? Lead::query()
                ->select(['id', 'name', 'phone'])
                ->find($request->input('lead'))
            : null;

        $selectedUser = $request->filled('user')
            ? User::query()
                ->select(['id', 'name', 'employee_id'])
                ->find($request->input('user'))
            : null;


        return Inertia::render(
            'crm/leads/lead-assign',
            [
                'leads' => $leads,
                'numberOfLeads' => $numberOfLeads,
                'filters' => [
                    'lead' => $selectedLead,
                    'user' => $selectedUser,
                    'dates' => $request->dates,
                    'assignedStatus' => $request->assignedStatus,
                ],
            ]
        );
    }

    public function bulkAssign(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('lead.assigned')) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:leads,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        Lead::accessible(auth()->user())
            ->whereIn('id', $validated['ids'])
            ->update([
                'assigned_to' => $validated['user_id'],
            ]);

        return back()->with(
            'notification',
            [
                'message' => 'Leads assigned successfully.',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]
        );
    }

    public function bulkUnassign(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('lead.assigned')) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:leads,id'],
        ]);

        Lead::accessible(auth()->user())
            ->whereIn('id', $validated['ids'])
            ->update([
                'assigned_to' => null,
            ]);

        return back()->with(
            'notification',
            [
                'message' => 'Leads unassigned successfully.',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]
        );
    }

    public function getLeads(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('lead.list')) {
            abort(403, 'Unauthorized access');
        }

        $keyword = trim($request->keyword);

        $leads = Lead::accessible(auth()->user())
            ->select('id', 'lead_code', 'name', 'phone', 'company_name')
            ->when($keyword, function ($query) use ($keyword) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                        ->orWhere('lead_code', 'like', "%{$keyword}%")
                        ->orWhere('phone', 'like', "%{$keyword}%")
                        ->orWhere('company_name', 'like', "%{$keyword}%");
                });
            })
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($leads);
    }

    // Untouch Lead
    public function untouch(Request $request)
    {

        if (is_null($this->user) || !$this->user->can('lead.untouch')) {
            abort('403', 'Unauthorized access');
        }

        // Get sorting input, default = today
        $sort_at = $request->input('sort_at');

        $query = Lead::accessible(auth()->user())
            ->with([
                'assignedUser:id,name,employee_id',
                'leadSource:id,name',
                'leadStage:id,name,color',
            ])
            ->whereDoesntHave('leadConversations')
            ->select([
                'id',
                'name',
                'source_id',
                'stage_id',
                'priority',
                'interest_level',
                'assigned_to',
                'last_contacted_at',
                'next_follow_up_at',
                'created_at',
            ]);

        // Apply sorting filter
        switch ($sort_at) {
            case 'today':
                $query->whereDate('created_at', today());
                break;

            case 'this_week':
                // Week = Saturday → Friday
                $start = now()->copy()->startOfWeek(Carbon::SATURDAY);
                $end = $start->copy()->next(Carbon::FRIDAY)->endOfDay();
                $query->whereBetween('created_at', [$start, $end]);
                break;

            case 'next_week':
                $start = now()->copy()->addWeek()->startOfWeek(Carbon::SATURDAY);
                $end = $start->copy()->next(Carbon::FRIDAY)->endOfDay();
                $query->whereBetween('created_at', [$start, $end]);
                break;

            case 'this_month':
                $start = now()->copy()->startOfMonth();
                $end = now()->copy()->endOfMonth();
                $query->whereBetween('created_at', [$start, $end]);
                break;

            case 'next_month':
                $start = now()->copy()->addMonth()->startOfMonth();
                $end = now()->copy()->addMonth()->endOfMonth();
                $query->whereBetween('created_at', [$start, $end]);
                break;

            case 'this_year':
                $start = now()->copy()->startOfYear();
                $end = now()->copy()->endOfYear();
                $query->whereBetween('created_at', [$start, $end]);
                break;

            case 'next_year':
                $start = now()->copy()->addYear()->startOfYear();
                $end = now()->copy()->addYear()->endOfYear();
                $query->whereBetween('created_at', [$start, $end]);
                break;

            case 'after_next_year':
                $query->where('created_at', '>', now()->copy()->addYear()->endOfYear());
                break;

            default:
                break;
        }


        if ($request->has('lead') && !empty($request->input('lead'))) {
            $query->where('id', $request->input('lead'));
        }

        if ($request->has('source') && !empty($request->input('source'))) {
            $query->where('source_id', $request->input('source'));
        }

        if ($request->has('stage') && !empty($request->input('stage'))) {
            $query->where('stage_id', $request->input('stage'));
        }

        if ($request->has('sector') && !empty($request->input('sector'))) {
            $query->where('sector_id', $request->input('sector'));
        }

        if ($request->has('area') && !empty($request->input('area'))) {
            $query->where('area_id', $request->input('area'));
        }

        if ($request->has('profession') && !empty($request->input('profession'))) {
            $query->where('profession_id', $request->input('profession'));
        }

        if ($request->has('designation') && !empty($request->input('designation'))) {
            $query->where('designation_id', $request->input('designation'));
        }

        if ($request->has('user') && !empty($request->input('user'))) {
            $query->where('assigned_to', $request->input('user'));
        }

        if ($request->filled('product')) {
            $query->whereHas('leadProducts', function ($q) use ($request) {
                $q->where('product_id', $request->input('product'));
            });
        }

        if ($request->has('sorting') && !empty($request->input('sorting'))) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        }

        if ($request->has('interest') && !empty($request->input('interest'))) {
            $query->where('interest_level', $request->input('interest'));
        }

        if ($request->has('priority') && !empty($request->input('priority'))) {
            $query->where('priority', $request->input('priority'));
        }

        // Apply date range filter only if both dates are provided
        if ($request->filled('dates')) {
            $date = $request->input('dates');

            if (str_contains($date, 'to')) {
                [$start, $end] = array_map(
                    'trim',
                    explode('to', $date)
                );

                $query->whereBetween(
                    'created_at',
                    [
                        Carbon::parse($start)->startOfDay(),
                        Carbon::parse($end)->endOfDay(),
                    ]
                );
            } else {
                $query->whereDate(
                    'created_at',
                    Carbon::parse($date)
                );
            }
        }


        // Get the total number of leads for this que
        $numberOfLeads = $query->count();

        // Paginate with 200 records per page
        $leads = $query->latest()->paginate(30);

        $selectedLead = $request->filled('lead')
            ? Lead::query()
                ->select(['id', 'name', 'lead_code'])
                ->find($request->input('lead'))
            : null;

        $selectedSector = $request->filled('sector')
            ? Sector::query()
                ->select(['id', 'name'])
                ->find($request->input('sector'))
            : null;

        $selectedArea = $request->filled('area')
            ? Area::query()
                ->select(['id', 'name'])
                ->find($request->input('area'))
            : null;

        $selectedProfession = $request->filled('profession')
            ? Profession::query()
                ->select(['id', 'name'])
                ->find($request->input('profession'))
            : null;

        $selectedDesignation = $request->filled('designation')
            ? LeadDesignation::query()
                ->select(['id', 'name'])
                ->find($request->input('designation'))
            : null;

        $selectedUser = $request->filled('user')
            ? User::query()
                ->select(['id', 'name', 'employee_id'])
                ->find($request->input('user'))
            : null;

        $selectedProduct = $request->filled('product')
            ? Product::query()
                ->select(['id', 'name'])
                ->find($request->input('product'))
            : null;


        $stages = LeadStage::orderBy('order', 'asc')->get();

        $sources = LeadSource::orderBy('name', 'asc')->get();

        return Inertia::render(
            'crm/leads/lead-untouch',
            [
                'leads' => $leads,
                'numberOfLeads' => $numberOfLeads,
                'stages' => $stages,
                'sources' => $sources,
                'filters' => [
                    'lead' => $selectedLead,
                    'source' => $request->source,
                    'stage' => $request->stage,
                    'priority' => $request->priority,
                    'interest' => $request->interest,
                    'sector' => $selectedSector,
                    'area' => $selectedArea,
                    'profession' => $selectedProfession,
                    'designation' => $selectedDesignation,
                    'user' => $selectedUser,
                    'product' => $selectedProduct,
                    'sorting' => $request->sorting,
                    'sort_at' => $request->sort_at,
                    'dates' => $request->dates,
                ],
            ],
        );

        // return view('pages.lead.un_touch_lead', compact('leads', 'numberOfLeads', 'stages'))->with('request', $request);
    }

    // follow-up-due Lead
    public function followUpDue(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('lead.follow-up-due')) {
            abort('403', 'Unauthorized access');
        }

        // Get sorting input, default = today
        $sort_at = $request->input('sort_at');

        $query = Lead::accessible(auth()->user())
            ->with([
                'assignedUser:id,name,employee_id',
                'leadSource:id,name',
                'leadStage:id,name,color',
            ])
            ->whereNotNull('next_follow_up_at')
            ->where('next_follow_up_at', '<=', now())
            ->select([
                'id',
                'name',
                'source_id',
                'stage_id',
                'priority',
                'interest_level',
                'assigned_to',
                'last_contacted_at',
                'next_follow_up_at',
                'created_at',
            ]);

        // Apply sorting filter
        switch ($sort_at) {
            case 'yesterday':
                $start = now()->copy()->subDay()->startOfDay();
                $end = now()->copy()->subDay()->endOfDay();

                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'this_week':
                // Week = Saturday → Friday
                $start = now()->copy()->startOfWeek(Carbon::SATURDAY);
                $end = $start->copy()->next(Carbon::FRIDAY)->endOfDay();

                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'this_month':
                $start = now()->copy()->startOfMonth();
                $end = now()->copy()->endOfMonth();

                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'this_year':
                $start = now()->copy()->startOfYear();
                $end = now()->copy()->endOfYear();

                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'previous_year':
                $start = now()->copy()->subYear()->startOfYear();
                $end = now()->copy()->subYear()->endOfYear();

                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'after_previous_year':
                // Before the previous calendar year
                $end = now()->copy()->subYear()->startOfYear();

                $query->where('next_follow_up_at', '<', $end);
                break;

            default:
                break;
        }


        if ($request->has('lead') && !empty($request->input('lead'))) {
            $query->where('id', $request->input('lead'));
        }

        if ($request->has('source') && !empty($request->input('source'))) {
            $query->where('source_id', $request->input('source'));
        }

        if ($request->has('stage') && !empty($request->input('stage'))) {
            $query->where('stage_id', $request->input('stage'));
        }

        if ($request->has('sector') && !empty($request->input('sector'))) {
            $query->where('sector_id', $request->input('sector'));
        }

        if ($request->has('area') && !empty($request->input('area'))) {
            $query->where('area_id', $request->input('area'));
        }

        if ($request->has('profession') && !empty($request->input('profession'))) {
            $query->where('profession_id', $request->input('profession'));
        }

        if ($request->has('designation') && !empty($request->input('designation'))) {
            $query->where('designation_id', $request->input('designation'));
        }

        if ($request->has('user') && !empty($request->input('user'))) {
            $query->where('assigned_to', $request->input('user'));
        }

        if ($request->filled('product')) {
            $query->whereHas('leadProducts', function ($q) use ($request) {
                $q->where('product_id', $request->input('product'));
            });
        }

        if ($request->has('sorting') && !empty($request->input('sorting'))) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        }

        if ($request->has('interest') && !empty($request->input('interest'))) {
            $query->where('interest_level', $request->input('interest'));
        }

        if ($request->has('priority') && !empty($request->input('priority'))) {
            $query->where('priority', $request->input('priority'));
        }

        // Apply date range filter only if both dates are provided
        if ($request->filled('dates')) {
            $date = $request->input('dates');

            if (str_contains($date, 'to')) {
                [$start, $end] = array_map(
                    'trim',
                    explode('to', $date)
                );

                $query->whereBetween(
                    'created_at',
                    [
                        Carbon::parse($start)->startOfDay(),
                        Carbon::parse($end)->endOfDay(),
                    ]
                );
            } else {
                $query->whereDate(
                    'created_at',
                    Carbon::parse($date)
                );
            }
        }

        // Get the total number of leads for this que
        $numberOfLeads = $query->count();

        // Paginate with 200 records per page
        $leads = $query->latest()->paginate(30);

        $selectedLead = $request->filled('lead')
            ? Lead::query()
                ->select(['id', 'name', 'lead_code'])
                ->find($request->input('lead'))
            : null;

        $selectedSector = $request->filled('sector')
            ? Sector::query()
                ->select(['id', 'name'])
                ->find($request->input('sector'))
            : null;

        $selectedArea = $request->filled('area')
            ? Area::query()
                ->select(['id', 'name'])
                ->find($request->input('area'))
            : null;

        $selectedProfession = $request->filled('profession')
            ? Profession::query()
                ->select(['id', 'name'])
                ->find($request->input('profession'))
            : null;

        $selectedDesignation = $request->filled('designation')
            ? LeadDesignation::query()
                ->select(['id', 'name'])
                ->find($request->input('designation'))
            : null;

        $selectedUser = $request->filled('user')
            ? User::query()
                ->select(['id', 'name', 'employee_id'])
                ->find($request->input('user'))
            : null;

        $selectedProduct = $request->filled('product')
            ? Product::query()
                ->select(['id', 'name'])
                ->find($request->input('product'))
            : null;


        $stages = LeadStage::orderBy('order', 'asc')->get();

        $sources = LeadSource::orderBy('name', 'asc')->get();

        return Inertia::render(
            'crm/leads/lead-follow-ups-due',
            [
                'leads' => $leads,
                'numberOfLeads' => $numberOfLeads,
                'stages' => $stages,
                'sources' => $sources,
                'filters' => [
                    'lead' => $selectedLead,
                    'source' => $request->source,
                    'stage' => $request->stage,
                    'priority' => $request->priority,
                    'interest' => $request->interest,
                    'sector' => $selectedSector,
                    'area' => $selectedArea,
                    'profession' => $selectedProfession,
                    'designation' => $selectedDesignation,
                    'user' => $selectedUser,
                    'product' => $selectedProduct,
                    'sorting' => $request->sorting,
                    'sort_at' => $request->sort_at,
                    'dates' => $request->dates,
                ],
            ],
        );

    }

    // Lead Follow Up
    public function leadFolllowUp(Request $request)
    {
        $this->authorizePermission('lead.follow-up');

        // Get sorting input, default = today
        $sort_at = $request->input('sort_at', 'today');

        $query = Lead::accessible(auth()->user())
            ->with([
                'assignedUser:id,name,employee_id',
                'leadSource:id,name',
                'leadStage:id,name,color',
            ])
            ->whereNotNull('next_follow_up_at')
            ->where('next_follow_up_at', '>=', now()->startOfDay())
            ->select([
                'id',
                'name',
                'source_id',
                'stage_id',
                'priority',
                'interest_level',
                'assigned_to',
                'last_contacted_at',
                'next_follow_up_at',
                'created_at',
            ]);

        // Apply sorting filter
        switch ($sort_at) {

            case 'today':
                $query->whereDate('next_follow_up_at', today());
                break;

            case 'this_week':
                // Week = Saturday → Friday
                $start = now()->copy()->startOfWeek(Carbon::SATURDAY);
                $end = $start->copy()->next(Carbon::FRIDAY)->endOfDay();
                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'next_week':
                $start = now()->copy()->addWeek()->startOfWeek(Carbon::SATURDAY);
                $end = $start->copy()->next(Carbon::FRIDAY)->endOfDay();
                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'this_month':
                $start = now()->copy()->startOfMonth();
                $end = now()->copy()->endOfMonth();
                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'next_month':
                $start = now()->copy()->addMonth()->startOfMonth();
                $end = now()->copy()->addMonth()->endOfMonth();
                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'this_year':
                $start = now()->copy()->startOfYear();
                $end = now()->copy()->endOfYear();
                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'next_year':
                $start = now()->copy()->addYear()->startOfYear();
                $end = now()->copy()->addYear()->endOfYear();
                $query->whereBetween('next_follow_up_at', [$start, $end]);
                break;

            case 'after_next_year':
                $query->where('next_follow_up_at', '>', now()->copy()->addYear()->endOfYear());
                break;

            default:
                // fallback = today
                $query->whereDate('next_follow_up_at', today());
                break;
        }

        if ($request->has('lead') && !empty($request->input('lead'))) {
            $query->where('id', $request->input('lead'));
        }

        if ($request->has('source') && !empty($request->input('source'))) {
            $query->where('source_id', $request->input('source'));
        }

        if ($request->has('stage') && !empty($request->input('stage'))) {
            $query->where('stage_id', $request->input('stage'));
        }

        if ($request->has('sector') && !empty($request->input('sector'))) {
            $query->where('sector_id', $request->input('sector'));
        }

        if ($request->has('area') && !empty($request->input('area'))) {
            $query->where('area_id', $request->input('area'));
        }

        if ($request->has('profession') && !empty($request->input('profession'))) {
            $query->where('profession_id', $request->input('profession'));
        }

        if ($request->has('designation') && !empty($request->input('designation'))) {
            $query->where('designation_id', $request->input('designation'));
        }

        if ($request->has('user') && !empty($request->input('user'))) {
            $query->where('created_by', $request->input('user'));
        }

        if ($request->filled('product')) {
            $query->whereHas('leadProducts', function ($q) use ($request) {
                $q->where('product_id', $request->input('product'));
            });
        }

        if ($request->has('sorting') && !empty($request->input('sorting'))) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        }

        if ($request->has('interest') && !empty($request->input('interest'))) {
            $query->where('interest_level', $request->input('interest'));
        }

        if ($request->has('priority') && !empty($request->input('priority'))) {
            $query->where('priority', $request->input('priority'));
        }

        // Apply date range filter only if both dates are provided
        if ($request->filled('dates')) {
            $date = $request->input('dates');

            if (str_contains($date, 'to')) {
                [$start, $end] = array_map(
                    'trim',
                    explode('to', $date)
                );

                $query->whereBetween(
                    'created_at',
                    [
                        Carbon::parse($start)->startOfDay(),
                        Carbon::parse($end)->endOfDay(),
                    ]
                );
            } else {
                $query->whereDate(
                    'created_at',
                    Carbon::parse($date)
                );
            }
        }

        // Get the total number of leads for this que
        $numberOfLeads = $query->count();

        // Paginate with 200 records per page
        $leads = $query->latest()->paginate(30);

        $selectedLead = $request->filled('lead')
            ? Lead::query()
                ->select(['id', 'name', 'lead_code'])
                ->find($request->input('lead'))
            : null;

        $selectedSector = $request->filled('sector')
            ? Sector::query()
                ->select(['id', 'name'])
                ->find($request->input('sector'))
            : null;

        $selectedArea = $request->filled('area')
            ? Area::query()
                ->select(['id', 'name'])
                ->find($request->input('area'))
            : null;

        $selectedProfession = $request->filled('profession')
            ? Profession::query()
                ->select(['id', 'name'])
                ->find($request->input('profession'))
            : null;

        $selectedDesignation = $request->filled('designation')
            ? LeadDesignation::query()
                ->select(['id', 'name'])
                ->find($request->input('designation'))
            : null;

        $selectedUser = $request->filled('user')
            ? User::query()
                ->select(['id', 'name', 'employee_id'])
                ->find($request->input('user'))
            : null;

        $selectedProduct = $request->filled('product')
            ? Product::query()
                ->select(['id', 'name'])
                ->find($request->input('product'))
            : null;


        $stages = LeadStage::orderBy('order', 'asc')->get();

        $sources = LeadSource::orderBy('name', 'asc')->get();

        return Inertia::render(
            'crm/leads/lead-follow-ups',
            [
                'leads' => $leads,
                'numberOfLeads' => $numberOfLeads,
                'stages' => $stages,
                'sources' => $sources,
                'filters' => [
                    'lead' => $selectedLead,
                    'source' => $request->source,
                    'stage' => $request->stage,
                    'priority' => $request->priority,
                    'interest' => $request->interest,
                    'sector' => $selectedSector,
                    'area' => $selectedArea,
                    'profession' => $selectedProfession,
                    'designation' => $selectedDesignation,
                    'user' => $selectedUser,
                    'product' => $selectedProduct,
                    'sorting' => $request->sorting,
                    'sort_at' => $request->sort_at,
                    'dates' => $request->dates,
                ],
            ],
        );
    }

    public function checkPhone(Request $request)
    {
        if (!$request->filled('phone')) {
            return response()->json(['exists' => false]);
        }

        $query = Lead::with([
            'createdBy:id,employee_id,name',
            'assignedUser:id,employee_id,name',
            'leadStage',
        ])->where(function ($q) use ($request) {
            $q->where('phone', $request->phone)
                ->orWhere('phone_secondary', $request->phone)
                ->orWhere('phone_foreign', $request->phone);
        });

        // Ignore current lead while editing
        if ($request->filled('lead_id')) {
            $query->where('id', '!=', $request->lead_id);
        }

        $lead = $query->first();

        if (!$lead) {
            return response()->json(['exists' => false]);
        }

        $lastConversation = $lead->leadConversations()
            ->with('user')
            ->latest('created_at')
            ->first();

        $createdBy = $lead->createdBy;
        $followUpBy = $lead->assignedUser ?: $createdBy;

        return response()->json([
            'exists' => true,
            'lead' => [
                'id' => $lead->id,
                'lead_code' => $lead->lead_code,
                'name' => $lead->name,
                'phone' => $lead->phone,
                'stage' => optional($lead->leadStage)->name,

                'created_by_name' => optional($createdBy)->name,
                'created_by_employee_no' => optional($createdBy)->employee_id,

                'follow_up_by_name' => optional($followUpBy)->name,
                'follow_up_by_employee_no' => optional($followUpBy)->employee_id,

                'is_assigned' => !is_null($lead->assigned_to),

                'last_conversation_date' => optional($lastConversation?->created_at)
                        ?->format('d M Y h:i A'),
                'last_conversation_by' => optional($lastConversation?->user)->name,
            ],
        ]);
    }

    public function resolveDesignation(Request $request)
    {

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $name = trim(
            preg_replace(
                '/\s+/',
                ' ',
                $validated['name'],
            ),
        );

        $designation = DB::transaction(function () use ($name) {
            $existingDesignation = LeadDesignation::query()
                ->whereRaw(
                    'LOWER(TRIM(name)) = ?',
                    [mb_strtolower($name)],
                )
                ->lockForUpdate()
                ->first();

            if ($existingDesignation) {
                return $existingDesignation;
            }

            $designation = LeadDesignation::create([
                'name' => $name,
                'status' => 'actionable',
            ]);

            $designation->update([
                'code' => 'LD-' . str_pad(
                    (string) $designation->id,
                    5,
                    '0',
                    STR_PAD_LEFT,
                ),
            ]);

            return $designation->fresh();
        });

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $designation->id,
                'name' => $designation->name,
            ],
        ]);
    }
    public function resolveArea(Request $request)
    {
        $validated = $request->validate([
            'addresses' => ['required', 'array', 'min:1'],
            'addresses.*' => ['nullable', 'string', 'max:255'],
        ]);

        $addresses = collect($validated['addresses'])
            ->filter(fn($address) => filled($address))
            ->map(fn($address) => trim($address))
            ->values();

        foreach ($addresses as $address) {
            $area = Area::query()
                ->select(['id', 'name'])
                ->where('is_active', true)
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($address)])
                ->first();

            if ($area) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $area->id,
                        'name' => $area->name,
                    ],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => null,
        ]);
    }

    public function exportExcel()
    {
        return Excel::download(new LeadExport, 'leads.xlsx');
    }

    public function parseCardData(
        Request $request,
        GroqCardParser $parser,
    ): JsonResponse {
        $validated = $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],
            'back_image' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:10240',
            ],
        ]);

        try {
            $card = $parser->parse(
                $validated['image'],
                $validated['back_image'] ?? null,
            );

            return response()->json([
                'success' => true,
                'message' => 'Card information extracted successfully.',
                'data' => $card,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Unable to extract card information.',
            ], 422);
        }
    }
}
