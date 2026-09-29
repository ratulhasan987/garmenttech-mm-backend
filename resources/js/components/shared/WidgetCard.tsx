import { rihoAsset } from '@/lib/riho';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

type WidgetCardProps = {
    label: string;
    value?: string | number | null;
    iconSrc?: string;
    fill?: string;
    href?: string;
    className?: string;
    classNames?: {
        root?: string;
        label?: string;
    };
};

export function WidgetCard({
    label,
    iconSrc,
    href,
    fill,
    value = 0,

    className,
    classNames,
}: WidgetCardProps) {
    return (
        <div
            className={cn(
                'col-12 col-md-6 col-xl-3',
                className,
                classNames?.root,
            )}
        >
            <Link href={href ?? '/'}>
                <div className="card widget-1">
                    <div className="card-body">
                        <div className="widget-content">
                            <div className="widget-round warning">
                                <div className="bg-round">
                                    <svg fill={fill}>
                                        <use
                                            href={rihoAsset(iconSrc ?? '')}
                                        ></use>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4>{value}</h4>
                                <span
                                    className={cn('f-light', classNames?.label)}
                                >
                                    {label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
