import { asc, desc, eq, isNotNull, sql } from 'drizzle-orm';
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
import { hashPassword } from '../lib/auth-crypto.ts';

function isMissingSchemaError(error: unknown): boolean {
  const err = error as {
    code?: string;
    cause?: { code?: string };
  };
  const code = err?.cause?.code || err?.code || '';
  return code === '42P01' || code === '42703';
}

async function createMissingSchemaTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      uid text NOT NULL UNIQUE,
      email text NOT NULL,
      name text,
      password_hash text,
      role text NOT NULL DEFAULT 'staff',
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS representatives (
      id serial PRIMARY KEY,
      slot_order integer NOT NULL UNIQUE,
      name_en text NOT NULL,
      name_kn text NOT NULL,
      designation_en text NOT NULL,
      designation_kn text NOT NULL,
      intro_en text NOT NULL,
      intro_kn text NOT NULL,
      work_en text NOT NULL,
      work_kn text NOT NULL,
      phone text,
      email text,
      office_hours text,
      photo_url text,
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS complaints (
      id serial PRIMARY KEY,
      complaint_code text NOT NULL UNIQUE,
      citizen_name text NOT NULL,
      mobile_number text NOT NULL,
      area_street text NOT NULL,
      ward_number text NOT NULL DEFAULT '65',
      category text NOT NULL,
      description text NOT NULL,
      landmark text,
      media_files jsonb DEFAULT '[]'::jsonb,
      status text NOT NULL DEFAULT 'Submitted',
      assigned_department text,
      latest_update text,
      resolution_details text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS complaint_timeline (
      id serial PRIMARY KEY,
      complaint_id integer NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
      status text NOT NULL,
      note text NOT NULL,
      updated_by text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS development_works (
      id serial PRIMARY KEY,
      title_en text NOT NULL,
      title_kn text NOT NULL,
      area text NOT NULL,
      category text NOT NULL,
      status text NOT NULL DEFAULT 'Completed',
      description_en text NOT NULL,
      description_kn text NOT NULL,
      before_photo_url text,
      after_photo_url text,
      completion_date text,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id serial PRIMARY KEY,
      title_en text NOT NULL,
      title_kn text NOT NULL,
      type text NOT NULL,
      location text NOT NULL,
      event_date text NOT NULL,
      description_en text NOT NULL,
      description_kn text NOT NULL,
      photo_url text,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS portal_settings (
      id integer PRIMARY KEY DEFAULT 1,
      banner_image_url text,
      banner_alt text,
      hero_slides jsonb DEFAULT '[]'::jsonb,
      office_address_en text NOT NULL,
      office_address_kn text NOT NULL,
      office_phone text,
      office_email text,
      whatsapp_number text,
      google_maps_url text,
      emergency_water_phone text,
      emergency_power_phone text,
      emergency_sanitation_phone text,
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);
  await db.execute(sql`
    ALTER TABLE portal_settings ADD COLUMN IF NOT EXISTS hero_slides jsonb DEFAULT '[]'::jsonb;
  `);
}

async function seedPortalDefaultsRows() {
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
          heroSlides: [],
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
            phone: '9886613689',
            email: '',
            officeHours: '',
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
}

export async function ensurePortalDefaults() {
  try {
    await seedPortalDefaultsRows();
  } catch (error) {
    if (isMissingSchemaError(error)) {
      try {
        await createMissingSchemaTables();
        await seedPortalDefaultsRows();
        return;
      } catch (bootstrapError) {
        console.error(
          'Failed to initialize portal tables and defaults:',
          bootstrapError
        );
        throw new Error('Failed to initialize portal defaults.', {
          cause: bootstrapError,
        });
      }
    }
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

async function seedAdminLoginAccountsRows() {
  const existingCountRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(isNotNull(users.passwordHash));

  if (Number(existingCountRes[0]?.count ?? 0) > 0) {
    return;
  }

  const adminPass = process.env.WARD65_ADMIN_PASSWORD || 'Ward65@Admin';
  const team1Pass = process.env.WARD65_TEAM1_PASSWORD || 'Ward65@Team1';
  const team2Pass = process.env.WARD65_TEAM2_PASSWORD || 'Ward65@Team2';

  await db
    .insert(users)
    .values([
      {
        uid: 'login:ward65admin',
        email: 'ward65admin',
        name: 'Ward 65 Admin',
        passwordHash: hashPassword(adminPass),
        role: 'admin',
        isActive: true,
      },
      {
        uid: 'login:ward65team1',
        email: 'ward65team1',
        name: 'Team Member 1',
        passwordHash: hashPassword(team1Pass),
        role: 'staff',
        isActive: true,
      },
      {
        uid: 'login:ward65team2',
        email: 'ward65team2',
        name: 'Team Member 2',
        passwordHash: hashPassword(team2Pass),
        role: 'staff',
        isActive: true,
      },
    ])
    .onConflictDoNothing();
}

export async function ensureAdminLoginAccounts() {
  try {
    await seedAdminLoginAccountsRows();
  } catch (error) {
    if (isMissingSchemaError(error)) {
      try {
        await createMissingSchemaTables();
        await seedAdminLoginAccountsRows();
        return;
      } catch (bootstrapError) {
        console.error(
          'Database bootstrap failed in ensureAdminLoginAccounts:',
          bootstrapError
        );
        throw new Error('Failed to initialize Ward 65 login accounts.', {
          cause: bootstrapError,
        });
      }
    }
    console.error('Database query failed in ensureAdminLoginAccounts:', error);
    throw new Error('Failed to initialize Ward 65 login accounts.', {
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
