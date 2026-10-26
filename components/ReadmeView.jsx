"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download, FileText } from "lucide-react";

export default function ReadmeView({ markdown = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!markdown) {
    return (
      <div className="p-12 text-center text-muted border border-white/5 rounded-xl bg-surface/50">
        <FileText className="w-8 h-8 text-muted/40 mx-auto mb-2" />
        <p className="text-sm">No README content generated yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <FileText className="w-4 h-4 text-teal" />
          <span>Generated README.md</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-surface-raised hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal" />
                <span className="text-teal font-mono">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-surface-raised hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal" />
            <span>Download README.md</span>
          </button>
        </div>
      </div>

      {/* Markdown Content Area */}
      <div className="p-6 rounded-xl bg-surface/90 border border-white/10 overflow-x-auto">
        <div className="prose prose-invert prose-teal max-w-none prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-white/80 prose-p:text-sm prose-li:text-white/80 prose-li:text-sm prose-code:font-mono prose-code:text-teal-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#070709] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <pre
                  className="bg-[#070709] border border-white/10 rounded-xl p-4 overflow-x-auto font-mono text-xs my-4"
                  {...props}
                />
              ),
              code: ({ node, inline, className, children, ...props }) => {
                if (inline) {
                  return (
                    <code
                      className="text-teal-400 bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="text-white/90 font-mono text-xs" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
