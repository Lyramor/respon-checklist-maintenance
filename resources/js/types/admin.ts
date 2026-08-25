import type { Role } from './auth';

export interface ManagedUser {
    id: number;
    name: string;
    username: string;
    email: string;
    role: Role;
    is_active: boolean;
    submissions_count: number;
    created_at: string;
}

export interface ActivityEntry {
    id: number;
    actor_name: string;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read: boolean;
    created_at: string;
}

export interface ReportPeriod {
    year: number;
    month: number;
    label: string;
    submissions: number;
}

export interface ReportExport {
    id: number;
    period_year: number;
    period_month: number;
    label: string;
    filename: string;
    size_label: string;
    submissions_count: number;
    created_by: string | null;
    created_at: string;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}
