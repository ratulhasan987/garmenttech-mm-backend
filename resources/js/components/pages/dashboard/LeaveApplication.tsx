interface LeaveApplicationCardProps {
    applications: any[];
}

const LeaveApplication = ({ applications }: LeaveApplicationCardProps) => {
    return (
        <div className="col-6">
            <div className="card rounded-15" style={{ minHeight: '300px' }}>
                <div className="card-header d-flex justify-content-between">
                    <h5 className="m-0 fs-18 fw-semi-bold text-color-1">
                        Leave Application
                    </h5>
                    <a href="/hr/leave-request">
                        See All{' '}
                        <svg
                            width="11"
                            height="8"
                            viewBox="0 0 11 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 4H10M10 4L6.75 1M10 4L6.75 7"
                                stroke="#00B074"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                        </svg>
                    </a>
                </div>
                <div className="card-body p-0">
                    {applications.map((application) => (
                        <div className="d-flex justify-content-between align-items-center border-bottom px-4 py-3">
                            <div className="d-flex align-items-start gap-3">
                                <div className="avatar">
                                    <img
                                        className="img-40 b-r-8"
                                        src={application?.user?.image_url ?? ''}
                                        alt="#"
                                    />
                                </div>
                                <div>
                                    <p className="mb-2 lh-1 fs-18 fw-semi-bold text-color-1">
                                        {application?.user?.name ?? 'Unknown'}
                                    </p>
                                    <p className="mb-2 lh-1 fs-14 fw-normal"></p>
                                    <p className="mb-0 lh-1 fs-14 fw-medium">
                                        Reason : {application?.reason ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-soft-success w-px-90 rounded-3 p-1">
                                <p className="mb-0 fs-14 fw-semi-bold text-color-3 text-center text-capitalize">
                                    {application?.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeaveApplication;
