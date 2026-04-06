import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ProcessNode from './nodes/ProcessNode';
import DecisionNode from './nodes/DecisionNode';
import TerminalNode from './nodes/TerminalNode';
import SubprocessNode from './nodes/SubprocessNode';
import IONode from './nodes/IONode';
import CustomEdge from './edges/CustomEdge';
import FlowToolbar from './FlowToolbar';
import ShapePanel from './ShapePanel';
import PropertiesPanel from './PropertiesPanel';

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  terminal: TerminalNode,
  subprocess: SubprocessNode,
  io: IONode,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Migrate old flowchart format (x/y/text/color) to React Flow format
function migrateFlowData(flow) {
  if (!flow || !flow.nodes || flow.nodes.length === 0) return { nodes: [], edges: [] };
  
  // Check if already in React Flow format (has 'position' key)
  const firstNode = flow.nodes[0];
  if (firstNode.position) {
    return { nodes: flow.nodes, edges: flow.edges || [] };
  }
  
  // Old format: {id, x, y, text, color, textColor} → React Flow format
  const nodes = flow.nodes.map(n => ({
    id: n.id,
    type: 'process',
    position: { x: n.x || 0, y: n.y || 0 },
    data: {
      label: n.text || 'Item',
      bgColor: n.color || 'hsl(185, 55%, 40%)',
      textColor: n.textColor || '#fff',
      borderColor: 'hsl(185, 55%, 30%)',
      fontSize: 13,
    },
  }));
  
  const edges = (flow.connections || []).map(c => ({
    id: c.id,
    source: c.from,
    target: c.to,
    type: 'custom',
    markerEnd: { type: 'arrowclosed', color: c.color || '#374151' },
    data: { lineColor: c.color || '#374151', lineStyle: 'solid', label: '' },
  }));
  
  return { nodes, edges };
}

const defaultNodeData = {
  process: { label: 'Processo', bgColor: 'hsl(185, 55%, 40%)', borderColor: 'hsl(185, 55%, 30%)', textColor: '#fff', fontSize: 13 },
  decision: { label: 'Decisão?', bgColor: 'hsl(38, 90%, 50%)', borderColor: 'hsl(38, 90%, 40%)', textColor: '#fff', fontSize: 12 },
  terminal: { label: 'Início', bgColor: 'hsl(215, 60%, 38%)', borderColor: 'hsl(215, 60%, 28%)', textColor: '#fff', fontSize: 13 },
  subprocess: { label: 'Subprocesso', bgColor: 'hsl(215, 15%, 55%)', borderColor: 'hsl(215, 15%, 45%)', textColor: '#fff', fontSize: 13 },
  io: { label: 'Entrada/Saída', bgColor: 'hsl(185, 55%, 40%)', borderColor: 'hsl(185, 55%, 30%)', textColor: '#fff', fontSize: 13 },
};

