"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Layers, CornerDownLeft } from "lucide-react";

export default function CommandPalette({ isOpen, onClose, nodes = [], onSelectNode }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredNodes = nodes.filter((n) => {
    const label = (n.data?.label || n.id).toLowerCase();
    const id = n.id.toLowerCase();
    const q = query.toLowerCase().trim();
    return label.includes(q) || id.includes(q);
  });

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredNodes.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredNodes.length) % Math.max(1, filteredNodes.length));
    } else if (e.key === "Enter" && filteredNodes[selectedIndex]) {
      e.preventDefault();
      onSelectNode(filteredNodes[selectedIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-teal" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search architecture nodes (type label or ID)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white/10 text-muted px-2 py-0.5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredNodes.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
              No matching nodes found in current architecture graph.
            </div>
          ) : (
            filteredNodes.map((node, idx) => {
              const isSelected = idx === selectedIndex;
              const label = node.data?.label || node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    onSelectNode(node);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected ? "bg-teal/15 text-white border border-teal/40" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers className={`w-4 h-4 ${isSelected ? "text-teal" : "text-muted"}`} />
                    <span className="font-medium truncate">{label}</span>
                    <span className="font-mono text-[11px] text-muted truncate">({node.id})</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-teal">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 bg-surface-raised flex items-center justify-between text-[11px] font-mono text-muted">
          <span>Navigate with ↑ ↓ and Enter to focus</span>
          <span>{filteredNodes.length} nodes</span>
        </div>
      </div>
    </div>
  );
}
