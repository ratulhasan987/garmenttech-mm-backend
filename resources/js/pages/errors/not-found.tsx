import { Link } from '@inertiajs/react';
import { rihoAsset } from '@/lib/riho';

export default function NotFoundPage() {
    return (
        <>
            <div className="tap-top">
                <i data-feather="chevrons-up"></i>
            </div>

            <div
                className="page-wrapper compact-wrapper"
                id="pageWrapper"
            >
                <div className="error-wrapper">
                    <div className="container text-center">
                        <img
                            className="img-100"
                            src={rihoAsset('images/other-images/sad.png')}
                            alt="Page not found"
                        />

                        <div className="error-heading">
                            <h2 className="headline font-danger">404</h2>
                        </div>

                        <div className="col-md-8 offset-md-2">
                            <p className="sub-content">
                                The page you are attempting to reach is currently
                                not available. This may be because the page does
                                not exist or has been moved.
                            </p>
                        </div>

                        <div>
                            <Link
                                href="/dashboard"
                                className="btn btn-danger btn-lg"
                            >
                                BACK TO DASHBOARD
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
