import {
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useRef,
} from 'react';

import { cn } from '@/lib/utils';

type BootstrapModalInstance = {
    show: () => void;
    hide: () => void;
    dispose: () => void;
};

type BootstrapModalConstructor = {
    getOrCreateInstance: (
        element: HTMLElement,
        options?: {
            backdrop?: boolean | 'static';
            keyboard?: boolean;
            focus?: boolean;
        },
    ) => BootstrapModalInstance;
};

declare global {
    interface Window {
        bootstrap?: {
            Modal: BootstrapModalConstructor;
        };
    }
}

export type ModalSize =
    | 'sm'   
    | 'md'   
    | 'lg'
    | 'xl'
    | 'fullscreen'
    | 'fullscreen-sm-down'
    | 'fullscreen-md-down'
    | 'fullscreen-lg-down'
    | 'fullscreen-xl-down'
    | 'fullscreen-xxl-down';

export type ModalClassNames = {
    root?: string;
    dialog?: string;
    content?: string;
    header?: string;
    title?: string;
    body?: string;
    footer?: string;
    closeButton?: string;
};

type AppModalProps = {
    open: boolean;

    onOpenChange: (open: boolean) => void;

    title?: ReactNode;

    children: ReactNode;

    footer?: ReactNode;

    size?: ModalSize;

    centered?: boolean;

    scrollable?: boolean;

    /**
     * Allow closing the modal by clicking
     * outside of the modal.
     *
     * Default: false
     */
    closeOnBackdropClick?: boolean;

    /**
     * Allow closing the modal with Escape.
     *
     * Default: true
     */
    keyboard?: boolean;

    /**
     * Prevent all closing while an asynchronous
     * operation is running.
     *
     * Useful for:
     * - form submissions
     * - delete requests
     * - API requests
     * - uploads
     *
     * Default: false
     */
    busy?: boolean;

    /**
     * Show Bootstrap close button in header.
     *
     * Default: true
     */
    showCloseButton?: boolean;

    classNames?: ModalClassNames;
};

