import React, { useState, useCallback, useMemo } from 'react';
import { GitBranch, X, ArrowRight, ChevronRight, CheckSquare, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FlowEditor from '../floweditor/FlowEditor';

export default function FlowchartViewer({ flowchart, steps, onNodeClick }) {
  const hasData = flowchart && flowchart.nodes && flowchart.nodes.length > 0;
  const [activeNodeId, setActiveNodeId] = useState(null);

  // Build adjacency map: nodeId -> [targetNodeIds]
  const adjacency = useMemo(() => {
    if (!flowchart?.edges) return {};
    const map = {};
    for (const edge of flowchart.edges) {
      const src = edge.source;
      if (!map[src]) map[src] = [];
      map[src].push({ targetId: edge.target, label: edge.data?.label || edge.label || '' });
    }
    return map;
  }, [flowchart]);

  // Map nodeId -> node data
  const nodeMap = useMemo(() => {
    if (!flowchart?.nodes) return {};
    const map = {};
    for (const node of flowchart.nodes) {
      map[node.id] = node;
    }
    return map;
  }, [flowchart]);

  // Match node label to step
  const findStepForNode = useCallback((node) => {
    if (!steps || steps.length === 0 || !node) return null;
    const label = (node.data?.label || '').trim().toLowerCase();
    const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
    return idx >= 0 ? { step: steps[idx], index: idx } : null;
  }, [steps]);

  const activeNode = activeNodeId ? nodeMap[activeNodeId] : null;
  const activeStepMatch = activeNode ? findStepForNode(activeNode) : null;
  const nextNodes = activeNodeId && adjacency[activeNodeId] ? adjacency[activeNodeId] : [];

  const handleNodeClick = useCallback((node) => {
    setActiveNodeId(node.id);
    // Also notify parent to scroll to step
    if (onNodeClick && steps && steps.length > 0) {
      const label = (node.data?.label || '').trim().toLowerCase();
      const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
      if (idx >= 0) onNodeClick(idx);
    }
  }, [onNodeClick, steps]);

  const handleNextClick = useCallback((targetId) => {
    setActiveNodeId(targetId);
    const targetNode = nodeMap[targetId];
    if (targetNode && onNodeClick && steps && steps.length > 0) {
      const label = (targetNode.data?.label || '').trim().toLowerCase();
      const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
      if (idx >= 0) onNodeClick(idx);
    }
  }, [nodeMap, onNodeClick, steps]);

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5" style={{ color: 'hsl(185, 60%, 32%)' }} />
        <h3 className="text-lg font-semibold">Fluxograma do Protocolo</h3>
        <span className="text-xs text-slate-500 ml-2">Clique em uma etapa para ver detalhes e navegar no fluxo</span>
      </div>

      <div className="flex gap-4">
        {/* Flowchart */}
        <div className={`${activeNodeId ? 'flex-1' : 'w-full'} transition-all duration-300`} style={{ height: 500 }}>
          <FlowEditor
            initialFlow={flowchart}
            readOnly
            onSave={() => {}}
            onCancel={() => {}}
            onExternalNodeClick={handleNodeClick}
          />
        </div>

        {/* Detail Panel */}
        {activeNodeId && activeNode && (
          <div className="w-80 flex-shrink-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: 500 }}>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 text-sm">Etapa Selecionada</h4>
                <button onClick={() => setActiveNodeId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Node Info */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 rounded-lg" style={{
                backgroundColor: activeNode.data?.bgColor || '#2B8A8A',
                color: activeNode.data?.textColor || '#fff'
              }}>
                <p className="font-medium text-center text-sm">
                  {activeNode.data?.label || 'Sem titulo'}
                </p>
              </div>

              {/* Step details */}
              {activeStepMatch ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Passo {activeStepMatch.step.order || activeStepMatch.index + 1}</p>
                    <p className="text-sm text-slate-700">{activeStepMatch.step.description || 'Sem descricao detalhada.'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeStepMatch.step.department && (
                      <Badge variant="outline" className="text-xs">{activeStepMatch.step.department}</Badge>
                    )}
                    {activeStepMatch.step.required && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckSquare className="w-3 h-3 mr-1" /> Obrigatorio
                      </Badge>
                    )}
                    {activeStepMatch.step.estimated_time && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" /> {activeStepMatch.step.estimated_time}
                      </Badge>
                    )}
                  </div>

                  {activeStepMatch.step.step_pdf_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => window.open(activeStepMatch.step.step_pdf_url, '_blank')}
                    >
                      <FileText className="w-4 h-4" /> Ver PDF do passo
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Este no nao possui um passo correspondente nos passos do protocolo.</p>
              )}

              {/* Next Steps */}
              {nextNodes.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Proximas etapas
                  </p>
                  <div className="space-y-2">
                    {nextNodes.map(({ targetId, label }) => {
                      const targetNode = nodeMap[targetId];
                      if (!targetNode) return null;
                      return (
                        <button
                          key={targetId}
                          onClick={() => handleNextClick(targetId)}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              {label && (
                                <span className="text-xs text-blue-600 font-medium block mb-1">{label}</span>
                              )}
                              <span className="text-sm font-medium text-slate-800 truncate block">
                                {targetNode.data?.label || 'Proximo'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {nextNodes.length === 0 && activeNodeId && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400 text-center italic">Fim do fluxo</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
