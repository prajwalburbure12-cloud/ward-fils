import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export interface ComplaintMediaItem {
  name: string;
  type: 'image' | 'video';
  dataUrl: string;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').notNull().default('staff'), // 'admin' | 'staff'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const representatives = pgTable('representatives', {
  id: serial('id').primaryKey(),
  slotOrder: integer('slot_order').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameKn: text('name_kn').notNull(),
  designationEn: text('designation_en').notNull(),
  designationKn: text('designation_kn').notNull(),
  introEn: text('intro_en').notNull(),
  introKn: text('intro_kn').notNull(),
  workEn: text('work_en').notNull(),
  workKn: text('work_kn').notNull(),
  phone: text('phone'),
  email: text('email'),
  officeHours: text('office_hours'),
  photoUrl: text('photo_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  complaintCode: text('complaint_code').notNull().unique(),
  citizenName: text('citizen_name').notNull(),
  mobileNumber: text('mobile_number').notNull(),
  areaStreet: text('area_street').notNull(),
  wardNumber: text('ward_number').notNull().default('65'),
  category: text('category').notNull(),
  description: text('description').notNull(),
  landmark: text('landmark'),
  mediaFiles: jsonb('media_files').$type<ComplaintMediaItem[]>().default([]),
  status: text('status').notNull().default('Submitted'),
  assignedDepartment: text('assigned_department'),
  latestUpdate: text('latest_update'),
  resolutionDetails: text('resolution_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const complaintTimeline = pgTable('complaint_timeline', {
  id: serial('id').primaryKey(),
  complaintId: integer('complaint_id')
    .references(() => complaints.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull(),
  note: text('note').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const complaintsRelations = relations(complaints, ({ many }) => ({
  timeline: many(complaintTimeline),
}));

export const complaintTimelineRelations = relations(
  complaintTimeline,
  ({ one }) => ({
    complaint: one(complaints, {
      fields: [complaintTimeline.complaintId],
      references: [complaints.id],
    }),
  })
);

export const developmentWorks = pgTable('development_works', {
  id: serial('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleKn: text('title_kn').notNull(),
  area: text('area').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull().default('Completed'), // 'Planned' | 'Ongoing' | 'Completed'
  descriptionEn: text('description_en').notNull(),
  descriptionKn: text('description_kn').notNull(),
  beforePhotoUrl: text('before_photo_url'),
  afterPhotoUrl: text('after_photo_url'),
  completionDate: text('completion_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  titleEn: text('title_en').notNull(),
  titleKn: text('title_kn').notNull(),
  type: text('type').notNull(),
  location: text('location').notNull(),
  eventDate: text('event_date').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionKn: text('description_kn').notNull(),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const portalSettings = pgTable('portal_settings', {
  id: integer('id').primaryKey().default(1),
  bannerImageUrl: text('banner_image_url'),
  bannerAlt: text('banner_alt'),
  officeAddressEn: text('office_address_en').notNull(),
  officeAddressKn: text('office_address_kn').notNull(),
  officePhone: text('office_phone'),
  officeEmail: text('office_email'),
  whatsappNumber: text('whatsapp_number'),
  googleMapsUrl: text('google_maps_url'),
  emergencyWaterPhone: text('emergency_water_phone'),
  emergencyPowerPhone: text('emergency_power_phone'),
  emergencySanitationPhone: text('emergency_sanitation_phone'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
