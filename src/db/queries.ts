import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  announcements,
  complaints,
  complaintTimeline,
  developmentWorks,
  portalSettings,
  representatives,
  users,
} from './schema.ts';
import { PRIMARY_ADMIN_EMAIL } from '../lib/constants.ts';

export async function ensurePortalDefaults() {
  try {
    const existingSettings = await db
      .select()
      .from(portalSettings)
      .where(eq(portalSettings.id, 1));

    if (existingSettings.length === 0) {
      await db
        .insert(portalSettings)
        .values({
          id: 1,
          bannerImageUrl: null,
          bannerAlt: 'Ward No. 65, Hubballi-Dharwad Municipal Corporation',
          officeAddressEn:
            'Ward No. 65 Civic Service Office, Hubballi-Dharwad Municipal Corporation, Hubballi, Karnataka 580020',
          officeAddressKn:
            'ವಾರ್ಡ್ ನಂ. 65 ನಾಗರಿಕ ಸೇವಾ ಕಚೇರಿ, ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆ, ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ 580020',
          officePhone: '',
          officeEmail: '',
          whatsappNumber: '',
          googleMapsUrl: '',
          emergencyWaterPhone: '1533',
          emergencyPowerPhone: '1912',
          emergencySanitationPhone: '1533',
        })
        .onConflictDoNothing();
    }

    const existingReps = await db.select().from(representatives);
    if (existingReps.length === 0) {
      await db
        .insert(representatives)
        .values([
          {
            slotOrder: 1,
            nameEn: 'Smt. Sunita Prakash Burabure',
            nameKn: 'ಶ್ರೀಮತಿ ಸುನೀತಾ ಪ್ರಕಾಶ ಬುರಬುರೆ',
            designationEn: 'Corporator – Ward No. 65 (HDMC)',
            designationKn: 'ಪಾಲಿಕೆ ಸದಸ್ಯರು – ವಾರ್ಡ್ ನಂ. 65 (ಎಚ್‌ಡಿಎಂಸಿ)',
            introEn:
              'Elected Corporator representing the residents of Ward No. 65 in the Hubballi-Dharwad Municipal Corporation, committed to accessible grassroots governance.',
            introKn:
              'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಮಹಾನಗರ ಪಾಲಿಕೆಯ ವಾರ್ಡ್ ನಂ. 65 ರ ಚುನಾಯಿತ ಪಾಲಿಕೆ ಸದಸ್ಯರಾಗಿ ಜನಸ್ನೇಹಿ ಆಡಳಿತಕ್ಕೆ ಬದ್ಧರಾಗಿದ್ದಾರೆ.',
            workEn:
              'Focused on drinking water distribution, underground drainage upgrades, street lighting, sanitation drives, and timely redressal of citizen grievances.',
            workKn:
              'ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು, ಭೂಗತ ಒಳಚರಂಡಿ ಸುಧಾರಣೆ, ಬೀದಿ ದೀಪಗಳು, ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ ಮತ್ತು ನಾಗರಿಕರ ಕುಂದುಕೊರತೆಗಳ ತ್ವರಿತ ಪರಿಹಾರ.',
            phone: '+91 9513613689',
            email: '',
            officeHours: '',
            photoUrl: '/assets/aistudio/KIR_5071_sd--_copy_dcb9ba37.jpg',
          },
          {
            slotOrder: 2,
            nameEn: 'Prakash Burbure',
            nameKn: 'ಪ್ರಕಾಶ್ ಬುರಬುರೆ',
            designationEn: 'Ward Operations Head',
            designationKn: 'ವಾರ್ಡ್ ಕಾರ್ಯಾಚರಣೆ ಮುಖ್ಯಸ್ಥರು',
            introEn:
              'Dedicated public representative serving the neighborhoods and civic committees of Ward No. 65, Hubballi.',
            introKn:
              'ಹುಬ್ಬಳ್ಳಿಯ ವಾರ್ಡ್ ನಂ. 65 ರ ಬಡಾವಣೆಗಳು ಮತ್ತು ನಾಗರಿಕ ಸಮಿತಿಗಳ ಸೇವೆಯಲ್ಲಿರುವ ಜನಪ್ರತಿನಿಧಿ.',
            workEn:
              'Coordinating road repairs, stormwater drain maintenance, cleanliness initiatives, and ward-level community infrastructure.',
            workKn:
              'ರಸ್ತೆ ದುರಸ್ತಿ, ಮಳೆನೀರು ಚರಂಡಿ ನಿರ್ವಹಣೆ, ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವಾರ್ಡ್ ಮಟ್ಟದ ಮೂಲಸೌಕರ್ಯ ಅಭಿವೃದ್ಧಿ.',
            phone: '',
            email: '',
            officeHours: 'Mon – Sat · 10:00 AM – 1:30 PM',
            photoUrl: '/assets/aistudio/DSC02240_fc0057be.JPG',
          },
          {
            slotOrder: 3,
            nameEn: 'Shri Prasad Abbayya',
            nameKn: 'ಶ್ರೀ ಪ್ರಸಾದ್ ಅಬ್ಬಯ್ಯ',
            designationEn: 'MLA – Hubballi-Dharwad East Constituency',
            designationKn: 'ಶಾಸಕರು – ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಪೂರ್ವ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ',
            introEn:
              'Member of the Karnataka Legislative Assembly representing Hubballi-Dharwad East, championing urban renewal, infrastructure, and public welfare.',
            introKn:
              'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಪೂರ್ವ ಕ್ಷೇತ್ರದ ಶಾಸಕರಾಗಿ ನಗರ ಅಭಿವೃದ್ಧಿ, ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕಲ್ಯಾಣಕ್ಕಾಗಿ ಶ್ರಮಿಸುತ್ತಿದ್ದಾರೆ.',
            workEn:
              'Leading constituency-wide road concretization, 24x7 water supply expansion, public health facilities, education support, and municipal development grants.',
            workKn:
              'ಕ್ಷೇತ್ರಾದ್ಯಂತ ಕಾಂಕ್ರೀಟ್ ರಸ್ತೆ ನಿರ್ಮಾಣ, 24x7 ಕುಡಿಯುವ ನೀರು ಯೋಜನೆ, ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ, ಶಿಕ್ಷಣ ಮತ್ತು ಮಹಾನಗರ ಪಾಲಿಕೆ ಅಭಿವೃದ್ಧಿ ಅನುದಾನ.',
            phone: '',
            email: '',
            officeHours: 'Constituency Office Hours · Mon – Sat',
            photoUrl: '/assets/aistudio/Formal_Portrait_on_Blue_Background_6bd0ab4f.png',
          },
        ])
        .onConflictDoNothing();
    }
  } catch (error) {
    console.error('Failed to ensure portal defaults:', error);
    throw new Error('Failed to initialize portal defaults.', { cause: error });
  }
}

