import React from 'react';
import { GitBranch } from 'lucide-react';
import FlowEditor from '../floweditor/FlowEditor';

export default function FlowchartViewer({ flowchart, steps, onNodeClick }) {
  const hasData = flowchart && flowchart.nodes && flowchart.nodes.length > 0;

  const handleNodeClick = React.useCallback((node) => {
    if (!onNodeClick || !steps || steps.length === 0) return;
    const label = (node.data?.label || '').trim().toLowerCase();
    const matchIndex = steps.findIndex(s => 
      (s.title || '').trim().toLowerCase() === label
    );
    if (matchIndex >= 0) {
      onNodeClick(matchIndex);
    }
  }, [onNodeClick, steps]);

  if (!hasData) {
    return (
      <div className="text-center py-12 text-slate-400">
        <GitBranch className="w-12 h-12 mx-auto mb-3" />
        <p className="text-lg font-medium">Nenhum fluxograma definido</p>
        <p className="text-sm">O fluxograma será exibido aqui quando for criado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GitBranch className="w-5 h-5" style={{ color: 'hsl(185, 60%, 32%)' }} />
        <h3 className="text-lg font-semibold">Fluxograma do Protocolo</h3>
        {steps && steps.length > 0 && (
          <span className="text-xs text-slate-500 ml-2">Clique em um nó para ir ao passo correspondente</span>
        )}
      </div>
      <div style={{ height: 500 }}>
        <FlowEditor
          initialFlow={flowchart}
          readOnly
          onSave={() => {}}
          onCancel={() => {}}
          onExternalNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
}