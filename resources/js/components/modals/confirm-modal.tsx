import { ReactNode } from 'react';

import { AppModal } from '@/components/ui/modal/app-modal';
import { Button } from '../ui/button';

type ConfirmModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    onConfirm: () => void;

    title?: string;
    description?: string;

    confirmText?: string;
    cancelText?: string;

    confirmVariant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';

    processing?: boolean;
    processingText?: string;

    icon?: ReactNode;
};

export function ConfirmModal({
    open,
    onOpenChange,
    onConfirm,

    title = 'Are you sure?',
    description = 'Please confirm that you want to continue with this action.',

    confirmText = 'Confirm',
    cancelText = 'Cancel',

    confirmVariant = 'primary',

    processing = false,
    processingText = 'Processing...',

    icon,
}: ConfirmModalProps) {
    const handleClose = () => {
        if (processing) {
            return;
        }

        onOpenChange(false);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            centered
            busy={processing}
            showCloseButton={false}
            classNames={{
                content: 'border-0 shadow',
                body: 'border-0 p-4 text-center',
            }}
        >
            <div className="d-flex flex-column align-items-center">
                {icon ? (
                    <div className="mb-4">
                        {icon}
                    </div>
                ) : (
                    <div
                        className="
                            d-flex
                            align-items-center
                            justify-content-center
                            rounded-circle
                            border-3
                            border-primary
                            text-primary
                            mb-4
                        "
                        style={{
                            width: 80,
                            height: 80,
                            fontSize: 42,
                            fontWeight: 300,
                            lineHeight: 1,
                        }}
                        aria-hidden="true"
                    >
                        ?
                    </div>
                )}

                <h4 className="fs-3 fw-semibold mb-3 text-secondary">
                    {title}
                </h4>

                <p className="text-muted mb-4">
                    {description}
                </p>

                <div className="d-flex align-items-center justify-content-center gap-2">
                    <Button
                        variant={confirmVariant}
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                    >
                        {processing ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                />

                                {processingText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>

                    <Button
                        variant="secondary"
                        appearance="outline"
                        type="button"
                        disabled={processing}
                        onClick={handleClose}
                    >
                        {cancelText}
                    </Button>
                </div>
            </div>
        </AppModal>
    );
}
