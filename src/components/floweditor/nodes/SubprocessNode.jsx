import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

export default function SubprocessNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Subprocesso');

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

  const bgColor = data.bgColor || 'hsl(215, 15%, 55%)';
  const borderColor = data.borderColor || 'hsl(215, 15%, 45%)';
  const IconComponent = data.iconComponent;

  return (
    <div
      style={{
        minWidth: data.width || 160,
        minHeight: data.height || 60,
        backgroundColor: bgColor,
        border: selected ? '2.5px solid hsl(185, 60%, 32%)' : `2px solid ${borderColor}`,
        borderRadius: 2,
        boxShadow: selected
          ? '0 0 0 3px hsla(185, 60%, 32%, 0.25), 0 2px 8px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 24px',
        transition: 'border 150ms, box-shadow 150ms',
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Inner border lines for subprocess */}
      <div style={{
        position: 'absolute', left: 10, top: 0, bottom: 0, width: 2,
        backgroundColor: borderColor, opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute', right: 10, top: 0, bottom: 0, width: 2,
        backgroundColor: borderColor, opacity: 0.5,
      }} />

      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2.5 !h-2.5 !bg-slate-400 !border-white !border-2" />

      <div className="flex items-center gap-2" style={{ color: data.textColor || '#fff' }}>
        {IconComponent && <IconComponent size={16} />}
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
          <span style={{ fontSize: data.fontSize || 13, fontWeight: 500 }}>{data.label || 'Subprocesso'}</span>
        )}
      </div>
    </div>
  );
}