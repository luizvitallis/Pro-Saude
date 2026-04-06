import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

export default function TerminalNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Início');

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

  const bgColor = data.bgColor || 'hsl(215, 60%, 38%)';
  const borderColor = data.borderColor || 'hsl(215, 60%, 28%)';
  const IconComponent = data.iconComponent;

  return (
    <div
      style={{
        minWidth: data.width || 100,
        minHeight: data.height || 60,
        backgroundColor: bgColor,
        border: selected ? '2.5px solid hsl(185, 60%, 32%)' : `2px solid ${borderColor}`,
        borderRadius: '50%',
        boxShadow: selected
          ? '0 0 0 3px hsla(185, 60%, 32%, 0.25), 0 2px 8px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 20px',
        transition: 'border 150ms, box-shadow 150ms',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />

      <div className="flex items-center gap-1" style={{ color: data.textColor || '#fff' }}>
        {IconComponent && <IconComponent size={14} />}
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full"
            style={{ fontSize: data.fontSize || 13, fontWeight: 600, color: data.textColor || '#fff' }}
          />
        ) : (
          <span style={{ fontSize: data.fontSize || 13, fontWeight: 600 }}>{data.label || 'Início'}</span>
        )}
      </div>
    </div>
  );
}