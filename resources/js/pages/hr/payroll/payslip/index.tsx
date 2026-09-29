import PageTitle from '@/components/page-title';
import { ManagePayslipTable } from '@/components/pages/hr/salary/manage-payslip-table';
import type {
    Salary,
    SalaryPagination,
} from '@/types/salary';
import { Head } from '@inertiajs/react';



interface PayslipIndexProps {
    salaries: SalaryPagination<Salary>;

    currentMonth: string;

    months: string[];

    numberOfSalaries: number;
}

export default function PayslipIndex({
    salaries,
    currentMonth,
    months,
    numberOfSalaries,
}: PayslipIndexProps) {
    return (
        <>
           <Head title="Manage Payslip" />

            <PageTitle title="Manage Payslip" />
        <div className="container-fluid mt-2">
            <ManagePayslipTable
                salaries={salaries}
                currentMonth={currentMonth}
                months={months}
                numberOfSalaries={
                    numberOfSalaries
                }
            />
        </div>
        </>
    );
}