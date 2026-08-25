import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { SubmissionIdentity } from '@/components/admin/submission-identity';
import {
    SubmissionSections,
    SubmissionSectionsEmpty,
} from '@/components/admin/submission-sections';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import { routes } from '@/routes';
import type { Blueprint, SubmissionDetail } from '@/types';

interface Props {
    submission: SubmissionDetail;
    blueprint: Blueprint;
}

export default function AdminSubmissionDetail({ submission, blueprint }: Props) {
    const hasSections = blueprint.sections.length > 0;

    return (
        <AppLayout title="Detail checklist">
            <Head title={`Checklist LINE ${submission.line} minggu ${submission.week}`} />

            <Section pad="sm">
                <Container className="space-y-4">
                    <Link
                        href={routes.admin.submissions()}
                        className="inline-flex items-center gap-1.5 rounded-[4px] px-1 py-1 text-sm font-medium text-brand hover:bg-brand-soft"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Kembali ke data checklist
                    </Link>

                    <SubmissionIdentity submission={submission} />

                    {hasSections ? (
                        <SubmissionSections
                            blueprint={blueprint}
                            answers={submission.answers}
                        />
                    ) : (
                        <SubmissionSectionsEmpty />
                    )}
                </Container>
            </Section>
        </AppLayout>
    );
}
