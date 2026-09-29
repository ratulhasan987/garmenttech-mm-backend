<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Designation;
use App\Models\Document;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();

            return $next($request);
        });
    }

    public function index(Request $request)
    {
        if (is_null($this->user) || ! $this->user->can('user.list')) {
            abort(403, 'Unauthorized access');
        }

        $query = Document::select('documents.*')->with([
            'user:id,name,employee_id,image,status,department_id,designation_id',
            'department',
            'designation',
        ]);

        if ($request->filled('user')) {
            $query->where('user_id', $request->input('user'));
        }

        if ($request->filled('department')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('department_id', $request->department);
            });
        }

        if ($request->filled('designation')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('designation_id', $request->designation);
            });
        }

        if ($request->filled('status')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $numberOfDocuments = $query->count();
        $documents = $query->latest()->paginate(30);

        $documents->getCollection()->transform(function ($document) {
            $document->progress = $document->documentProgress();

            return $document;
        });

        $departments = Department::select(['id', 'name'])->orderBy('name', 'asc')->get();
        $designations = Designation::select('id', 'name')->orderBy('name')->get();

        $selectedUser = null;
        if ($request->filled('user')) {
            $selectedUser = User::select(['id', 'name', 'employee_id'])->find($request->input('user'));
        }

        return Inertia::render('hr/document/index', [
            'documents' => $documents->through(fn ($doc) => $doc),
            'numberOfDocuments' => $numberOfDocuments,
            'departments' => $departments,
            'designations' => $designations,
            'filters' => $request->only(['user', 'department', 'designation', 'status']),
            'selectedUser' => $selectedUser
                ? ['id' => $selectedUser->id, 'name' => $selectedUser->name, 'employee_id' => $selectedUser->employee_id]
                : null,
        ]);
    }

    public function show($id)
    {
        if (is_null($this->user) || ! $this->user->can('user.list')) {
            abort(403, 'Unauthorized access');
        }

        $document = Document::with([
            'user:id,name,employee_id,image,status,department_id,designation_id',
            'department',
            'designation',
        ])->findOrFail($id);

        return Inertia::render('hr/document/show', [
            'document' => $document,
        ]);
    }

    public function edit()
    {
        $document = Document::firstOrCreate(
            ['user_id' => $this->user->id]
        );

        return Inertia::render('hr/document/edit', [
            'document' => $document->load(['user.department', 'user.designation']),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:png,jpg,jpeg,pdf', 'max:5000'],
            'field' => [
                'required',
                Rule::in([
                    'resume', 'nid_card', 'as_per_nid_image', 'father_nid', 'mother_nid',
                    'relative_nid_primary', 'relative_nid_secondary', 'non_relative_nid_primary',
                    'non_relative_nid_secondary', 'educational_certificate', 'professional_certificate',
                    'training_certificate', 'professional_referance_primary', 'professional_referance_secondary',
                ]),
            ],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ], [
            'file.required' => 'File is required. Please upload an image (png, jpg, jpeg) or PDF.',
            'file.mimes' => 'Invalid file type. Allowed types: png, jpg, jpeg, pdf.',
            'file.max' => 'File size exceeds the 5MB limit.',
            'file.file' => 'The uploaded file is invalid.',
            'file.uploaded' => 'The file failed to upload. Please ensure it is a valid image (png, jpg, jpeg) or PDF and does not exceed 5MB.',
        ]);

        // Check if logged-in user has 'user.edit' permission
        $hasEditPermission = ! is_null($this->user) && $this->user->can('user.edit');
        $hasListPermission = ! is_null($this->user) && $this->user->can('user.list');

        // Determine target user ID
        $targetUserId = $this->user->id;
        if ($hasListPermission && $request->filled('user_id')) {
            $targetUserId = $request->input('user_id');
        }

        $document = Document::firstOrCreate(['user_id' => $targetUserId]);
        $field = $request->input('field');

        // Enforce same-day validation ONLY if the user DOES NOT have 'user.edit' permission
        if (! $hasEditPermission && ! $this->canUpdateToday($document->$field)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => 'You can update this file only on the same day.',
                'key' => uniqid(),
            ]);
        }

        if ($document->$field) {
            $oldFilePath = public_path($document->$field);
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }
        }

        $file = $request->file('file');
        $originalName = preg_replace('/\s+/', '_', $file->getClientOriginalName());

        // Preserve the original upload timestamp so HR's update doesn't reset the user's 10-minute window
        $timestamp = time();
        if ($document->$field) {
            $oldBasename = basename($document->$field);
            $parts = explode('_', $oldBasename);
            if (isset($parts[0]) && is_numeric($parts[0]) && (int)$parts[0] > 1000000000) {
                $timestamp = (int)$parts[0];
            }
        }

        $fileName = $timestamp . '_' . $originalName;

        $destinationPath = public_path('uploads/documents');

        if (! file_exists($destinationPath)) {
            mkdir($destinationPath, 0775, true);
        }

        $file->move($destinationPath, $fileName);

        $filePath = 'uploads/documents/'.$fileName;
        $document->update([$field => $filePath]);

        return back()->with('notification', [
            'type' => 'success',
            'message' => 'Document updated successfully.',
            'key' => uniqid(),
        ]);
    }

private function canUpdateToday(?string $filePath): bool
{
    if (empty($filePath)) {
        return true;
    }

    // Extract timestamp from the filename
    $parts = explode('_', basename($filePath));
    if (isset($parts[0]) && is_numeric($parts[0]) && (int)$parts[0] > 1000000000) {
        $uploadTime = \Carbon\Carbon::createFromTimestamp((int)$parts[0]);
        
        // return $uploadTime->diffInSeconds(now()) <= 10; // 10 seconds validation
        return $uploadTime->isToday(); // 1 day (today) validation
    }

    return true;
}
}