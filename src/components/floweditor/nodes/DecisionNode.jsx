import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText } from 'lucide-react';

const handleStyle = '!w-[7px] !h-[7px] !bg-white/40 !border-0 !rounded-full';

export default function DecisionNode({ data, selected }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Decisao');

  const handleDoubleClick = useCallback(() => { if (data.readOnly) return; setEditing(true); }, [data.readOnly]);
  const handleBlur = useCallback(() => { setEditing(false); data.onLabelChange?.(text); }, [text, data]);
  const handleKeyDown = useCallback((e) => { if (e.key === 'Enter') { setEditing(false); data.onLabelChange?.(text); } }, [text, data]);

  const bgColor = data.bgColor || 'hsl(38, 90%, 50%)';
  const borderColor = data.borderColor || 'hsl(38, 90%, 40%)';
  const size = 130;
  const hasPdf = !!data.pdfUrl;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 1.3, height: size * 1.3, cursor: data.readOnly ? 'pointer' : 'grab' }}
      onDoubleClick={handleDoubleClick}
    >
      <svg width="100%" height="100%" viewBox="0 0 169 169" className="absolute inset-0" style={{ filter: selected ? 'drop-shadow(0 0 6px rgba(96,165,250,0.4))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.1))' }}>
        <polygon
          points="84.5,8 161,84.5 84.5,161 8,84.5"
          fill={bgColor}
          stroke={selected ? '#60a5fa' : 'rgba(255,255,255,0.18)'}
          strokeWidth={selected ? 2 : 1}
        />
        <polygon
          points="84.5,12 157,84.5 84.5,157 12,84.5"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      </svg>

      <Handle type="target" position={Position.Top} className={handleStyle} style={{ top: 8 }} />
      <Handle type="source" position={Position.Bottom} className={handleStyle} style={{ bottom: 8 }} />
      <Handle type="target" position={Position.Left} id="left-target" className={handleStyle} style={{ left: 8 }} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleStyle} style={{ right: 8 }} />

      <div className="relative z-10 flex items-center gap-1 px-8" style={{ color: data.textColor || '#fff', maxWidth: '65%' }}>
        {editing ? (
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-center w-full" style={{ fontSize: data.fontSize || 13, fontWeight: 600, color: data.textColor || '#fff' }} />
        ) : (
          <span className="text-center leading-tight" style={{ fontSize: data.fontSize || 13, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>{data.label || 'Decisao'}</span>
        )}
      </div>

      {hasPdf && (
        <div className="absolute top-1 right-6 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center ring-1 ring-slate-200 z-20">
          <FileText className="w-2.5 h-2.5 text-blue-600" />
        </div>
      )}
    </div>
  );
}
