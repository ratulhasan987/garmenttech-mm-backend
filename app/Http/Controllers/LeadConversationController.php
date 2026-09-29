<?php

namespace App\Http\Controllers;

use App\Events\LeadFollowup;
use App\Models\Area;
use App\Models\Client;
use App\Models\Country;
use App\Models\Designation;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\LeadStage;
use App\Models\Profession;
use App\Models\Project;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LeadConversationController extends Controller
{
    public $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = auth()->guard('web')->user();
            return $next($request);
        });
    }

    public function create(Lead $lead)
    {
        if (is_null($this->user) || !$this->user->can('lead.conversation')) {
            abort('403', 'Unauthorized access');
        }

        if (!$this->user->can('lead.global')) {

            $userId = auth()->id();

            $isOwner = $lead->created_by === $userId;
            $isAssigned = $lead->assigned_to === $userId;

            if (!$isOwner && !$isAssigned) {
                abort(403, 'Unauthorized access');
            }
        }

        // Load conversations
        $lead->load([
            'leadConversations.user',
            'assignedUser:id,name',
            'profession:id,name',
            'designation:id,name',
            'area:id,name',
            'sector:id,name',
            'leadStage:id,name,color',
            'leadSource:id,name',
        ]);

        $data = [];
        $data['sources'] = LeadSource::orderBy('name', 'asc')->get();
        $data['stages'] = LeadStage::orderBy('order', 'asc')->get();
        $data['sectors'] = Sector::orderBy('name', 'asc')->get();
        $data['areas'] = Area::orderBy('name', 'asc')->get();
        $data['professions'] = Profession::orderBy('name', 'asc')->get();
        $data['designations'] = Designation::orderBy('name', 'asc')->get();

        return Inertia::render('crm/leads/conversation/lead-conversation', [
            'lead' => $lead,
            'sources' => $data['sources'],
            'stages' => $data['stages'],
            'sectors' => $data['sectors'],
            'areas' => $data['areas'],
            'professions' => $data['professions'],
            'designations' => $data['designations'],
        ]);
    }

    // public function store(Request $request, Lead $lead)
    // {
    //     // return $request->all();

    //     if (is_null($this->user) || !$this->user->can('lead.conversation')) {
    //         abort('403', 'Unauthorized access');
    //     }

    //     if(!$this->user->can('lead.global')){
    //         // Check if lead is assigned to the current user
    //         if ($lead->assigned_to !== auth()->id()) {
    //             abort(403, 'Unauthorized access');
    //         }
    //     }

    //     if ($lead->status === 'converted') {
    //         $notification = array(
    //             'message'=> 'Your can not add new conversation, cause the lead already converted to client.',
    //             'type'=> 'error'
    //         );
    //         return redirect()->back()->with($notification);
    //     }

    //     // Convert checkbox to boolean
    //     $request->merge([
    //         'requires_follow_up' => $request->has('requires_follow_up') ? true : false
    //     ]);

    //     // Validation rules
    //     $rules = [
    //         'channel' => 'required|in:call,whatsapp,email,sms,meeting,note',
    //         'call_direction' => 'nullable|in:inbound,outbound',
    //         'call_duration' => 'nullable|integer|min:0',
    //         'message' => 'required|string|max:2000',
    //         'requires_follow_up' => 'required|boolean',
    //         'next_follow_up_at' => 'nullable|date|after:now',
    //         'stage' => 'nullable|exists:lead_stages,id',
    //     ];

    //     // Custom dependency validation
    //     $validator = Validator::make($request->all(), $rules);

    //     // If channel = call, call_direction and call_duration are required
    //     $validator->sometimes(['call_direction', 'call_duration'], 'required', function($input) {
    //         return $input->channel === 'call';
    //     });

    //     // If requires_follow_up is checked, next_follow_up_at is required
    //     $validator->sometimes('next_follow_up_at', 'required|date|after:now', function($input){
    //         return isset($input->requires_follow_up) && $input->requires_follow_up;
    //     });

    //     // Validate
    //     $validator->validate();

    //     // Store conversation
    //     $conversation = $lead->leadConversations()->create([
    //         'user_id' => auth()->id(),
    //         'channel' => $request->channel,
    //         'call_direction' => $request->call_direction,
    //         'call_duration' => $request->call_duration,
    //         'message' => $request->message,
    //         'requires_follow_up' => $request->requires_follow_up,
    //         'next_follow_up_at' => $request->requires_follow_up ? $request->next_follow_up_at : null,
    //         'stage_id' => $request->stage,
    //     ]);

    //     // Lead Stage Priority and Interest Level Update
    //      $lead->update([
    //         'last_contacted_at' => now(),
    //         'next_follow_up_at' => $request->requires_follow_up ? $request->next_follow_up_at : null,
    //         'remarks' => $request->message ?? $lead->remarks,
    //         'stage_id' => $request->stage ?? $lead->stage_id,
    //         'priority' => $request->priority,
    //         'interest_level' => $request->interest_level,
    //     ]);

    //     // if($request->next_follow_up_at){
    //     //     DB::table('lead_followup_notifications')->insert([
    //     //         'lead_id' => $lead->id,
    //     //         'user_id' => $lead->assigned_to ?? auth()->user()->id,
    //     //         'notify_at' => $request->next_follow_up_at,
    //     //         'created_at' => now(),
    //     //         'updated_at' => now()
    //     //     ]);
    //     // }

    //     $notification = array(
    //         'message'=> 'Conversation added successfully.',
    //         'type'=> 'success'
    //     );
    //     return redirect()->back()->with($notification);
    // }


    public function store(Request $request, Lead $lead)
    {
        if (is_null($this->user) || !$this->user->can('lead.conversation')) {
            abort(403, 'Unauthorized access');
        }

        // If user doesn't have global permission, ensure the lead is assigned to them
        if (!$this->user->can('lead.global')) {

            $userId = auth()->id();

            $isOwner = $lead->created_by === $userId;
            $isAssigned = $lead->assigned_to === $userId;

            if (!$isOwner && !$isAssigned) {
                abort(403, 'Unauthorized access');
            }
        }

        // Prevent adding conversation after conversion
        // if ($lead->is_converted) {
        //     return redirect()->back()->with([
        //         'message' => 'This lead has already been converted to a customer.',
        //         'type' => 'error'
        //     ]);
        // }

        // Convert checkbox to boolean
        $request->merge([
            'requires_follow_up' => $request->boolean('requires_follow_up')
        ]);

        // Validation Rules
        $rules = [
            'channel' => 'required|in:call,whatsapp,email,sms,meeting,note',
            'call_direction' => 'nullable|in:inbound,outbound',
            'call_duration' => 'nullable|integer|min:0',
            'message' => 'required|string|max:2000',
            'requires_follow_up' => 'required|boolean',
            'next_follow_up_at' => 'nullable|date|after:now',
            'stage' => 'nullable|exists:lead_stages,id',
            'priority' => 'required|in:low,medium,high',
            'interest_level' => 'nullable|in:cold,warm,hot',
        ];

        $validator = Validator::make($request->all(), $rules);

        // Required for Call
        // $validator->sometimes(['call_direction', 'call_duration'], 'required', function ($input) {
        //     return $input->channel == 'call';
        // });

        // Required for Follow-up
        $validator->sometimes('next_follow_up_at', 'required|date|after:now', function ($input) {
            return $input->requires_follow_up;
        });

        $validator->validate();

        DB::beginTransaction();

        try {

            /*
            |--------------------------------------------------------------------------
            | Save Conversation
            |--------------------------------------------------------------------------
            */

            $lead->leadConversations()->create([
                'user_id' => auth()->id(),
                'channel' => $request->channel,
                'call_direction' => $request->call_direction,
                'call_duration' => $request->call_duration,
                'message' => $request->message,
                'requires_follow_up' => $request->requires_follow_up,
                'next_follow_up_at' => $request->requires_follow_up ? $request->next_follow_up_at : null,
                'stage_id' => $request->stage,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Update Lead
            |--------------------------------------------------------------------------
            */

            $lead->update([
                'last_contacted_at' => now(),
                'next_follow_up_at' => $request->requires_follow_up ? $request->next_follow_up_at : null,
                'remarks' => $request->message,
                'stage_id' => $request->stage ?? $lead->stage_id,
                'priority' => $request->priority,
                'interest_level' => $request->interest_level,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Auto Convert To Customer
            |--------------------------------------------------------------------------
            */

            if ($request->filled('stage')) {

                $stage = LeadStage::find($request->stage);

                if (
                    $stage &&
                    $stage->is_convert_to_customer &&
                    !$lead->is_converted
                ) {

                    // Check existing customer
                    $client = Client::where('lead_id', $lead->id)
                        ->orWhere('phone', $lead->phone)
                        ->first();

                    if (!$client) {

                        /*
                        |--------------------------------------------------------------------------
                        | Generate Customer Number
                        |--------------------------------------------------------------------------
                        */

                        $year = date('y');

                        $lastClient = Client::where('client_no', 'like', "C{$year}%")
                            ->latest('id')
                            ->first();

                        if ($lastClient) {

                            $lastNumber = (int) substr($lastClient->client_no, 3);

                            $newNumber = $lastNumber + 1;

                        } else {

                            $newNumber = 1;
                        }

                        $clientNo = 'C' . $year . str_pad($newNumber, 6, '0', STR_PAD_LEFT);

                        /*
                        |--------------------------------------------------------------------------
                        | Create Customer
                        |--------------------------------------------------------------------------
                        */

                        $client = Client::create([

                            'client_no' => $clientNo,

                            'lead_id' => $lead->id,

                            'name' => $lead->name,
                            'phone' => $lead->phone,
                            'email' => $lead->email,

                            'profession_id' => $lead->profession_id,
                            'lead_designation_id' => $lead->designation_id,

                            'area_id' => $lead->area_id,
                            'sector_id' => $lead->sector_id,

                            'present_address' => $lead->address,
                            'permanent_address' => $lead->address,

                            'status' => 'active',

                            'created_by' => auth()->id(),
                        ]);

                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Update Lead Conversion Status
                    |--------------------------------------------------------------------------
                    */

                    $lead->update([
                        'is_converted' => true,
                        'converted_at' => now(),
                        // Uncomment if you add client_id in leads table
                        'client_id' => $client->id,
                    ]);

                }

            }

            /*
            |--------------------------------------------------------------------------
            | Follow-up Notification
            |--------------------------------------------------------------------------
            */

            if ($request->next_follow_up_at) {
                DB::table('lead_followup_notifications')->insert([
                    'lead_id' => $lead->id,
                    'user_id' => $lead->assigned_to ?? auth()->id(),
                    'notify_at' => $request->next_follow_up_at,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // $notificationId = DB::table('lead_followup_notifications')->insertGetId([
                //     'lead_id' => $lead->id,
                //     'user_id' => $lead->assigned_to ?? auth()->id(),
                //     'notify_at' => $request->next_follow_up_at,
                //     'created_at' => now(),
                //     'updated_at' => now(),
                // ]);

                // $notification = DB::table('lead_followup_notifications')
                //     ->join('leads', 'leads.id', '=', 'lead_followup_notifications.lead_id')
                //     ->where('lead_followup_notifications.id', $notificationId)
                //     ->select([
                //         'lead_followup_notifications.*',
                //         'leads.name',
                //         'leads.company_name',
                //     ])
                //     ->first();

                // event(new LeadFollowup($notification));

            }

            DB::commit();

            return redirect()->back()->with("notification", [
                'message' => $lead->is_converted
                    ? 'Conversation added successfully. Lead converted to customer.'
                    : 'Conversation added successfully.',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            report($e);

            return redirect()->back()->with('notification', [
                'message' => app()->isLocal()
                    ? $e->getMessage()
                    : 'Something went wrong. Please try again.',
                'type' => 'error',
                'key' => (string) str()->uuid(),
            ]);
        }
    }


}
