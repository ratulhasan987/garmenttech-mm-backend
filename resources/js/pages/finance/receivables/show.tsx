import AccountShow from '@/components/pages/finance/account-show';
import type { FinanceAccount } from '@/types/finance';
export default function Page({ receivable }: { receivable: FinanceAccount }) {
    return <AccountShow kind="receivable" account={receivable} />;
}
