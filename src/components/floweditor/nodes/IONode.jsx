import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText } from 'lucide-react';

const handleStyle = '!w-[7px] !h-[7px] !bg-white/40 !border-0 !rounded-full';

export default function IONode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Entrada/Saida');

  const handleDoubleClick = useCallback(() => { if (data.readOnly) return; setEditing(true); }, [data.readOnly]);
  const handleBlur = useCallback(() => { setEditing(false); data.onLabelChange?.(text); }, [text, data]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') { setEditing(false); data.onLabelChange?.(text); } }, [text, data]);

  const bgColor = data.bgColor || 'hsl(185, 55%, 40%)';
  const w = 180, h = 52, skew = 14;
  const hasPdf = !!data.pdfUrl;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: w, height: h, cursor: data.readOnly ? 'pointer' : 'grab' }}
      onDoubleClick={handleDoubleClick}
    >
      <svg width={w} height={h} className="absolute inset-0" style={{ filter: selected ? 'drop-shadow(0 0 6px rgba(96,165,250,0.4))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))' }}>
        <defs>
          <linearGradient id={`iog-${data.label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bgColor} />
            <stop offset="100%" stopColor={bgColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <polygon
          points={`${skew},0 ${w},0 ${w - skew},${h} 0,${h}`}
          fill={`url(#iog-${data.label})`}
          stroke={selected ? '#60a5fa' : 'rgba(255,255,255,0.18)'}
          strokeWidth={selected ? 2 : 1}
        />
      </svg>

      <Handle type="target" position={Position.Top} className={handleStyle} />
      <Handle type="source" position={Position.Bottom} className={handleStyle} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleStyle} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleStyle} />

      <div className="relative z-10 flex items-center gap-1 px-5" style={{ color: data.textColor || '#fff' }}>
        {editing ? (
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full" style={{ fontSize: data.fontSize || 14, fontWeight: 600, color: data.textColor || '#fff' }} />
        ) : (
          <span style={{ fontSize: data.fontSize || 14, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>{data.label || 'Entrada/Saida'}</span>
        )}
      </div>

      {hasPdf && (
        <div className="absolute -top-1.5 right-2 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center ring-1 ring-slate-200 z-20">
          <FileText className="w-2.5 h-2.5 text-blue-600" />
        </div>
      )}
    </div>
  );
}
