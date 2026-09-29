import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function FlashNotification() {
    const { flash } = usePage().props;

    useEffect(() => {
        const notification = flash?.notification;

        if (!notification?.message) {
            return;
        }

        switch (notification.type) {
            case 'success':
                toast.success(notification.message);
                break;

            case 'error':
                toast.error(notification.message);
                break;

            case 'warning':
                toast.warning(notification.message);
                break;

            case 'info':
                toast.info(notification.message);
                break;
        }
    }, [
        flash?.notification?.key,
        flash?.notification?.message,
        flash?.notification?.type,
    ]);

    return null;
}
