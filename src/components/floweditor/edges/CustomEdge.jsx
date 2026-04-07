import React, { useState } from 'react';
import { getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

export default function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected, markerEnd, style,
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    borderRadius: 16,
  });

  const lineColor = data?.lineColor || '#94a3b8';
  const lineStyle = data?.lineStyle || 'solid';
  const strokeDasharray = lineStyle === 'dashed' ? '8 4' : lineStyle === 'dotted' ? '2 4' : 'none';

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (data?.readOnly) return;
    setEditing(true);
  };

  const handleBlur = () => { setEditing(false); data?.onLabelChange?.(label); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') { setEditing(false); data?.onLabelChange?.(label); } };

  return (
    <>
      {/* Shadow path */}
      <path
        d={edgePath}
        stroke="rgba(0,0,0,0.04)"
        strokeWidth={4}
        fill="none"
        style={{ filter: 'blur(2px)' }}
      />
      {/* Main path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={selected ? '#60a5fa' : lineColor}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd={markerEnd}
        style={{ transition: 'stroke 150ms, stroke-width 150ms' }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          onDoubleClick={handleDoubleClick}
        >
          {editing ? (
            <input
              autoFocus value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur} onKeyDown={handleKeyDown}
              className="bg-white border border-slate-300 rounded-md px-2 py-0.5 text-xs text-center outline-none shadow-sm"
              style={{ minWidth: 50 }}
            />
          ) : (data?.label || selected) ? (
            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[11px] font-medium border border-slate-200/60 shadow-sm cursor-pointer"
              style={{ color: selected ? '#3b82f6' : '#64748b' }}>
              {data?.label || (selected ? 'Duplo-clique' : '')}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
