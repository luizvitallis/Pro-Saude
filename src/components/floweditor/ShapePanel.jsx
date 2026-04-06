import React from 'react';

const shapes = [
  {
    type: 'process',
    label: 'PROCESSO',
    description: 'Ação / Etapa',
    preview: (
      <svg width="48" height="32" viewBox="0 0 48 32">
        <rect x="2" y="2" width="44" height="28" rx="6" fill="hsl(185, 55%, 40%)" stroke="hsl(185, 55%, 30%)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'decision',
    label: 'DECISÃO',
    description: 'Condição',
    preview: (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <polygon points="24,4 44,24 24,44 4,24" fill="hsl(38, 90%, 50%)" stroke="hsl(38, 90%, 40%)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'terminal',
    label: 'INÍCIO / FIM',
    description: 'Terminal',
    preview: (
      <svg width="48" height="32" viewBox="0 0 48 32">
        <ellipse cx="24" cy="16" rx="22" ry="14" fill="hsl(215, 60%, 38%)" stroke="hsl(215, 60%, 28%)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'io',
    label: 'ENTRADA/SAÍDA',
    description: 'Dados',
    preview: (
      <svg width="48" height="32" viewBox="0 0 48 32">
        <polygon points="10,0 48,0 38,32 0,32" fill="hsl(185, 55%, 40%)" stroke="hsl(185, 55%, 30%)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'subprocess',
    label: 'SUBPROCESSO',
    description: 'Referência',
    preview: (
      <svg width="48" height="32" viewBox="0 0 48 32">
        <rect x="2" y="2" width="44" height="28" rx="1" fill="hsl(215, 15%, 55%)" stroke="hsl(215, 15%, 45%)" strokeWidth="1.5" />
        <line x1="8" y1="2" x2="8" y2="30" stroke="hsl(215, 15%, 45%)" strokeWidth="1" opacity="0.5" />
        <line x1="40" y1="2" x2="40" y2="30" stroke="hsl(215, 15%, 45%)" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
];

export default function ShapePanel({ onAddNode }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[180px] bg-white border-r flex-shrink-0 overflow-y-auto" style={{ borderColor: '#E2E8F0' }}>
      <div className="p-3">
        <h3 className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#64748B' }}>
          Formas
        </h3>
        <div className="space-y-2">
          {shapes.map((shape) => (
            <div
              key={shape.type}
              draggable
              onDragStart={(e) => onDragStart(e, shape.type)}
              onClick={() => onAddNode(shape.type)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-transparent cursor-grab active:cursor-grabbing transition-all duration-150"
              style={{ ':hover': { background: '#F8FAFC' } }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              {shape.preview}
              <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color: '#64748B' }}>
                {shape.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}