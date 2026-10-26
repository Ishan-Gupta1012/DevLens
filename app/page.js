"use client";
import React, { useState, useCallback, useRef } from "react";
import InputPane from "../components/InputPane";
import OutputPane from "../components/OutputPane";
import { normalizeBottlenecks } from "../lib/graph";
import { Layers, Terminal, Sparkles } from "lucide-react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("visual");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);

  // Load bundled sample files
  const loadSample = useCallback(async () => {
    try {
      setError(null);
      // Fetch sample code
      const codeRes = await fetch("/sample/code.txt");
      if (codeRes.ok) {
        const codeText = await codeRes.text();
        setCode(codeText);
      }

      // Fetch sample image
      const imgRes = await fetch("/sample/diagram.png");
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          setImagePreview(dataUrl);
          setImage(dataUrl.split(",")[1]);
        };
        reader.readAsDataURL(blob);
      }

      // Pre-load sample parsed data so user has immediate preview capability
      const dataRes = await fetch("/sample/sampleData.json");
      if (dataRes.ok) {
        const sampleData = await dataRes.json();
        const normalized = {
          ...sampleData,
          bottlenecks: normalizeBottlenecks(sampleData.bottlenecks),
        };
        setResult(normalized);
        setTab("visual");
      }
    } catch (err) {
      console.error("Failed to load sample data:", err);
    }
  }, []);

  // Main analyze flow
  const analyze = async () => {
    if (!image && !code.trim()) return;

    setLoading(true);
    setError(null);
    setLoadingStage(0);

    // Staged loading simulator interval
    const stageTimer1 = setTimeout(() => setLoadingStage(1), 700);
    const stageTimer2 = setTimeout(() => setLoadingStage(2), 1500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, code }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const rawData = await res.json();

      // Normalize bottlenecks (support both string[] and object[])
      const normalized = {
        ...rawData,
        bottlenecks: normalizeBottlenecks(rawData.bottlenecks),
      };

      setResult(normalized);
      setTab("visual");
    } catch (err) {
      console.error("Analysis error:", err);
      // If no API key configured and user has sample loaded, inform gracefully with retry option
      setError(
        err.message?.includes("No API keys configured")
          ? "No Gemini API keys are configured in .env.local. You can inspect the pre-bundled sample dataset or configure GEMINI_API_KEY."
          : err.message || "Failed to analyze architecture diagram and code snippet."
      );
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-white selection:bg-teal/30 selection:text-white">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-white/10 flex items-center justify-center text-teal shadow-[0_0_12px_rgba(20,184,166,0.25)]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">DevLens</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-teal/10 text-teal border border-teal/20 font-semibold">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-muted hidden sm:inline">
              Architecture Diagram & Code Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-muted">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal shadow-[0_0_8px_#14b8a6]" />
            <span>Interactive Graph Engine</span>
          </div>
        </div>
      </header>

      {/* Main Workspace: Split Screen on desktop, vertical stack on mobile */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 lg:p-6 gap-6">
        {/* Left: Input Workspace */}
        <section className="w-full lg:w-[42%] xl:w-[38%] rounded-xl bg-surface border border-white/10 p-5 flex flex-col overflow-y-auto min-h-[500px]">
          <InputPane
            image={image}
            setImage={setImage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            code={code}
            setCode={setCode}
            loading={loading}
            onAnalyze={analyze}
            onLoadSample={loadSample}
          />
        </section>

        {/* Right: Output Workspace */}
        <section className="w-full lg:w-[58%] xl:w-[62%] rounded-xl bg-surface border border-white/10 p-5 flex flex-col overflow-hidden min-h-[640px]">
          <OutputPane
            result={result}
            tab={tab}
            setTab={setTab}
            loading={loading}
            loadingStage={loadingStage}
            error={error}
            onRetry={analyze}
            onTrySample={loadSample}
            originalImage={imagePreview || image}
            highlightedNodeId={highlightedNodeId}
            setHighlightedNodeId={setHighlightedNodeId}
          />
        </section>
      </main>
    </div>
  );
}
