<?php

namespace App\Http\Controllers;

use App\Models\BoqItem;
use App\Models\Configure;
use App\Models\Product;
use App\Models\Requisition;
use App\Models\RequisitionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

use Barryvdh\DomPDF\Facade\Pdf;
use Throwable;
use App\Actions\File;
use Inertia\Inertia;
use Inertia\Response;

class RequisitionController extends Controller
{
    public $user;

    public function index(Request $request): Response
    {
        $this->authorizePermission('requisition.list');

        $sort = $request->input(
            'sort',
            'latest'
        );

        if (
            !in_array(
                $sort,
                ['latest', 'oldest'],
                true
            )
        ) {
            $sort = 'latest';
        }

        $query = Requisition::query()
            ->select([
                'id',
                'requisition_id',
                'required_date',
                'requested_by',
                'approved_by',
                'status',
                'created_at',
                'updated_at',
            ])
            ->with([
                'requestedBy:id,name,employee_id',

                'approvedBy:id,name,employee_id',
            ])
            ->withCount('items');

        /*
        |--------------------------------------------------------------------------
        | Requisition Filter
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'requisition_id'
            )
        ) {
            $query->where(
                'requisition_id',
                $request->input(
                    'requisition_id'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled(
                'status'
            )
        ) {
            $query->where(
                'status',
                $request->input(
                    'status'
                )
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        if (
            $sort ===
            'oldest'
        ) {
            $query->orderBy(
                'created_at',
                'asc'
            );
        } else {
            $query->orderBy(
                'created_at',
                'desc'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $requisitions = $query
            ->paginate(20)
            ->withQueryString();


        return Inertia::render(
            'operations/requisition/index',
            [
                'data' =>
                    $requisitions,

                'filters' => [
                    'requisition_id' =>
                        $request->input(
                            'requisition_id'
                        ),

                    'status' =>
                        $request->input(
                            'status'
                        ),

                    'sort' =>
                        $sort,
                ],
            ]
        );
    }


    public function create(): Response
    {
        $this->authorizePermission('requisition.create');

        return Inertia::render("operations/requisition/create-requisition", [
        ]);


    }

    public function store(Request $request)
    {

        $this->authorizePermission('requisition.create');

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'required_date' => [
                'required',
                'string',
                'max:100',
            ],

            /*
            |--------------------------------------------------------------------------
            | Attachments
            |--------------------------------------------------------------------------
            */

            'files' => [
                'nullable',
                'array',
                'max:5',
            ],

            'files.*' => [
                'file',
                'mimes:jpg,jpeg,png,pdf,xlsx,xls',
                'max:30720',
            ],

            /*
            |--------------------------------------------------------------------------
            | Requisition Items
            |--------------------------------------------------------------------------
            */

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.product_id' => [
                'required',
                'integer',
                'exists:products,id',
                'distinct',
            ],

