import { Link } from '@inertiajs/react';
import { rihoAsset } from '@/lib/riho';

export default function ForbiddenPage() {
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
                            alt="Access denied"
                        />

                        <div className="error-heading">
                            <h2 className="headline font-success">403</h2>
                        </div>

                        <div className="col-md-8 offset-md-2">
                            <p className="sub-content">
                                You do not have permission to access this page.
                                Please contact an administrator if you believe
                                you should have access.
                            </p>
                        </div>

                        <div>
                            <Link
                                href="/dashboard"
                                className="btn btn-success btn-lg"
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
