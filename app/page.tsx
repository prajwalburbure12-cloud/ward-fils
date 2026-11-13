import React from 'react';
import { getPublicPortalData } from '../src/db/queries.ts';
import {
  HomePortalView,
  type PublicPortalPayload,
} from '../src/components/HomePortalView.tsx';
import {
  DEFAULT_PORTAL_SETTINGS,
  DEFAULT_REPRESENTATIVES,
} from '../src/lib/defaults.ts';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let payload: PublicPortalPayload = {
    settings: DEFAULT_PORTAL_SETTINGS,
    representatives: DEFAULT_REPRESENTATIVES,
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
    const dbData = await getPublicPortalData();
    payload = {
      ...dbData,
      settings: dbData.settings ?? DEFAULT_PORTAL_SETTINGS,
      representatives:
        dbData.representatives.length > 0
          ? dbData.representatives
          : DEFAULT_REPRESENTATIVES,
    };
  } catch (error) {
    console.error('HomePage failed to load initial DB data:', error);
  }

  return <HomePortalView initialData={payload} />;
}
