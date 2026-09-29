<?php

namespace App\Http\Controllers;

use App\Models\LeadFollowupNotification;
use Illuminate\Http\Request;

class LeadFollowupNotificationController extends Controller
{
    public function destroy($id)
    {
        LeadFollowupNotification::where('id',$id)
            ->where('user_id',auth()->id())
            ->delete();

        return response()->json(['success'=>true]);

    }
}
