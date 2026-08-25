/**
 * Typed route map. Every URL in the app comes from here, never from a literal string,
 * so a path change in routes/web.php is a one line change on the frontend too.
 */
export const routes = {
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
    checklist: {
        create: () => '/checklist/create',
        store: () => '/checklist',
        success: () => '/checklist/berhasil',
    },
    admin: {
        dashboard: () => '/admin',
        submissions: () => '/admin/submissions',
        submission: (id: number) => `/admin/submissions/${id}`,
        users: () => '/admin/users',
        userDestroy: (id: number) => `/admin/users/${id}`,
        activity: () => '/admin/activity',
        notifications: () => '/admin/notifications',
        notificationsRead: () => '/admin/notifications/read',
        reports: () => '/admin/reports',
        reportGenerate: () => '/admin/reports',
        reportDownload: (id: number) => `/admin/reports/${id}/download`,
        reportDestroy: (id: number) => `/admin/reports/${id}`,
    },
} as const;

export default routes;
