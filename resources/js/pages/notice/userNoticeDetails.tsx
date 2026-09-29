import { Head, Link } from '@inertiajs/react';
import PageTitle from '@/components/page-title';
import { Card, CardBody } from '@/components/ui/card';
import { CornerUpLeft } from 'react-feather';

interface Notice {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

interface Props {
    notice: Notice;
}

export default function UserNoticeDetails({ notice }: Props) {
    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    return (
        <>
            <Head title="Notice Details" />
            <PageTitle title="Notice Details" />

            <div className="container-fluid">
                <Card style={{ 
                    backgroundImage: 'url(/notice_background.jpg)', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'center center', 
                    backgroundSize: 'cover' 
                }}>
                    <CardBody style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: '40px', height: '40px' }}>
                                    <img 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                        src="/announcement.png" 
                                        alt="Announcement" 
                                    />
                                </div>
                                <h4 style={{ textTransform: 'uppercase' }} className="mb-0">
                                    Announcement
                                </h4>
                            </div>
                            <div style={{ width: '50px', height: '50px' }}>
                                <Link 
                                    href="/hr/notice"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '50px',
                                        height: '50px',
                                        boxShadow: 'rgba(149,157,165,0.2) 0px 8px 24px',
                                        borderRadius: '50%',
                                        textDecoration: 'none',
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <CornerUpLeft size={24} />
                                </Link>
                            </div>
                        </div>
                        
                        <hr />
                        
                        <h4 className="mb-2">{notice.title}</h4>
                        <p className="text-primary mb-3" style={{ flex: 1 }}>
                            {formatDateTime(notice.created_at)}
                        </p>
                        
                        {/* Render the rich text HTML from the database */}
                        <div dangerouslySetInnerHTML={{ __html: notice.description }} />
                    </CardBody>
                </Card>
            </div>
        </>
    );
}