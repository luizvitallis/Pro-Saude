import React, { useState } from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';

export default function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected, markerEnd, style,
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const lineColor = data?.lineColor || '#374151';
  const lineStyle = data?.lineStyle || 'solid';
  const strokeDasharray = lineStyle === 'dashed' ? '8 4' : lineStyle === 'dotted' ? '2 4' : 'none';

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (data?.readOnly) return;
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    data?.onLabelChange?.(label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      data?.onLabelChange?.(label);
    }
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={selected ? 'hsl(185, 60%, 32%)' : lineColor}
        strokeWidth={selected ? 2.5 : 2}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd={markerEnd}
        style={{ transition: 'stroke 150ms' }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onDoubleClick={handleDoubleClick}
        >
          {editing ? (
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-center outline-none shadow-sm"
              style={{ minWidth: 60 }}
            />
          ) : (data?.label || selected) ? (
            <div
              className="bg-white px-2 py-0.5 rounded text-xs border border-slate-200 shadow-sm cursor-pointer"
              style={{ color: lineColor }}
            >
              {data?.label || (selected ? 'Duplo-clique p/ rótulo' : '')}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}