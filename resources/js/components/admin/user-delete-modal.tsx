import { router } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { routes } from '@/routes';
import type { ManagedUser } from '@/types';

export function UserDeleteModal({
    target,
    onClose,
}: {
    target: ManagedUser | null;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState<boolean>(false);

    const confirm = (): void => {
        if (!target) {
            return;
        }

        router.delete(routes.admin.userDestroy(target.id), {
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
            title="Hapus akun ini?"
            description={
                target
                    ? `Akun ${target.name} dengan username ${target.username} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`
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
                        Ya, hapus akun
                    </Button>
                </div>
            }
        >
            {target ? (
                <p className="text-sm text-ink-soft">
                    Checklist yang pernah diisi akun ini tetap tersimpan, tetapi kolom pengisi akan
                    kosong. Saat ini tercatat {target.submissions_count} checklist atas namanya.
                </p>
            ) : null}
        </Modal>
    );
}
