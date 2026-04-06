import React, { forwardRef, useMemo } from 'react';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;

function getNodeCenter(node) {
  return {
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2,
  };
}

function getConnectionPoints(fromNode, toNode) {
  const from = getNodeCenter(fromNode);
  const to = getNodeCenter(toNode);

  const dx = to.x - from.x;
  const dy = to.y - from.y;

  let startX, startY, endX, endY;

  if (Math.abs(dy) > Math.abs(dx)) {
    // Vertical connection
    if (dy > 0) {
      startX = from.x; startY = fromNode.y + NODE_HEIGHT;
      endX = to.x; endY = toNode.y;
    } else {
      startX = from.x; startY = fromNode.y;
      endX = to.x; endY = toNode.y + NODE_HEIGHT;
    }
  } else {
    // Horizontal connection
    if (dx > 0) {
      startX = fromNode.x + NODE_WIDTH; startY = from.y;
      endX = toNode.x; endY = to.y;
    } else {
      startX = fromNode.x; startY = from.y;
      endX = toNode.x + NODE_WIDTH; endY = to.y;
    }
  }

  return { startX, startY, endX, endY };
}

function ConnectionLine({ conn, fromNode, toNode, highlighted }) {
  if (!fromNode || !toNode) return null;
  const { startX, startY, endX, endY } = getConnectionPoints(fromNode, toNode);
  const color = conn.color || '#374151';
  const arrowId = `arrow_${conn.id}`;

  // Calculate intermediate points for right-angle lines
  const midY = (startY + endY) / 2;
  const pathPoints = Math.abs(startX - endX) < 5
    ? `M ${startX} ${startY} L ${endX} ${endY}`
    : `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;

  return (
    <g>
      <defs>
        <marker
          id={arrowId}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill={color} />
        </marker>
      </defs>
      <path
        d={pathPoints}
        stroke={color}
        strokeWidth={highlighted ? 3 : 2}
        fill="none"
        markerEnd={`url(#${arrowId})`}
        opacity={highlighted ? 1 : 0.7}
      />
    </g>
  );
}

const FlowchartCanvas = forwardRef(function FlowchartCanvas({
  nodes,
  connections,
  selectedNodeId,
  connectSource,
  connectMode,
  onNodeClick,
  onNodeMouseDown,
  onCanvasClick,
  highlightedNodes,
  editable,
}, ref) {

  const canvasWidth = useMemo(() => {
    if (nodes.length === 0) return 800;
    return Math.max(800, ...nodes.map(n => n.x + NODE_WIDTH + 40));
  }, [nodes]);

  const canvasHeight = useMemo(() => {
    if (nodes.length === 0) return 500;
    return Math.max(500, ...nodes.map(n => n.y + NODE_HEIGHT + 40));
  }, [nodes]);

  const highlightedSet = new Set(highlightedNodes || []);
  const hasHighlights = highlightedSet.size > 0;

  return (
    <div
      ref={ref}
      className="relative bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-auto"
      style={{ minHeight: 500, height: canvasHeight + 20 }}
      onClick={onCanvasClick}
    >
      {/* SVG for connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasWidth}
        height={canvasHeight}
        style={{ zIndex: 1 }}
      >
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          const highlighted = !hasHighlights ||
            (highlightedSet.has(conn.from) && highlightedSet.has(conn.to));
          return (
            <ConnectionLine
              key={conn.id}
              conn={conn}
              fromNode={fromNode}
              toNode={toNode}
              highlighted={highlighted}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const isSelected = node.id === selectedNodeId;
        const isConnectSource = node.id === connectSource;
        const isHighlighted = !hasHighlights || highlightedSet.has(node.id);
        const dimmed = hasHighlights && !isHighlighted;

        return (
          <div
            key={node.id}
            className={`absolute flex items-center justify-center text-center px-3 py-2 rounded-lg font-semibold text-sm shadow-md select-none transition-all ${
              editable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${
              isConnectSource ? 'ring-2 ring-orange-400 ring-offset-2 animate-pulse' : ''
            } ${dimmed ? 'opacity-30' : ''}`}
            style={{
              left: node.x,
              top: node.y,
              width: NODE_WIDTH,
              minHeight: NODE_HEIGHT,
              backgroundColor: node.color || '#22c55e',
              color: node.textColor || '#ffffff',
              zIndex: isSelected ? 10 : 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick?.(node.id);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onNodeMouseDown?.(e, node.id);
            }}
          >
            <span className="leading-tight break-words w-full">{node.text}</span>
          </div>
        );
      })}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-lg font-medium">Fluxograma vazio</p>
            <p className="text-sm">Clique em "Adicionar Caixa" para começar</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default FlowchartCanvas;