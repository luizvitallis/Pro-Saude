import React, { useState, useMemo, useCallback } from 'react';
import { GitBranch, ChevronDown, CheckSquare, Clock, FileText, ArrowDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Recursively build a tree from the flowchart graph.
 * Each tree node: { node, children: [{ label, tree }] }
 */
function buildTree(nodeId, nodeMap, adj, visited) {
  if (!nodeId || visited.has(nodeId)) return null;
  visited.add(nodeId);

  const node = nodeMap[nodeId];
  if (!node) return null;

  const childEdges = adj[nodeId] || [];
  const children = [];

  for (const edge of childEdges) {
    const childTree = buildTree(edge.target, nodeMap, adj, visited);
    if (childTree) {
      children.push({ label: edge.label || '', tree: childTree });
    }
  }

  return { node, children };
}

function buildForest(flowchart) {
  if (!flowchart?.nodes?.length) return [];

  const nodes = flowchart.nodes;
  const edges = flowchart.edges || [];

  const nodeMap = {};
  for (const n of nodes) nodeMap[n.id] = n;

  const adj = {};
  const hasIncoming = new Set();
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.source] = adj[e.source] || [];
    adj[e.source].push({ target: e.target, label: e.data?.label || e.label || '' });
    hasIncoming.add(e.target);
  }

  // Find roots: terminal/start nodes or nodes with no incoming edges
  let roots = nodes
    .filter(n => n.type === 'terminal' && /^(in[ií]cio|start|come[cç])/i.test(n.data?.label || ''))
    .map(n => n.id);

  if (roots.length === 0) {
    roots = nodes.filter(n => !hasIncoming.has(n.id)).map(n => n.id);
  }
  if (roots.length === 0 && nodes.length > 0) {
    roots = [nodes[0].id];
  }

  const visited = new Set();
  const forest = [];

  for (const rid of roots) {
    const tree = buildTree(rid, nodeMap, adj, visited);
    if (tree) forest.push(tree);
  }

  // Add orphan nodes
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      forest.push({ node: n, children: [] });
    }
  }

  return forest;
}

function Connector({ small }) {
  return (
    <div className="flex justify-center py-0.5">
      <div className="flex flex-col items-center">
        <div className={`w-0.5 ${small ? 'h-3' : 'h-5'} bg-slate-300`} />
        <ArrowDown className={`${small ? 'w-3 h-3' : 'w-4 h-4'} text-slate-400 -mt-1`} />
      </div>
    </div>
  );
}

function FlowCard({ node, step, stepIndex, isOpen, onToggle }) {
  const bgColor = node.data?.bgColor || '#2B8A8A';
  const textColor = node.data?.textColor || '#fff';
  const label = node.data?.label || 'Etapa';
  const isDecision = node.type === 'decision';
  const isTerminal = node.type === 'terminal';
  const hasContent = step || true; // always expandable

  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className={`w-full text-left transition-all duration-200 ${
          isOpen
            ? 'rounded-t-xl shadow-lg ring-2 ring-blue-400 ring-opacity-70'
            : 'rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01]'
        }`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {isDecision ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 opacity-80" />
            ) : isTerminal ? (
              <GitBranch className="w-4 h-4 flex-shrink-0 opacity-80" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                {stepIndex != null ? (
                  <span className="text-xs font-bold">{stepIndex + 1}</span>
                ) : (
                  <FileText className="w-3 h-3" />
                )}
              </div>
            )}
            <span className="font-semibold text-sm truncate">{label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div
          className="bg-white border-x-2 border-b-2 rounded-b-xl px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200"
          style={{ borderColor: bgColor }}
        >
          {step ? (
            <>
              {step.description && (
                <p className="text-sm text-slate-700 leading-relaxed">{step.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {step.department && (
                  <Badge variant="outline" className="text-xs">{step.department}</Badge>
                )}
                {step.required && (
                  <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                    <CheckSquare className="w-3 h-3" /> Obrigatorio
                  </Badge>
                )}
                {step.estimated_time && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" /> {step.estimated_time}
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
                  <ExternalLink className="w-4 h-4" /> Ver PDF desta etapa
                </Button>
              )}

              {!step.description && !step.department && !step.step_pdf_url && (
                <p className="text-sm text-slate-500 italic">Passo registrado sem detalhes adicionais.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 italic">
              {isDecision
                ? 'Ponto de decisao no fluxo. Siga o caminho adequado abaixo.'
                : isTerminal
                ? 'Ponto de inicio ou fim do protocolo.'
                : 'Esta etapa nao possui detalhes adicionais cadastrados.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders a tree node and its children recursively.
 */
function TreeRenderer({ treeNode, steps, openNodeId, onToggle, isFirst }) {
  const { node, children } = treeNode;

  const findStep = (n) => {
    if (!steps || !n) return { step: null, index: null };
    const label = (n.data?.label || '').trim().toLowerCase();
    const idx = steps.findIndex(s => (s.title || '').trim().toLowerCase() === label);
    return idx >= 0 ? { step: steps[idx], index: idx } : { step: null, index: null };
  };

  const { step, index: stepIndex } = findStep(node);

  // Single child: render linearly
  if (children.length <= 1) {
    return (
      <>
        {!isFirst && <Connector />}
        <FlowCard
          node={node}
          step={step}
          stepIndex={stepIndex}
          isOpen={openNodeId === node.id}
          onToggle={() => onToggle(node.id)}
        />
        {children.length === 1 && (
          <TreeRenderer
            treeNode={children[0].tree}
            steps={steps}
            openNodeId={openNodeId}
            onToggle={onToggle}
            isFirst={false}
          />
        )}
      </>
    );
  }

  // Multiple children: branch
  return (
    <>
      {!isFirst && <Connector />}
      <FlowCard
        node={node}
        step={step}
        stepIndex={stepIndex}
        isOpen={openNodeId === node.id}
        onToggle={() => onToggle(node.id)}
      />
      <Connector />
      <div className={`grid gap-4 ${
        children.length === 2 ? 'grid-cols-2' :
        children.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
      }`}>
        {children.map((child, ci) => (
          <div key={ci} className="space-y-0">
            {child.label && (
              <div className="text-center mb-2">
                <Badge variant="outline" className="text-xs font-medium bg-white shadow-sm">
                  {child.label}
                </Badge>
              </div>
            )}
            <TreeRenderer
              treeNode={child.tree}
              steps={steps}
              openNodeId={openNodeId}
              onToggle={onToggle}
              isFirst={true}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default function FlowchartViewer({ flowchart, steps, onNodeClick }) {
  const hasData = flowchart && flowchart.nodes && flowchart.nodes.length > 0;
  const [openNodeId, setOpenNodeId] = useState(null);

  const forest = useMemo(() => buildForest(flowchart), [flowchart]);

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

      <div className="py-4 max-w-3xl mx-auto">
        {forest.map((tree, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <Connector />}
            <TreeRenderer
              treeNode={tree}
              steps={steps}
              openNodeId={openNodeId}
              onToggle={handleToggle}
              isFirst={idx === 0}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
