import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

export default function ProcessNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Processo');

  const handleDoubleClick = useCallback(() => {
    if (data.readOnly) return;
    setEditing(true);
  }, [data.readOnly]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    data.onLabelChange?.(text);
  }, [text, data]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      data.onLabelChange?.(text);
    }
  }, [text, data]);

  const bgColor = data.bgColor || 'hsl(185, 55%, 40%)';
  const borderColor = data.borderColor || 'hsl(185, 55%, 30%)';
  const fontSize = data.fontSize || 13;
  const IconComponent = data.iconComponent;

  return (
    <div
      className="relative"
      style={{
        minWidth: data.width || 160,
        minHeight: data.height || 60,
        backgroundColor: bgColor,
        border: selected ? '2.5px solid hsl(185, 60%, 32%)' : `2px solid ${borderColor}`,
        borderRadius: 10,
        boxShadow: selected
          ? '0 0 0 3px hsla(185, 60%, 32%, 0.25), 0 2px 8px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        cursor: data.readOnly ? 'default' : 'grab',
        transition: 'border 150ms, box-shadow 150ms',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />

      <div className="flex items-center gap-2 text-center" style={{ color: data.textColor || '#fff' }}>
        {IconComponent && <IconComponent size={16} />}
        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full"
            style={{ fontSize, fontWeight: 500, color: data.textColor || '#fff' }}
          />
        ) : (
          <span style={{ fontSize, fontWeight: 500, lineHeight: 1.3 }}>{data.label || 'Processo'}</span>
        )}
      </div>
    </div>
  );
}