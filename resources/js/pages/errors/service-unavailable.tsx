import { Link } from '@inertiajs/react';
import { rihoAsset } from '@/lib/riho';

export default function ServiceUnavailablePage() {
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
                            alt="Service unavailable"
                        />

                        <div className="error-heading">
                            <h2 className="headline font-secondary">503</h2>
                        </div>

                        <div className="col-md-8 offset-md-2">
                            <p className="sub-content">
                                The service is temporarily unavailable.
                                Please try again in a few moments.
                            </p>
                        </div>

                        <div>
                            <Link
                                href="/dashboard"
                                className="btn btn-secondary btn-lg"
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
