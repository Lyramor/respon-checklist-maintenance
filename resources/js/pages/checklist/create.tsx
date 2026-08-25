import { ChecklistForm, type ChecklistDefaults } from '@/components/checklist/checklist-form';
import { ChecklistIntro } from '@/components/checklist/checklist-intro';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { Blueprint } from '@/types';

interface ChecklistCreatePageProps {
    blueprint: Blueprint;
    defaults: ChecklistDefaults;
}

export default function ChecklistCreatePage({ blueprint, defaults }: ChecklistCreatePageProps) {
    return (
        <AppLayout title="Checklist Monitoring Maintenance">
            <Section pad="sm">
                <Container size="narrow">
                    <ChecklistIntro blueprint={blueprint} />
                    <ChecklistForm blueprint={blueprint} defaults={defaults} />
                </Container>
            </Section>
        </AppLayout>
    );
}
