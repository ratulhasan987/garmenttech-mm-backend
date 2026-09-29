import PageTitle from '@/components/page-title';
import { SalaryReportForm } from '@/components/pages/hr/salary/user-salary-report-form';
import { Head } from '@inertiajs/react';

interface SalaryReportPageProps {
    currentMonth: string;
}

export default function SalaryReport({
    currentMonth,
}: SalaryReportPageProps) {
    return (
        <>
           <Head title="Salary Report" />

            <PageTitle title="Salary Report" />
        <div className="container-fluid mt-2">
            <SalaryReportForm
                currentMonth={currentMonth}
            />
        </div>
        </>
    );
}