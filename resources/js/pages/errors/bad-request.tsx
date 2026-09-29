import { Link } from '@inertiajs/react';
import { rihoAsset } from '@/lib/riho';

export default function BadRequestPage() {
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
                        alt="Bad Request"
                    />

                    <div className="error-heading">
                        <h2 className="headline font-info">400</h2>
                    </div>

                    <div className="col-md-8 offset-md-2">
                        <p className="sub-content">
                            The request could not be understood by the server.
                            Please check your request and try again.
                        </p>
                    </div>

                    <div>
                        <Link
                            href="/dashboard"
                            className="btn btn-info btn-lg"
                        >
                            BACK TO DASHBOARD
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
