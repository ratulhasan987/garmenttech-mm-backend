import { useEffect, useRef, useState } from 'react';

import type { ReactElement } from 'react';

interface TooltipProps {
    children: ReactElement;
    title: string;
    placement?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
    showOnlyIfTruncated?: boolean;
}

interface BootstrapTooltipInstance {
    dispose: () => void;
}

interface BootstrapTooltipConstructor {
    new (
        element: HTMLElement,
        options?: {
            placement?: string;
        },
    ): BootstrapTooltipInstance;
}

export default function Tooltip({
    children,
    title,
    placement = 'top',
    showOnlyIfTruncated = false,
}: TooltipProps) {
    const wrapperRef = useRef<HTMLSpanElement | null>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const element = wrapper?.firstElementChild as HTMLElement | null;

        if (!element) {
            return;
        }

        const checkTruncation = () => {
            setIsTruncated(element.scrollWidth > element.clientWidth);
        };

        checkTruncation();

        const resizeObserver = new ResizeObserver(checkTruncation);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
        };
    }, [title]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const BootstrapTooltip = (window.bootstrap as any)?.Tooltip;

        if (!wrapper || !BootstrapTooltip) {
            return;
        }

        const shouldShow = !showOnlyIfTruncated || isTruncated;

        if (!shouldShow) {
            return;
        }

        const tooltip = new BootstrapTooltip(wrapper, {
            placement,
        });

        return () => {
            tooltip.dispose();
        };
    }, [
        placement,
        title,
        isTruncated,
        showOnlyIfTruncated,
    ]);

    return (
        <span
            ref={wrapperRef}
            data-bs-toggle={
                !showOnlyIfTruncated || isTruncated
                    ? 'tooltip'
                    : undefined
            }
            data-bs-placement={placement}
            title={
                !showOnlyIfTruncated || isTruncated
                    ? title
                    : undefined
            }
        >
            {children}
        </span>
    );
}

// import { useEffect, useRef } from 'react';

// import type { ReactElement } from 'react';

// interface TooltipProps {
//     children: ReactElement;
//     title: string;
//     placement?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
// }

// export default function Tooltip({
//     children,
//     title,
//     placement = 'top',
// }: TooltipProps) {
//     const elementRef = useRef<HTMLElement | null>(null);

//     useEffect(() => {
//         const element = elementRef.current;

//         // @ts-expect-error Bootstrap is provided globally by the template
//         const BootstrapTooltip = window.bootstrap?.Tooltip;

//         if (!element || !BootstrapTooltip) {
//             return;
//         }

//         const tooltip = new BootstrapTooltip(element, {
//             placement,
//         });

//         return () => {
//             tooltip.dispose();
//         };
//     }, [placement, title]);

//     return (
//         <span
//             ref={elementRef}
//             data-bs-toggle="tooltip"
//             data-bs-placement={placement}
//             title={title}
//         >
//             {children}
//         </span>
//     );
// }
