import AccountShow from '@/components/pages/finance/account-show';
import type { FinanceAccount } from '@/types/finance';
export default function Page({ payable }: { payable: FinanceAccount }) {
    return <AccountShow kind="payable" account={payable} />;
}
