export type SidebarItemIcon = {
    id: string;
    type: 'fill' | 'stroke';
};

export interface SidebarSubItem {
    id: string;
    title: string;
    path: string;
    permission?: string;
}

export interface SidebarItem {
    id: string;
    title: string;
    icon: SidebarItemIcon;
    path?: string;
    isOpen?: boolean;
    permission?: string;
    subItems?: SidebarSubItem[];
}

export interface SidebarSection {
    id: string;
    title: string;
    items: SidebarItem[];
}
