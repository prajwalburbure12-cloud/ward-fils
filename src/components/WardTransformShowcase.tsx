'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Lightbulb,
  Sparkles,
  Trees,
} from 'lucide-react';
import { useLanguage } from './LanguageProvider.tsx';

const WardTransform3DCanvas = dynamic(
  () =>
    import('./WardTransform3DCanvas.tsx').then(
      (mod) => mod.WardTransform3DCanvas
    ),
  { ssr: false }
);

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const STAGE_TARGETS = [0.22, 0.48, 0.72, 0.96] as const;

function getStageIndex(progress: number): number {
  if (progress < 0.34) return 0;
  if (progress < 0.58) return 1;
  if (progress < 0.8) return 2;
  return 3;
}

export function WardTransformShowcase() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<number>(0.12);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const manualOverrideRef = useRef<boolean>(false);

  const [activeStage, setActiveStage] = useState<number>(0);
  const [progressPct, setProgressPct] = useState<number>(12);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 90%', 'end 20%'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    manualOverrideRef.current = false;
    const clamped = Math.max(0, Math.min(1, latest));
    progressRef.current = clamped;
    const pct = Math.round(clamped * 100);
    setProgressPct(pct);
    setActiveStage(getStageIndex(clamped));
  });

  const handleSelectStage = (idx: number) => {
    manualOverrideRef.current = true;
    const target = STAGE_TARGETS[idx] ?? 0.5;
    progressRef.current = target;
    setActiveStage(idx);
    setProgressPct(Math.round(target * 100));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  };

  const handlePointerLeave = () => {
    pointerRef.current.x = 0;
    pointerRef.current.y = 0;
  };

  const stageIcons = [
    <Sparkles key="clean" className="w-3.5 h-3.5 shrink-0" />,
    <Droplets key="road" className="w-3.5 h-3.5 shrink-0" />,
    <Lightbulb key="infra" className="w-3.5 h-3.5 shrink-0" />,
    <Trees key="green" className="w-3.5 h-3.5 shrink-0" />,
  ];

  const currentStageCopy = t.transform.stages[activeStage] ?? t.transform.stages[0];

  return (
    <motion.section
      ref={sectionRef}
      aria-label={t.transform.heading}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#15803D] inline-flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.transform.eyebrow}</span>
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2545] mt-1">
            {t.transform.heading}
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            {t.transform.subheading}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0 self-start md:self-auto">
          <span>{t.transform.scrollHint}</span>
          <span className="font-mono font-bold text-[#0B2545] tabular-nums">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* 3D Transformation Viewport */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-[380px] sm:h-[440px] lg:h-[490px] rounded-2xl overflow-hidden border border-[#163864] bg-[#071a33] shadow-sm"
      >
        {/* Isolated 3D WebGL Canvas Mount */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WardTransform3DCanvas
            progressRef={progressRef}
            pointerRef={pointerRef}
            reduceMotion={reduceMotion}
          />
        </div>

        {/* Minimal Top-Left Stage Caption (Static, Solid RGBA, Zero backdrop-blur) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 sm:right-auto sm:max-w-md z-10 pointer-events-none">
          <div className="bg-[#081b34]/92 border border-white/15 rounded-xl px-3.5 py-2.5 text-white shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                {stageIcons[activeStage]}
                <span>{currentStageCopy.label}</span>
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-300 tabular-nums">
                {progressPct}%
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-snug">
              {currentStageCopy.desc}
            </p>
          </div>
        </div>

        {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 w-[min(900px,calc(100%-1.5rem))] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-slate-200 bg-[#081b34]/95 hover:bg-[#0f294d] border border-white/15 border-b-0 rounded-t-lg transition-colors cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Stages</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>

          {!dockCollapsed && (
            <div className="w-full bg-[#081b34]/95 border border-white/15 rounded-xl p-2 shadow-md space-y-2">
              {/* Thin Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 transition-all duration-150"
                  style={{ width: `${Math.max(4, progressPct)}%` }}
                />
              </div>

              {/* 4 Stage Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {t.transform.stages.map((stage, idx) => {
                  const isActive = activeStage === idx;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleSelectStage(idx)}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#15803D] text-white border border-emerald-400/50'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {stageIcons[idx]}
                      <span className="truncate">{stage.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
