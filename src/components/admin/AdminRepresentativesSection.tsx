'use client';

import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { readFileAsDataUrl } from '../../lib/media-utils.ts';
import type { RepresentativeData } from '../HomePortalView.tsx';

interface AdminRepresentativesSectionProps {
  representatives: RepresentativeData[];
  setRepresentatives: React.Dispatch<
    React.SetStateAction<RepresentativeData[]>
  >;
  onSaveRepresentative: (rep: RepresentativeData) => Promise<void>;
}

export function AdminRepresentativesSection({
  representatives,
  setRepresentatives,
  onSaveRepresentative,
}: AdminRepresentativesSectionProps) {
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [editLang, setEditLang] = useState<'en' | 'kn'>('en');

  const handleSave = async (rep: RepresentativeData) => {
    setSavingSlot(rep.slotOrder);
    try {
      await onSaveRepresentative(rep);
    } finally {
      setSavingSlot(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-slate-600 max-w-2xl">
          Update supplied portraits, English & Kannada names, official
          designations, service summaries, and contact information for Ward No.
          65 Public Representatives.
        </p>

        <div
          role="group"
          aria-label="Profile editor language"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start"
        >
          <button
            type="button"
            onClick={() => setEditLang('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              editLang === 'en'
                ? 'bg-white text-[#0B2545] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English Fields
          </button>
          <button
            type="button"
            onClick={() => setEditLang('kn')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              editLang === 'kn'
                ? 'bg-white text-[#0B2545] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ಕನ್ನಡ Fields
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {representatives.map((rep, idx) => (
          <div
            key={rep.id}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#0B2545]">
                  Representative Card #{rep.slotOrder}
                </div>
                {rep.photoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, photoUrl: null } : item
                        )
                      )
                    }
                    className="text-[11px] font-semibold text-red-700 hover:underline"
                  >
                    Clear Photo
                  </button>
                )}
              </div>

              <div className="w-full py-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                {rep.photoUrl ? (
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 bg-white">
                    <img
                      src={rep.photoUrl}
                      alt={rep.nameEn}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover ${
                        rep.slotOrder === 1
                          ? 'object-[50%_20%]'
                          : rep.slotOrder === 2
                            ? 'object-[50%_24%]'
                            : 'object-[50%_18%]'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>

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

              {editLang === 'en' ? (
                <>
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
                            i === idx ? { ...item, introEn: e.target.value } : item
                          )
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Public Service & Development Work (English)
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
                </>
              ) : (
                <>
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
                      Official Designation (Kannada)
                    </label>
                    <input
                      type="text"
                      value={rep.designationKn}
                      onChange={(e) =>
                        setRepresentatives((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? { ...item, designationKn: e.target.value }
                              : item
                          )
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Introduction (Kannada)
                    </label>
                    <textarea
                      rows={2}
                      value={rep.introKn}
                      onChange={(e) =>
                        setRepresentatives((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, introKn: e.target.value } : item
                          )
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Public Service & Development Work (Kannada)
                    </label>
                    <textarea
                      rows={2}
                      value={rep.workKn}
                      onChange={(e) =>
                        setRepresentatives((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, workKn: e.target.value } : item
                          )
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9513613689"
                    value={rep.phone || ''}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, phone: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Optional email"
                    value={rep.email || ''}
                    onChange={(e) =>
                      setRepresentatives((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, email: e.target.value } : item
                        )
                      )
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Office Hours (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank if showing Call link only"
                  value={rep.officeHours || ''}
                  onChange={(e) =>
                    setRepresentatives((prev) =>
                      prev.map((item, i) =>
                        i === idx
                          ? { ...item, officeHours: e.target.value }
                          : item
                      )
                    )
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={savingSlot === rep.slotOrder}
              onClick={() => handleSave(rep)}
              className="w-full py-2.5 text-sm font-bold text-white bg-[#0B2545] hover:bg-[#133868] rounded-lg disabled:opacity-60"
            >
              {savingSlot === rep.slotOrder
                ? `Saving Profile #${rep.slotOrder}...`
                : `Save Profile #${rep.slotOrder}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
