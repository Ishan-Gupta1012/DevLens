"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import {
  Download,
  RotateCcw,
  Maximize2,
  Search,
  SplitSquareVertical,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

import CustomNode from "./CustomNode";
import NodeInspector from "./NodeInspector";
import CommandPalette from "./CommandPalette";
import { layoutGraph, sanitizeGraph } from "../lib/graph";

const nodeTypes = {
  customNode: CustomNode,
};

function GraphInner({
  rawNodes = [],
  rawEdges = [],
  bottlenecks = [],
  originalImage = null,
  highlightedNodeId = null,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef(null);
  const { fitView, setCenter } = useReactFlow();

  // Prepare and layout graph whenever rawNodes/rawEdges change
  const applyLayout = useCallback(() => {
    const sanitized = sanitizeGraph(rawNodes, rawEdges);

    // Annotate nodes with bottleneck status
    const annotatedNodes = sanitized.nodes.map((n) => {
      const hasBottleneck = bottlenecks.some(
        (b) => b.nodeId && String(b.nodeId).toLowerCase() === String(n.id).toLowerCase()
      );
      return {
        ...n,
        data: {
          ...n.data,
          hasBottleneck,
        },
      };
    });

    const layouted = layoutGraph(annotatedNodes, sanitized.edges, "LR");
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [rawNodes, rawEdges, bottlenecks, fitView, setNodes, setEdges]);

  useEffect(() => {
    applyLayout();
  }, [applyLayout]);

  // Handle external highlightNodeId (e.g. clicked from Bottlenecks tab)
  useEffect(() => {
    if (highlightedNodeId) {
      const target = nodes.find(
        (n) => String(n.id).toLowerCase() === String(highlightedNodeId).toLowerCase()
      );
      if (target) {
        setSelectedNode(target);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === target.id,
          }))
        );
        // Center view on this node
        if (target.position) {
          setCenter(target.position.x + 100, target.position.y + 40, {
            zoom: 1.2,
            duration: 500,
          });
        }
      }
    }
  }, [highlightedNodeId, nodes, setCenter, setNodes]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus node from Command Palette
  const handleSelectFromPalette = useCallback(
    (node) => {
      setSelectedNode(node);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
      if (node.position) {
        setCenter(node.position.x + 100, node.position.y + 40, {
          zoom: 1.25,
          duration: 500,
        });
      }
    },
    [setCenter, setNodes]
  );

  // PNG Export
  const handleExportPng = useCallback(async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      // Temporarily hide controls during capture
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "#050505",
        quality: 0.95,
        filter: (node) => {
          // exclude controls and drawers from export
          if (
            node?.classList?.contains("react-flow__controls") ||
            node?.classList?.contains("react-flow__minimap") ||
            node?.classList?.contains("no-export")
          ) {
            return false;
          }
          return true;
        },
      });
      const link = document.createElement("a");
      link.download = `devlens-architecture-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-white/10 bg-[#070709]" ref={containerRef}>
      {/* Top action toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 p-1 bg-surface-raised/90 backdrop-blur-md border border-white/10 rounded-lg no-export">
        {/* Ctrl+K Search button */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors"
          title="Search nodes (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-teal" />
          <span className="hidden sm:inline font-mono">Find node</span>
          <kbd className="text-[10px] font-mono bg-white/10 px-1 rounded text-muted">⌘K</kbd>
        </button>

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Reset Layout */}
        <button
          onClick={applyLayout}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors"
          title="Reset auto-layout (Dagre LR)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset layout</span>
        </button>

        {/* Fit View */}
        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors"
          title="Fit entire graph to view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit view</span>
        </button>

        {/* Toggle Original Diagram */}
        {originalImage && (
          <button
            onClick={() => setShowOriginal((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
              showOriginal
                ? "bg-teal/20 text-teal border border-teal/40"
                : "text-muted hover:text-white hover:bg-white/5"
            }`}
            title="Toggle original diagram side-by-side"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Original diagram</span>
          </button>
        )}

        <div className="w-[1px] h-4 bg-white/10" />

        {/* Export PNG */}
        <button
          onClick={handleExportPng}
          disabled={isExporting}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted hover:text-white hover:bg-white/5 rounded-md transition-colors"
          title="Export graph as PNG image"
        >
          <Download className="w-3.5 h-3.5 text-teal" />
          <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export PNG"}</span>
        </button>
      </div>

      {/* Main Graph Canvas Area (split with original image if toggled) */}
      <div className="flex w-full h-full">
        <div className={`h-full transition-all duration-300 ${showOriginal ? "w-1/2 border-r border-white/10" : "w-full"}`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            minZoom={0.2}
            maxZoom={2.5}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
            }}
          >
            <Background color="#141416" gap={20} size={1} />
            <Controls showInteractive={false} position="bottom-left" />
            <MiniMap
              nodeColor={() => "#14b8a6"}
              nodeStrokeWidth={2}
              position="bottom-right"
              className="!bottom-3 !right-3"
            />
          </ReactFlow>
        </div>

        {/* Original Diagram Side Panel */}
        {showOriginal && originalImage && (
          <div className="w-1/2 h-full bg-surface-raised flex flex-col p-4 overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-mono font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal" />
                Original Diagram Source
              </span>
              <button
                onClick={() => setShowOriginal(false)}
                className="text-muted hover:text-white text-xs font-mono"
              >
                Close
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto rounded-lg bg-black/60 border border-white/5 p-2">
              <img
                src={originalImage.startsWith("data:") ? originalImage : `data:image/png;base64,${originalImage}`}
                alt="Original uploaded architecture diagram"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="no-export">
          <NodeInspector
            node={selectedNode}
            bottlenecks={bottlenecks}
            edges={edges}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}

      {/* Command Palette Modal */}
      <div className="no-export">
        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          nodes={nodes}
          onSelectNode={handleSelectFromPalette}
        />
      </div>
    </div>
  );
}

export default function ArchitectureGraph(props) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
