'use client';

import { Layout } from '@/components/layout/layout';
import { SettingsManager } from '@/components/settings/settings-manager';

export default function SettingsPage() {
  return (
    <Layout>
      <SettingsManager />
    </Layout>
  );
}