import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Save, XCircle, Link2, MousePointer, Type } from 'lucide-react';
import FlowchartCanvas from './FlowchartCanvas';

const DEFAULT_NODE_COLOR = '#22c55e';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_LINE_COLOR = '#374151';

export default function FlowchartEditor({ flowchart, onSave, onCancel }) {
  const [nodes, setNodes] = useState(flowchart?.nodes || []);
  const [connections, setConnections] = useState(flowchart?.connections || []);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const [dragInfo, setDragInfo] = useState(null);
  const [newNodeColor, setNewNodeColor] = useState(DEFAULT_NODE_COLOR);
  const [newTextColor, setNewTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [lineColor, setLineColor] = useState(DEFAULT_LINE_COLOR);
  const canvasRef = useRef(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const addNode = () => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      text: 'Novo Item',
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: newNodeColor,
      textColor: newTextColor,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setConnectMode(false);
    setConnectSource(null);
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const updateNode = (nodeId, updates) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const handleNodeClick = (nodeId) => {
    if (connectMode) {
      if (!connectSource) {
        setConnectSource(nodeId);
      } else if (connectSource !== nodeId) {
        const exists = connections.some(c =>
          (c.from === connectSource && c.to === nodeId)
        );
        if (!exists) {
          setConnections(prev => [...prev, {
            id: `conn_${Date.now()}`,
            from: connectSource,
            to: nodeId,
            color: lineColor,
          }]);
        }
        setConnectSource(null);
        setConnectMode(false);
      }
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const deleteConnection = (connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget || e.target.tagName === 'svg' || e.target.tagName === 'line' || e.target.tagName === 'polygon') {
      setSelectedNodeId(null);
      if (connectMode) {
        setConnectSource(null);
        setConnectMode(false);
      }
    }
  };

  const handleMouseDown = (e, nodeId) => {
    if (connectMode) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    setDragInfo({
      nodeId,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragInfo || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - dragInfo.offsetX);
    const newY = Math.max(0, e.clientY - rect.top - dragInfo.offsetY);
    setNodes(prev => prev.map(n =>
      n.id === dragInfo.nodeId ? { ...n, x: newX, y: newY } : n
    ));
  }, [dragInfo]);

  const handleMouseUp = useCallback(() => {
    setDragInfo(null);
  }, []);

  useEffect(() => {
    if (dragInfo) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragInfo, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    onSave({ nodes, connections });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={addNode} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" /> Adicionar Caixa
          </Button>
          <Button
            onClick={() => { setConnectMode(!connectMode); setConnectSource(null); }}
            size="sm"
            variant={connectMode ? "default" : "outline"}
            className={`gap-2 ${connectMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          >
            <Link2 className="w-4 h-4" /> {connectMode ? 'Conectando...' : 'Conectar'}
          </Button>
          
          <div className="h-6 w-px bg-slate-300" />
          
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Cor da Caixa:</Label>
            <input
              type="color"
              value={newNodeColor}
              onChange={(e) => setNewNodeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Cor do Texto:</Label>
            <input
              type="color"
              value={newTextColor}
              onChange={(e) => setNewTextColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs whitespace-nowrap">Cor da Linha:</Label>
            <input
              type="color"
              value={lineColor}
              onChange={(e) => setLineColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-slate-300"
            />
          </div>

          <div className="flex-1" />

          <Button variant="ghost" onClick={onCancel} size="sm">
            <XCircle className="w-4 h-4 mr-1" /> Cancelar
          </Button>
          <Button onClick={handleSave} size="sm" className="gradient-primary gap-2">
            <Save className="w-4 h-4" /> Salvar Fluxograma
          </Button>
        </div>

        {connectMode && (
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
            <MousePointer className="w-3 h-3" />
            {connectSource ? 'Agora clique na caixa de destino' : 'Clique na caixa de origem'}
          </p>
        )}
      </Card>

      {/* Node Properties Panel */}
      {selectedNode && (
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Type className="w-4 h-4" /> Propriedades da Caixa
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Texto</Label>
              <Input
                value={selectedNode.text}
                onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Cor do Fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedNode.color}
                  onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs text-slate-500">{selectedNode.color}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs">Cor do Texto</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedNode.textColor || '#ffffff'}
                  onChange={(e) => updateNode(selectedNode.id, { textColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs text-slate-500">{selectedNode.textColor || '#ffffff'}</span>
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="destructive" size="sm" onClick={() => deleteNode(selectedNode.id)} className="gap-1">
                <Trash2 className="w-3 h-3" /> Remover
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connections List */}
      {connections.length > 0 && selectedNodeId && (
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-2">Conexões</h4>
          <div className="flex flex-wrap gap-2">
            {connections
              .filter(c => c.from === selectedNodeId || c.to === selectedNodeId)
              .map(conn => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                return (
                  <div key={conn.id} className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-xs">
                    <span className="font-medium">{fromNode?.text}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-medium">{toNode?.text}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={conn.color || DEFAULT_LINE_COLOR}
                        onChange={(e) => setConnections(prev => prev.map(c => c.id === conn.id ? { ...c, color: e.target.value } : c))}
                        className="w-5 h-5 rounded cursor-pointer border"
                      />
                      <button onClick={() => deleteConnection(conn.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Canvas */}
      <FlowchartCanvas
        ref={canvasRef}
        nodes={nodes}
        connections={connections}
        selectedNodeId={selectedNodeId}
        connectSource={connectSource}
        connectMode={connectMode}
        onNodeClick={handleNodeClick}
        onNodeMouseDown={handleMouseDown}
        onCanvasClick={handleCanvasClick}
        editable
      />
    </div>
  );
}