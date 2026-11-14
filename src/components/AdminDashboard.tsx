'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Megaphone,
  RefreshCw,
  Settings,
  UserCheck,
  Users,
  X,
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
  DEVELOPMENT_CATEGORIES,
  HDMC_DEPARTMENTS,
  WARD_65_AREAS,
} from '../lib/constants.ts';
import type {
  AdminComplaintRow,
  AdminNotice,
  AdminSection,
  ComplaintTimelineRow,
  StaffUserRow,
} from './admin/types.ts';
import { AdminOverviewSection } from './admin/AdminOverviewSection.tsx';
import { AdminComplaintsSection } from './admin/AdminComplaintsSection.tsx';
import { AdminGallerySection } from './admin/AdminGallerySection.tsx';
import { AdminAnnouncementsSection } from './admin/AdminAnnouncementsSection.tsx';
import { AdminRepresentativesSection } from './admin/AdminRepresentativesSection.tsx';
import { AdminSettingsSection } from './admin/AdminSettingsSection.tsx';
import { AdminStaffSection } from './admin/AdminStaffSection.tsx';

export function AdminDashboard() {
  const {
    firebaseUser,
    staffProfile,
    signOut,
    getIdToken,
  } = useAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);

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
  const [selectedTimeline, setSelectedTimeline] = useState<
    ComplaintTimelineRow[]
  >([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Complaint Update Form State
  const [editStatus, setEditStatus] = useState<string>('Under Review');
  const [editDept, setEditDept] = useState<string>(HDMC_DEPARTMENTS[0]);
  const [editNote, setEditNote] = useState('');
  const [editResolution, setEditResolution] = useState('');
  const [updatingComplaint, setUpdatingComplaint] = useState(false);

  // Gallery Form State
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
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
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    number | null
  >(null);
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

  const loadComplaints = useCallback(
    async (overrides?: {
      q?: string;
      area?: string;
      category?: string;
      status?: string;
      from?: string;
      to?: string;
    }) => {
      const token = await getIdToken();
      if (!token) return;
      setComplaintsLoading(true);
      try {
        const qVal = overrides?.q !== undefined ? overrides.q : searchQ;
        const areaVal =
          overrides?.area !== undefined ? overrides.area : areaFilter;
        const catVal =
          overrides?.category !== undefined ? overrides.category : catFilter;
        const statusVal =
          overrides?.status !== undefined ? overrides.status : statusFilter;
        const fromVal = overrides?.from !== undefined ? overrides.from : fromDate;
        const toVal = overrides?.to !== undefined ? overrides.to : toDate;

        const params = new URLSearchParams();
        if (qVal.trim()) params.set('q', qVal.trim());
        if (areaVal) params.set('area', areaVal);
        if (catVal) params.set('category', catVal);
        if (statusVal) params.set('status', statusVal);
        if (fromVal) params.set('from', fromVal);
        if (toVal) params.set('to', toVal);

        const res = await fetch(`/api/complaints?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          setComplaintsList(json.complaints ?? []);
        }
      } finally {
        setComplaintsLoading(false);
      }
    },
    [
      areaFilter,
      catFilter,
      fromDate,
      getIdToken,
      searchQ,
      statusFilter,
      toDate,
    ]
  );

  const loadStaffUsers = useCallback(async () => {
    if (staffProfile?.role !== 'admin') return;
    const token = await getIdToken();
    if (!token) return;
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
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

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      await Promise.all([
        loadPortalData(),
        loadComplaints(),
        staffProfile?.role === 'admin' ? loadStaffUsers() : Promise.resolve(),
      ]);
      setNotice({ type: 'success', text: 'Dashboard data refreshed.' });
    } finally {
      setRefreshingAll(false);
    }
  };

  const selectComplaintForEdit = useCallback(
    async (row: AdminComplaintRow) => {
      setSelectedComplaint(row);
      setEditStatus(row.status);
      setEditDept(row.assignedDepartment || HDMC_DEPARTMENTS[0]);
      setEditNote(row.latestUpdate || '');
      setEditResolution(row.resolutionDetails || '');
      setSelectedTimeline([]);

      const token = await getIdToken();
      if (!token) return;
      setTimelineLoading(true);
      try {
        const res = await fetch(`/api/complaints/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          setSelectedTimeline(json.timeline ?? []);
        }
      } finally {
        setTimelineLoading(false);
      }
    },
    [getIdToken]
  );

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
      setSelectedTimeline(json.timeline ?? []);
      setEditStatus(json.complaint.status);
      setNotice({
        type: 'success',
        text: `Updated ${json.complaint.complaintCode} to "${json.complaint.status}".`,
      });
      await Promise.all([loadComplaints(), loadPortalData()]);
    } catch (err) {
      setNotice({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'Failed to update complaint.',
      });
    } finally {
      setUpdatingComplaint(false);
    }
  };

  const handleDeleteComplaint = async (id: number) => {
    const token = await getIdToken();
    if (!token) return;
    setNotice(null);
    const res = await fetch(`/api/complaints/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice({
        type: 'error',
        text: json.error || 'Failed to delete complaint record.',
      });
      return;
    }
    if (selectedComplaint?.id === id) {
      setSelectedComplaint(null);
      setSelectedTimeline([]);
    }
    setNotice({
      type: 'success',
      text: 'Complaint record deleted.',
    });
    await Promise.all([loadComplaints(), loadPortalData()]);
  };

  const handleResetFilters = () => {
    setSearchQ('');
    setAreaFilter('');
    setCatFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    loadComplaints({
      q: '',
      area: '',
      category: '',
      status: '',
      from: '',
      to: '',
    });
  };

  // Gallery Handlers
  const resetGalleryForm = () => {
    setEditingGalleryId(null);
    setGalTitleEn('');
    setGalTitleKn('');
    setGalArea(WARD_65_AREAS[0]);
    setGalCategory(DEVELOPMENT_CATEGORIES[0]);
    setGalStatus('Completed');
    setGalDate('');
    setGalDescEn('');
    setGalDescKn('');
    setGalBeforeUrl(null);
    setGalAfterUrl(null);
  };

  const handleStartEditGallery = (work: DevelopmentWorkData) => {
    setEditingGalleryId(work.id);
    setGalTitleEn(work.titleEn);
    setGalTitleKn(work.titleKn);
    setGalArea(work.area);
    setGalCategory(work.category);
    setGalStatus(work.status);
    setGalDate(work.completionDate || '');
    setGalDescEn(work.descriptionEn);
    setGalDescKn(work.descriptionKn);
    setGalBeforeUrl(work.beforePhotoUrl);
    setGalAfterUrl(work.afterPhotoUrl);
  };

  const handleSubmitGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getIdToken();
    if (!token) return;

    setSavingGallery(true);
    setNotice(null);
    try {
      const isEdit = editingGalleryId !== null;
      const res = await fetch('/api/admin/gallery', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingGalleryId,
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
      if (!res.ok) throw new Error(json.error || 'Failed to save project.');

      setDevelopmentWorks(json.developmentWorks ?? []);
      resetGalleryForm();
      setNotice({
        type: 'success',
        text: isEdit
          ? 'Development work updated and live statistics refreshed.'
          : 'Development work added to Gallery and live statistics updated.',
      });
      await loadPortalData();
    } catch (err) {
      setNotice({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'Failed to save gallery work.',
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
      if (editingGalleryId === id) {
        resetGalleryForm();
      }
      setNotice({ type: 'success', text: 'Development project removed.' });
      await loadPortalData();
    }
  };

  // Announcements Handlers
  const resetAnnouncementForm = () => {
    setEditingAnnouncementId(null);
    setAnnTitleEn('');
    setAnnTitleKn('');
    setAnnType(ANNOUNCEMENT_TYPES[0]);
    setAnnLocation('Ward No. 65, Hubballi');
    setAnnDate('');
    setAnnDescEn('');
    setAnnDescKn('');
    setAnnPhotoUrl(null);
  };

  const handleStartEditAnnouncement = (item: AnnouncementData) => {
    setEditingAnnouncementId(item.id);
    setAnnTitleEn(item.titleEn);
    setAnnTitleKn(item.titleKn);
    setAnnType(item.type);
    setAnnLocation(item.location);
    setAnnDate(item.eventDate);
    setAnnDescEn(item.descriptionEn);
    setAnnDescKn(item.descriptionKn);
    setAnnPhotoUrl(item.photoUrl);
  };

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getIdToken();
    if (!token) return;

    setSavingAnnouncement(true);
    setNotice(null);
    try {
      const isEdit = editingAnnouncementId !== null;
      const res = await fetch('/api/admin/announcements', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingAnnouncementId,
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
        throw new Error(json.error || 'Failed to save announcement.');
      }

      setAnnouncements(json.announcements ?? []);
      resetAnnouncementForm();
      setNotice({
        type: 'success',
        text: isEdit
          ? 'Announcement updated.'
          : 'Announcement published to Ward No. 65 Updates.',
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'Failed to save announcement.',
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
      if (editingAnnouncementId === id) {
        resetAnnouncementForm();
      }
      setNotice({ type: 'success', text: 'Announcement deleted.' });
    }
  };

  // Representatives Handler
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

  // Settings Handler
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

  // Staff Access Handlers
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

  const handleInviteUser = async (
    email: string,
    name: string,
    role: 'staff' | 'admin'
  ) => {
    const token = await getIdToken();
    if (!token) return;
    setNotice(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, name, role }),
    });
    const json = await res.json();
    if (res.ok) {
      setStaffUsers(json.users ?? []);
      setNotice({
        type: 'success',
        text: `Authorised ${email} as ${role === 'admin' ? 'Administrator' : 'Authorised Staff'}.`,
      });
    } else {
      setNotice({
        type: 'error',
        text: json.error || 'Failed to pre-authorise staff email.',
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const token = await getIdToken();
    if (!token) return;
    setNotice(null);
    const res = await fetch(`/api/admin/users?id=${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) {
      setStaffUsers(json.users ?? []);
      setNotice({ type: 'success', text: 'Staff record removed.' });
    } else {
      setNotice({
        type: 'error',
        text: json.error || 'Failed to remove staff record.',
      });
    }
  };

  const pendingStaffCount = useMemo(
    () => staffUsers.filter((u) => !u.isActive).length,
    [staffUsers]
  );

  if (!firebaseUser || !staffProfile || !staffProfile.isActive) {
    return null;
  }

  const isAdmin = staffProfile.role === 'admin';

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
    count?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: ClipboardList,
      count: complaintsList.length,
    },
    {
      id: 'gallery',
      label: 'Development Gallery',
      icon: Building2,
      count: developmentWorks.length,
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      count: announcements.length,
    },
    {
      id: 'representatives',
      label: 'Representatives',
      icon: UserCheck,
      adminOnly: true,
    },
    {
      id: 'settings',
      label: 'Banner & Contacts',
      icon: Settings,
      adminOnly: true,
    },
    {
      id: 'staff',
      label: 'Staff Access',
      icon: Users,
      adminOnly: true,
      count: pendingStaffCount > 0 ? pendingStaffCount : undefined,
    },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);
  const currentNavLabel =
    visibleNavItems.find((item) => item.id === activeSection)?.label ??
    'Overview';

  return (
    <div className="bg-slate-50/60 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Workspace Sidebar (Desktop) + Horizontal Bar (Mobile/Tablet) */}
          <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-3 space-y-4">
            <div className="px-2.5 pt-1.5 pb-3 border-b border-slate-100">
              <div className="text-xs font-semibold text-[#15803D]">
                {isAdmin ? 'Ward Administrator' : 'Authorised Staff'}
              </div>
              <div className="text-sm font-bold text-[#0B2545] truncate mt-0.5">
                {staffProfile.name || 'Ward 65 Officer'}
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate">
                {staffProfile.email}
              </div>
            </div>

            <nav
              aria-label="Admin workspace sections"
              className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0"
            >
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#0B2545] text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#0B2545]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {item.count !== undefined && (
                      <span
                        className={`font-mono text-xs tabular-nums ${
                          active ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden lg:block pt-3 border-t border-slate-100 space-y-1.5">
              <Link
                href="/"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#0B2545] hover:bg-slate-50 rounded-lg"
              >
                <span>View Public Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Workspace Viewport */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Contextual Console Top Bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span>Ward No. 65</span>
                  <span aria-hidden="true">/</span>
                  <span>Admin Console</span>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold text-[#0B2545]">
                    {currentNavLabel}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2545] mt-0.5">
                  {currentNavLabel}
                </h1>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleRefreshAll}
                  disabled={refreshingAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      refreshingAll ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {notice && (
              <div
                role="status"
                className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 ${
                  notice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span>{notice.text}</span>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Active Section Content */}
            {activeSection === 'overview' && (
              <AdminOverviewSection
                stats={stats}
                complaints={complaintsList}
                developmentWorks={developmentWorks}
                announcements={announcements}
                pendingStaffCount={pendingStaffCount}
                isAdmin={isAdmin}
                onNavigateSection={setActiveSection}
                onInspectComplaint={(row) => {
                  setActiveSection('complaints');
                  selectComplaintForEdit(row);
                }}
                onFilterComplaintsByStatus={(status) => {
                  setStatusFilter(status);
                  setActiveSection('complaints');
                  loadComplaints({ status });
                }}
              />
            )}

            {activeSection === 'complaints' && (
              <AdminComplaintsSection
                complaintsList={complaintsList}
                complaintsLoading={complaintsLoading}
                isAdmin={isAdmin}
                searchQ={searchQ}
                setSearchQ={setSearchQ}
                areaFilter={areaFilter}
                setAreaFilter={setAreaFilter}
                catFilter={catFilter}
                setCatFilter={setCatFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
                onApplyFilter={() => loadComplaints()}
                onResetFilters={handleResetFilters}
                selectedComplaint={selectedComplaint}
                selectedTimeline={selectedTimeline}
                timelineLoading={timelineLoading}
                onSelectComplaint={selectComplaintForEdit}
                editStatus={editStatus}
                setEditStatus={setEditStatus}
                editDept={editDept}
                setEditDept={setEditDept}
                editNote={editNote}
                setEditNote={setEditNote}
                editResolution={editResolution}
                setEditResolution={setEditResolution}
                updatingComplaint={updatingComplaint}
                onUpdateComplaint={handleUpdateComplaint}
                onDeleteComplaint={handleDeleteComplaint}
              />
            )}

            {activeSection === 'gallery' && (
              <AdminGallerySection
                developmentWorks={developmentWorks}
                savingGallery={savingGallery}
                editingId={editingGalleryId}
                galTitleEn={galTitleEn}
                setGalTitleEn={setGalTitleEn}
                galTitleKn={galTitleKn}
                setGalTitleKn={setGalTitleKn}
                galArea={galArea}
                setGalArea={setGalArea}
                galCategory={galCategory}
                setGalCategory={setGalCategory}
                galStatus={galStatus}
                setGalStatus={setGalStatus}
                galDate={galDate}
                setGalDate={setGalDate}
                galDescEn={galDescEn}
                setGalDescEn={setGalDescEn}
                galDescKn={galDescKn}
                setGalDescKn={setGalDescKn}
                galBeforeUrl={galBeforeUrl}
                setGalBeforeUrl={setGalBeforeUrl}
                galAfterUrl={galAfterUrl}
                setGalAfterUrl={setGalAfterUrl}
                onSubmitGallery={handleSubmitGallery}
                onStartEditGallery={handleStartEditGallery}
                onCancelEditGallery={resetGalleryForm}
                onDeleteGallery={handleDeleteGallery}
              />
            )}

            {activeSection === 'announcements' && (
              <AdminAnnouncementsSection
                announcements={announcements}
                savingAnnouncement={savingAnnouncement}
                editingId={editingAnnouncementId}
                annTitleEn={annTitleEn}
                setAnnTitleEn={setAnnTitleEn}
                annTitleKn={annTitleKn}
                setAnnTitleKn={setAnnTitleKn}
                annType={annType}
                setAnnType={setAnnType}
                annLocation={annLocation}
                setAnnLocation={setAnnLocation}
                annDate={annDate}
                setAnnDate={setAnnDate}
                annDescEn={annDescEn}
                setAnnDescEn={setAnnDescEn}
                annDescKn={annDescKn}
                setAnnDescKn={setAnnDescKn}
                annPhotoUrl={annPhotoUrl}
                setAnnPhotoUrl={setAnnPhotoUrl}
                onSubmitAnnouncement={handleSubmitAnnouncement}
                onStartEditAnnouncement={handleStartEditAnnouncement}
                onCancelEditAnnouncement={resetAnnouncementForm}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            )}

            {activeSection === 'representatives' && isAdmin && (
              <AdminRepresentativesSection
                representatives={representatives}
                setRepresentatives={setRepresentatives}
                onSaveRepresentative={handleSaveRepresentative}
              />
            )}

            {activeSection === 'settings' && isAdmin && (
              <AdminSettingsSection
                settings={settings}
                setSettings={setSettings}
                onSaveSettings={handleSaveSettings}
              />
            )}

            {activeSection === 'staff' && isAdmin && (
              <AdminStaffSection
                staffUsers={staffUsers}
                currentUserId={staffProfile.id}
                onToggleUser={handleToggleUser}
                onInviteUser={handleInviteUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
