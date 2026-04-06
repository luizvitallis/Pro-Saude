import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

export default function IONode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Entrada/Saída');

  const handleDoubleClick = useCallback(() => {
    if (data.readOnly) return;
    setEditing(true);
  }, [data.readOnly]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    data.onLabelChange?.(text);
  }, [text, data]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { setEditing(false); data.onLabelChange?.(text); }
  }, [text, data]);

  const bgColor = data.bgColor || 'hsl(185, 55%, 40%)';
  const borderColor = data.borderColor || 'hsl(185, 55%, 30%)';
  const w = data.width || 170;
  const h = data.height || 60;
  const skew = 15;
  const IconComponent = data.iconComponent;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: w, height: h }}
      onDoubleClick={handleDoubleClick}
    >
      <svg width={w} height={h} className="absolute inset-0">
        <polygon
          points={`${skew},0 ${w},0 ${w - skew},${h} 0,${h}`}
          fill={bgColor}
          stroke={selected ? 'hsl(185, 60%, 32%)' : borderColor}
          strokeWidth={selected ? 2.5 : 2}
        />
      </svg>

      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />

      <div className="relative z-10 flex items-center gap-1 px-4" style={{ color: data.textColor || '#fff' }}>
        {IconComponent && <IconComponent size={14} />}
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full"
            style={{ fontSize: data.fontSize || 13, fontWeight: 500, color: data.textColor || '#fff' }}
          />
        ) : (
          <span style={{ fontSize: data.fontSize || 13, fontWeight: 500 }}>{data.label || 'Entrada/Saída'}</span>
        )}
      </div>
    </div>
  );
}