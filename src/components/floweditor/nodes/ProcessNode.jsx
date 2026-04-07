import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText } from 'lucide-react';

const handleStyle = '!w-[7px] !h-[7px] !bg-white/40 !border-0 !rounded-full hover:!bg-white/70 !transition-colors';

export default function ProcessNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Processo');

  const handleDoubleClick = useCallback(() => {
    if (data.readOnly) return;
    setEditing(true);
  }, [data.readOnly]);

  const handleBlur = useCallback(() => { setEditing(false); data.onLabelChange?.(text); }, [text, data]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') { setEditing(false); data.onLabelChange?.(text); } }, [text, data]);

  const bgColor = data.bgColor || 'hsl(185, 55%, 40%)';
  const fontSize = data.fontSize || 14;
  const hasPdf = !!data.pdfUrl;

  return (
    <div
      className="group relative"
      style={{
        minWidth: 180, minHeight: 52,
        background: `linear-gradient(160deg, ${bgColor}, ${bgColor}cc)`,
        border: selected ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.18)',
        borderRadius: 12,
        boxShadow: selected
          ? '0 0 0 3px rgba(96,165,250,0.25), 0 10px 30px -5px rgba(0,0,0,0.2)'
          : '0 2px 12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 18px',
        cursor: data.readOnly ? 'pointer' : 'grab',
        transition: 'all 180ms ease',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />

      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleStyle} />

      <div className="flex items-center gap-2 text-center" style={{ color: data.textColor || '#fff' }}>
        {editing ? (
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full" style={{ fontSize, fontWeight: 600, color: data.textColor || '#fff' }} />
        ) : (
          <span style={{ fontSize, fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
            {data.label || 'Processo'}
          </span>
        )}
      </div>

      {hasPdf && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center ring-1 ring-slate-200">
          <FileText className="w-2.5 h-2.5 text-blue-600" />
        </div>
      )}
    </div>
  );
}
