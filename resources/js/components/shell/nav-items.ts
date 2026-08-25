import {
    Bell,
    ClipboardList,
    FileSpreadsheet,
    Gauge,
    History,
    LayoutGrid,
    Table2,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { routes } from '@/routes';
import type { Role } from '@/types';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    roles: Role[];
    /** matches the start of the current path so child pages stay highlighted */
    match?: string;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        label: 'Harian',
        items: [
            {
                label: 'Dashboard',
                href: routes.dashboard(),
                icon: Gauge,
                roles: ['admin', 'responden'],
            },
            {
                label: 'Isi Checklist',
                href: routes.checklist.create(),
                icon: ClipboardList,
                roles: ['admin', 'responden'],
                match: '/checklist',
            },
        ],
    },
    {
        label: 'Administrasi',
        items: [
            {
                label: 'Ringkasan Admin',
                href: routes.admin.dashboard(),
                icon: LayoutGrid,
                roles: ['admin'],
            },
            {
                label: 'Data Isian',
                href: routes.admin.submissions(),
                icon: Table2,
                roles: ['admin'],
                match: '/admin/submissions',
            },
            {
                label: 'Akun Pengguna',
                href: routes.admin.users(),
                icon: Users,
                roles: ['admin'],
                match: '/admin/users',
            },
            {
                label: 'Log Aktivitas',
                href: routes.admin.activity(),
                icon: History,
                roles: ['admin'],
            },
            {
                label: 'Notifikasi',
                href: routes.admin.notifications(),
                icon: Bell,
                roles: ['admin'],
            },
            {
                label: 'Laporan Bulanan',
                href: routes.admin.reports(),
                icon: FileSpreadsheet,
                roles: ['admin'],
                match: '/admin/reports',
            },
        ],
    },
];

export function navFor(role: Role | undefined): NavGroup[] {
    if (!role) {
        return [];
    }

    return navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.roles.includes(role)),
        }))
        .filter((group) => group.items.length > 0);
}

export function isActive(currentUrl: string, item: NavItem): boolean {
    const path = currentUrl.split('?')[0];
    const target = item.match ?? item.href;

    return target === routes.admin.dashboard() || target === routes.dashboard()
        ? path === target
        : path === target || path.startsWith(`${target}/`);
}
