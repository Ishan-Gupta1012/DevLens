"use client";
import React, { useState, useEffect } from "react";
import {
  FileImage,
  Code2,
  GitFork,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle,
} from "lucide-react";

export function LoadingStages({ stageIndex = 0 }) {
  const stages = [
    { title: "Reading diagram", desc: "Extracting topology and service entities", icon: FileImage },
    { title: "Parsing code", desc: "Analyzing protocols, endpoints, and logic", icon: Code2 },
    { title: "Building graph", desc: "Synthesizing nodes, links, and bottlenecks", icon: GitFork },
  ];

  return (
    <div className="w-full py-10 px-6 rounded-xl bg-surface/80 border border-white/10 space-y-6 animate-in fade-in duration-300">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-mono font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>DevLens Engine Active</span>
        </div>
        <h3 className="text-base font-semibold text-white">Analyzing Architecture & Code</h3>
        <p className="text-xs text-muted mt-1">Generating nodes, README specification, and bottlenecks...</p>
      </div>

      {/* Progress Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stages.map((stage, idx) => {
          const isDone = idx < stageIndex;
          const isCurrent = idx === stageIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.title}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? "bg-surface-raised border-teal shadow-[0_0_15px_rgba(20,184,166,0.15)] scale-[1.02]"
                  : isDone
                  ? "bg-surface/50 border-white/10 opacity-75"
                  : "bg-surface/30 border-white/5 opacity-40"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    isCurrent
                      ? "bg-teal/20 border-teal text-teal"
                      : isDone
                      ? "bg-teal/10 border-teal/30 text-teal"
                      : "bg-white/5 border-white/10 text-muted"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-teal" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? "animate-pulse" : ""}`} />
                  )}
                </div>
                <div className="text-xs font-semibold text-white">{stage.title}</div>
              </div>
              <p className="text-[11px] text-muted leading-tight">{stage.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Skeletons */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="h-4 bg-white/5 rounded-md w-3/4 animate-pulse" />
        <div className="h-32 bg-white/5 rounded-xl w-full animate-pulse flex items-center justify-center">
          <div className="text-muted/40 font-mono text-xs flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Synthesizing visual graph layout...</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message = "An error occurred during analysis.", onRetry }) {
  return (
    <div className="p-5 rounded-xl border border-orange-500/40 bg-orange-950/20 text-white space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-orange-400">Analysis Failed</h4>
          <p className="text-xs text-white/80 mt-1 leading-relaxed break-words">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-black bg-orange hover:bg-orange-600 rounded-lg transition-colors font-mono font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function EmptyStateIllustration({ onTrySample }) {
  return (
    <div className="p-10 text-center rounded-xl border border-dashed border-white/10 bg-surface/40 space-y-4">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-surface-raised border border-white/10 shadow-xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-teal/20 to-orange/10 blur-sm" />
        <Layers className="w-8 h-8 text-teal relative z-10" />
      </div>

      <div className="max-w-sm mx-auto">
        <h3 className="text-sm font-semibold text-white mb-1">Architecture Workspace Ready</h3>
        <p className="text-xs text-muted leading-relaxed">
          Upload an architecture diagram and input code snippet on the left, or try the bundled sample to generate an interactive graph, README, and bottleneck evaluation.
        </p>
      </div>

      {onTrySample && (
        <button
          onClick={onTrySample}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example Architecture</span>
        </button>
      )}
    </div>
  );
}