            'items.*.unit' => [
                'required',
                'string',
                'max:50',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'items.*.priority' => [
                'required',
                'in:Low,Medium,High',
            ],

            'items.*.required_date' => [
                'nullable',
                'date_format:Y-m-d',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Maximum 30 MB Total
        |--------------------------------------------------------------------------
        |
        | "max:30720" above protects each individual file.
        | This additionally protects the TOTAL size of all uploaded files.
        |
        */

        $files = $request->file(
            'files',
            []
        );

        $totalFileSize = collect(
            $files
        )->sum(
                fn($file) =>
                $file->getSize()
            );

        if (
            $totalFileSize >
            30 * 1024 * 1024
        ) {
            throw ValidationException::withMessages([
                'files' =>
                    'Total attachment size cannot exceed 30 MB.',
            ]);
        }

        try {
            $requisition = DB::transaction(
                function () use ($validated, $files) {
                    /*
                    |--------------------------------------------------------------------------
                    | Generate Requisition ID
                    |--------------------------------------------------------------------------
                    */

                    $year =
                        now()->format('Y');

                    $lastRequisition =
                        Requisition::query()
                            ->where(
                                'requisition_id',
                                'like',
                                "REQ-{$year}%"
                            )
                            ->lockForUpdate()
                            ->latest('id')
                            ->first();

                    $newNumber =
                        $lastRequisition
                        ? (
                            (int) substr(
                                $lastRequisition
                                    ->requisition_id,
                                -5
                            )
                        ) + 1
                        : 1;

                    $requisitionId =
                        sprintf(
                            'REQ-%s%05d',
                            $year,
                            $newNumber
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | Upload Attachments
                    |--------------------------------------------------------------------------
                    |
                    | Your helper:
                    |
                    | File::upload($file, 'Requisitions')
                    |
                    */

                    $attachments = [];

                    foreach (
                        $files
                        as $file
                    ) {
                        $extension =
                            strtolower(
                                $file->getClientOriginalExtension()
                            );

                        /*
                        |--------------------------------------------------------------------------
                        | Images
                        |--------------------------------------------------------------------------
                        */

                        if (
                            in_array(
                                $extension,
                                [
                                    'jpg',
                                    'jpeg',
                                    'png',
                                ],
                                true
                            )
                        ) {
                            $filePath =
                                File::fileUpload(
                                    $file,
                                    'Requisitions'
                                );
                        } else {
                            /*
                            |--------------------------------------------------------------------------
                            | PDF / Excel
                            |--------------------------------------------------------------------------
                            */

                            $filePath =
                                File::upload(
                                    $file,
                                    'Requisitions'
                                );
                        }

                        if (
                            $filePath
                        ) {
                            $attachments[] =
                                $filePath;
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Create Requisition
                    |--------------------------------------------------------------------------
                    */

                    $requisition =
                        Requisition::create([
                            'requisition_id' =>
                                $requisitionId,

                            'required_date' =>
                                $validated[
                                    'required_date'
                                ],

                            'requested_by' =>
                                Auth::id(),

                            'status' =>
                                'Pending',

                            'approved_by' =>
                                null,

                            /*
                            |--------------------------------------------------------------------------
                            | Attachments
                            |--------------------------------------------------------------------------
                            */

                            'attachments' =>
                                count(
                                    $attachments
                                ) > 0
                                ? json_encode(
                                    $attachments
                                )
                                : null,
                        ]);

                    /*
                    |--------------------------------------------------------------------------
                    | Create Requisition Items
                    |--------------------------------------------------------------------------
                    */

                    foreach (
                        $validated['items']
                        as $item
                    ) {
                        /*
                        |--------------------------------------------------------------------------
                        | Previously Requisitioned
                        |--------------------------------------------------------------------------
                        */

                        $previouslyRequisitioned =
                            RequisitionItem::query()
                                ->where(
                                    'product_id',
                                    $item[
                                        'product_id'
                                    ]
                                )
                                ->whereHas(
                                    'requisition',
                                    function ($query) {
                                        $query->whereIn(
                                            'status',
                                            [
                                                'Pending',
                                                'Approved',
                                            ]
                                        );
                                    }
                                )
                                ->sum(
                                    'quantity'
                                );

                        /*
                        |--------------------------------------------------------------------------
                        | Create Item
                        |--------------------------------------------------------------------------
                        */

                        RequisitionItem::create([
                            'requisition_id' =>
                                $requisition
                                    ->id,

                            'product_id' =>
                                $item[
                                    'product_id'
                                ],

                            /*
                            |--------------------------------------------------------------------------
                            | Legacy item_id
                            |--------------------------------------------------------------------------
                            */

                            'item_id' =>
                                $item[
                                    'product_id'
                                ],

                            'unit' =>
                                $item[
                                    'unit'
                                ],

                            'quantity' =>
                                $item[
                                    'quantity'
                                ],

                            'previously_requisitioned' =>
                                $previouslyRequisitioned,

                            'remaining_quantity' =>
                                null,

                            'required_date' =>
                                $item[
                                    'required_date'
                                ]
                                ?? null,

                            'priority' =>
                                $item[
                                    'priority'
                                ],

                            'status' =>
                                'Pending',
                        ]);
                    }

                    return $requisition;
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            return redirect()
                ->route(
                    'requisition.index'
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            "Requisition {$requisition->requisition_id} created successfully.",

                        'type' =>
                            'success',
                    ]
                );

        } catch (
            Throwable $exception
        ) {
            Log::error(
                'Error creating requisition.',
                [
                    'message' =>
                        $exception
                            ->getMessage(),

                    'user_id' =>
                        Auth::id(),

                    'exception' =>
                        $exception,
                ]
            );

            return redirect()
                ->back()
                ->withInput()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Failed to create requisition. Please try again.',

                        'type' =>
                            'error',
                    ]
                );
        }
    }

    public function edit(
        Requisition $requisition
    ) {

        $this->authorizePermission('requisition.edit');


        /*
        |--------------------------------------------------------------------------
        | Status Lock
        |--------------------------------------------------------------------------
        */

        if (
            $requisition->status !==
            'Pending'
        ) {
            return redirect()
                ->route(
                    'requisition.index'
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            "{$requisition->status} requisitions cannot be edited.",

                        'type' =>
                            'error',
                    ]
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Relations
        |--------------------------------------------------------------------------
        */

        $requisition->load([
            'requestedBy:id,name',

            'approvedBy:id,name',

            'items' => function ($query) {
                $query->select([
                    'id',
                    'requisition_id',
                    'product_id',
                    'unit',
                    'quantity',
                    'previously_requisitioned',
                    'remaining_quantity',
                    'required_date',
                    'priority',
                    'status',
                ]);
            },

            'items.product:id,code,name',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Attachments
        |--------------------------------------------------------------------------
        */

        $attachments = collect(
            json_decode(
                $requisition->attachments ?? '[]',
                true
            ) ?: []
        )
            ->filter()
            ->map(
                function ($path) {
                    return [
                        'path' =>
                            $path,

                        'url' =>
                            asset($path),

                        'extension' =>
                            strtolower(
                                pathinfo(
                                    $path,
                                    PATHINFO_EXTENSION
                                )
                            ),
                    ];
                }
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/requisition/edit-requisition',
            [
                'requisition' => [
                    'id' =>
                        $requisition->id,

                    'requisition_id' =>
                        $requisition
                            ->requisition_id,

                    'required_date' =>
                        $requisition
                            ->required_date
                        ? Carbon::parse(
                            $requisition
                                ->required_date
                        )->format(
                                'Y-m-d'
                            )
                        : '',

                    'requested_by' =>
                        $requisition
                            ->requested_by,

                    'requester_name' =>
                        $requisition
                            ->requestedBy
                                ?->name,

                    'approved_by' =>
                        $requisition
                            ->approved_by,

                    'approved_by_name' =>
                        $requisition
                            ->approvedBy
                                ?->name,

                    'status' =>
                        $requisition
                            ->status,

                    /*
                    |--------------------------------------------------------------------------
                    | Attachments
                    |--------------------------------------------------------------------------
                    */

                    'attachments' =>
                        $attachments,

                    /*
                    |--------------------------------------------------------------------------
                    | Items
                    |--------------------------------------------------------------------------
                    */

                    'items' =>
                        $requisition
                            ->items
                            ->map(
                                function ($item) {
                                    return [
                                        'id' =>
                                            $item->id,

                                        'product_id' =>
                                            $item
                                                ->product_id,

                                        'product_code' =>
                                            $item
                                                ->product
                                                    ?->code
                                            ?? '',

                                        'product_name' =>
                                            $item
                                                ->product
                                                    ?->name
                                            ?? '',

                                        'unit' =>
                                            $item
                                                ->unit,

                                        'quantity' =>
                                            (float)
                                            $item
                                                ->quantity,

                                        'previously_requisitioned' =>
                                            (float)
                                            $item
                                                ->previously_requisitioned,

                                        'remaining_quantity' =>
                                            $item
                                                ->remaining_quantity !==
                                            null
                                            ? (float)
                                            $item
                                                ->remaining_quantity
                                            : null,

                                        'required_date' =>
                                            $item
                                                ->required_date
                                            ? Carbon::parse(
                                                $item
                                                    ->required_date
                                            )->format(
                                                    'Y-m-d'
                                                )
                                            : '',

                                        'priority' =>
                                            $item
                                                ->priority,

                                        'status' =>
                                            $item
                                                ->status,
                                    ];
                                }
                            )
                            ->values(),
                ],
            ]
        );
    }


    public function update(
        Request $request,
        Requisition $requisition
    ) {

        $this->authorizePermission('requisition.edit');
        /*
        |--------------------------------------------------------------------------
        | Quick Status Check
        |--------------------------------------------------------------------------
        */

        if (
            $requisition->status !==
            'Pending'
        ) {
            return redirect()
                ->route(
                    'requisition.index'
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            "{$requisition->status} requisitions cannot be edited.",

                        'type' =>
                            'error',
                    ]
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validated =
            $request->validate([
                'required_date' => [
                    'required',
                    'date_format:Y-m-d',
                ],

                /*
                |--------------------------------------------------------------------------
                | Existing Attachments
                |--------------------------------------------------------------------------
                */

                'existing_attachments' => [
                    'nullable',
                    'array',
                    'max:5',
                ],

                'existing_attachments.*' => [
                    'string',
                ],

                /*
                |--------------------------------------------------------------------------
                | New Attachments
                |--------------------------------------------------------------------------
                */

                'files' => [
                    'nullable',
                    'array',
                    'max:5',
                ],

                'files.*' => [
                    'file',
                    'mimes:jpg,jpeg,png,pdf,xlsx,xls',
                    'max:30720',
                ],

                /*
                |--------------------------------------------------------------------------
                | Items
                |--------------------------------------------------------------------------
                */

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'items.*.product_id' => [
                    'required',
                    'integer',
                    'distinct',
                    'exists:products,id',
                ],

                'items.*.unit' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'items.*.quantity' => [
                    'required',
                    'numeric',
                    'min:0.01',
                ],

                'items.*.priority' => [
                    'required',
                    'in:Low,Medium,High',
                ],

                'items.*.required_date' => [
                    'nullable',
                    'date_format:Y-m-d',
                ],
            ]);

        /*
        |--------------------------------------------------------------------------
        | New Files
        |--------------------------------------------------------------------------
        */

        $files =
            $request->file(
                'files',
                []
            );

        /*
        |--------------------------------------------------------------------------
        | Maximum 30 MB New Upload Total
        |--------------------------------------------------------------------------
        */

        $totalFileSize =
            collect(
                $files
            )->sum(
                    fn($file) =>
                    $file->getSize()
                );

        if (
            $totalFileSize >
            30 * 1024 * 1024
        ) {
            throw ValidationException::withMessages([
                'files' =>
                    'Total attachment size cannot exceed 30 MB.',
            ]);
        }

        try {
            /*
            |--------------------------------------------------------------------------
            | Database Transaction
            |--------------------------------------------------------------------------
            |
            | Return the removed attachment paths so they can be physically deleted
            | only after the database transaction succeeds.
            |
            */

            $removedAttachments =
                DB::transaction(
                    function () use ($validated, $requisition, $files) {
                        /*
                        |--------------------------------------------------------------------------
                        | Lock Requisition
                        |--------------------------------------------------------------------------
                        */

                        $lockedRequisition =
                            Requisition::query()
                                ->whereKey(
                                    $requisition->id
                                )
                                ->lockForUpdate()
                                ->firstOrFail();

                        /*
                        |--------------------------------------------------------------------------
                        | Critical Status Check
                        |--------------------------------------------------------------------------
                        */

                        if (
                            $lockedRequisition
                                ->status !==
                            'Pending'
                        ) {
                            throw ValidationException::withMessages([
                                'status' =>
                                    "{$lockedRequisition->status} requisitions cannot be edited.",
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Current Attachments
                        |--------------------------------------------------------------------------
                        */

                        $currentAttachments =
                            collect(
                                json_decode(
                                    $lockedRequisition
                                        ->attachments
                                    ?? '[]',
                                    true
                                ) ?: []
                            )
                                ->filter()
                                ->values();

                        /*
                        |--------------------------------------------------------------------------
                        | Retained Existing Attachments
                        |--------------------------------------------------------------------------
                        |
                        | Only allow paths that already belong to this requisition.
                        |
                        */

                        $retainedAttachments =
                            collect(
                                $validated[
                                    'existing_attachments'
                                ] ?? []
                            )
                                ->filter(
                                    fn($path) =>
                                    $currentAttachments
                                        ->contains(
                                            $path
                                        )
                                )
                                ->values();

                        /*
                        |--------------------------------------------------------------------------
                        | Removed Existing Attachments
                        |--------------------------------------------------------------------------
                        |
                        | Anything originally stored but no longer included in
                        | existing_attachments has been removed by the user.
                        |
                        */

                        $removedAttachments =
                            $currentAttachments
                                ->diff(
                                    $retainedAttachments
                                )
                                ->values()
                                ->all();

                        /*
                        |--------------------------------------------------------------------------
                        | Maximum Total Files
                        |--------------------------------------------------------------------------
                        */

                        if (
                            $retainedAttachments
                                ->count() +
                            count(
                                $files
                            ) >
                            5
                        ) {
                            throw ValidationException::withMessages([
                                'files' =>
                                    'Maximum 5 attachments are allowed.',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Upload New Files
                        |--------------------------------------------------------------------------
                        */

                        $newAttachments =
                            [];

                        foreach (
                            $files
                            as $file
                        ) {
                            $extension =
                                strtolower(
                                    $file
                                        ->getClientOriginalExtension()
                                );

                            /*
                            |--------------------------------------------------------------------------
                            | Images
                            |--------------------------------------------------------------------------
                            */

                            if (
                                in_array(
                                    $extension,
                                    [
                                        'jpg',
                                        'jpeg',
                                        'png',
                                    ],
                                    true
                                )
                            ) {
                                $filePath =
                                    File::fileUpload(
                                        $file,
                                        'Requisitions'
                                    );
                            } else {
                                /*
                                |--------------------------------------------------------------------------
                                | PDF / Excel
                                |--------------------------------------------------------------------------
                                */

                                $filePath =
                                    File::upload(
                                        $file,
                                        'Requisitions'
                                    );
                            }

                            if (
                                $filePath
                            ) {
                                $newAttachments[] =
                                    $filePath;
                            }
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Merge Attachments
                        |--------------------------------------------------------------------------
                        */

                        $attachments =
                            $retainedAttachments
                                ->concat(
                                    $newAttachments
                                )
                                ->values()
                                ->all();

                        /*
                        |--------------------------------------------------------------------------
                        | Update Header
                        |--------------------------------------------------------------------------
                        */

                        $lockedRequisition->update([
                            'required_date' =>
                                $validated[
                                    'required_date'
                                ],

                            'attachments' =>
                                count(
                                    $attachments
                                ) > 0
                                ? json_encode(
                                    $attachments
                                )
                                : null,
                        ]);

                        /*
                        |--------------------------------------------------------------------------
                        | Replace Items
                        |--------------------------------------------------------------------------
                        */

                        $lockedRequisition
                            ->items()
                            ->delete();

                        foreach (
                            $validated['items']
                            as $item
                        ) {
                            /*
                            |--------------------------------------------------------------------------
                            | Previously Requisitioned
                            |--------------------------------------------------------------------------
                            */

                            $previouslyRequisitioned =
                                RequisitionItem::query()
                                    ->where(
                                        'product_id',
                                        $item[
                                            'product_id'
                                        ]
                                    )
                                    ->where(
                                        'requisition_id',
                                        '!=',
                                        $lockedRequisition
                                            ->id
                                    )
                                    ->whereHas(
                                        'requisition',
                                        function ($query) {
                                            $query
                                                ->whereIn(
                                                    'status',
                                                    [
                                                        'Pending',
                                                        'Approved',
                                                    ]
                                                );
                                        }
                                    )
                                    ->sum(
                                        'quantity'
                                    );

                            /*
                            |--------------------------------------------------------------------------
                            | Create Item
                            |--------------------------------------------------------------------------
                            */

                            RequisitionItem::create([
                                'requisition_id' =>
                                    $lockedRequisition
                                        ->id,

                                'product_id' =>
                                    $item[
                                        'product_id'
                                    ],

                                'item_id' =>
                                    $item[
                                        'product_id'
                                    ],

                                'unit' =>
                                    $item[
                                        'unit'
                                    ],

                                'quantity' =>
                                    $item[
                                        'quantity'
                                    ],

                                'previously_requisitioned' =>
                                    $previouslyRequisitioned,

                                'remaining_quantity' =>
                                    null,

                                'required_date' =>
                                    $item[
                                        'required_date'
                                    ]
                                    ?? null,

                                'priority' =>
                                    $item[
                                        'priority'
                                    ],

                                'status' =>
                                    'Pending',
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Return Removed Files
                        |--------------------------------------------------------------------------
                        */

                        return $removedAttachments;
                    }
                );

            /*
            |--------------------------------------------------------------------------
            | Delete Removed Physical Files
            |--------------------------------------------------------------------------
            |
            | We do this only AFTER DB::transaction() succeeds.
            |
            */

            foreach (
                $removedAttachments
                as $attachment
            ) {
                try {
                    File::deleteFile(
                        $attachment
                    );
                } catch (
                    Throwable $fileException
                ) {
                    Log::warning(
                        'Failed to delete removed requisition attachment.',
                        [
                            'requisition_id' =>
                                $requisition->id,

                            'attachment' =>
                                $attachment,

                            'message' =>
                                $fileException
                                    ->getMessage(),
                        ]
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            return redirect()
                ->route(
                    'requisition.index'
                )
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Requisition updated successfully.',

                        'type' =>
                            'success',
                    ]
                );

        } catch (
            ValidationException $exception
        ) {
            return redirect()
                ->back()
                ->withErrors(
                    $exception->errors()
                )
                ->withInput();

        } catch (
            Throwable $exception
        ) {
            Log::error(
                'Error updating requisition.',
                [
                    'requisition_id' =>
                        $requisition->id,

                    'user_id' =>
                        Auth::id(),

                    'message' =>
                        $exception
                            ->getMessage(),

                    'exception' =>
                        $exception,
                ]
            );

            return redirect()
                ->back()
                ->withInput()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Failed to update requisition. Please try again.',

                        'type' =>
                            'error',
                    ]
                );
        }
    }

    public function destroy($id)
    {
        $this->authorizePermission('requisition.delete');
        try {
            /*
            |--------------------------------------------------------------------------
            | Find Requisition
            |--------------------------------------------------------------------------
            */

            $requisition =
                Requisition::with(
                    'items'
                )->findOrFail(
                        $id
                    );

            /*
            |--------------------------------------------------------------------------
            | Approved Cannot Be Deleted
            |--------------------------------------------------------------------------
            */

            if (
                $requisition->status ===
                'Approved'
            ) {
                $message =
                    'Approved requisition cannot be deleted.';

                if (
                    request()->expectsJson()
                ) {
                    return response()->json(
                        [
                            'message' =>
                                $message,
                        ],
                        422
                    );
                }

                return redirect()
                    ->back()
                    ->with(
                        'notification',
                        [
                            'message' =>
                                $message,

                            'type' =>
                                'error',
                            'key' => $id
                        ]
                    );
            }

            /*
            |--------------------------------------------------------------------------
            | Attachments
            |--------------------------------------------------------------------------
            */

            $attachments =
                is_array(
                    $requisition->attachments
                )
                ? $requisition->attachments
                : (
                    json_decode(
                        $requisition->attachments
                        ?? '[]',
                        true
                    ) ?: []
                );

            /*
            |--------------------------------------------------------------------------
            | Database Transaction
            |--------------------------------------------------------------------------
            */

            DB::beginTransaction();

            /*
            |--------------------------------------------------------------------------
            | Delete Child Items
            |--------------------------------------------------------------------------
            */

            $requisition
                ->items()
                ->delete();

            /*
            |--------------------------------------------------------------------------
            | Delete Requisition
            |--------------------------------------------------------------------------
            */

            $requisition
                ->delete();

            DB::commit();

            /*
            |--------------------------------------------------------------------------
            | Delete Attachment Files
            |--------------------------------------------------------------------------
            */

            foreach (
                $attachments
                as $attachment
            ) {
                if (
                    !$attachment ||
                    !is_string(
                        $attachment
                    )
                ) {
                    continue;
                }

                File::deleteFile(
                    $attachment
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            $message =
                'Requisition deleted successfully';

            if (
                request()->expectsJson()
            ) {
                return response()->json(
                    [
                        'message' =>
                            $message,
                    ],
                    200
                );
            }

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            $message,

                        'type' =>
                            'success',
                        'key' => $id
                    ]
                );

        } catch (
            \Illuminate\Database\Eloquent\ModelNotFoundException $e
        ) {
            $message =
                'Requisition not found';

            if (
                request()->expectsJson()
            ) {
                return response()->json(
                    [
                        'message' =>
                            $message,
                    ],
                    404
                );
            }

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            $message,

                        'type' =>
                            'error',
                        'key' => $id
                    ]
                );

        } catch (
            \Exception $e
        ) {
            if (
                DB::transactionLevel() >
                0
            ) {
                DB::rollBack();
            }

            Log::error(
                'Error deleting requisition: '
                . $e->getMessage(),
                [
                    'requisition_id' =>
                        $id,

                    'exception' =>
                        $e,
                ]
            );

            $message =
                'Failed to delete requisition';

            if (
                request()->expectsJson()
            ) {
                return response()->json(
                    [
                        'message' =>
                            $message,
                    ],
                    500
                );
            }

            return redirect()
                ->back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            $message,

                        'type' =>
                            'error',
                        'key' => $id
                    ]
                );
        }
    }




    public function show(
        Requisition $requisition
    ) {
        $this->authorizePermission('requisition.view');

        /*
        |--------------------------------------------------------------------------
        | Load
        |--------------------------------------------------------------------------
        */

        $requisition->load([
            'requestedBy:id,name,employee_id',

            'approvedBy:id,name,employee_id',

            'items' => function ($query) {
                $query->select([
                    'id',
                    'requisition_id',
                    'product_id',
                    'quantity',
                    'unit',
                    'required_date',
                    'priority',
                    'status',
                ]);
            },

            'items.product:id,code,name',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Attachments
        |--------------------------------------------------------------------------
        */

        $attachmentPaths =
            is_array(
                $requisition->attachments
            )
            ? $requisition->attachments
            : (
                json_decode(
                    $requisition->attachments ?? '[]',
                    true
                ) ?: []
            );

        $attachments =
            collect(
                $attachmentPaths
            )
                ->filter()
                ->map(
                    function ($path) {
                        $absolutePath =
                            public_path(
                                $path
                            );

                        return [
                            'path' =>
                                $path,

                            'url' =>
                                asset(
                                    $path
                                ),

                            'extension' =>
                                strtolower(
                                    pathinfo(
                                        $path,
                                        PATHINFO_EXTENSION
                                    )
                                ),

                            'size' =>
                                is_file(
                                    $absolutePath
                                )
                                ? filesize(
                                    $absolutePath
                                )
                                : null,
                        ];
                    }
                )
                ->values();

        /*
        |--------------------------------------------------------------------------
        | Render
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'operations/requisition/show-requisition',
            [
                'requisition' => [
                    'id' =>
                        $requisition->id,

                    'requisition_id' =>
                        $requisition
                            ->requisition_id,

                    'required_date' =>
                        $requisition
                            ->required_date,

                    'status' =>
                        $requisition
                            ->status,

                    'created_at' =>
                        $requisition
                            ->created_at,

                    /*
                    |--------------------------------------------------------------------------
                    | Attachments
                    |--------------------------------------------------------------------------
                    */

                    'attachments' =>
                        $attachments,

                    /*
                    |--------------------------------------------------------------------------
                    | Requested By
                    |--------------------------------------------------------------------------
                    */

                    'requested_by_user' =>
                        $requisition
                            ->requestedBy
                        ? [
                            'id' =>
                                $requisition
                                    ->requestedBy
                                    ->id,

                            'name' =>
                                $requisition
                                    ->requestedBy
                                    ->name,

                            'employee_id' =>
                                $requisition
                                    ->requestedBy
                                    ->employee_id,
                        ]
                        : null,

                    /*
                    |--------------------------------------------------------------------------
                    | Approved By
                    |--------------------------------------------------------------------------
                    */

                    'approved_by_user' =>
                        $requisition
                            ->approvedBy
                        ? [
                            'id' =>
                                $requisition
                                    ->approvedBy
                                    ->id,

                            'name' =>
                                $requisition
                                    ->approvedBy
                                    ->name,

                            'employee_id' =>
                                $requisition
                                    ->approvedBy
                                    ->employee_id,
                        ]
                        : null,

                    /*
                    |--------------------------------------------------------------------------
                    | Items
                    |--------------------------------------------------------------------------
                    */

                    'items' =>
                        $requisition
                            ->items
                            ->map(
                                function ($item) {
                                    return [
                                        'id' =>
                                            $item
                                                ->id,

                                        'product_id' =>
                                            $item
                                                ->product_id,

                                        'product_name' =>
                                            $item
                                                ->product
                                                    ?->name,

                                        'product_code' =>
                                            $item
                                                ->product
                                                    ?->code,

                                        'quantity' =>
                                            (float)
                                            $item
                                                ->quantity,

                                        'unit' =>
                                            $item
                                                ->unit,

                                        'priority' =>
                                            $item
                                                ->priority,

                                        'required_date' =>
                                            $item
                                                ->required_date,

                                        'status' =>
                                            $item
                                                ->status,
                                    ];
                                }
                            )
                            ->values(),
                ],
            ]
        );
    }

    public function updateRequisitionStatus(
        Request $request
    ) {

        $this->authorizePermission('requisition.status');

        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validated =
            $request->validate([
                'id' => [
                    'required',
                    'integer',
                    'exists:requisitions,id',
                ],

                'status' => [
                    'required',
                    'in:Approved,Rejected',
                ],
            ]);

        try {
            $result =
                DB::transaction(
                    function () use ($validated) {
                        /*
                        |--------------------------------------------------------------------------
                        | Lock Requisition
                        |--------------------------------------------------------------------------
                        */

                        $requisition =
                            Requisition::query()
                                ->lockForUpdate()
                                ->findOrFail(
                                    $validated[
                                        'id'
                                    ]
                                );

                        $oldStatus =
                            $requisition
                                ->status;

                        $newStatus =
                            $validated[
                                'status'
                            ];

                        /*
                        |--------------------------------------------------------------------------
                        | Terminal Status Protection
                        |--------------------------------------------------------------------------
                        |
                        | Only Pending requisitions can change.
                        |
                        | Pending -> Approved
                        | Pending -> Rejected
                        |
                        | Approved -> NOTHING
                        | Rejected -> NOTHING
                        |
                        */

                        if (
                            $oldStatus !==
                            'Pending'
                        ) {
                            throw ValidationException::withMessages([
                                'status' =>
                                    "This requisition is already {$oldStatus}. Its status can no longer be changed.",
                            ]);
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Update Requisition
                        |--------------------------------------------------------------------------
                        */

                        $requisition
                            ->status =
                            $newStatus;

                        /*
                        |--------------------------------------------------------------------------
                        | Approved By
                        |--------------------------------------------------------------------------
                        */

                        $requisition
                            ->approved_by =
                            $newStatus ===
                            'Approved'
                            ? Auth::id()
                            : null;

                        $requisition
                            ->save();

                        /*
                        |--------------------------------------------------------------------------
                        | Synchronize Items
                        |--------------------------------------------------------------------------
                        |
                        | All current requisition items inherit the main status.
                        |
                        | Later:
                        | Approved item -> Procured
                        |
                        | should happen from the purchasing workflow.
                        |
                        */

                        $updatedCount =
                            $requisition
                                ->items()
                                ->update([
                                    'status' =>
                                        $newStatus,
                                ]);

                        /*
                        |--------------------------------------------------------------------------
                        | Fresh Item Statuses
                        |--------------------------------------------------------------------------
                        */

                        $itemStatuses =
                            $requisition
                                ->items()
                                ->pluck(
                                    'status',
                                    'id'
                                );

                        return [
                            'message' =>
                                $newStatus ===
                                'Approved'
                                ? 'Requisition approved successfully.'
                                : 'Requisition rejected successfully.',

                            'status' =>
                                $newStatus,

                            'old_status' =>
                                $oldStatus,

                            'updated_count' =>
                                $updatedCount,

                            'item_statuses' =>
                                $itemStatuses,
                        ];
                    }
                );

            return response()->json(
                $result
            );
        } catch (
            ValidationException $exception
        ) {
            return response()->json([
                'message' =>
                    collect(
                        $exception
                            ->errors()
                    )
                        ->flatten()
                        ->first()
                    ?? 'Validation failed.',

                'errors' =>
                    $exception
                        ->errors(),
            ], 422);
        } catch (
            \Throwable $exception
        ) {
            Log::error(
                'Requisition status update failed.',
                [
                    'requisition_id' =>
                        $request->id,

                    'user_id' =>
                        Auth::id(),

                    'message' =>
                        $exception
                            ->getMessage(),

                    'exception' =>
                        $exception,
                ]
            );

            return response()->json([
                'message' =>
                    'Failed to update requisition status.',
            ], 500);
        }
    }

    // Optional: keep for PO module later (not used on this show page)
    public function updateRequisitionItemStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => [
                'required',
                'integer',
                'exists:requisition_items,id',
            ],

            'status' => [
                'required',
                'in:Pending,Approved,Procured,Rejected',
            ],
        ]);

        try {
            $result = DB::transaction(
                function () use ($validated) {
                    $item =
                        RequisitionItem::query()
                            ->with('requisition')
                            ->lockForUpdate()
                            ->findOrFail(
                                $validated['id']
                            );

                    $oldStatus =
                        $item->status;

                    $newStatus =
                        $validated['status'];

                    /*
                    |--------------------------------------------------------------------------
                    | Same Status
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $oldStatus ===
                        $newStatus
                    ) {
                        return [
                            'message' =>
                                "Item is already {$newStatus}.",

                            'status' =>
                                $newStatus,

                            'old_status' =>
                                $oldStatus,
                        ];
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Procured Protection
                    |--------------------------------------------------------------------------
                    |
                    | A product cannot be marked Procured while its requisition
                    | is not approved.
                    |
                    */

                    if (
                        $newStatus ===
                        'Procured' &&
                        $item
                            ->requisition
                                ?->status !==
                        'Approved'
                    ) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'The requisition must be Approved before an item can be marked as Procured.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Only Approved Item → Procured
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $newStatus ===
                        'Procured' &&
                        $oldStatus !==
                        'Approved'
                    ) {
                        throw ValidationException::withMessages([
                            'status' =>
                                'Only an Approved item can be marked as Procured.',
                        ]);
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Update
                    |--------------------------------------------------------------------------
                    */

                    $item->status =
                        $newStatus;

                    $item->save();

                    return [
                        'message' =>
                            "Item status changed from {$oldStatus} to {$newStatus}.",

                        'status' =>
                            $item->status,

                        'old_status' =>
                            $oldStatus,

                        'item_id' =>
                            $item->id,
                    ];
                }
            );

            return response()->json(
                $result
            );
        } catch (
            ValidationException $exception
        ) {
            return response()->json([
                'message' =>
                    collect(
                        $exception->errors()
                    )
                        ->flatten()
                        ->first()
                    ?? 'Validation failed.',

                'errors' =>
                    $exception->errors(),
            ], 422);
        } catch (
            \Throwable $exception
        ) {
            Log::error(
                'Requisition item status update failed.',
                [
                    'item_id' =>
                        $request->id,

                    'message' =>
                        $exception
                            ->getMessage(),
                ]
            );

            return response()->json([
                'message' =>
                    'Failed to update item status.',
            ], 500);
        }
    }



    public function downloadPdf($id)
    {
        $requisition = Requisition::with([
            'requestedBy:id,employee_id,name,department_id',

            'requestedBy.department:id,name',

            'approvedBy:id,employee_id,name',

            'items:id,requisition_id,product_id,quantity,unit,required_date,priority,status',

            'items.product:id,code,name',
        ])
            ->findOrFail($id);

        $data['requisition'] =
            $requisition;

        $data['configure'] =
            Configure::first();

        $pdf = Pdf::loadView(
            'pdf.requisition',
            $data
        );

        return $pdf->stream(
            'requisition_' .
            $requisition->id .
            '.pdf'
        );
    }

    public function streamPdf($id)
    {
        $requisition = Requisition::with([
            'requestedBy:id,employee_id,name,department_id',

            'requestedBy.department:id,name',

            'approvedBy:id,employee_id,name',

            'items:id,requisition_id,product_id,quantity,unit,required_date,priority,status',

            'items.product:id,code,name',
        ])
            ->findOrFail($id);

        $data['requisition'] =
            $requisition;

        $data['configure'] =
            Configure::first();

        $pdf = Pdf::loadView(
            'pdf.requisition',
            $data
        );

        return $pdf->stream(
            'requisition_' .
            $requisition->id .
            '.pdf'
        );
    }

    public function getProducts(
        Request $request
    ) {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $brandId =
            $request->integer(
                'brand_id'
            );

        $categoryId =
            $request->integer(
                'category_id'
            );

        $subcategoryId =
            $request->integer(
                'subcategory_id'
            );

        $query =
            Product::query()
                ->select([
                    'id',
                    'code',
                    'name',
                    'purchase_price',
                    'sales_price',
                    'purchase_tax_ids',
                    'unit_id',
                    'product_brand_id',
                    'product_category_id',
                ])
                ->with([
                    'unit:id,name',
                ]);

        /*
        |--------------------------------------------------------------------------
        | Brand
        |--------------------------------------------------------------------------
        */

        if ($brandId) {
            $query->where(
                'product_brand_id',
                $brandId
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Subcategory
        |--------------------------------------------------------------------------
        |
        | Most specific filter wins.
        |
        */

        if ($subcategoryId) {
            $query->where(
                'product_category_id',
                $subcategoryId
            );
        } elseif ($categoryId) {
            /*
            |--------------------------------------------------------------------------
            | Category + Children
            |--------------------------------------------------------------------------
            |
            | If no subcategory is explicitly selected, selecting a parent
            | category returns products directly under that category AND its
            | subcategories.
            |
            */

            $categoryIds =
                DB::table(
                    'product_categories'
                )
                    ->where(
                        'parent_id',
                        $categoryId
                    )
                    ->pluck('id');

            $categoryIds->push(
                $categoryId
            );

            $query->whereIn(
                'product_category_id',
                $categoryIds
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if ($keyword !== '') {
            $query->where(
                function ($query) use ($keyword) {
                    $query
                        ->where(
                            'name',
                            'like',
                            "%{$keyword}%"
                        )
                        ->orWhere(
                            'code',
                            'like',
                            "%{$keyword}%"
                        );
                }
            );
        }

        $products =
            $query
                ->orderBy('name')
                ->limit(20)
                ->get()
                ->map(
                    function ($product) {
                        return [
                            'id' =>
                                $product->id,

                            'code' =>
                                $product->code,

                            'name' =>
                                $product->name,
                            'purchase_price' =>
                                $product->purchase_price,
                            'sales_price' =>
                                $product->sales_price,
                            'purchase_tax_ids' =>
                                $product->purchase_tax_ids ?? [],
                            'unit' =>
                                $product
                                    ->unit
                                        ?->name
                                ?? '',
                        ];
                    }
                );

        return response()->json(
            $products
        );
    }

    public function getRequisitions(
        Request $request
    ) {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $requisitions =
            Requisition::query()
                ->select([
                    'id',
                    'requisition_id',
                    'status',
                ])
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            function ($query) use ($keyword) {
                                $query
                                    ->where(
                                        'requisition_id',
                                        'like',
                                        "%{$keyword}%"
                                    )
                                    ->orWhere(
                                        'purpose',
                                        'like',
                                        "%{$keyword}%"
                                    );
                            }
                        );
                    }
                )
                ->latest()
                ->limit(20)
                ->get();

        return response()->json(
            $requisitions
        );
    }

    public function getProductBrands(
        Request $request
    ) {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $brands = DB::table(
            'product_brands'
        )
            ->select([
                'id',
                'name',
            ])
            ->when(
                $keyword !== '',
                function ($query) use ($keyword) {
                    $query->where(
                        'name',
                        'like',
                        "%{$keyword}%"
                    );
                }
            )
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json(
            $brands
        );
    }

    public function getProductCategories(
        Request $request
    ) {
        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $categories =
            DB::table(
                'product_categories'
            )
                /*
                |--------------------------------------------------------------------------
                | Parent Categories Only
                |--------------------------------------------------------------------------
                */
                ->whereNull(
                    'parent_id'
                )
                ->select([
                    'id',
                    'name',
                ])
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            'name',
                            'like',
                            "%{$keyword}%"
                        );
                    }
                )
                ->orderBy('name')
                ->limit(20)
                ->get();

        return response()->json(
            $categories
        );
    }

    public function getProductSubcategories(
        Request $request
    ) {
        $categoryId =
            $request->integer(
                'category_id'
            );

        if (!$categoryId) {
            return response()->json(
                []
            );
        }

        $keyword = trim(
            (string) $request->input(
                'keyword',
                ''
            )
        );

        $subcategories =
            DB::table(
                'product_categories'
            )
                ->where(
                    'parent_id',
                    $categoryId
                )
                ->select([
                    'id',
                    'name',
                ])
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            'name',
                            'like',
                            "%{$keyword}%"
                        );
                    }
                )
                ->orderBy('name')
                ->limit(20)
                ->get();

        return response()->json(
            $subcategories
        );
    }

    private function generateRequisitionId(): string
    {

        $year =
            now()->format('Y');

        $lastRequisition =
            Requisition::query()
                ->where(
                    'requisition_id',
                    'like',
                    "REQ-{$year}%"
                )
                ->lockForUpdate()
                ->latest('id')
                ->first();

        $newNumber =
            $lastRequisition
            ? (
                (int) substr(
                    $lastRequisition
                        ->requisition_id,
                    -5
                )
            ) + 1
            : 1;

        return sprintf(
            'REQ-%s%05d',
            $year,
            $newNumber
        );


    }
}
