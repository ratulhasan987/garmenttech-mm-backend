import { Link } from '@inertiajs/react';

type PageTitleProps = {
    title: string;
};

export default function PageTitle({ title }: PageTitleProps) {
    return (
        <div className="container-fluid">
            <div className="page-title">
                <div className="row">
                    <div className="col-6">
                        <h3>{title}</h3>
                    </div>

                    <div className="col-6">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link href="/dashboard">
                                    <i className="fa fa-home" />
                                </Link>
                            </li>

                            <li className="breadcrumb-item active">{title}</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
