"use client";
import React, { useRef, useState, useEffect } from "react";
import { GitFork, FileText, AlertTriangle } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import ArchitectureGraph from "./ArchitectureGraph";
import ReadmeView from "./ReadmeView";
import BottleneckCards from "./BottleneckCards";
import { LoadingStages, ErrorBanner, EmptyStateIllustration } from "./LoadingStages";

export default function OutputPane({
  result,
  tab,
  setTab,
  loading,
  loadingStage,
  error,
  onRetry,
  onTrySample,
  originalImage,
  highlightedNodeId,
  setHighlightedNodeId,
}) {
  const containerRef = useRef(null);
  const tabContentRef = useRef(null);
  const prevTabRef = useRef(tab);

  // Staggered fade-in on new result success
  useGSAP(
    () => {
      // Check reduced motion
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      if (result && !loading && containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
        );
      }
    },
    { dependencies: [result, loading], scope: containerRef }
  );

  // Tab switch animation
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      if (tabContentRef.current && prevTabRef.current !== tab) {
        gsap.fromTo(
          tabContentRef.current,
          { opacity: 0.2, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
        prevTabRef.current = tab;
      }
    },
    { dependencies: [tab], scope: tabContentRef }
  );

  const bottlenecks = result?.bottlenecks || [];
  const bottleneckCount = bottlenecks.length;

  const handleSelectNodeFromBottleneck = (nodeId) => {
    setHighlightedNodeId(nodeId);
    setTab("visual");
  };

  const tabs = [
    { id: "visual", label: "Visual Architecture", icon: GitFork },
    { id: "readme", label: "Generated README", icon: FileText },
    {
      id: "bottlenecks",
      label: "Bottlenecks",
      icon: AlertTriangle,
      badge: bottleneckCount,
    },
  ];

  return (
    <div className="relative flex flex-col h-full space-y-4" ref={containerRef}>
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Header and Tab Navigation */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Output Workspace</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Synthesized system architecture, documentation & bottlenecks
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-raised border border-white/10 overflow-x-auto max-w-full shrink-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? "bg-teal text-black font-semibold shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-muted"}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? t.badge > 0
                          ? "bg-black text-orange-400"
                          : "bg-black text-teal-300"
                        : t.badge > 0
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-white/10 text-muted"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="relative z-10 flex-1 overflow-auto" ref={tabContentRef}>
        {loading ? (
          <LoadingStages stageIndex={loadingStage} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={onRetry} />
        ) : !result ? (
          <EmptyStateIllustration onTrySample={onTrySample} />
        ) : (
          <>
            {tab === "visual" && (
              <ArchitectureGraph
                rawNodes={result?.nodes || []}
                rawEdges={result?.edges || []}
                bottlenecks={bottlenecks}
                originalImage={originalImage}
                highlightedNodeId={highlightedNodeId}
              />
            )}

            {tab === "readme" && <ReadmeView markdown={result?.readme || ""} />}

            {tab === "bottlenecks" && (
              <BottleneckCards
                bottlenecks={bottlenecks}
                onSelectNodeId={handleSelectNodeFromBottleneck}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
