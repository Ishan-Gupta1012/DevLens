"use client";
import React, { useState, useCallback, useMemo } from "react";
import {
  UploadCloud,
  FileCode,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  Loader2,
  FileText,
} from "lucide-react";
import { compressImage } from "../lib/graph";

export default function InputPane({
  image,
  setImage,
  imagePreview,
  setImagePreview,
  code,
  setCode,
  loading,
  onAnalyze,
  onLoadSample,
}) {
  const [isDragging, setIsDragging] = useState(false);

  // Line count computation
  const lineCount = useMemo(() => {
    if (!code) return 0;
    return code.split("\n").length;
  }, [code]);

  // Handle file processing with client compression
  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      try {
        const compressed = await compressImage(file, 1600);
        setImage(compressed.base64);
        setImagePreview(compressed.dataUrl);
      } catch (err) {
        console.error("Failed to compress image:", err);
        // Fallback to raw FileReader
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          setImage(result.split(",")[1]);
          setImagePreview(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [setImage, setImagePreview]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClearImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
  }, [setImage, setImagePreview]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Title / Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Input Workspace</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Provide system architecture diagram and source logic
          </p>
        </div>

        <button
          onClick={onLoadSample}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 rounded-lg transition-colors disabled:opacity-50"
          title="Load bundled sample architecture and code"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Try a sample</span>
        </button>
      </div>

      {/* Image Upload Drag-and-Drop Area */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-muted">
          <span>1. Architecture Diagram</span>
          {imagePreview && (
            <span className="text-[11px] text-teal-400">Compressed & ready</span>
          )}
        </div>

        {imagePreview ? (
          <div className="relative rounded-xl border border-white/10 bg-surface-raised p-3 flex items-center gap-3 group">
            <div className="w-20 h-20 rounded-lg bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={imagePreview}
                alt="Architecture diagram preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <ImageIcon className="w-4 h-4 text-teal" />
                <span className="truncate">Architecture Diagram Loaded</span>
              </div>
              <p className="text-[11px] text-muted mt-1">
                Max 1600px client compressed image
              </p>
            </div>
            <button
              onClick={handleClearImage}
              className="p-2 rounded-lg text-muted hover:text-orange-400 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-colors"
              title="Remove diagram"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? "border-teal bg-teal/5 scale-[1.01]"
                : "border-white/15 bg-surface/60 hover:border-teal/50 hover:bg-surface-raised"
            }`}
            onClick={() => document.getElementById("diagram-upload-input")?.click()}
          >
            <input
              id="diagram-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center mx-auto mb-2 text-teal">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-white">
              Drag & drop architecture diagram
            </div>
            <p className="text-[11px] text-muted mt-1">
              PNG, JPG, SVG, WebP (auto-scaled to max 1600px)
            </p>
          </div>
        )}
      </div>

      {/* Code Textarea Area */}
      <div className="space-y-1.5 flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between text-xs font-mono text-muted">
          <span className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-teal" />
            <span>2. Core Source Code</span>
          </span>
          <span className="text-[11px] text-muted">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>

        <div className="flex-1 flex flex-col rounded-xl border border-white/10 bg-[#070709] overflow-hidden focus-within:border-teal/60 transition-colors">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste system code, API handlers, schema definitions, or infrastructure logic..."
            className="flex-1 w-full p-3.5 bg-transparent font-mono text-xs text-white/90 placeholder-muted/60 resize-none focus:outline-none"
            spellCheck={false}
          />
          <div className="px-3.5 py-1.5 bg-surface-raised border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-muted">
            <span>UTF-8 Monospace</span>
            <span>{code.length} characters</span>
          </div>
        </div>
      </div>

      {/* Analyze CTA button */}
      <div className="pt-2">
        <button
          onClick={onAnalyze}
          disabled={loading || (!image && !code.trim())}
          className="w-full py-3 px-6 rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-black bg-orange hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Analyzing Architecture...</span>
            </>
          ) : (
            <>
              <span>Analyze Architecture</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