function FlowEditorInner({ initialFlow, onSave, onCancel, readOnlyProp, onExternalNodeClick }) {
  const reactFlowWrapper = useRef(null);
  const { fitView, zoomIn, zoomOut, getNodes, getEdges, setViewport, project } = useReactFlow();

  const migrated = React.useMemo(() => migrateFlowData(initialFlow), [initialFlow]);
  const [nodes, setNodes] = useState(migrated.nodes);
  const [edges, setEdges] = useState(migrated.edges);
  const [selectedElement, setSelectedElement] = useState(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [readOnly, setReadOnly] = useState(readOnlyProp || false);

  // History for undo/redo
  const [history, setHistory] = useState([{ nodes: migrated.nodes, edges: migrated.edges }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const skipHistoryRef = useRef(false);

  const pushHistory = useCallback((newNodes, newEdges) => {
    if (skipHistoryRef.current) { skipHistoryRef.current = false; return; }
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, { nodes: newNodes, edges: newEdges }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    skipHistoryRef.current = true;
    setNodes(history[newIndex].nodes);
    setEdges(history[newIndex].edges);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    skipHistoryRef.current = true;
    setNodes(history[newIndex].nodes);
    setEdges(history[newIndex].edges);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !readOnly) {
        // Don't delete if we're inside an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (selectedElement.source) {
          setEdges(es => es.filter(edge => edge.id !== selectedElement.id));
        } else {
          setNodes(ns => ns.filter(n => n.id !== selectedElement.id));
          setEdges(es => es.filter(e => e.source !== selectedElement.id && e.target !== selectedElement.id));
        }
        setSelectedElement(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedElement, readOnly]);

  const makeLabelChanger = useCallback((nodeId) => (newLabel) => {
    setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n));
  }, []);

  const makeEdgeLabelChanger = useCallback((edgeId) => (newLabel) => {
    setEdges(es => es.map(e => e.id === edgeId ? { ...e, data: { ...e.data, label: newLabel } } : e));
  }, []);

  const onNodesChange = useCallback((changes) => {
    if (readOnly) return;
    setNodes(ns => {
      const updated = applyNodeChanges(changes, ns);
      // Attach callbacks
      return updated.map(n => ({
        ...n,
        data: { ...n.data, onLabelChange: makeLabelChanger(n.id), readOnly }
      }));
    });
  }, [readOnly, makeLabelChanger]);

  const onEdgesChange = useCallback((changes) => {
    if (readOnly) return;
    setEdges(es => applyEdgeChanges(changes, es));
  }, [readOnly]);

  const onConnect = useCallback((connection) => {
    if (readOnly) return;
    const newEdge = {
      ...connection,
      id: `e_${Date.now()}`,
      type: 'custom',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#374151' },
      data: { lineColor: '#374151', lineStyle: 'solid', label: '', readOnly },
    };
    setEdges(es => addEdge(newEdge, es));
  }, [readOnly]);

  // Save history on meaningful changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      pushHistory(nodes, edges);
    }, 500);
    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  const addNode = useCallback((type, position) => {
    if (readOnly) return;
    const id = `${type}_${Date.now()}`;
    const pos = position || { x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 };
    const newNode = {
      id,
      type,
      position: pos,
      data: {
        ...defaultNodeData[type],
        onLabelChange: makeLabelChanger(id),
        readOnly,
      },
    };
    setNodes(ns => [...ns, newNode]);
  }, [readOnly, makeLabelChanger]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    if (readOnly) return;
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    addNode(type, position);
  }, [readOnly, project, addNode]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedElement(node);
    if (onExternalNodeClick) onExternalNodeClick(node);
  }, [onExternalNodeClick]);

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedElement(edge);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const updateSelectedElement = useCallback((updates) => {
    if (!selectedElement) return;
    if (selectedElement.source) {
      // Edge
      setEdges(es => es.map(e => e.id === selectedElement.id
        ? { ...e, data: { ...e.data, ...updates, onLabelChange: makeEdgeLabelChanger(e.id), readOnly } }
        : e
      ));
      setSelectedElement(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : null);
    } else {
      // Node
      setNodes(ns => ns.map(n => n.id === selectedElement.id
        ? { ...n, data: { ...n.data, ...updates, onLabelChange: makeLabelChanger(n.id), readOnly } }
        : n
      ));
      setSelectedElement(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : null);
    }
  }, [selectedElement, readOnly, makeLabelChanger, makeEdgeLabelChanger]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    if (selectedElement.source) {
      setEdges(es => es.filter(e => e.id !== selectedElement.id));
    } else {
      setNodes(ns => ns.filter(n => n.id !== selectedElement.id));
      setEdges(es => es.filter(e => e.source !== selectedElement.id && e.target !== selectedElement.id));
    }
    setSelectedElement(null);
  }, [selectedElement]);

  const handleSave = useCallback(() => {
    // Strip callback functions before saving
    const cleanNodes = nodes.map(n => ({
      ...n,
      data: { ...n.data, onLabelChange: undefined, readOnly: undefined, iconComponent: undefined },
    }));
    const cleanEdges = edges.map(e => ({
      ...e,
      data: { ...e.data, onLabelChange: undefined, readOnly: undefined },
    }));
    onSave?.({ nodes: cleanNodes, edges: cleanEdges });
  }, [nodes, edges, onSave]);

  const handleExportJSON = useCallback(() => {
    const cleanNodes = nodes.map(n => ({ ...n, data: { ...n.data, onLabelChange: undefined, readOnly: undefined, iconComponent: undefined } }));
    const cleanEdges = edges.map(e => ({ ...e, data: { ...e.data, onLabelChange: undefined, readOnly: undefined } }));
    const data = JSON.stringify({ nodes: cleanNodes, edges: cleanEdges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fluxograma.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImportJSON = useCallback((data) => {
    if (data.nodes) setNodes(data.nodes.map(n => ({ ...n, data: { ...n.data, onLabelChange: makeLabelChanger(n.id), readOnly } })));
    if (data.edges) setEdges(data.edges.map(e => ({ ...e, data: { ...e.data, onLabelChange: makeEdgeLabelChanger(e.id), readOnly } })));
  }, [makeLabelChanger, makeEdgeLabelChanger, readOnly]);

  const handleClear = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar todo o fluxograma?')) {
      setNodes([]);
      setEdges([]);
      setSelectedElement(null);
    }
  }, []);

  // Inject callbacks into nodes/edges on readOnly change
  useEffect(() => {
    setNodes(ns => ns.map(n => ({
      ...n,
      data: { ...n.data, onLabelChange: makeLabelChanger(n.id), readOnly }
    })));
    setEdges(es => es.map(e => ({
      ...e,
      data: { ...e.data, onLabelChange: makeEdgeLabelChanger(e.id), readOnly }
    })));
  }, [readOnly]);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border" style={{ borderColor: '#E2E8F0', minHeight: 600 }}>
      <FlowToolbar
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitView={() => fitView({ padding: 0.2 })}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportPNG={() => {}}
        onClear={handleClear}
        onSave={handleSave}
        onCancel={onCancel}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(s => !s)}
        readOnly={readOnly}
        onToggleReadOnly={() => setReadOnly(r => !r)}
      />

      <div className="flex flex-1 overflow-hidden">
        {!readOnly && <ShapePanel onAddNode={addNode} />}

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              type: 'custom',
              markerEnd: { type: MarkerType.ArrowClosed, color: '#374151' },
            }}
            snapToGrid={snapToGrid}
            snapGrid={[15, 15]}
            fitView
            deleteKeyCode={null}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              color="#CBD5E1"
              gap={20}
              size={1.5}
              variant="dots"
              style={{ backgroundColor: '#F8FAFC' }}
            />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {selectedElement && !readOnly && (
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdate={updateSelectedElement}
            onDelete={deleteSelectedElement}
            onClose={() => setSelectedElement(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function FlowEditor({ initialFlow, onSave, onCancel, readOnly, onExternalNodeClick }) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner
        initialFlow={initialFlow}
        onSave={onSave}
        onCancel={onCancel}
        readOnlyProp={readOnly}
        onExternalNodeClick={onExternalNodeClick}
      />
    </ReactFlowProvider>
  );
}