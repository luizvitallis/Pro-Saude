import React, { useState, useCallback, useMemo } from 'react';
import { GitBranch, X, ArrowRight, ChevronRight, CheckSquare, Clock, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FlowEditor from '../floweditor/FlowEditor';

export default function FlowchartViewer({ flowchart, steps, onNodeClick }) {
  const hasData = flowchart && flowchart.nodes && flowchart.nodes.length > 0;
  const [activeNode, setActiveNode] = useState(null);

  // Build adjacency: nodeId -> [{targetId, label}]
  const adjacency = useMemo(() => {
    if (!flowchart?.edges) return {};
    const map = {};
    for (const edge of flowchart.edges) {
      if (!map[edge.source]) map[edge.source] = [];
      map[edge.source].push({
        targetId: edge.target,
        label: edge.data?.label || edge.label || ''
      });
    }
    return map;
  }, [flowchart]);

  // nodeId -> node
  const nodeMap = useMemo(() => {
    if (!flowchart?.nodes) return {};
    const map = {};
    for (const n of flowchart.nodes) map[n.id] = n;
    return map;
  }, [flowchart]);

  // Match node to step by label
  const findStep = useCallback((node) => {
    if (!steps?.length || !node) return null;
    const label = (node.data?.label || '').trim().toLowerCase();
    const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
    return idx >= 0 ? { step: steps[idx], index: idx } : null;
  }, [steps]);

  const handleNodeClick = useCallback((node) => {
    setActiveNode(prev => prev?.id === node.id ? null : node);
    if (onNodeClick && steps?.length) {
      const label = (node.data?.label || '').trim().toLowerCase();
      const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
      if (idx >= 0) onNodeClick(idx);
    }
  }, [onNodeClick, steps]);

  const handleNextClick = useCallback((targetId) => {
    const node = nodeMap[targetId];
    if (node) {
      setActiveNode(node);
      if (onNodeClick && steps?.length) {
        const label = (node.data?.label || '').trim().toLowerCase();
        const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
        if (idx >= 0) onNodeClick(idx);
      }
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

  const stepMatch = activeNode ? findStep(activeNode) : null;
  const nextNodes = activeNode && adjacency[activeNode.id] ? adjacency[activeNode.id] : [];
  const bgColor = activeNode?.data?.bgColor || '#2B8A8A';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5" style={{ color: 'hsl(185, 60%, 32%)' }} />
        <h3 className="text-lg font-semibold">Fluxograma do Protocolo</h3>
        <span className="text-xs text-slate-500 ml-2">Clique em uma etapa para ver os detalhes</span>
      </div>

      {/* Flowchart - same visual as admin created */}
      <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: 500 }}>
        <FlowEditor
          initialFlow={flowchart}
          readOnly
          onSave={() => {}}
          onCancel={() => {}}
          onExternalNodeClick={handleNodeClick}
        />
      </div>

      {/* Detail panel below flowchart */}
      {activeNode && (
        <div className="rounded-xl border-2 shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-300"
          style={{ borderColor: bgColor }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: bgColor, color: activeNode.data?.textColor || '#fff' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-semibold">{activeNode.data?.label || 'Etapa'}</h4>
            </div>
            <button onClick={() => setActiveNode(null)} className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: step details */}
              <div className="space-y-4">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detalhes da Etapa</h5>
                {stepMatch ? (
                  <>
                    {stepMatch.step.description && (
                      <p className="text-sm text-slate-700 leading-relaxed">{stepMatch.step.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {stepMatch.step.department && (
                        <Badge variant="outline" className="text-xs">{stepMatch.step.department}</Badge>
                      )}
                      {stepMatch.step.required && (
                        <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                          <CheckSquare className="w-3 h-3" /> Obrigatorio
                        </Badge>
                      )}
                      {stepMatch.step.estimated_time && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="w-3 h-3" /> {stepMatch.step.estimated_time}
                        </Badge>
                      )}
                    </div>
                    {stepMatch.step.step_pdf_url && (
                      <Button variant="outline" size="sm" className="gap-2"
                        onClick={() => window.open(stepMatch.step.step_pdf_url, '_blank')}>
                        <ExternalLink className="w-4 h-4" /> Ver PDF desta etapa
                      </Button>
                    )}
                    {!stepMatch.step.description && !stepMatch.step.department && (
                      <p className="text-sm text-slate-500 italic">Passo registrado sem detalhes adicionais.</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    {activeNode.type === 'decision'
                      ? 'Ponto de decisao no fluxo. Siga o caminho adequado.'
                      : activeNode.type === 'terminal'
                      ? 'Ponto de inicio ou fim do protocolo.'
                      : 'Esta etapa nao possui detalhes adicionais cadastrados.'}
                  </p>
                )}
              </div>

              {/* Right: next steps */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Proximas Etapas
                </h5>
                {nextNodes.length > 0 ? (
                  <div className="space-y-2">
                    {nextNodes.map(({ targetId, label }) => {
                      const target = nodeMap[targetId];
                      if (!target) return null;
                      return (
                        <button key={targetId} onClick={() => handleNextClick(targetId)}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              {label && <span className="text-xs text-blue-600 font-medium block mb-0.5">{label}</span>}
                              <span className="text-sm font-medium text-slate-800 block truncate">
                                {target.data?.label || 'Proximo'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Fim do fluxo - nao ha proximas etapas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
