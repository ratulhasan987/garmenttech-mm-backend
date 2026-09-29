import { Button } from '@/components/ui/button';
import { AppModal } from '@/components/ui/modal/app-modal';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Increment = {
    id: number;

    increment_type: 'percentage' | 'fixed';

    increment_value: number | string;

    increment_amount: number | string;

    old_basic_salary: number | string;

    new_basic_salary: number | string;

    effective_date: string;

    status: 'pending' | 'approved' | 'rejected';

    user: {
        id: number;
        employee_id: string;
        name: string;

        department?: {
            id: number;
            name: string;
        } | null;

        designation?: {
            id: number;
            name: string;
        } | null;
    };
};

type Props = {
    open: boolean;

    increment: Increment | null;

    onClose: () => void;

    onApprove: () => void;

    onReject: () => void;

    canChangeStatus: boolean;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function money(value: number | string | null | undefined): string {
    return Number(value ?? 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,

        maximumFractionDigits: 2,
    });
}

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',

        month: 'short',

        year: 'numeric',
    });
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
    status,
}: {
    status: 'pending' | 'approved' | 'rejected';
}) {
    if (status === 'approved') {
        return <span className="badge bg-success">Approved</span>;
    }

    if (status === 'rejected') {
        return <span className="badge bg-danger">Rejected</span>;
    }

    return <span className="badge bg-warning text-dark">Pending</span>;
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function IncrementShowModal({
    open,
    increment,
    onClose,
    onApprove,
    onReject,
    canChangeStatus,
}: Props) {
    const canApprove = Boolean(
        increment && canChangeStatus && increment.status === 'pending',
    );

    return (
        <AppModal
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
            title="Increment Details"
            size="md"
            centered
            footer={
                <div className="d-flex justify-content-end gap-2">
                    {canApprove && (
                        <>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={onReject}
                            >
                                Reject
                            </Button>

                            <Button
                                type="button"
                                variant="success"
                                onClick={onApprove}
                            >
                                Approve
                            </Button>
                        </>
                    )}

                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            }
        >
            {!increment ? (
                <div className="text-center text-muted py-4">
                    No increment selected.
                </div>
            ) : (
                <>
                    {/* Employee */}

                    <div className="border rounded p-3 mb-4">
                        <div className="d-flex align-items-center gap-3">
                            {/* <div
                                className="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                    width: 56,
                                    height: 56,
                                }}
                            >
                                <strong>
                                    {increment.user.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </strong>
                            </div> */}

                            <div>
                                <h6 className="mb-1">{increment.user.name}</h6>

                                <div className="text-muted small">
                                    Employee ID: {increment.user.employee_id}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}

                    <div className="table-responsive">
                        <table className="table table-sm table-borderless">
                            <tbody>
                                <tr>
                                    <th className="text-muted fw-normal">
                                        Department
                                    </th>

                                    <td className="text-end">
                                        {increment.user.department?.name ?? '-'}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Designation
                                    </th>

                                    <td className="text-end">
                                        {increment.user.designation?.name ??
                                            '-'}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Increment Type
                                    </th>

                                    <td className="text-end text-capitalize">
                                        {increment.increment_type}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Increment Value
                                    </th>

                                    <td className="text-end">
                                        {increment.increment_value}

                                        {increment.increment_type ===
                                            'percentage' && ' %'}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Increment Amount
                                    </th>

                                    <td className="text-end">
                                        {money(increment.increment_amount)}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Old Basic Salary
                                    </th>

                                    <td className="text-end">
                                        {money(increment.old_basic_salary)}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        New Basic Salary
                                    </th>

                                    <td className="text-end fw-semibold">
                                        {money(increment.new_basic_salary)}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Effective Date
                                    </th>

                                    <td className="text-end">
                                        {formatDate(increment.effective_date)}
                                    </td>
                                </tr>

                                <tr>
                                    <th className="text-muted fw-normal">
                                        Status
                                    </th>

                                    <td className="text-end">
                                        <StatusBadge
                                            status={increment.status}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </AppModal>
    );
}
