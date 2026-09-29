import { useSidebar } from '@/hooks/use-sidebar';
import SidebarItem from './SidebarItem';
import SidebarSectionTitle from './SidebarSectionTitle';
import { getSidebarItemById } from '@/constant/sidebar.constant';

const PinnedSidebarSection = () => {
    const { pinnedItems } = useSidebar();

    if (!pinnedItems.length) return null;

    return (
        <>
            <li>
                <SidebarSectionTitle title="Pinned" />

                {pinnedItems.map((id) => {
                    const item = getSidebarItemById(id);
                    if (!item) return null;

                    return <SidebarItem key={item.id} item={item} />;
                })}
            </li>
        </>
    );
};

export default PinnedSidebarSection;
