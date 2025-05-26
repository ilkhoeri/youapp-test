import { $Enums } from '@prisma/client';
import { Account as _Account, IsAccountStatus, IsRole } from '../types/user';

type Admin = { role: $Enums.UserRole } | null | undefined;

type StrictRole = boolean | IsRole | IsRole[] | ((role: IsRole) => boolean);

export function strictRole(user: Admin, role: StrictRole = ['DEVELOPER', 'SUPERADMIN']): boolean {
  if (!user || !user?.role) return false;
  // const strictByRole = typeof role !== 'boolean' ? (Array.isArray(role) ? role?.includes(user?.role) : user?.role !== role) : role === true;
  const strictByRole =
    typeof role === 'function' ? role(user.role) : typeof role !== 'boolean' ? (typeof role === 'string' ? role === user?.role : role?.includes(user?.role)) : role === true;

  return strictByRole;
}

type Info<T> = {
  description: string;
  list: { bold: T; thin: string }[];
};

export const roleUserInfo: Info<IsRole> = {
  description: 'Pilih peran pengguna dalam sistem.',
  list: [
    { bold: 'SUPERADMIN', thin: '→ Memiliki akses penuh ke semua fitur dan pengaturan,' },
    { bold: 'ADMIN', thin: '→ Memiliki beberapa akses SUPERADMIN + semua akses USER' },
    { bold: 'USER', thin: '→ Memiliki akses terbatas sesuai ketentuan.' }
  ]
};

export const accountStatusInfo: Info<IsAccountStatus> = {
  description: 'Tentukan status akun pengguna.',
  list: [
    { bold: 'ACTIVE', thin: '→ Akun normal dan bisa digunakan.' },
    { bold: 'PENDING', thin: '→ Akun belum diverifikasi / dikonfirmasi.' },
    { bold: 'INACTIVE', thin: '→ Akun tidak digunakan jangka lama / dinonaktifkan.' },
    { bold: 'SUSPENDED', thin: '→ akun dibekukan sementara.' },
    { bold: 'BANNED', thin: '→ akun diblokir secara permanen.' }
  ]
};

export const dataUserRole = [
  // { id: 'DEVELOPER', label: 'Developer', description: 'Untuk Pengembang Aplikasi' },
  { id: 'SUPERADMIN', label: 'Superadmin', description: 'Untuk Pimpinan / Pengasuh' },
  { id: 'ADMIN', label: 'Admin', description: 'Untuk Guru / Pengurus' },
  { id: 'USER', label: 'User', description: 'Untuk Murid / Siswa / Santri' }
];

export const dataAccountStatus = [
  { id: 'ACTIVE', label: 'Active', description: 'Akun normal dan bisa digunakan.' },
  { id: 'PENDING', label: 'Pending', description: 'Akun belum diverifikasi / dikonfirmasi.' },
  { id: 'INACTIVE', label: 'Inactive', description: 'Akun tidak digunakan jangka lama / dinonaktifkan.' },
  { id: 'SUSPENDED', label: 'Suspended', description: 'akun dibekukan sementara.' },
  { id: 'BANNED', label: 'Banned', description: 'akun diblokir secara permanen.' }
];
