"use client";
import React from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export default function BottleneckCards({ bottlenecks = [], onSelectNodeId }) {
  if (!bottlenecks || bottlenecks.length === 0) {
    return (
      <div className="p-12 text-center border border-white/5 rounded-xl bg-surface/50">
        <div className="w-12 h-12 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-teal" />
        </div>
        <h4 className="text-sm font-semibold text-white mb-1">No Bottlenecks Detected</h4>
        <p className="text-xs text-muted max-w-sm mx-auto">
          The analyzed architecture and code snippet show no immediate high-risk structural or concurrency concerns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono text-muted">
        <span>Identified System Risks & Vulnerabilities</span>
        <span>{bottlenecks.length} {bottlenecks.length === 1 ? "Issue" : "Issues"}</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {bottlenecks.map((item) => {
          const severity = (item.severity || "medium").toLowerCase();
          const isHigh = severity === "high";
          const isLow = severity === "low";

          const cardStyles = isHigh
            ? "border-orange-500/40 bg-orange-950/20 hover:border-orange-500/70"
            : isLow
            ? "border-teal-500/40 bg-teal-950/15 hover:border-teal-500/70"
            : "border-amber-500/40 bg-amber-950/20 hover:border-amber-500/70";

          const badgeStyles = isHigh
            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
            : isLow
            ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
            : "bg-amber-500/20 text-amber-400 border-amber-500/30";

          const IconComponent = isHigh ? AlertOctagon : isLow ? Info : AlertTriangle;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.nodeId && onSelectNodeId) {
                  onSelectNodeId(item.nodeId);
                }
              }}
              className={`p-4 rounded-xl border transition-all duration-200 ${cardStyles} ${
                item.nodeId ? "cursor-pointer hover:scale-[1.005] group" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      isHigh
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                        : isLow
                        ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${badgeStyles}`}
                    >
                      {severity} Priority
                    </span>
                  </div>
                </div>

                {item.nodeId && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted group-hover:text-teal transition-colors">
                    <span>Node: {item.nodeId}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>

              {/* Title / Description */}
              <h4 className="text-sm font-semibold text-white/95 mb-1.5 leading-snug">
                {item.title}
              </h4>

              {item.description && (
                <p className="text-xs text-muted mb-2 leading-relaxed">{item.description}</p>
              )}

              {/* Fix recommendation */}
              {item.fix && (
                <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-white/80">
                  <div className="flex items-center gap-1.5 text-teal font-mono font-semibold text-[11px] mb-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Recommended Mitigation:</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-muted">{item.fix}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
