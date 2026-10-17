import React, { useState, useEffect } from 'react';
import { Network, Info, RefreshCw, ZoomIn, ZoomOut, Database } from 'lucide-react';
import { api } from '../api/client';

export default function GraphView({ onSelectPaper }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getGraphData();
      setGraphData(data);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Compute fixed visual positions in a circle/network pattern
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 180;

  const nodePositions = {};
  graphData.nodes.forEach((node, idx) => {
    const angle = (idx / (graphData.nodes.length || 1)) * 2 * Math.PI;
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              Citation & Knowledge Graph Explorer
            </h2>
            <span className="text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" /> Neo4j Graph Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing multi-hop paper citations and semantic topic relationships.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>Nodes: <strong className="text-indigo-400">{graphData.nodes.length}</strong></span>
            <span>Edges: <strong className="text-emerald-400">{graphData.edges.length}</strong></span>
          </div>
          <button
            onClick={loadGraph}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Refresh graph"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Canvas + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden relative flex items-center justify-center p-4 min-h-[460px]">
          {loading ? (
            <div className="text-slate-400 text-sm animate-pulse flex items-center gap-2 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" /> Querying Neo4j Citation Graph...
            </div>
          ) : (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[500px]">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="18"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                </marker>
              </defs>

              {/* Edges */}
              {graphData.edges.map((edge, idx) => {
                const s = nodePositions[edge.source];
                const t = nodePositions[edge.target];
                if (!s || !t) return null;
                return (
                  <g key={idx}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke="#4338ca"
                      strokeWidth="2"
                      strokeDasharray={edge.relationship === 'SEMANTIC_LINK' ? '4,4' : 'none'}
                      markerEnd="url(#arrowhead)"
                      opacity="0.6"
                    />
                  </g>
                );
              })}

              {/* Center Halo Node */}
              <circle
                cx={centerX}
                cy={centerY}
                r="6"
                fill="#4f46e5"
                opacity="0.4"
              />

              {/* Nodes */}
              {graphData.nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Outer pulse if selected */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="24"
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill={isSelected ? '#6366f1' : '#1e1b4b'}
                      stroke={isSelected ? '#c7d2fe' : '#6366f1'}
                      strokeWidth="2.5"
                    />

                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                    >
                      P{node.id}
                    </text>

                    {/* Node title preview */}
                    <text
                      x={pos.x}
                      y={pos.y + 30}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                      className="pointer-events-none select-none max-w-[120px]"
                    >
                      {node.title.length > 22 ? node.title.substring(0, 22) + '...' : node.title}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Canvas Legend */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-[11px] text-slate-400 space-y-1 backdrop-blur font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              <span>Paper Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-indigo-500 inline-block"></span>
              <span>Direct Citation (CITES)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-indigo-400 inline-block"></span>
              <span>Semantic Similarity Edge</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Node Metadata
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white leading-snug">
                    {selectedNode.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {selectedNode.category || 'Computer Science'}
                    </span>
                    <span className="text-xs text-amber-400 font-mono">
                      ⭐ {selectedNode.citation_count || 0} citations
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="text-slate-400">Node ID: <span className="text-white">{selectedNode.id}</span></div>
                  <div className="text-slate-400">Label: <span className="text-emerald-400">(:Paper)</span></div>
                  <div className="text-slate-400">Cypher Pattern:</div>
                  <div className="text-[10px] text-indigo-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                    MATCH (p:Paper &#123;id: '{selectedNode.id}'&#125;)-[r:CITES]-&gt;(c:Paper) RETURN p, r, c
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Click any node in the graph to inspect its citation relationships and Cypher queries.
              </p>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800/80 text-[11px] text-slate-400">
            Powered by <strong>Neo4j Graph Database</strong> modeling for high-speed multi-hop graph traversal.
          </div>
        </div>
      </div>
    </div>
  );
}
