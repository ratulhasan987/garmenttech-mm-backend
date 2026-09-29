import { AppModal } from '@/components/ui/modal/app-modal';
import { Button } from '../ui/button';

type DeleteConfirmModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    onConfirm: () => void;
    
    processing?: boolean;
};

export function DeleteConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    processing = false,
}: DeleteConfirmModalProps) {
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
                {/* Warning icon */}
                <div
                    className="d-flex align-items-center justify-content-center rounded-circle border border-3 border-warning text-warning mb-4"
                    style={{
                        width: 80,
                        height: 80,
                        fontSize: 48,
                        fontWeight: 300,
                        lineHeight: 1,
                    }}
                    aria-hidden="true"
                >
                    !
                </div>

                {/* Title */}
                <h4 className="fs-2 fw-semibold mb-3 text-secondary">
                    Are you sure you want to delete this record?

                </h4>

                {/* Description */}
                <p className="text-muted mb-4">
                    If you delete this, it will be gone forever.
                </p>

                {/* Actions */}
                <div className="d-flex align-items-center justify-content-center gap-2">
                    <Button variant="danger" type="button"
                        disabled={processing}
                        onClick={onConfirm}>
                        {processing
                            ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        aria-hidden="true"
                                    />

                                    Deleting...
                                </>
                            )
                            : 'Yes, delete it!'}
                    </Button>


                    <Button
                    variant="primary"
                        appearance="outline"
                        type="button"
                        disabled={processing}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </AppModal>
    );
}
