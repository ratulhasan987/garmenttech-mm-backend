import { type ReactNode } from 'react';

import { SidebarProvider } from '@/hooks/use-sidebar';
import Sidebar from '@/components/sidebar/Sidebar';

import { FlashNotification } from '@/components/shared/flash-notification';
import Header from '@/components/Header';
import Footer from '@/components/footer';
import ScrollFix from '@/components/ScrollFix';
import SidebarDrawer from '@/components/SidebarDrawer';

type AppLayoutProps = {
    children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <>
            <ScrollFix />
            <SidebarProvider>
                <div className="page-wrapper compact-wrapper" id="pageWrapper">
                    <Header />

                    <div className="page-body-wrapper horizontal-menu">
                        <Sidebar />

                        <div className="page-body">{children}</div>

                        <Footer />
                    </div>
                </div>
            </SidebarProvider>

            <SidebarDrawer />

            <FlashNotification />
        </>
    );
}