export async function getPortalStats() {
  try {
    const complaintRows = await db
      .select({
        status: complaints.status,
        count: sql<number>`count(*)::int`,
      })
      .from(complaints)
      .groupBy(complaints.status);

    let totalComplaints = 0;
    let pendingComplaints = 0;
    let underProcessComplaints = 0;
    let resolvedComplaints = 0;

    for (const row of complaintRows) {
      const c = Number(row.count) || 0;
      totalComplaints += c;
      if (row.status === 'Submitted' || row.status === 'Under Review') {
        pendingComplaints += c;
      } else if (
        row.status === 'Assigned to Department' ||
        row.status === 'Work in Progress'
      ) {
        underProcessComplaints += c;
      } else if (row.status === 'Resolved' || row.status === 'Closed') {
        resolvedComplaints += c;
      }
    }

    const projectRows = await db
      .select({
        status: developmentWorks.status,
        count: sql<number>`count(*)::int`,
      })
      .from(developmentWorks)
      .groupBy(developmentWorks.status);

    let totalProjects = 0;
    let completedProjects = 0;
    for (const row of projectRows) {
      const c = Number(row.count) || 0;
      totalProjects += c;
      if (row.status === 'Completed') {
        completedProjects += c;
      }
    }

    return {
      totalComplaints,
      pendingComplaints,
      underProcessComplaints,
      resolvedComplaints,
      totalProjects,
      completedProjects,
    };
  } catch (error) {
    console.error('Database query failed in getPortalStats:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getPublicPortalData() {
  try {
    await ensurePortalDefaults();

    const [settingsRows, repRows, worksRows, announcementRows, stats] =
      await Promise.all([
        db.select().from(portalSettings).where(eq(portalSettings.id, 1)),
        db
          .select()
          .from(representatives)
          .orderBy(asc(representatives.slotOrder)),
        db
          .select()
          .from(developmentWorks)
          .orderBy(desc(developmentWorks.createdAt)),
        db.select().from(announcements).orderBy(desc(announcements.createdAt)),
        getPortalStats(),
      ]);

    return {
      settings: settingsRows[0] ?? null,
      representatives: repRows,
      developmentWorks: worksRows,
      announcements: announcementRows,
      stats,
    };
  } catch (error) {
    console.error('Database query failed in getPublicPortalData:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getOrCreateStaffUser(
  uid: string,
  email: string,
  name?: string | null
) {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid));

    if (existing.length > 0) {
      const [updated] = await db
        .update(users)
        .set({ email, name: name ?? existing[0].name })
        .where(eq(users.uid, uid))
        .returning();
      return updated;
    }

    const adminCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'admin'));
    const adminCount = Number(adminCountResult[0]?.count ?? 0);

    const isPrimaryAdmin =
      email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
      adminCount === 0;

    const [created] = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name ?? null,
        role: isPrimaryAdmin ? 'admin' : 'staff',
        isActive: isPrimaryAdmin,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email, name: name ?? null },
      })
      .returning();

    return created;
  } catch (error) {
    console.error('Database query failed in getOrCreateStaffUser:', error);
    throw new Error('Failed to synchronize staff user account.', {
      cause: error,
    });
  }
}

