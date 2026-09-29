@php
    use Carbon\Carbon;
@endphp

<table>
    <thead>
        <tr>
            <th>Sl</th>
            <th>Date</th>
            <th>Lead Code</th>
            <th>Company Name</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Secondary Phone</th>
            <th>Foreign Phone</th>
            <th>Email</th>
            <th>Area</th>
            <th>Sector</th>
            <th>Profession</th>
            <th>Designation</th>
            <th>Source</th>
            <th>Stage</th>
            <th>Assigned To</th>
            <th>Priority</th>
            <th>Interest Level</th>
            <th>Last Contacted</th>
            <th>Next Follow-up</th>
            <th>Remarks</th>
            <th>Converted</th>
            <th>Converted At</th>
            <th>Customer ID</th>
            <th>Address</th>
            <th>Creator</th>
        </tr>
    </thead>

    <tbody>
        @forelse ($leads as $lead)
            <tr>
                <td class="sticky">{{ $loop->iteration }}</td>
                <td>
                    {{ !empty($lead['created_at']) ? Carbon::parse($lead['created_at'])->format('d-M-Y') : '' }}
                </td>
                <td>{{ $lead['lead_code'] ?? '' }}</td>
                <td>{{ $lead['company_name'] ?? '' }}</td>
                <td>{{ $lead['name'] ?? '' }}</td>
                <td>{{ $lead['phone'] ?? '' }}</td>
                <td>{{ $lead['phone_secondary'] ?? '' }}</td>
                <td>{{ $lead['phone_foreign'] ?? '' }}</td>
                <td>{{ $lead['email'] ?? '' }}</td>
                <td>{{ $lead['area']['name'] ?? '' }}</td>
                <td>{{ $lead['sector']['name'] ?? '' }}</td>
                <td>{{ $lead['profession']['name'] ?? '' }}</td>
                <td>{{ $lead['designation']['name'] ?? '' }}</td>
                <td>{{ $lead['lead_source']['name'] ?? '' }}</td>
                <td>{{ $lead['stage']['name'] ?? '' }}</td>
                <td>{{ $lead['assigned_user']['name'] ?? '' }}</td>
                <td>{{ ucfirst($lead['priority'] ?? '') }}</td>
                <td>{{ ucfirst($lead['interest_level'] ?? '') }}</td>
                <td>
                    {{ !empty($lead['last_contacted_at']) ? Carbon::parse($lead['last_contacted_at'])->format('d-M-Y') : '' }}
                </td>
                <td>
                    {{ !empty($lead['next_follow_up_at']) ? Carbon::parse($lead['next_follow_up_at'])->format('d-M-Y') : '' }}
                </td>
                <td>{{ $lead['remarks'] ?? '' }}</td>
                <td>{{ !empty($lead['is_converted']) ? 'Yes' : 'No' }}</td>
                <td>
                    {{ !empty($lead['converted_at']) ? Carbon::parse($lead['converted_at'])->format('d-M-Y') : '' }}
                </td>
                <td>{{ $lead['customer_id'] ?? '' }}</td>
                <td>{{ $lead['address'] ?? '' }}</td>
                <td>{{ $lead['created_by']['name'] ?? '' }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="26" class="text-center">No leads found.</td>
            </tr>
        @endforelse
    </tbody>
</table>
