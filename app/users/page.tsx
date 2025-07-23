'use client';

import { Layout } from '@/components/layout/layout';
import { UsersManager } from '@/components/users/users-manager';

export default function UsersPage() {
  return (
    <Layout>
      <UsersManager />
    </Layout>
  );
}