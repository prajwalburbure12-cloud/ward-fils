'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAuth } from './AuthProvider.tsx';
import type {
  AnnouncementData,
  DevelopmentWorkData,
  PortalSettingsData,
  PortalStatsData,
  RepresentativeData,
} from './HomePortalView.tsx';
import {
  ANNOUNCEMENT_TYPES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  DEVELOPMENT_CATEGORIES,
  DEVELOPMENT_STATUSES,
  HDMC_DEPARTMENTS,
  WARD_65_AREAS,
} from '../lib/constants.ts';
import { compressImageIfNeeded, readFileAsDataUrl } from '../lib/media-utils.ts';
import {
  exportComplaintsToExcel,
  exportComplaintsToPdf,
} from '../lib/export-reports.ts';

interface AdminComplaintRow {
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

interface StaffUserRow {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

type AdminTab =
  | 'complaints'
  | 'gallery'
  | 'announcements'
  | 'representatives'
  | 'settings'
  | 'staff';

export function AdminDashboard() {
  const {
    firebaseUser,
    staffProfile,
    loading,
    authError,
    signInWithGoogle,
    signOut,
    getIdToken,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('complaints');
  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Portal Public Data & Stats
  const [stats, setStats] = useState<PortalStatsData>({
    totalComplaints: 0,
    pendingComplaints: 0,
    underProcessComplaints: 0,
    resolvedComplaints: 0,
    totalProjects: 0,
    completedProjects: 0,
  });
  const [representatives, setRepresentatives] = useState<RepresentativeData[]>(
    []
  );
  const [developmentWorks, setDevelopmentWorks] = useState<
    DevelopmentWorkData[]
  >([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [settings, setSettings] = useState<PortalSettingsData | null>(null);

  // Complaints Management State
  const [complaintsList, setComplaintsList] = useState<AdminComplaintRow[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedComplaint, setSelectedComplaint] =
    useState<AdminComplaintRow | null>(null);

  // Complaint Update Form State
  const [editStatus, setEditStatus] = useState<string>('Under Review');
  const [editDept, setEditDept] = useState<string>(HDMC_DEPARTMENTS[0]);
  const [editNote, setEditNote] = useState('');
  const [editResolution, setEditResolution] = useState('');
  const [updatingComplaint, setUpdatingComplaint] = useState(false);

  // Gallery Form State
  const [galTitleEn, setGalTitleEn] = useState('');
  const [galTitleKn, setGalTitleKn] = useState('');
  const [galArea, setGalArea] = useState<string>(WARD_65_AREAS[0]);
  const [galCategory, setGalCategory] = useState<string>(
    DEVELOPMENT_CATEGORIES[0]
  );
  const [galStatus, setGalStatus] = useState<string>('Completed');
  const [galDate, setGalDate] = useState('');
  const [galDescEn, setGalDescEn] = useState('');
  const [galDescKn, setGalDescKn] = useState('');
  const [galBeforeUrl, setGalBeforeUrl] = useState<string | null>(null);
  const [galAfterUrl, setGalAfterUrl] = useState<string | null>(null);
  const [savingGallery, setSavingGallery] = useState(false);

  // Announcement Form State
  const [annTitleEn, setAnnTitleEn] = useState('');
  const [annTitleKn, setAnnTitleKn] = useState('');
  const [annType, setAnnType] = useState<string>(ANNOUNCEMENT_TYPES[0]);
  const [annLocation, setAnnLocation] = useState('Ward No. 65, Hubballi');
  const [annDate, setAnnDate] = useState('');
  const [annDescEn, setAnnDescEn] = useState('');
  const [annDescKn, setAnnDescKn] = useState('');
  const [annPhotoUrl, setAnnPhotoUrl] = useState<string | null>(null);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Staff Access State
  const [staffUsers, setStaffUsers] = useState<StaffUserRow[]>([]);

  const loadPortalData = useCallback(async () => {
    const res = await fetch('/api/portal', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      setStats(json.stats);
      setRepresentatives(json.representatives ?? []);
      setDevelopmentWorks(json.developmentWorks ?? []);
      setAnnouncements(json.announcements ?? []);
      setSettings(json.settings ?? null);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    const token = await getIdToken();
    if (!token) return;
    setComplaintsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQ.trim()) params.set('q', searchQ.trim());
      if (areaFilter) params.set('area', areaFilter);
      if (catFilter) params.set('category', catFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`/api/complaints?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setComplaintsList(json.complaints ?? []);
      }
    } finally {
      setComplaintsLoading(false);
    }
  }, [
    areaFilter,
    catFilter,
    fromDate,
    getIdToken,
    searchQ,
    statusFilter,
    toDate,
  ]);

  const loadStaffUsers = useCallback(async () => {
    if (staffProfile?.role !== 'admin') return;
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setStaffUsers(json.users ?? []);
    }
  }, [getIdToken, staffProfile?.role]);

  useEffect(() => {
    if (!staffProfile?.isActive) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      loadPortalData();
      loadComplaints();
      if (staffProfile.role === 'admin') {
        loadStaffUsers();
      }
    });
    return () => {
      active = false;
    };
  }, [
    loadComplaints,
    loadPortalData,
    loadStaffUsers,
    staffProfile?.isActive,
    staffProfile?.role,
  ]);

  const selectComplaintForEdit = (row: AdminComplaintRow) => {
    setSelectedComplaint(row);
    setEditStatus(row.status);
    setEditDept(row.assignedDepartment || HDMC_DEPARTMENTS[0]);
    setEditNote(row.latestUpdate || '');
    setEditResolution(row.resolutionDetails || '');
  };

  const handleUpdateComplaint = async (overrideStatus?: string) => {
    if (!selectedComplaint) return;
    const token = await getIdToken();
    if (!token) return;

    setUpdatingComplaint(true);
    setNotice(null);
    const nextStatus = overrideStatus || editStatus;
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          assignedDepartment: editDept,
          progressNote:
            editNote.trim() ||
            (nextStatus === 'Resolved'
              ? 'Issue resolved by Ward 65 team.'
              : `Status updated to ${nextStatus}.`),
          resolutionDetails: editResolution.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Update failed.');
      }
      setSelectedComplaint(json.complaint);
      setEditStatus(json.complaint.status);
      setNotice({
        type: 'success',
        text: `Updated ${json.complaint.complaintCode} to "${json.complaint.status}".`,
      });
      await Promise.all([loadComplaints(), loadPortalData()]);
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update complaint.',
      });
    } finally {
      setUpdatingComplaint(false);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getIdToken();
    if (!token) return;

    setSavingGallery(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titleEn: galTitleEn,
          titleKn: galTitleKn,
          area: galArea,
          category: galCategory,
          status: galStatus,
          completionDate: galDate,
          descriptionEn: galDescEn,
          descriptionKn: galDescKn,
          beforePhotoUrl: galBeforeUrl,
          afterPhotoUrl: galAfterUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add project.');

      setDevelopmentWorks(json.developmentWorks ?? []);
      setGalTitleEn('');
      setGalTitleKn('');
      setGalDate('');
      setGalDescEn('');
      setGalDescKn('');
      setGalBeforeUrl(null);
      setGalAfterUrl(null);
      setNotice({
        type: 'success',
        text: 'Development work added to Gallery and live statistics updated.',
      });
      await loadPortalData();
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save gallery work.',
      });
    } finally {
      setSavingGallery(false);
    }
  };

  const handleDeleteGallery = async (id: number) => {
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch(`/api/admin/gallery?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setDevelopmentWorks(json.developmentWorks ?? []);
      await loadPortalData();
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getIdToken();
    if (!token) return;

    setSavingAnnouncement(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titleEn: annTitleEn,
          titleKn: annTitleKn,
          type: annType,
          location: annLocation,
          eventDate: annDate,
          descriptionEn: annDescEn,
          descriptionKn: annDescKn,
          photoUrl: annPhotoUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to publish announcement.');
      }

      setAnnouncements(json.announcements ?? []);
      setAnnTitleEn('');
      setAnnTitleKn('');
      setAnnDescEn('');
      setAnnDescKn('');
      setAnnPhotoUrl(null);
      setNotice({
        type: 'success',
        text: 'Announcement published to Ward No. 65 Updates.',
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to publish announcement.',
      });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch(`/api/admin/announcements?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setAnnouncements(json.announcements ?? []);
    }
  };

  const handleSaveRepresentative = async (rep: RepresentativeData) => {
    const token = await getIdToken();
    if (!token) return;
    setNotice(null);
    try {
      const res = await fetch('/api/admin/representatives', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rep),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update profile.');
      setRepresentatives(json.representatives ?? []);
      setNotice({
        type: 'success',
        text: `Saved representative profile: ${rep.nameEn}`,
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const token = await getIdToken();
    if (!token) return;
    setNotice(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save settings.');
      setSettings(json.settings);
      setNotice({
        type: 'success',
        text: 'Ward 65 banner and office contact settings updated.',
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    }
  };

  const handleToggleUser = async (
    userId: number,
    role: string,
    isActive: boolean
  ) => {
    const token = await getIdToken();
    if (!token) return;
    setNotice(null);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, role, isActive }),
    });
    const json = await res.json();
    if (res.ok) {
      setStaffUsers(json.users ?? []);
      setNotice({ type: 'success', text: 'Staff permission updated.' });
    } else {
      setNotice({
        type: 'error',
        text: json.error || 'Failed to update permissions.',
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-sm text-slate-600">
        Verifying administrative session...
      </div>
    );
  }

  if (!firebaseUser || !staffProfile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#0B2545]/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#0B2545]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B2545]">
              Ward No. 65 · Admin & Staff Portal
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Authorised HDMC Ward 65 administrators and staff must sign in with
              Google to view citizen grievances, upload development photos, and
              manage portal records.
            </p>
          </div>
          {authError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              {authError}
            </div>
          )}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (!staffProfile.isActive) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-4">
          <h1 className="text-xl font-bold text-slate-900">
            Account Pending Administrator Approval
          </h1>
          <p className="text-sm text-slate-600">
            Signed in as{' '}
            <span className="font-mono font-semibold text-slate-900">
              {staffProfile.email}
            </span>
            . For citizen data privacy, an active Ward 65 Administrator must
            enable your staff permissions before you can view complaints.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = staffProfile.role === 'admin';

  const tabs: Array<{ id: AdminTab; label: string; adminOnly?: boolean }> = [
    { id: 'complaints', label: 'Complaints' },
    { id: 'gallery', label: 'Development Gallery' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'representatives', label: 'Representatives', adminOnly: true },
    { id: 'settings', label: 'Banner & Contacts', adminOnly: true },
    { id: 'staff', label: 'Staff Access', adminOnly: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#15803D]">
            {isAdmin ? 'Ward Administrator' : 'Authorised Staff'} ·{' '}
            {staffProfile.email}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545] mt-1">
            Ward No. 65 Control Dashboard
          </h1>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-slate-200 rounded-xl bg-white overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        {[
          { label: 'Total Complaints', val: stats.totalComplaints },
          { label: 'Pending Review', val: stats.pendingComplaints },
          { label: 'Under Process', val: stats.underProcessComplaints },
          { label: 'Resolved', val: stats.resolvedComplaints },
          { label: 'Total Projects', val: stats.totalProjects },
          { label: 'Completed Works', val: stats.completedProjects },
        ].map((item) => (
          <div key={item.label} className="p-4">
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="text-2xl font-mono font-bold text-[#0B2545] tabular-nums mt-1">
              {item.val}
            </div>
          </div>
        ))}
      </div>

      {notice && (
        <div
          role="status"
          className={`p-4 rounded-lg border text-sm font-medium ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
        {tabs
          .filter((t) => !t.adminOnly || isAdmin)
          .map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* TAB 1: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Search ID / Resident / Mobile / Text
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Area
                </label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Areas</option>
                  {WARD_65_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Categories</option>
                  {COMPLAINT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Statuses</option>
                  {COMPLAINT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={loadComplaints}
                  className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-600">
                  <span>From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-slate-600">
                  <span>To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportComplaintsToExcel(complaintsList)}
                  disabled={complaintsList.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#15803D] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportComplaintsToPdf(complaintsList)}
                  disabled={complaintsList.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B2545] bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Complaints Table */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              {complaintsLoading ? (
                <div className="p-8 text-sm text-slate-500">
                  Loading complaints...
                </div>
              ) : complaintsList.length === 0 ? (
                <div className="p-8 text-sm text-slate-600">
                  No complaints match the current filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Complaint ID</th>
                        <th className="px-4 py-3">Resident & Area</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {complaintsList.map((row) => {
                        const isSelected = selectedComplaint?.id === row.id;
                        return (
                          <tr
                            key={row.id}
                            onClick={() => selectComplaintForEdit(row)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50/70'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="px-4 py-3 font-mono text-xs font-bold text-[#0B2545] whitespace-nowrap">
                              <div>{row.complaintCode}</div>
                              <div className="text-[11px] font-normal text-slate-500">
                                {new Date(row.createdAt).toLocaleDateString(
                                  'en-IN'
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {row.citizenName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {row.areaStreet} · {row.mobileNumber}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-700">
                              {row.category}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-800 whitespace-nowrap">
                              {row.status}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected Complaint Detail & Resolution Editor */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              {!selectedComplaint ? (
                <div className="text-sm text-slate-500 py-8 text-center">
                  Select a complaint row from the list to inspect uploaded
                  photos/videos, assign a department, or update resolution
                  progress.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-slate-200">
                    <div className="text-xs font-mono font-bold text-[#0B2545]">
                      {selectedComplaint.complaintCode}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedComplaint.citizenName}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1">
                      Mobile:{' '}
                      <span className="font-mono font-semibold">
                        {selectedComplaint.mobileNumber}
                      </span>{' '}
                      · {selectedComplaint.areaStreet}
                      {selectedComplaint.landmark
                        ? ` (${selectedComplaint.landmark})`
                        : ''}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      Problem Description ({selectedComplaint.category})
                    </div>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {selectedComplaint.mediaFiles &&
                    selectedComplaint.mediaFiles.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-2">
                          Uploaded Evidence (
                          {selectedComplaint.mediaFiles.length})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedComplaint.mediaFiles.map((m, idx) =>
                            m.type === 'image' ? (
                              <img
                                key={idx}
                                src={m.dataUrl}
                                alt={m.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-28 object-cover rounded border border-slate-200"
                              />
                            ) : (
                              <video
                                key={idx}
                                src={m.dataUrl}
                                controls
                                className="w-full h-28 rounded border border-slate-200 bg-black"
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Complaint Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      >
                        {COMPLAINT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assigned Department
                      </label>
                      <select
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                      >
                        {HDMC_DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Progress Report Note (Visible to Resident)
                      </label>
                      <textarea
                        rows={2}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Field inspection or action update..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Resolution Details
                      </label>
                      <textarea
                        rows={2}
                        value={editResolution}
                        onChange={(e) => setEditResolution(e.target.value)}
                        placeholder="Details of completed repair or resolution..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={updatingComplaint}
                        onClick={() => handleUpdateComplaint()}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg disabled:opacity-60"
                      >
                        Save Progress Update
                      </button>
                      <button
                        type="button"
                        disabled={updatingComplaint}
                        onClick={() => handleUpdateComplaint('Resolved')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPMENT GALLERY */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAddGallery}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add Development Work</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title (English) *
              </label>
              <input
                type="text"
                required
                value={galTitleEn}
                onChange={(e) => setGalTitleEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title (Kannada - Optional)
              </label>
              <input
                type="text"
                value={galTitleKn}
                onChange={(e) => setGalTitleKn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward 65 Area
                </label>
                <select
                  value={galArea}
                  onChange={(e) => setGalArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {WARD_65_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={galCategory}
                  onChange={(e) => setGalCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {DEVELOPMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Status
                </label>
                <select
                  value={galStatus}
                  onChange={(e) => setGalStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {DEVELOPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Completion / Work Date
                </label>
                <input
                  type="date"
                  value={galDate}
                  onChange={(e) => setGalDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (English) *
              </label>
              <textarea
                rows={3}
                required
                value={galDescEn}
                onChange={(e) => setGalDescEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (Kannada - Optional)
              </label>
              <textarea
                rows={2}
                value={galDescKn}
                onChange={(e) => setGalDescKn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Before Work Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setGalBeforeUrl(await compressImageIfNeeded(f));
                  }}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  After Completion Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setGalAfterUrl(await compressImageIfNeeded(f));
                  }}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingGallery}
              className="w-full py-2.5 text-sm font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg"
            >
              {savingGallery ? 'Uploading...' : 'Publish to Ward Gallery'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Published Development Works ({developmentWorks.length})
            </h2>
            {developmentWorks.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
                No development works published yet.
              </div>
            ) : (
              <div className="space-y-3">
                {developmentWorks.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-[#0B2545]">
                          {w.area}
                        </span>{' '}
                        · {w.category} · {w.status}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {w.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {w.descriptionEn}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGallery(w.id)}
                      className="p-2 text-slate-400 hover:text-red-600"
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAddAnnouncement}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-[#0B2545] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Publish Announcement</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline (English) *
              </label>
              <input
                type="text"
                required
                value={annTitleEn}
                onChange={(e) => setAnnTitleEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline (Kannada - Optional)
              </label>
              <input
                type="text"
                value={annTitleKn}
                onChange={(e) => setAnnTitleKn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Type
                </label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={annDate}
                  onChange={(e) => setAnnDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                required
                value={annLocation}
                onChange={(e) => setAnnLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Details (English) *
              </label>
              <textarea
                rows={3}
                required
                value={annDescEn}
                onChange={(e) => setAnnDescEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Details (Kannada - Optional)
              </label>
              <textarea
                rows={2}
                value={annDescKn}
                onChange={(e) => setAnnDescKn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attachment Photograph (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setAnnPhotoUrl(await compressImageIfNeeded(f));
                }}
                className="w-full text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={savingAnnouncement}
              className="w-full py-2.5 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg"
            >
              {savingAnnouncement ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Published Announcements ({announcements.length})
            </h2>
            {announcements.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
                No announcements published yet.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-[#D97706]">
                          {a.type}
                        </span>{' '}
                        · {a.eventDate} · {a.location}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {a.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {a.descriptionEn}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-2 text-slate-400 hover:text-red-600"
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REPRESENTATIVES (ADMIN ONLY) */}
      {activeTab === 'representatives' && isAdmin && (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Upload the exact supplied photographs and update names, official
            designations, biographies, and contact details for Ward No. 65
            public representatives. Photographs are displayed without altering
            faces or proportions.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {representatives.map((rep, idx) => (
              <div
                key={rep.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
              >
                <div className="text-xs font-bold text-[#0B2545]">
                  Representative Card #{rep.slotOrder}
                </div>

                {rep.photoUrl && (
                  <img
                    src={rep.photoUrl}
                    alt={rep.nameEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-contain bg-slate-50 rounded-lg border border-slate-200"
                  />
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Exact Photograph
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await readFileAsDataUrl(f);
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, photoUrl: url } : item
                        )
                      );
                    }}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (English)
                  </label>
                  <input
                    type="text"
                    value={rep.nameEn}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, nameEn: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (Kannada)
                  </label>
                  <input
                    type="text"
                    value={rep.nameKn}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, nameKn: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Designation (English)
                  </label>
                  <input
                    type="text"
                    value={rep.designationEn}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? { ...item, designationEn: e.target.value }
                            : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Introduction (English)
                  </label>
                  <textarea
                    rows={2}
                    value={rep.introEn}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? { ...item, introEn: e.target.value }
                            : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Public Service & Development Work
                  </label>
                  <textarea
                    rows={2}
                    value={rep.workEn}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, workEn: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={rep.phone || ''}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, phone: e.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={rep.email || ''}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, email: e.target.value } : item
                        )
                      )
                    }
                    className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveRepresentative(rep)}
                  className="w-full py-2.5 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg"
                >
                  Save Profile #{rep.slotOrder}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BANNER & CONTACT SETTINGS (ADMIN ONLY) */}
      {activeTab === 'settings' && isAdmin && settings && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 max-w-3xl"
        >
          <h2 className="text-xl font-bold text-[#0B2545]">
            Homepage Official Banner & Ward Contact Settings
          </h2>

          <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <label className="block text-sm font-semibold text-slate-800">
              Official Supplied Homepage Banner (Displayed in Original
              Proportions)
            </label>
            {settings.bannerImageUrl && (
              <div className="space-y-2">
                <img
                  src={settings.bannerImageUrl}
                  alt="Current Homepage Banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, bannerImageUrl: null })
                  }
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Remove Banner Image
                </button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0B2545] bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100">
              <Upload className="w-4 h-4" />
              <span>Upload Supplied Banner Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const url = await readFileAsDataUrl(f);
                    setSettings({ ...settings, bannerImageUrl: url });
                  }
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward Office Address (English)
              </label>
              <input
                type="text"
                value={settings.officeAddressEn}
                onChange={(e) =>
                  setSettings({ ...settings, officeAddressEn: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward Office Address (Kannada)
              </label>
              <input
                type="text"
                value={settings.officeAddressKn}
                onChange={(e) =>
                  setSettings({ ...settings, officeAddressKn: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward Office Phone
              </label>
              <input
                type="text"
                value={settings.officePhone || ''}
                onChange={(e) =>
                  setSettings({ ...settings, officePhone: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward Office Email
              </label>
              <input
                type="email"
                value={settings.officeEmail || ''}
                onChange={(e) =>
                  setSettings({ ...settings, officeEmail: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official WhatsApp Number (with country code, e.g. 9198450...)
              </label>
              <input
                type="text"
                value={settings.whatsappNumber || ''}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappNumber: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Maps Location URL
              </label>
              <input
                type="url"
                value={settings.googleMapsUrl || ''}
                onChange={(e) =>
                  setSettings({ ...settings, googleMapsUrl: e.target.value })
                }
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Water Helpline
              </label>
              <input
                type="text"
                value={settings.emergencyWaterPhone || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergencyWaterPhone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Power / Streetlight Helpline
              </label>
              <input
                type="text"
                value={settings.emergencyPowerPhone || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergencyPowerPhone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Sanitation Helpline
              </label>
              <input
                type="text"
                value={settings.emergencySanitationPhone || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    emergencySanitationPhone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 text-sm font-bold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg"
          >
            Save Portal Settings
          </button>
        </form>
      )}

      {/* TAB 6: STAFF & ROLE ACCESS CONTROL (ADMIN ONLY) */}
      {activeTab === 'staff' && isAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-[#0B2545]">
              Administrator & Authorised Staff Permissions
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Staff members who sign in via Google appear here. Enable their
              access and assign either Authorised Staff (complaints, gallery,
              updates) or full Administrator permissions.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Access Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {u.name || 'Staff Member'}
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        {u.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={u.id === staffProfile.id}
                        onChange={(e) =>
                          handleToggleUser(u.id, e.target.value, u.isActive)
                        }
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                      >
                        <option value="staff">Authorised Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {u.isActive ? (
                        <span className="text-[#15803D]">Active</span>
                      ) : (
                        <span className="text-[#D97706]">Pending Approval</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={u.id === staffProfile.id}
                        onClick={() =>
                          handleToggleUser(u.id, u.role, !u.isActive)
                        }
                        className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40"
                      >
                        {u.isActive ? 'Revoke Access' : 'Approve Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
