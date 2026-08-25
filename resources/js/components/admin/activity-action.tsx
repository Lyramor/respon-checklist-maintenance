import { Badge } from '@/components/ui/badge';

type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad';

const KNOWN: Record<string, { label: string; tone: Tone }> = {
    login: { label: 'Masuk', tone: 'neutral' },
    logout: { label: 'Keluar', tone: 'neutral' },
    'submission.created': { label: 'Checklist dibuat', tone: 'ok' },
    'submission.updated': { label: 'Checklist diubah', tone: 'brand' },
    'submission.deleted': { label: 'Checklist dihapus', tone: 'bad' },
    'user.created': { label: 'Akun dibuat', tone: 'ok' },
    'user.deleted': { label: 'Akun dihapus', tone: 'bad' },
    'report.generated': { label: 'Laporan dibuat', tone: 'brand' },
    'report.downloaded': { label: 'Laporan diunduh', tone: 'brand' },
    'report.deleted': { label: 'Laporan dihapus', tone: 'bad' },
};

function humanize(action: string): string {
    const words = action.replace(/[._-]+/g, ' ').trim();

    return words.charAt(0).toUpperCase() + words.slice(1);
}

function toneFor(action: string): Tone {
    if (/deleted|destroy|hapus|failed/i.test(action)) return 'bad';
    if (/created|store|success/i.test(action)) return 'ok';
    if (/updated|generated|download/i.test(action)) return 'brand';

    return 'neutral';
}

export function ActivityAction({ action }: { action: string }) {
    const known = KNOWN[action];

    return (
        <Badge tone={known ? known.tone : toneFor(action)} className="shrink-0">
            {known ? known.label : humanize(action)}
        </Badge>
    );
}
