'use client';

import { Layout } from '@/components/layout/layout';
import { TreeViewDashboard } from '@/components/dashboard/tree-view-dashboard';

export default function Dashboard() {
  return (
    <Layout>
      <TreeViewDashboard />
    </Layout>
  );
}