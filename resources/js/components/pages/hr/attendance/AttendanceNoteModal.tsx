import { FileText } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppModal } from '@/components/ui/modal/app-modal';
import { Button } from '@/components/ui/button';

type AttendanceNoteModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    employeeName?: string;
    date?: string;

    checkInNote?: string | null;
    checkOutNote?: string | null;

    children?: ReactNode;
};

export default function AttendanceNoteModal({
    open,
    onOpenChange,
    employeeName,
    date,
    checkInNote,
    checkOutNote,
    children,
}: AttendanceNoteModalProps) {
    const hasCheckInNote = Boolean(
        checkInNote?.trim(),
    );

    const hasCheckOutNote = Boolean(
        checkOutNote?.trim(),
    );

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            centered
            size="md"
            showCloseButton
            classNames={{
                content: 'border-0 shadow',
                header: 'border-bottom',
                body: 'p-4',
                footer: 'border-top',
            }}
            title={
                <div className="d-flex align-items-center gap-2">
                    <span
                        className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary"
                        style={{
                            width: 34,
                            height: 34,
                        }}
                    >
                        <FileText size={16} />
                    </span>

                    <div>
                        <h5 className="mb-0">
                            Attendance Notes
                        </h5>

                        {(employeeName || date) && (
                            <small className="text-muted">
                                {employeeName}

                                {employeeName && date
                                    ? ' • '
                                    : ''}

                                {date}
                            </small>
                        )}
                    </div>
                </div>
            }
            footer={
                <div className="d-flex justify-content-end w-100">
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                    >
                        Close
                    </Button>
                </div>
            }
        >
            {children ? (
                children
            ) : (
                <div className="d-flex flex-column gap-3">
                    {/* CHECK-IN NOTE */}

                    <div>
                        <label className="form-label fw-semibold mb-2">
                            Check In Note
                        </label>

                        <div
                            className={`rounded border p-3 ${
                                hasCheckInNote
                                    ? 'bg-light'
                                    : 'text-muted'
                            }`}
                            style={{
                                minHeight: 70,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                        >
                            {hasCheckInNote
                                ? checkInNote
                                : 'No check-in note.'}
                        </div>
                    </div>

                    {/* CHECK-OUT NOTE */}

                    <div>
                        <label className="form-label fw-semibold mb-2">
                            Check Out Note
                        </label>

                        <div
                            className={`rounded border p-3 ${
                                hasCheckOutNote
                                    ? 'bg-light'
                                    : 'text-muted'
                            }`}
                            style={{
                                minHeight: 70,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                        >
                            {hasCheckOutNote
                                ? checkOutNote
                                : 'No check-out note.'}
                        </div>
                    </div>
                </div>
            )}
        </AppModal>
    );
}