import React from 'react';
import { getPublicPortalData } from '../src/db/queries.ts';
import {
  HomePortalView,
  type PublicPortalPayload,
} from '../src/components/HomePortalView.tsx';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let payload: PublicPortalPayload = {
    settings: null,
    representatives: [],
    developmentWorks: [],
    announcements: [],
    stats: {
      totalComplaints: 0,
      pendingComplaints: 0,
      underProcessComplaints: 0,
      resolvedComplaints: 0,
      totalProjects: 0,
      completedProjects: 0,
    },
  };

  try {
    payload = await getPublicPortalData();
  } catch (error) {
    console.error('HomePage failed to load initial DB data:', error);
  }

  return <HomePortalView initialData={payload} />;
}
