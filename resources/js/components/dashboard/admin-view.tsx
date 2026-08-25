import { ActionLink } from '@/components/dashboard/action-link';
import { AdminLinks } from '@/components/dashboard/admin-links';
import { CoverageMeter } from '@/components/dashboard/coverage-meter';
import { StatRow, StatTile } from '@/components/dashboard/stat-tile';
import { SubmissionList } from '@/components/dashboard/submission-list';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { routes } from '@/routes';
import type { SubmissionSummary } from '@/types';

export interface AdminStats {
    submissions_total: number;
    submissions_month: number;
    users_total: number;
    coverage_filled: number;
    coverage_total: number;
    period: { year: number; month: number; label: string };
    recent: SubmissionSummary[];
}

/**
 * Dashboard admin. Angka operasional dulu, lalu cakupan periode berjalan.
 */
export function AdminView({ admin }: { admin: AdminStats }) {
    const percent =
        admin.coverage_total > 0 ? Math.round((admin.coverage_filled / admin.coverage_total) * 100) : 0;

    return (
        <div className="space-y-6">
            <StatRow>
                <StatTile label="Submission bulan ini" value={admin.submissions_month} meta={admin.period.label} accent />
                <StatTile label="Total submission" value={admin.submissions_total} meta="seluruh periode" />
                <StatTile label="Pengguna terdaftar" value={admin.users_total} meta="admin dan responden" />
                <StatTile
                    label="Cakupan periode"
                    value={`${percent}%`}
                    meta={`${admin.coverage_filled} dari ${admin.coverage_total} slot`}
                />
            </StatRow>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
                <Card>
                    <CardHeader
                        title={`Cakupan ${admin.period.label}`}
                        description="Slot dihitung dari kombinasi minggu dan line yang harus diperiksa."
                        action={
                            <ActionLink href={routes.checklist.create()} variant="secondary" size="sm">
                                Isi checklist
                            </ActionLink>
                        }
                    />
                    <CardBody>
                        <CoverageMeter
                            filled={admin.coverage_filled}
                            total={admin.coverage_total}
                            periodLabel={admin.period.label}
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader
                        title="Submission terbaru"
                        description="Isian yang paling baru masuk dari seluruh responden."
                        action={
                            <ActionLink href={routes.admin.submissions()} variant="secondary" size="sm">
                                Lihat semua
                            </ActionLink>
                        }
                    />
                    <CardBody>
                        <SubmissionList
                            items={admin.recent}
                            showAuthor
                            hrefFor={(item) => routes.admin.submission(item.id)}
                            emptyTitle="Belum ada submission yang masuk"
                            emptyDescription="Begitu responden mengirim checklist pertama, isiannya langsung tampil di sini dan bisa dibuka satu per satu."
                            emptyAction={
                                <ActionLink href={routes.admin.users()} variant="secondary">
                                    Kelola akun responden
                                </ActionLink>
                            }
                        />
                    </CardBody>
                </Card>
            </div>

            <AdminLinks />
        </div>
    );
}
