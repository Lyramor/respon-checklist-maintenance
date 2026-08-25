import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import type { ManagedUser } from '@/types';

export function UsersTable({
    users,
    currentUserId,
    onDelete,
}: {
    users: ManagedUser[];
    currentUserId: number | null;
    onDelete: (user: ManagedUser) => void;
}) {
    if (users.length === 0) {
        return (
            <div className="p-4">
                <EmptyState
                    title="Belum ada akun lain"
                    description="Buat akun responden lewat panel di atas supaya petugas bisa mengisi checklist dengan akunnya sendiri."
                />
            </div>
        );
    }

    return (
        <Table>
            <THead>
                <TR>
                    <TH>Nama</TH>
                    <TH>Username</TH>
                    <TH>Email</TH>
                    <TH className="whitespace-nowrap">Peran</TH>
                    <TH className="whitespace-nowrap">Checklist</TH>
                    <TH className="whitespace-nowrap">Dibuat</TH>
                    <TH className="text-right">Aksi</TH>
                </TR>
            </THead>

            <TBody>
                {users.map((user) => (
                    <TR key={user.id}>
                        <TD className="font-medium text-ink">
                            {user.name}
                            {user.is_active ? null : (
                                <Badge tone="warn" className="ml-2">
                                    Nonaktif
                                </Badge>
                            )}
                        </TD>
                        <TD className="font-mono text-xs">{user.username}</TD>
                        <TD className="text-ink-soft">{user.email}</TD>
                        <TD>
                            <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>
                                {user.role === 'admin' ? 'Admin' : 'Responden'}
                            </Badge>
                        </TD>
                        <TD className="font-mono text-xs">{user.submissions_count}</TD>
                        <TD className="font-mono text-xs whitespace-nowrap">{user.created_at}</TD>
                        <TD className="text-right whitespace-nowrap">
                            {user.id === currentUserId ? (
                                <span className="text-xs text-ink-soft/70">Akun Anda</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onDelete(user)}
                                    className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs font-medium text-bad hover:bg-bad-soft"
                                >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Hapus
                                </button>
                            )}
                        </TD>
                    </TR>
                ))}
            </TBody>
        </Table>
    );
}
