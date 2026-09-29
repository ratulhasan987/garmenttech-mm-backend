import PageTitle from '@/components/page-title';
import { SalaryGenerateForm } from '@/components/pages/hr/salary/salary-generate-form';
import { SalaryGenerateTable } from '@/components/pages/hr/salary/salary-generate-table';
import type { SalaryGeneratePageProps } from '@/types/salary';
import { Head } from '@inertiajs/react';

export default function SalaryGenerate({
    departments,
    employees,
    salaries,
    currentMonth,
    numberOfSalaries,
}: SalaryGeneratePageProps) {
    return (
        <>
            <Head title="Salary Generate" />

            <PageTitle title="Salary Generate" />

            <div className="container-fluid mt-2">
                <SalaryGenerateForm
                    departments={departments}

                    employees={employees}

                    currentMonth={currentMonth}
                />

                <SalaryGenerateTable
                    salaries={salaries}

                    numberOfSalaries={numberOfSalaries}

                    month={currentMonth}
                />
            </div>
        </>
    );
}
