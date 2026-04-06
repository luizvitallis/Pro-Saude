import React, { useState, useMemo, useCallback } from 'react';
import { GitBranch, ChevronDown, CheckSquare, Clock, FileText, ArrowDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Builds a traversal order from the flowchart graph starting from terminal/start nodes.
 * Returns an array of "rows". Each row is either:
 *   - { type: 'node', node }            — a single node
 *   - { type: 'branch', label, paths }  — a decision with multiple paths
 */
function buildFlow(flowchart) {
  if (!flowchart?.nodes?.length) return [];

  const nodes = flowchart.nodes;
  const edges = flowchart.edges || [];

  const nodeMap = {};
  for (const n of nodes) nodeMap[n.id] = n;

  // adjacency: source -> [{target, label}]
  const adj = {};
  const inDegree = {};
  for (const n of nodes) { adj[n.id] = []; inDegree[n.id] = 0; }
  for (const e of edges) {
    adj[e.source] = adj[e.source] || [];
    adj[e.source].push({ target: e.target, label: e.data?.label || e.label || '' });
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  }

  // Find start nodes: terminal type or 0 in-degree
  let startIds = nodes
    .filter(n => n.type === 'terminal' && (n.data?.label || '').toLowerCase().includes('inic'))
    .map(n => n.id);
  if (startIds.length === 0) {
    startIds = nodes.filter(n => (inDegree[n.id] || 0) === 0).map(n => n.id);
  }
  if (startIds.length === 0 && nodes.length > 0) {
    startIds = [nodes[0].id];
  }

  const visited = new Set();
  const result = [];

  function walk(nodeId) {
    if (!nodeId || visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodeMap[nodeId];
    if (!node) return;

    const children = adj[nodeId] || [];

    if (node.type === 'decision' && children.length > 1) {
      // Decision node: show as branch
      const paths = children.map(c => {
        const pathNodes = [];
        const collectPath = (id) => {
          if (!id || visited.has(id)) return;
          visited.add(id);
          const n = nodeMap[id];
          if (!n) return;
          pathNodes.push(n);
          const next = adj[id] || [];
          if (next.length === 1) collectPath(next[0].target);
        };
        collectPath(c.target);
        return { label: c.label, nodes: pathNodes };
      });
      result.push({ type: 'branch', node, paths });
    } else {
      result.push({ type: 'node', node });
      if (children.length === 1) {
        walk(children[0].target);
      } else if (children.length > 1) {
        // Multiple children but not a decision node — treat as branch anyway
        const paths = children.map(c => {
          const pathNodes = [];
          const collectPath = (id) => {
            if (!id || visited.has(id)) return;
            visited.add(id);
            const n = nodeMap[id];
            if (!n) return;
            pathNodes.push(n);
            const next = adj[id] || [];
            if (next.length === 1) collectPath(next[0].target);
          };
          collectPath(c.target);
          return { label: c.label, nodes: pathNodes };
        });
        if (paths.some(p => p.nodes.length > 0)) {
          result.push({ type: 'branch', node: null, paths });
        }
      }
    }
  }

  for (const sid of startIds) walk(sid);

  // Add any unvisited nodes at the end
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      result.push({ type: 'node', node: n });
    }
  }

  return result;
}

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-slate-300" />
        <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
      </div>
    </div>
  );
}

