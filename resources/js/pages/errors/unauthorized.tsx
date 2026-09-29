import { Link } from '@inertiajs/react';
import { rihoAsset } from '@/lib/riho';

export default function UnauthorizedPage() {
    return (
        <div
            className="page-wrapper compact-wrapper"
            id="pageWrapper"
        >
            <div className="error-wrapper">
                <div className="container text-center">
                    <img
                        className="img-100"
                        src={rihoAsset('images/other-images/sad.png')}
                        alt="Unauthorized"
                    />

                    <div className="error-heading">
                        <h2 className="headline font-warning">401</h2>
                    </div>

                    <div className="col-md-8 offset-md-2">
                        <p className="sub-content">
                            You must be logged in to access this page.
                            Please sign in and try again.
                        </p>
                    </div>

                    <div>
                        <Link
                            href="/login"
                            className="btn btn-warning btn-lg"
                        >
                            BACK TO LOGIN
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