export async function generateNextComplaintCode(): Promise<string> {
  try {
    const year = new Date().getFullYear();
    const countRes = await db
      .select({ maxId: sql<number>`coalesce(max(id), 0)::int` })
      .from(complaints);
    const nextNum = (Number(countRes[0]?.maxId ?? 0) + 1)
      .toString()
      .padStart(4, '0');
    return `HDMC-W65-${year}-${nextNum}`;
  } catch (error) {
    console.error('Failed to generate complaint code:', error);
    throw new Error('Failed to generate complaint reference ID.', {
      cause: error,
    });
  }
}

export async function getComplaintWithTimelineByCodeAndMobile(
  code: string,
  mobile: string
) {
  try {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedMobile = mobile.replace(/\D/g, '').slice(-10);

    const rows = await db
      .select()
      .from(complaints)
      .where(eq(complaints.complaintCode, normalizedCode));

    const complaint = rows[0];
    if (!complaint) return null;

    if (complaint.mobileNumber !== normalizedMobile) {
      return 'MISMATCH' as const;
    }

    const timeline = await db
      .select()
      .from(complaintTimeline)
      .where(eq(complaintTimeline.complaintId, complaint.id))
      .orderBy(asc(complaintTimeline.createdAt));

    // Return sanitized view without exposing raw mobile number unnecessarily
    return {
      id: complaint.id,
      complaintCode: complaint.complaintCode,
      citizenName: complaint.citizenName,
      areaStreet: complaint.areaStreet,
      wardNumber: complaint.wardNumber,
      category: complaint.category,
      description: complaint.description,
      landmark: complaint.landmark,
      mediaFiles: complaint.mediaFiles ?? [],
      status: complaint.status,
      assignedDepartment: complaint.assignedDepartment,
      latestUpdate: complaint.latestUpdate,
      resolutionDetails: complaint.resolutionDetails,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      timeline,
    };
  } catch (error) {
    console.error('Database query failed in tracking complaint:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}
