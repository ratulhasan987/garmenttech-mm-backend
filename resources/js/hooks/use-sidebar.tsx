import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SidebarContextType = {
    //sidebar collapsed toggling
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    toggleCollapsed: () => void;

    //sidebar collapsed on hover
    hoverSidebar: boolean;
    setHoverSidebar: (v: boolean) => void;

    //pinned items in sidebar
    pinnedItems: string[];
    togglePin: (id: string) => void;
    isPinned: (id: string) => boolean;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

const COLLAPSE_KEY = 'sidebar-collapsed';
const PIN_KEY = 'sidebar-pins';

export const SidebarProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        return localStorage.getItem(COLLAPSE_KEY) === 'true';
    });

    const [hoverSidebar, setHoverSidebar] = useState(false);

    const [pinnedItems, setPinnedItems] = useState<string[]>(() => {
        const stored = localStorage.getItem(PIN_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem(COLLAPSE_KEY, String(collapsed));
    }, [collapsed]);

    useEffect(() => {
        localStorage.setItem(PIN_KEY, JSON.stringify(pinnedItems));
    }, [pinnedItems]);

    const togglePin = (id: string) => {
        setPinnedItems((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const value = useMemo(
        () => ({
            collapsed,
            setCollapsed,
            toggleCollapsed: () => setCollapsed((p) => !p),
            hoverSidebar,
            setHoverSidebar,
            pinnedItems,
            togglePin,
            isPinned: (id: string) => pinnedItems.includes(id),
        }),
        [collapsed, hoverSidebar, pinnedItems],
    );

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider');
    return ctx;
};
