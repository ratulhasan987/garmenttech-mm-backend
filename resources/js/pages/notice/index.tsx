
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/page-title';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Edit, Trash2 } from 'react-feather';

// Adjust imports based on your actual paths
import { DatePicker } from '@/components/ui/form/date-picker';
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal';
import { usePermission } from '@/hooks/use-permission';


import { TablePaginationInfo } from '@/components/shared/table-pagination-info';
import { Pagination } from '@/components/ui/pagination';

interface Notice {
    id: number;
    title: string;
    created_at: string;
}

interface Props {
    notices: { data: Notice[]; from: number; to: number; total: number; links: any[]; current_page: number; last_page: number };
    numberOfNotices: number;
    filters: any;
}

export default function NoticeIndex({ notices, numberOfNotices, filters }: Props) {

    const { can, canAny } = usePermission();

    const showActions = canAny(['notice.edit', 'notice.delete']);
    const canCreate = can('notice.create');
    const canEdit = can('notice.edit');
    const canDelete = can('notice.delete');


    const [search, setSearch] = useState('');
    const [noticeId, setNoticeId] = useState(filters.notice_id || '');
    const [sorting, setSorting] = useState(filters.sorting || '');

    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Typeahead state
    const [suggestions, setSuggestions] = useState<Notice[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Delete Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch suggestions for typeahead (fetches all if search is empty)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetch(`/get-notices?keyword=${encodeURIComponent(search)}`)
                .then(res => res.json())
                .then(data => {
                    setSuggestions(data);
                });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-suggestion-container')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const selectSuggestion = (notice: Notice) => {
        setSearch(notice.title);
        setNoticeId(String(notice.id));
        setShowSuggestions(false);
    };

    const handleFilter = () => {
        router.get('/notice', {
            notice_id: noticeId,
            sorting: sorting,
            start_date: startDate,
            end_date: endDate
        }, { preserveState: true });
    };


     const handlePageChange = (page: number) => {
        router.get('/notice', {
            page,
            notice_id: noticeId,
            sorting: sorting,
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };



    const openDeleteModal = (notice: Notice) => {
        setSelectedNotice(notice);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedNotice) return;
        setDeleting(true);
        router.delete(`/notice/${selectedNotice.id}`, {
            onSuccess: () => {
                setDeleting(false);
                setDeleteModalOpen(false);
                setSelectedNotice(null);
            },
            onFinish: () => {
                setDeleting(false);
            }
        });
    };

    return (
        <>
            <Head title="Notices" />
            <PageTitle title="Notices" />

            <div className="container-fluid">
                <Card>
                    <CardHeader className="px-3 py-3">
                        <div className="d-flex gap-2 flex-wrap justify-content-start align-items-center mb-3">

                            {canCreate && (


                                <Link href="/notice/create" className="btn btn-primary">Add New</Link>

                            )}

                            {/* Search Typeahead */}
                            <div className="search-suggestion-container" style={{ position: 'relative', flex: 1, flexBasis: '200px' }}>
                                <input type="hidden" value={noticeId} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search notice"
                                    autoComplete="off"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setNoticeId('');
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {showSuggestions && (
                                    <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
                                        {suggestions.length > 0 ? (
                                            suggestions.map(item => (
                                                <a
                                                    key={item.id}
                                                    className="dropdown-item"
                                                    href="javascript:void(0)"
                                                    onClick={() => selectSuggestion(item)}
                                                >
                                                    {item.title}
                                                </a>
                                            ))
                                        ) : (
                                            <span className="dropdown-item text-muted">No notices found</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                className="form-control"
                                style={{ flex: 1, flexBasis: '200px' }}
                                value={sorting}
                                onChange={(e) => setSorting(e.target.value)}
                            >
                                <option value="">-- Sort By Date --</option>
                                <option value="asc">Oldest First</option>
                                <option value="desc">Newest First</option>
                            </select>

                            {/* Date Pickers */}
                            <style>{`.holiday-dp-wrap input:first-of-type{position:absolute!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;padding:0!important;margin:0!important;border:0!important;overflow:hidden!important}`}</style>

                            {/* Added onClick to wrapper div to reset date on click */}
                            <div
                                className="holiday-dp-wrap"
                                style={{ flex: 1, flexBasis: '200px' }}
                                onClick={() => setStartDate('')}
                            >
                                <DatePicker
                                    value={startDate}
                                    placeholder="Start Date"
                                    disabled={false}
                                    allowInput={false}
                                    onChange={(dateString) => setStartDate(dateString)}
                                />
                            </div>

                            {/* Added onClick to wrapper div to reset date on click */}
                            <div
                                className="holiday-dp-wrap"
                                style={{ flex: 1, flexBasis: '200px' }}
                                onClick={() => setEndDate('')}
                            >
                                <DatePicker
                                    value={endDate}
                                    placeholder="End Date"
                                    disabled={false}
                                    allowInput={false}
                                    onChange={(dateString) => setEndDate(dateString)}
                                />
                            </div>

                            <button type="button" className="btn btn-primary" onClick={handleFilter}>
                                Filter
                            </button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="table-responsive">
                            <table className="table" id="noticeTable">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>Sl</th>
                                        <th>Notice Title</th>
                                        {showActions && (

                                            <th style={{ width: '100px' }}>Actions</th>

                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {notices.data.map((notice, index) => (
                                        <tr key={notice.id}>
                                            <td>{notices.from + index}</td>
                                            <td>{notice.title}</td>

                                            {showActions && (

                                            <td>
                                                <ul className="action d-flex gap-2 list-unstyled mb-0">
                                                    <li>

                                                        {canEdit && (
                                                            <Link href={`/notice/${notice.id}/edit`} className="text-warning">
                                                                <Edit size={16} />
                                                            </Link>


                                                        )}

                                                    </li>
                                                    <li>

                                                        {canDelete && (

                                                        <button
                                                            onClick={() => openDeleteModal(notice)}
                                                            className="text-danger btn btn-link p-0 border-0"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>

                                                        )}
                                                    </li>
                                                </ul>
                                            </td>


                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     
                    </CardBody>

                    <CardFooter>
                        <div className="d-flex w-100 flex-wrap gap-3 justify-content-between align-items-center">
                            <TablePaginationInfo
                                from={notices.from ?? 0}
                                to={notices.to ?? 0}
                                total={numberOfNotices}
                            />
                            <Pagination
                                currentPage={notices.current_page}
                                lastPage={notices.last_page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </CardFooter>
                    
                </Card>
            </div>

            <DeleteConfirmModal
                key={selectedNotice?.id || 'no-notice'}
                open={deleteModalOpen}
                onOpenChange={(open) => {
                    if (deleting) return;
                    setDeleteModalOpen(open);
                    if (!open) setSelectedNotice(null);
                }}
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}