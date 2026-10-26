import dagre from "dagre";

/**
 * Sanitizes graph nodes and edges:
 * - Deduplicate node IDs
 * - Default missing node labels
 * - Drop edges with missing source or target
 * - Deduplicate edge IDs and normalize edge structures
 */
export function sanitizeGraph(rawNodes = [], rawEdges = []) {
  if (!Array.isArray(rawNodes)) rawNodes = [];
  if (!Array.isArray(rawEdges)) rawEdges = [];

  const seenNodeIds = new Set();
  const validNodes = [];

  for (const node of rawNodes) {
    if (!node || !node.id) continue;
    const id = String(node.id).trim();
    if (!id || seenNodeIds.has(id)) continue;
    seenNodeIds.add(id);

    const label =
      node.data?.label ||
      node.label ||
      node.name ||
      `Node ${id}`;

    validNodes.push({
      ...node,
      id,
      type: "customNode",
      data: {
        ...(node.data || {}),
        label,
        type: node.type || node.data?.type || "service",
      },
      position: node.position || { x: 0, y: 0 },
    });
  }

  const seenEdgeIds = new Set();
  const validEdges = [];

  for (let i = 0; i < rawEdges.length; i++) {
    const edge = rawEdges[i];
    if (!edge) continue;

    const source = String(edge.source || "").trim();
    const target = String(edge.target || "").trim();

    // Drop edge if source or target node is missing
    if (!source || !target || !seenNodeIds.has(source) || !seenNodeIds.has(target)) {
      continue;
    }

    const edgeId = edge.id ? String(edge.id).trim() : `e-${source}-${target}-${i}`;
    if (seenEdgeIds.has(edgeId)) continue;
    seenEdgeIds.add(edgeId);

    const label = edge.label || edge.data?.label || "";

    validEdges.push({
      ...edge,
      id: edgeId,
      source,
      target,
      type: "smoothstep",
      animated: true,
      label,
      style: { strokeWidth: 1.5 },
      labelStyle: {
        fill: "#9a9aa0",
        fontFamily: "var(--font-mono), monospace",
        fontSize: 11,
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: "#0d0d0f",
        fillOpacity: 0.9,
        rx: 4,
        ry: 4,
      },
      labelBgPadding: [6, 4],
    });
  }

  return { nodes: validNodes, edges: validEdges };
}

/**
 * Automatically calculates graph layout using Dagre (left-to-right direction).
 * Ignores model x/y positions to provide a clean, predictable diagram.
 */
export function layoutGraph(nodes = [], edges = [], direction = "LR") {
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 85;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    align: "UL",
    nodesep: 45,
    ranksep: 70,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === "LR" ? "left" : "top",
      sourcePosition: direction === "LR" ? "right" : "bottom",
      position: {
        // Dagre centers nodes; react-flow expects top-left anchor
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Normalizes bottlenecks array:
 * Supports string[] (current) or { title, severity, nodeId?, fix? }[] (future).
 * Strings become { id, title, severity: "medium" }.
 */
export function normalizeBottlenecks(bottlenecks = []) {
  if (!Array.isArray(bottlenecks)) return [];

  return bottlenecks.map((item, index) => {
    if (typeof item === "string") {
      // Guess severity or default to medium
      const lower = item.toLowerCase();
      let severity = "medium";
      if (lower.includes("critical") || lower.includes("vulnerability") || lower.includes("security risk") || lower.includes("data loss")) {
        severity = "high";
      } else if (lower.includes("optimization") || lower.includes("minor") || lower.includes("suggestion")) {
        severity = "low";
      }

      return {
        id: `bn-${index}`,
        title: item,
        severity,
        nodeId: null,
        fix: null,
      };
    }

    if (item && typeof item === "object") {
      const validSeverities = ["high", "medium", "low"];
      const severity = validSeverities.includes(item.severity?.toLowerCase())
        ? item.severity.toLowerCase()
        : "medium";

      return {
        id: item.id || `bn-${index}`,
        title: item.title || item.name || "Identified Bottleneck",
        severity,
        nodeId: item.nodeId ? String(item.nodeId) : null,
        fix: item.fix || item.recommendation || null,
        description: item.description || null,
      };
    }

    return {
      id: `bn-${index}`,
      title: String(item),
      severity: "medium",
      nodeId: null,
      fix: null,
    };
  });
}

/**
 * Compresses an image client-side to maximum maxDimension (default 1600px).
 * Returns a Promise that resolves to a base64 string without data: URL prefix.
 */
export function compressImage(file, maxDimension = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/png", 0.88);
        const base64 = dataUrl.split(",")[1];
        resolve({
          base64,
          dataUrl,
          width,
          height,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
