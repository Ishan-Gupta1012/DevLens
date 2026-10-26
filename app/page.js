"use client";
import { useState, useRef, useCallback } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import ReactMarkdown from "react-markdown";
import { AlertTriangle } from "lucide-react";
import { gsap } from "gsap";

export default function Home() {
  const [image, setImage] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("visual");
  const [loading, setLoading] = useState(false);
  const outRef = useRef(null);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    }
  }, []);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, code }),
      });
      const data = await res.json();
      setResult(data);
      setTab("visual");
      setTimeout(() => {
        if (outRef.current) gsap.fromTo(outRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  const nodes = result?.nodes || [];
  const edges = result?.edges || [];

  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-6 border-r border-gray-800 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Input Workspace</h1>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-teal-500 rounded-lg p-8 text-center mb-4"
        >
          {image ? "Image loaded" : "Drag & drop architecture diagram"}
          <div className="mt-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setImage(reader.result.split(",")[1]);
                  reader.readAsDataURL(file);
                }
              }}
              className="text-sm"
            />
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 bg-gray-900 border border-gray-700 rounded p-3"
          placeholder="Paste code snippet..."
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2 rounded"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      <div className="w-1/2 p-6 overflow-auto" ref={outRef}>
        <div className="flex gap-2 mb-4">
          {["visual", "readme", "bottlenecks"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded ${tab === t ? "bg-teal-500 text-black" : "bg-gray-800"}`}
            >
              {t === "visual" ? "Visual Architecture" : t === "readme" ? "Generated README" : "Bottlenecks"}
            </button>
          ))}
        </div>
        {tab === "visual" && (
          <div style={{ height: 500 }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        )}
        {tab === "readme" && (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{result?.readme || ""}</ReactMarkdown>
          </div>
        )}
        {tab === "bottlenecks" && (
          <div className="space-y-3">
            {(result?.bottlenecks || []).map((b, i) => (
              <div key={i} className="bg-red-900/30 border border-red-500 rounded p-4 flex gap-3">
                <AlertTriangle className="text-orange-400" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