export function AppModal({
    open,
    onOpenChange,

    title,
    children,
    footer,

    size,

    centered = true,
    scrollable = false,

    closeOnBackdropClick = true,
    keyboard = true,

    busy = false,

    showCloseButton = true,

    classNames,
}: AppModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    const instanceRef =
        useRef<BootstrapModalInstance | null>(null);

    /**
     * Used to tell the Bootstrap hide event
     * that React intentionally requested closing.
     */
    const allowNextHideRef = useRef(false);

    /**
     * Native Bootstrap event listeners don't automatically
     * know about the newest React props.
     *
     * Refs keep their latest values available.
     */
    const busyRef = useRef(busy);

    const closeOnBackdropClickRef =
        useRef(closeOnBackdropClick);

    const onOpenChangeRef =
        useRef(onOpenChange);

    const generatedId = useId().replace(/:/g, '');

    const titleId =
        `app-modal-title-${generatedId}`;

    /*
    |--------------------------------------------------------------------------
    | Keep refs synchronized with current props
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        busyRef.current = busy;
    }, [busy]);

    useEffect(() => {
        closeOnBackdropClickRef.current =
            closeOnBackdropClick;
    }, [closeOnBackdropClick]);

    useEffect(() => {
        onOpenChangeRef.current =
            onOpenChange;
    }, [onOpenChange]);

    /*
    |--------------------------------------------------------------------------
    | Get / Create Bootstrap modal instance
    |--------------------------------------------------------------------------
    */

    const getModalInstance =
        useCallback(() => {
            const element =
                modalRef.current;

            if (!element) {
                return null;
            }

            if (instanceRef.current) {
                return instanceRef.current;
            }

            if (!window.bootstrap?.Modal) {
                console.error(
                    'Bootstrap Modal is unavailable. Make sure riho/assets/js/bootstrap/bootstrap.bundle.min.js is loaded.',
                );

                return null;
            }

            /**
             * Backdrop is enabled.
             *
             * Whether clicking that backdrop is allowed to close
             * the modal is controlled by handleHide().
             *
             * Bootstrap keyboard handling is disabled because
             * React handles Escape below.
             */
            const instance =
                window.bootstrap.Modal.getOrCreateInstance(
                    element,
                    {
                        backdrop: true,
                        keyboard: false,
                        focus: true,
                    },
                );

            instanceRef.current =
                instance;

            return instance;
        }, []);

    /*
    |--------------------------------------------------------------------------
    | Bootstrap modal events
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const element =
            modalRef.current;

        if (!element) {
            return;
        }

        /**
         * Runs immediately before Bootstrap
         * attempts to hide the modal.
         */
        const handleHide = (
            event: Event,
        ) => {
            /**
             * Never allow closing while busy.
             *
             * This protects against:
             *
             * - backdrop clicks
             * - Bootstrap JS calls
             * - data-bs-dismiss
             * - accidental closing
             */
            if (busyRef.current) {
                event.preventDefault();

                allowNextHideRef.current =
                    false;

                return;
            }

            /**
             * React intentionally requested this hide.
             *
             * Examples:
             *
             * - close button
             * - Escape
             * - open changes to false
             */
            if (allowNextHideRef.current) {
                allowNextHideRef.current =
                    false;

                return;
            }

            /**
             * Bootstrap itself requested the hide.
             *
             * Usually this means backdrop click.
             */
            if (
                !closeOnBackdropClickRef.current
            ) {
                event.preventDefault();
            }
        };

        /**
         * Runs after modal is completely hidden.
         */
        const handleHidden = () => {
            allowNextHideRef.current =
                false;

            onOpenChangeRef.current(
                false,
            );
        };

        element.addEventListener(
            'hide.bs.modal',
            handleHide,
        );

        element.addEventListener(
            'hidden.bs.modal',
            handleHidden,
        );

        return () => {
            element.removeEventListener(
                'hide.bs.modal',
                handleHide,
            );

            element.removeEventListener(
                'hidden.bs.modal',
                handleHidden,
            );

            instanceRef.current?.dispose();

            instanceRef.current = null;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Synchronize React `open` with Bootstrap
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const instance =
            getModalInstance();

        const element =
            modalRef.current;

        if (!instance || !element) {
            return;
        }

        /*
         * OPEN
         */
        if (open) {
            if (
                !element.classList.contains(
                    'show',
                )
            ) {
                instance.show();
            }

            return;
        }

        /*
         * CLOSE
         *
         * If an asynchronous operation is still
         * running, do not close yet.
         */
        if (busy) {
            return;
        }

        if (
            element.classList.contains(
                'show',
            )
        ) {
            allowNextHideRef.current =
                true;

            instance.hide();
        }
    }, [
        open,
        busy,
        getModalInstance,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Controlled close function
    |--------------------------------------------------------------------------
    */

    const requestClose =
        useCallback(() => {
            /**
             * Do absolutely nothing when busy.
             */
            if (busy) {
                return;
            }

            const instance =
                getModalInstance();

            if (!instance) {
                return;
            }

            allowNextHideRef.current =
                true;

            instance.hide();
        }, [
            busy,
            getModalInstance,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Escape key handling
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!open || !keyboard) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                event.key !== 'Escape'
            ) {
                return;
            }

            event.preventDefault();

            /*
             * Don't close while processing.
             */
            if (busy) {
                return;
            }

            requestClose();
        };

        document.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [
        open,
        keyboard,
        busy,
        requestClose,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div
            ref={modalRef}
            className={cn(
                'modal fade',
                classNames?.root,
            )}
            tabIndex={-1}
            aria-hidden="true"
            aria-labelledby={
                title
                    ? titleId
                    : undefined
            }
            aria-busy={
                busy
                    ? true
                    : undefined
            }
        >
            <div
                className={cn(
                    'modal-dialog',

                    centered &&
                    'modal-dialog-centered',

                    scrollable &&
                    'modal-dialog-scrollable',

                    size &&
                    `modal-${size}`,

                    classNames?.dialog,
                )}
            >
                <div
                    className={cn(
                        'modal-content',
                        classNames?.content,
                    )}
                >
                    {(title ||
                        showCloseButton) && (
                            <div
                                className={cn(
                                    'modal-header',
                                    classNames?.header,
                                )}
                            >
                                {title && (
                                    <h5
                                        id={
                                            titleId
                                        }
                                        className={cn(
                                            'modal-title',
                                            classNames?.title,
                                        )}
                                    >
                                        {
                                            title
                                        }
                                    </h5>
                                )}

                                {showCloseButton && (
                                    <button
                                        type="button"
                                        className={cn(
                                            'btn-close py-0',
                                            classNames?.closeButton,
                                        )}
                                        aria-label="Close"
                                        disabled={
                                            busy
                                        }
                                        onClick={
                                            requestClose
                                        }
                                    />
                                )}
                            </div>
                        )}

                    <div
                        className={cn(
                            'modal-body',
                            classNames?.body,
                        )}
                    >
                        {children}
                    </div>

                    {footer && (
                        <div
                            className={cn(
                                'modal-footer',
                                classNames?.footer,
                            )}
                        >
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
