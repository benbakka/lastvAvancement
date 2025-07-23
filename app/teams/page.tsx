'use client';

import { Layout } from '@/components/layout/layout';
import { TeamsManager } from '@/components/teams/teams-manager';

export default function TeamsPage() {
  return (
    <Layout>
      <TeamsManager />
    </Layout>
  );
}