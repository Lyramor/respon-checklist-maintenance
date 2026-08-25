export type Role = 'admin' | 'responden';

export interface AuthUser {
    id: number;
    name: string;
    username: string;
    email: string;
    role: Role;
}

export interface FlashBag {
    success?: string | null;
    error?: string | null;
}
