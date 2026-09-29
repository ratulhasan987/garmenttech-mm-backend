import { Head, Link, useForm } from '@inertiajs/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import PageTitle from '@/components/page-title';
import { Card, CardBody } from '@/components/ui/card';

export default function NoticeCreate() {
    const form = useForm({
        title: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/notice');
    };

    return (
        <>
            <Head title="Create Notice" />
            <PageTitle title="Create Notice" />

            <div className="container-fluid">
                <Card>
                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <label htmlFor="title">Notice Title</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="title" 
                                    placeholder="Enter Your Notice Title" 
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                />
                                {form.errors.title && <div className="text-danger mt-1">{form.errors.title}</div>}
                            </div>
                            
                            <div className="form-group mb-3">
                                <label className="form-label">Notice Body</label>
                                <ReactQuill 
                                    theme="snow" 
                                    value={form.data.description}
                                    onChange={content => form.setData('description', content)}
                                    style={{ height: '200px', marginBottom: '50px' }}
                                />
                                {form.errors.description && <div className="text-danger mt-1">{form.errors.description}</div>}
                            </div>
                            
                            <div className="d-flex justify-content-end">
                                <Link href="/notice" className="btn btn-secondary me-2">Cancel</Link>
                                <button className="btn btn-primary" type="submit" disabled={form.processing}>
                                    Save & Publish
                                </button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}