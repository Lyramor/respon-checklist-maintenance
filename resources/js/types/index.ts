import type { AuthUser, FlashBag } from './auth';
import type { NotificationItem } from './admin';

export type { Role, AuthUser, FlashBag } from './auth';
export type {
    Severity,
    ChecklistOption,
    OptionSets,
    ChecklistItem,
    ChecklistSection,
    Blueprint,
    SubmissionSummary,
    SubmissionDetail,
} from './checklist';
export type {
    ManagedUser,
    ActivityEntry,
    NotificationItem,
    ReportPeriod,
    ReportExport,
    Paginated,
} from './admin';

/** Mirrors HandleInertiaRequests::share() one to one. */
export interface SharedProps {
    app: { name: string };
    auth: { user: AuthUser | null };
    flash: FlashBag;
    notifications: { unread: number; items: NotificationItem[] };
    [key: string]: unknown;
}
