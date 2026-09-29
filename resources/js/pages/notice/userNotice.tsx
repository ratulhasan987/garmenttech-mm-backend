import { Head, Link } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Card, CardBody } from '@/components/ui/card';

interface Notice {
    id: number;
    title: string;
    created_at: string;
}

interface Props {
    notices: Notice[];
}

export default function UserNotice({ notices }: Props) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        }).format(date);
    };

    return (
        <>
            <Head title="Notices" />
            <PageTitle title="Notices" />

            <div className="container-fluid">
                <Card>
                    <CardBody style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                        {notices.map((notice) => (
                            <Link 
                                key={notice.id} 
                                href={`/notice/${notice.id}`} 
                                className="alert alert-light-primary light alert-dismissible fade show txt-primary border-left-primary rounded d-flex flex-wrap justify-content-between align-items-center mb-2 text-decoration-none"
                            >
                                <div className="d-flex justify-content-start align-items-center" style={{ gap: '1em' }}>
                                    <div style={{ width: '40px', height: '40px' }}>
                                        <img 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                            src="/announcement.png" 
                                            alt="Announcement" 
                                        />
                                    </div>
                                    <p className="mb-0 fw-semibold">{notice.title}</p>
                                </div>
                                <p className="text-primary mb-0">{formatDate(notice.created_at)}</p>
                            </Link>
                        ))}
                    </CardBody>
                </Card>
            </div>
        </>
    );
}