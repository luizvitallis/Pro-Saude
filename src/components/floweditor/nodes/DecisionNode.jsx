import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

export default function DecisionNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Decisão');

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

  const bgColor = data.bgColor || 'hsl(38, 90%, 50%)';
  const borderColor = data.borderColor || 'hsl(38, 90%, 40%)';
  const size = data.width || 120;
  const IconComponent = data.iconComponent;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 1.4, height: size * 1.4 }}
      onDoubleClick={handleDoubleClick}
    >
      <svg width="100%" height="100%" viewBox="0 0 140 140" className="absolute inset-0">
        <polygon
          points="70,5 135,70 70,135 5,70"
          fill={bgColor}
          stroke={selected ? 'hsl(185, 60%, 32%)' : borderColor}
          strokeWidth={selected ? 2.5 : 2}
          filter={selected ? '' : ''}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          filter: selected ? 'drop-shadow(0 0 3px hsla(185, 60%, 32%, 0.25))' : 'drop-shadow(0 1px 4px rgba(0,0,0,0.12))',
        }}
      >
        <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" style={{ top: 5 }} />
        <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" style={{ bottom: 5 }} />
        <Handle type="target" position={Position.Left} id="left-target" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" style={{ left: 5 }} />
        <Handle type="source" position={Position.Right} id="right-source" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" style={{ right: 5 }} />
      </div>

      <div className="relative z-10 flex items-center gap-1 px-6" style={{ color: data.textColor || '#fff', maxWidth: '70%' }}>
        {IconComponent && <IconComponent size={14} />}
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full"
            style={{ fontSize: data.fontSize || 12, fontWeight: 500, color: data.textColor || '#fff' }}
          />
        ) : (
          <span className="text-center leading-tight" style={{ fontSize: data.fontSize || 12, fontWeight: 500 }}>{data.label || 'Decisão'}</span>
        )}
      </div>
    </div>
  );
}