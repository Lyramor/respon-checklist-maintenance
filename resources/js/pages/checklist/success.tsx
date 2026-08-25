import { SuccessPanel, type SuccessSummary } from '@/components/checklist/success-panel';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';

interface ChecklistSuccessPageProps {
    summary?: SuccessSummary | null;
}

export default function ChecklistSuccessPage({ summary = null }: ChecklistSuccessPageProps) {
    return (
        <AppLayout title="Checklist berhasil dikirim">
            <Section pad="default">
                <Container size="narrow">
                    <SuccessPanel summary={summary} />
                </Container>
            </Section>
        </AppLayout>
    );
}
