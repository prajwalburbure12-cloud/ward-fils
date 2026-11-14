export interface AdminComplaintRow {
  id: number;
  complaintCode: string;
  citizenName: string;
  mobileNumber: string;
  areaStreet: string;
  wardNumber: string;
  category: string;
  description: string;
  landmark: string | null;
  mediaFiles: Array<{ name: string; type: 'image' | 'video'; dataUrl: string }>;
  status: string;
  assignedDepartment: string | null;
  latestUpdate: string | null;
  resolutionDetails: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintTimelineRow {
  id: number;
  complaintId: number;
  status: string;
  note: string;
  updatedBy: string;
  createdAt: string;
}

export interface StaffUserRow {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export type AdminSection =
  | 'overview'
  | 'complaints'
  | 'gallery'
  | 'announcements'
  | 'representatives'
  | 'settings'
  | 'staff';

export interface AdminNotice {
  type: 'success' | 'error';
  text: string;
}
