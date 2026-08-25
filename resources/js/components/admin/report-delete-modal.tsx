import { router } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { routes } from '@/routes';
import type { ReportExport } from '@/types';

export function ReportDeleteModal({
    target,
    onClose,
}: {
    target: ReportExport | null;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState<boolean>(false);

    const confirm = (): void => {
        if (!target) {
            return;
        }

        router.delete(routes.admin.reportDestroy(target.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                onClose();
            },
        });
    };

    return (
        <Modal
            open={target !== null}
            onClose={onClose}
            tone="danger"
            title="Hapus file laporan?"
            description={
                target
                    ? `File ${target.filename} untuk periode ${target.label} akan dihapus permanen dari server. Tindakan ini tidak bisa dibatalkan.`
                    : ''
            }
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={confirm}
                        loading={processing}
                        disabled={processing}
                    >
                        Ya, hapus file
                    </Button>
                </div>
            }
        >
            <p className="text-sm text-ink-soft">
                Data checklist tidak ikut terhapus. Anda bisa membuat file baru untuk periode yang
                sama kapan saja lewat panel export.
            </p>
        </Modal>
    );
}
