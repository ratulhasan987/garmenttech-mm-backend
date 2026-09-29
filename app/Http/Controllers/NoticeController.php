<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NoticeController extends Controller
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
        if (is_null($this->user) || !$this->user->can('notice.list')) {
            abort(403, 'Unauthorized access');
        }

        $query = Notice::query();

        if ($request->filled('notice_id')) {
            $query->where('id', $request->input('notice_id'));
        }

        if ($request->filled('sorting')) {
            $sortOrder = $request->input('sorting') === 'asc' ? 'asc' : 'desc';
            $query->orderBy('created_at', $sortOrder);
        } else {
            $query->latest();
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $numberOfNotices = $query->count();
        $notices = $query->paginate(30);

        return Inertia::render('notice/index', [
            'notices' => $notices,
            'numberOfNotices' => $numberOfNotices,
            'filters' => $request->only(['notice_id', 'sorting', 'start_date', 'end_date']),

            // Add this 'can' array to pass permissions to React
            'can' => [
                'create' => !is_null($this->user) && $this->user->can('notice.create'),
                'edit' => !is_null($this->user) && $this->user->can('notice.edit'),
                'delete' => !is_null($this->user) && $this->user->can('notice.delete'),
            ]
        ]);
    }

    public function getNotices(Request $request)
    {
        $keyword = $request->keyword;
        $query = DB::table('notices')->select('id', 'title');

        if (!empty($keyword)) {
            $query->where('title', 'like', "%{$keyword}%");
        }

        $notices = $query->orderBy('id')->limit(20)->get();

        $notices->transform(function ($item) {
            $item->title = mb_strlen($item->title) > 30 ? mb_substr($item->title, 0, 30) . '...' : $item->title;
            return $item;
        });

        return response()->json($notices);
    }

    public function create()
    {
        if (is_null($this->user) || !$this->user->can('notice.create')) {
            abort(403, 'Unauthorized access');
        }
        return Inertia::render('notice/create');
    }

    public function store(Request $request)
    {
        if (is_null($this->user) || !$this->user->can('notice.create')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'title' => ['required', 'string', 'min:2', 'max:255'],
            'description' => ['required', 'string']
        ]);

        Notice::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
        ]);


        return redirect()->route('notice.index')->with('notification', [
            'message' => 'Notice Created successfully!',
            'type' => 'success'
        ]);
    }

    public function edit(Notice $notice)
    {
        if (is_null($this->user) || !$this->user->can('notice.edit')) {
            abort(403, 'Unauthorized access');
        }
        return Inertia::render('notice/edit', ['notice' => $notice]);
    }

    public function update(Request $request, Notice $notice)
    {
        if (is_null($this->user) || !$this->user->can('notice.edit')) {
            abort(403, 'Unauthorized access');
        }

        $request->validate([
            'title' => ['required', 'string', 'min:2', 'max:255'],
            'description' => ['required', 'string']
        ]);

        $notice->update([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return redirect()->route('notice.index')->with('notification', [
            'message' => 'Notice Updated successfully!',
            'type' => 'success'
        ]);
    }

    public function destroy(Notice $notice)
    {
        if (is_null($this->user) || !$this->user->can('notice.delete')) {
            abort(403, 'Unauthorized access');
        }

        $notice->delete();

        return back()->with('notification', [
            'message' => 'Notice Deleted successfully!',
            'type' => 'warning'
        ]);
    }



    // User Notice List Page
    public function notice()
    {
        if (is_null($this->user) || !$this->user->can('user.notice')) {
            abort(403, 'Unauthorized access');
        }

        $notices = Notice::latest()->get();

        return Inertia::render('notice/userNotice', [
            'notices' => $notices
        ]);
    }

    // Notice Details Page
    public function show(Notice $notice)
    {
        if (is_null($this->user) || !$this->user->can('user.notice')) {
            abort(403, 'Unauthorized access');
        }

        return Inertia::render('notice/userNoticeDetails', [
            'notice' => $notice
        ]);
    }
}
