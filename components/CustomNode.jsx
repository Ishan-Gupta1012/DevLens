"use client";
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Database,
  Server,
  Layers,
  Monitor,
  ShieldCheck,
  Zap,
  ExternalLink,
  Box,
  AlertTriangle,
} from "lucide-react";

function getNodeIcon(label = "") {
  const l = String(label).toLowerCase();
  if (l.includes("db") || l.includes("database") || l.includes("sql") || l.includes("postgres") || l.includes("mongo")) {
    return { icon: Database, typeLabel: "DATA STORE", color: "text-teal-400" };
  }
  if (l.includes("auth") || l.includes("jwt") || l.includes("security") || l.includes("login") || l.includes("token")) {
    return { icon: ShieldCheck, typeLabel: "AUTH", color: "text-teal-400" };
  }
  if (l.includes("cache") || l.includes("redis") || l.includes("memcache")) {
    return { icon: Zap, typeLabel: "CACHE", color: "text-amber-400" };
  }
  if (l.includes("queue") || l.includes("kafka") || l.includes("rabbit") || l.includes("sqs") || l.includes("event") || l.includes("pubsub")) {
    return { icon: Layers, typeLabel: "QUEUE", color: "text-orange-400" };
  }
  if (l.includes("client") || l.includes("web") || l.includes("browser") || l.includes("app") || l.includes("ui") || l.includes("frontend")) {
    return { icon: Monitor, typeLabel: "CLIENT", color: "text-teal-400" };
  }
  if (l.includes("external") || l.includes("payment") || l.includes("stripe") || l.includes("third-party") || l.includes("provider") || l.includes("webhook")) {
    return { icon: ExternalLink, typeLabel: "EXTERNAL", color: "text-orange-400" };
  }
  if (l.includes("api") || l.includes("gateway") || l.includes("service") || l.includes("server") || l.includes("microservice") || l.includes("lambda")) {
    return { icon: Server, typeLabel: "SERVICE", color: "text-teal-400" };
  }
  return { icon: Box, typeLabel: "COMPONENT", color: "text-teal-400" };
}

function CustomNode({ data, selected }) {
  const label = data?.label || "Node";
  const { icon: Icon, typeLabel, color } = getNodeIcon(label);
  const hasBottleneck = data?.hasBottleneck;

  return (
    <div
      className={`relative min-w-[190px] px-3.5 py-2.5 rounded-[12px] transition-all duration-200 select-none bg-surface/95 backdrop-blur-md border ${
        selected
          ? "border-teal shadow-[0_0_20px_rgba(20,184,166,0.35)] scale-[1.02]"
          : "border-white/10 hover:border-teal/60 hover:shadow-[0_0_12px_rgba(20,184,166,0.15)]"
      }`}
    >
      {/* ReactFlow Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-[#14b8a6] !border-2 !border-[#0d0d0f] -translate-x-[1px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-[#14b8a6] !border-2 !border-[#0d0d0f] translate-x-[1px]"
      />

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-white/5 flex items-center justify-center shrink-0">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono tracking-wider uppercase text-muted font-semibold flex items-center justify-between">
            <span>{typeLabel}</span>
            {hasBottleneck && (
              <span className="flex items-center gap-0.5 text-orange-400" title="Has identified bottleneck">
                <AlertTriangle className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-white truncate max-w-[130px]" title={label}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CustomNode);
