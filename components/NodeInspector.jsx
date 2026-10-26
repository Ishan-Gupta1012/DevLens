"use client";
import React from "react";
import { X, AlertTriangle, ArrowRight, ShieldAlert, Cpu } from "lucide-react";

export default function NodeInspector({ node, bottlenecks = [], edges = [], onClose }) {
  if (!node) return null;

  const nodeLabel = node.data?.label || node.id;
  const nodeId = node.id;

  // Filter bottlenecks associated with this node
  const linkedBottlenecks = bottlenecks.filter(
    (b) => b.nodeId && String(b.nodeId).toLowerCase() === String(nodeId).toLowerCase()
  );

  // Incoming and outgoing connections
  const incoming = edges.filter((e) => String(e.target) === String(nodeId));
  const outgoing = edges.filter((e) => String(e.source) === String(nodeId));

  return (
    <div className="absolute top-3 right-3 bottom-3 w-80 max-w-[calc(100%-24px)] bg-surface-raised/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_8px_#14b8a6]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">Node Inspector</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-5 text-xs">
        {/* Node Overview */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Node Name</span>
          <div className="text-sm font-bold text-white mt-0.5">{nodeLabel}</div>
          <div className="font-mono text-[11px] text-teal-400 mt-1">ID: {nodeId}</div>
        </div>

        {/* Connections */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Graph Topology</span>

          {/* Incoming */}
          <div>
            <div className="text-[11px] font-mono text-muted mb-1 flex items-center gap-1">
              <span>Incoming Sources ({incoming.length})</span>
            </div>
            {incoming.length === 0 ? (
              <span className="text-muted/60 italic text-[11px]">No upstream nodes</span>
            ) : (
              <div className="space-y-1">
                {incoming.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-2 rounded bg-surface border border-white/5 font-mono text-[11px] flex items-center justify-between"
                  >
                    <span className="text-white/80">{edge.source}</span>
                    <span className="text-[10px] text-teal-400 bg-teal/10 px-1.5 py-0.5 rounded">
                      {edge.label || "link"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div>
            <div className="text-[11px] font-mono text-muted mb-1 flex items-center gap-1">
              <span>Outgoing Targets ({outgoing.length})</span>
            </div>
            {outgoing.length === 0 ? (
              <span className="text-muted/60 italic text-[11px]">No downstream nodes</span>
            ) : (
              <div className="space-y-1">
                {outgoing.map((edge) => (
                  <div
                    key={edge.id}
                    className="p-2 rounded bg-surface border border-white/5 font-mono text-[11px] flex items-center justify-between"
                  >
                    <span className="text-white/80">{edge.target}</span>
                    <span className="text-[10px] text-teal-400 bg-teal/10 px-1.5 py-0.5 rounded">
                      {edge.label || "link"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottlenecks linked to this node */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Node Risks</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                linkedBottlenecks.length > 0
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-white/5 text-muted"
              }`}
            >
              {linkedBottlenecks.length} {linkedBottlenecks.length === 1 ? "Issue" : "Issues"}
            </span>
          </div>

          {linkedBottlenecks.length === 0 ? (
            <div className="p-3 rounded-lg bg-surface border border-white/5 text-muted text-center">
              No identified risks or bottlenecks for this component.
            </div>
          ) : (
            <div className="space-y-2">
              {linkedBottlenecks.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-lg border ${
                    b.severity === "high"
                      ? "bg-orange-950/20 border-orange-500/40"
                      : b.severity === "low"
                      ? "bg-teal-950/20 border-teal-500/30"
                      : "bg-amber-950/20 border-amber-500/30"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle
                      className={`w-3.5 h-3.5 ${
                        b.severity === "high"
                          ? "text-orange-400"
                          : b.severity === "low"
                          ? "text-teal-400"
                          : "text-amber-400"
                      }`}
                    />
                    <span
                      className={`text-[10px] uppercase font-mono font-bold ${
                        b.severity === "high"
                          ? "text-orange-400"
                          : b.severity === "low"
                          ? "text-teal-400"
                          : "text-amber-400"
                      }`}
                    >
                      {b.severity} Risk
                    </span>
                  </div>
                  <div className="text-white font-medium text-xs leading-snug">{b.title}</div>
                  {b.fix && (
                    <div className="mt-2 text-[11px] text-muted bg-black/40 p-2 rounded border border-white/5">
                      <span className="text-teal-400 font-mono font-semibold">Recommended Fix: </span>
                      {b.fix}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
