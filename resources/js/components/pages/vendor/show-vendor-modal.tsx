import { Button } from '@/components/ui/button';
import { AppModal } from '@/components/ui/modal/app-modal';
import { Vendor } from '@/types/vendor';


/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type ShowVendorModalProps = {
    open: boolean;

    onOpenChange: (
        open: boolean,
    ) => void;

    vendor: Vendor | null;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function displayValue(
    value:
        | string
        | number
        | null
        | undefined,
) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '-';
    }

    return value;
}

function formatDate(
    value: string | null | undefined,
) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'en-US',
        {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        },
    ).format(date);
}

/*
|--------------------------------------------------------------------------
| Detail Item
|--------------------------------------------------------------------------
*/

type DetailItemProps = {
    label: string;

    value:
    | string
    | number
    | null
    | undefined;

    className?: string;
};

function DetailItem({
    label,
    value,
    className = 'col-12 col-md-6',
}: DetailItemProps) {
    return (
        <div className={className}>
            <div className="mb-3">
                <div className="text-muted small mb-1">
                    {label}
                </div>

                <div className="fw-medium">
                    {displayValue(value)}
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function ShowVendorModal({
    open,
    onOpenChange,
    vendor,
}: ShowVendorModalProps) {
    if (!vendor) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Image URL
    |--------------------------------------------------------------------------
    */

    const imageUrl = vendor.image
        ? vendor.image.startsWith(
            'http',
        )
            ? vendor.image
            : `/${vendor.image.replace(
                /^\/+/,
                '',
            )}`
        : null;

    return (
        <AppModal
            open={open}
            onOpenChange={
                onOpenChange
            }
            title="Vendor Details"
            size="lg"
            centered={false}
            footer={
                <Button
                    type="button"
                    variant="secondary"
                    appearance="outline"
                    onClick={() =>
                        onOpenChange(
                            false,
                        )
                    }
                >
                    Close
                </Button>
            }
        >
            <div className="row">
                {/* Image */}

                <div className="col-12">
                    <div className="mb-4 text-center">
                        {imageUrl ? (
                            <img
                                src={
                                    imageUrl
                                }
                                alt={
                                    vendor.name
                                }
                                className="img-fluid rounded border"
                                style={{
                                    width: 140,
                                    height: 140,
                                    objectFit:
                                        'cover',
                                }}
                            />
                        ) : (
                            <div
                                className="d-inline-flex align-items-center justify-content-center rounded border bg-light text-secondary"
                                style={{
                                    width: 140,
                                    height: 140,
                                    fontSize: 42,
                                    fontWeight: 600,
                                }}
                            >
                                {vendor.name
                                    .charAt(
                                        0,
                                    )
                                    .toUpperCase()}
                            </div>
                        )}

                        <div className="mt-2 fw-semibold">
                            {
                                vendor.name
                            }
                        </div>

                        {vendor.company_name && (
                            <div className="text-muted small">
                                {
                                    vendor.company_name
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* Name */}

                <DetailItem
                    label="Vendor Name"
                    value={
                        vendor.name
                    }
                />

                {/* Company */}

                <DetailItem
                    label="Company"
                    value={
                        vendor.company_name
                    }
                />

                {/* Email */}

                <DetailItem
                    label="Email"
                    value={
                        vendor.email
                    }
                />

                {/* Phone */}

                <DetailItem
                    label="Phone"
                    value={
                        vendor.phone
                    }
                />

                {/* Country */}

                <DetailItem
                    label="Country"
                    value={
                        vendor.country
                    }
                    className="col-12 col-md-4"
                />

                {/* State */}

                <DetailItem
                    label="State"
                    value={
                        vendor.state
                    }
                    className="col-12 col-md-4"
                />

                {/* City */}

                <DetailItem
                    label="City"
                    value={
                        vendor.city
                    }
                    className="col-12 col-md-4"
                />

                {/* Address */}

                <DetailItem
                    label="Address"
                    value={
                        vendor.address
                    }
                    className="col-12"
                />



                {/* Created At */}

                {vendor.created_at && (
                    <DetailItem
                        label="Created At"
                        value={formatDate(
                            vendor.created_at,
                        )}
                    />
                )}

                {/* Updated At */}

                {vendor.updated_at && (
                    <DetailItem
                        label="Updated At"
                        value={formatDate(
                            vendor.updated_at,
                        )}
                    />
                )}
            </div>
        </AppModal>
    );
}
