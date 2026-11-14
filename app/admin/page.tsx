import React from 'react';
import { AuthProvider } from '../../src/components/AuthProvider.tsx';
import { AdminAuthGate } from '../../src/components/admin/AdminAuthGate.tsx';
import { AdminDashboard } from '../../src/components/AdminDashboard.tsx';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminAuthGate>
        <AdminDashboard />
      </AdminAuthGate>
    </AuthProvider>
  );
}
