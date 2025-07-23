'use client';

import { Layout } from '@/components/layout/layout';
import { ProjectsManager } from '@/components/projects/projects-manager';

export default function ProjectsPage() {
  return (
    <Layout>
      <ProjectsManager />
    </Layout>
  );
}