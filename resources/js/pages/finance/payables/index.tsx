import AccountIndex from '@/components/pages/finance/account-index';
import type { FinancePage } from '@/types/finance';
export default function Page(props: {
    data: FinancePage;
    filters: {
        search?: string;
        status?: string;
        source_type?: string;
        from?: string;
        to?: string;
    };
}) {
    return <AccountIndex kind="payables" {...props} />;
}