function FlowNode({ node, step, isOpen, onToggle }) {
  const bgColor = node.data?.bgColor || '#2B8A8A';
  const textColor = node.data?.textColor || '#fff';
  const label = node.data?.label || 'Etapa';
  const isDecision = node.type === 'decision';
  const isTerminal = node.type === 'terminal';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={onToggle}
        className={`w-full text-left transition-all duration-200 ${
          isOpen
            ? 'rounded-t-xl shadow-lg ring-2 ring-blue-400'
            : 'rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01]'
        }`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className={`flex items-center justify-between px-5 py-4 ${isDecision ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3 flex-1">
            {isDecision && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            {isTerminal && <GitBranch className="w-5 h-5 flex-shrink-0" />}
            {!isDecision && !isTerminal && (
              <div className="w-7 h-7 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            )}
            <span className="font-semibold text-base">{label}</span>
          </div>
          {step && (
            <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && step && (
        <div className="bg-white border-x-2 border-b-2 rounded-b-xl px-5 py-5 space-y-4 shadow-lg"
          style={{ borderColor: bgColor }}>
          {step.description && (
            <p className="text-slate-700 leading-relaxed">{step.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {step.department && (
              <Badge variant="outline" className="text-xs">{step.department}</Badge>
            )}
            {step.required && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckSquare className="w-3 h-3 mr-1" /> Obrigatorio
              </Badge>
            )}
            {step.estimated_time && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" /> {step.estimated_time}
              </Badge>
            )}
          </div>

          {step.step_pdf_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={(e) => { e.stopPropagation(); window.open(step.step_pdf_url, '_blank'); }}
            >
              <FileText className="w-4 h-4" /> Ver PDF desta etapa
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FlowchartViewer({ flowchart, steps, onNodeClick }) {
  const hasData = flowchart && flowchart.nodes && flowchart.nodes.length > 0;
  const [openNodeId, setOpenNodeId] = useState(null);

  const flow = useMemo(() => buildFlow(flowchart), [flowchart]);

  const findStep = useCallback((node) => {
    if (!steps || !node) return null;
    const label = (node.data?.label || '').trim().toLowerCase();
    return steps.find(s => (s.title || '').trim().toLowerCase() === label) || null;
  }, [steps]);

  const handleToggle = useCallback((nodeId) => {
    setOpenNodeId(prev => prev === nodeId ? null : nodeId);
  }, []);

  if (!hasData) {
    return (
      <div className="text-center py-12 text-slate-400">
        <GitBranch className="w-12 h-12 mx-auto mb-3" />
        <p className="text-lg font-medium">Nenhum fluxograma definido</p>
        <p className="text-sm">O fluxograma sera exibido aqui quando for criado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-5 h-5" style={{ color: 'hsl(185, 60%, 32%)' }} />
        <h3 className="text-lg font-semibold">Fluxograma do Protocolo</h3>
        <span className="text-xs text-slate-500 ml-2">Clique em cada etapa para ver os detalhes</span>
      </div>

      <div className="py-4">
        {flow.map((item, idx) => {
          if (item.type === 'node') {
            const step = findStep(item.node);
            return (
              <React.Fragment key={item.node.id}>
                {idx > 0 && <Connector />}
                <FlowNode
                  node={item.node}
                  step={step}
                  isOpen={openNodeId === item.node.id}
                  onToggle={() => handleToggle(item.node.id)}
                />
              </React.Fragment>
            );
          }

          if (item.type === 'branch') {
            return (
              <React.Fragment key={`branch-${idx}`}>
                {idx > 0 && <Connector />}

                {/* Decision node header */}
                {item.node && (
                  <div className="w-full max-w-2xl mx-auto">
                    <div
                      className="rounded-xl px-5 py-4 text-center shadow-md"
                      style={{
                        backgroundColor: item.node.data?.bgColor || '#E9A13A',
                        color: item.node.data?.textColor || '#fff',
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">{item.node.data?.label || 'Decisao'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Branch paths side by side */}
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-4 bg-slate-300" />
                </div>
                <div className={`grid gap-4 max-w-4xl mx-auto ${
                  item.paths.length === 2 ? 'grid-cols-2' :
                  item.paths.length === 3 ? 'grid-cols-3' : 'grid-cols-1'
                }`}>
                  {item.paths.map((path, pi) => (
                    <div key={pi} className="space-y-0">
                      {path.label && (
                        <div className="text-center mb-2">
                          <Badge variant="outline" className="text-xs font-medium bg-white">
                            {path.label}
                          </Badge>
                        </div>
                      )}
                      {path.nodes.map((pNode, pni) => {
                        const step = findStep(pNode);
                        return (
                          <React.Fragment key={pNode.id}>
                            {pni > 0 && (
                              <div className="flex justify-center py-1">
                                <div className="flex flex-col items-center">
                                  <div className="w-0.5 h-3 bg-slate-300" />
                                  <ArrowDown className="w-3 h-3 text-slate-400 -mt-0.5" />
                                </div>
                              </div>
                            )}
                            <FlowNode
                              node={pNode}
                              step={step}
                              isOpen={openNodeId === pNode.id}
                              onToggle={() => handleToggle(pNode.id)}
                            />
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
