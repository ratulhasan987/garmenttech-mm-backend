import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';

import { rihoAsset } from '@/lib/riho';
import { asset } from '@/lib/asset';

type AuthLayoutProps = {
    children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { configure } = usePage().props;
    const lightLogo =
        (configure?.primary_logo ? asset(configure.primary_logo) : null) ??
        rihoAsset('images/logo/logo.png');

    const darkLogo =
        (configure?.secondary_logo ? asset(configure.secondary_logo) : null) ??
        rihoAsset('images/logo/logo.png');


    return (
        <div className="container-fluid p-0">
            <div className="row m-0">
                <div className="col-12 p-0">
                    <div className="login-card login-dark">
                        <div>
                            <div className="d-flex justify-content-center">
                                <Link
                                    className="logo d-inline-flex justify-content-center"
                                    href="/"
                                >
                                    <img
                                        className="img-fluid for-light"
                                        src={lightLogo}
                                        alt="Logo"
                                        width={160}
                                        height={50}
                                        style={{
                                            objectFit: 'contain',
                                        }}
                                    />

                                    <img
                                        className="img-fluid for-dark"
                                        src={darkLogo}
                                        alt="Logo"
                                        width={160}
                                        height={50}
                                        style={{
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Link>
                            </div>

                            <div className="login-main">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
