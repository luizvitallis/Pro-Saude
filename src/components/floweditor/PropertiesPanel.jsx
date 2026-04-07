import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, X, Upload, FileText, Loader2 } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';

const NODE_COLORS = [
  { label: 'Verde-azulado', value: 'hsl(185, 55%, 40%)' },
  { label: 'Azul escuro', value: 'hsl(215, 60%, 38%)' },
  { label: 'Âmbar', value: 'hsl(38, 90%, 50%)' },
  { label: 'Vermelho', value: 'hsl(0, 65%, 50%)' },
  { label: 'Verde', value: 'hsl(142, 55%, 38%)' },
  { label: 'Cinza', value: 'hsl(215, 15%, 55%)' },
];

export default function PropertiesPanel({ selectedElement, onUpdate, onDelete, onClose }) {
  if (!selectedElement) return null;

  const isEdge = !!selectedElement.source;

  return (
    <div
      className="w-[240px] bg-white border-l flex-shrink-0 overflow-y-auto"
      style={{ borderColor: '#E2E8F0', animation: 'slideIn 200ms ease-out' }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#64748B' }}>
            {isEdge ? 'Conexão' : 'Propriedades'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X size={14} className="text-slate-400" />
          </button>
        </div>

        {isEdge ? (
          <EdgeProperties edge={selectedElement} onUpdate={onUpdate} onDelete={onDelete} />
        ) : (
          <NodeProperties node={selectedElement} onUpdate={onUpdate} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}

function NodeProperties({ node, onUpdate, onDelete }) {
  const data = node.data || {};

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Texto</Label>
        <Input
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="mt-1 h-8 text-sm"
        />
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Cor de Fundo</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {NODE_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onUpdate({ bgColor: c.value })}
              className="w-full aspect-square rounded-lg border-2 transition-all"
              style={{
                backgroundColor: c.value,
                borderColor: data.bgColor === c.value ? 'hsl(185, 60%, 32%)' : 'transparent',
                boxShadow: data.bgColor === c.value ? '0 0 0 2px hsla(185, 60%, 32%, 0.3)' : 'none',
              }}
              title={c.label}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={data.bgColor || 'hsl(185, 55%, 40%)'}
            onChange={(e) => onUpdate({ bgColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border"
          />
          <span className="text-xs text-slate-500">Personalizar</span>
        </div>
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Cor da Borda</Label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={data.borderColor || '#2d7a7a'}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border"
          />
          <span className="text-xs text-slate-500">{data.borderColor || 'Automática'}</span>
        </div>
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Cor do Texto</Label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={data.textColor || '#ffffff'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border"
          />
          <span className="text-xs text-slate-500">{data.textColor || '#ffffff'}</span>
        </div>
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Tamanho da Fonte</Label>
        <Input
          type="number"
          min={10}
          max={24}
          value={data.fontSize || 13}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 13 })}
          className="mt-1 h-8 text-sm w-20"
        />
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>PDF da Etapa</Label>
        <NodePdfUpload pdfUrl={data.pdfUrl} onUpdate={onUpdate} />
      </div>

      <Button variant="destructive" size="sm" onClick={onDelete} className="w-full gap-2">
        <Trash2 size={14} /> Remover Nó
      </Button>
    </div>
  );
}

function NodePdfUpload({ pdfUrl, onUpdate }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Apenas arquivos PDF.');
      return;
    }
    setUploading(true);
    try {
      const result = await UploadFile({ file });
      onUpdate({ pdfUrl: result.file_url });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Erro ao fazer upload.');
    } finally {
      setUploading(false);
    }
  };

  if (pdfUrl) {
    return (
      <div className="mt-1 flex items-center gap-1">
        <div className="flex-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1.5 truncate flex items-center gap-1">
          <FileText size={12} /> PDF anexado
        </div>
        <button onClick={() => onUpdate({ pdfUrl: '' })} className="p-1 hover:bg-red-50 rounded" title="Remover PDF">
          <X size={14} className="text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
      <Button variant="outline" size="sm" className="w-full mt-1 gap-1 text-xs" disabled={uploading}
        onClick={() => fileRef.current?.click()}>
        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
        {uploading ? 'Enviando...' : 'Anexar PDF'}
      </Button>
    </>
  );
}

function EdgeProperties({ edge, onUpdate, onDelete }) {
  const data = edge.data || {};

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Rótulo</Label>
        <Input
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="mt-1 h-8 text-sm"
          placeholder="Ex: Sim, Não"
        />
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Estilo da Linha</Label>
        <Select value={data.lineStyle || 'solid'} onValueChange={(v) => onUpdate({ lineStyle: v })}>
          <SelectTrigger className="mt-1 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Sólida</SelectItem>
            <SelectItem value="dashed">Tracejada</SelectItem>
            <SelectItem value="dotted">Pontilhada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>Cor da Linha</Label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={data.lineColor || '#374151'}
            onChange={(e) => onUpdate({ lineColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border"
          />
          <span className="text-xs text-slate-500">{data.lineColor || '#374151'}</span>
        </div>
      </div>

      <Button variant="destructive" size="sm" onClick={onDelete} className="w-full gap-2">
        <Trash2 size={14} /> Remover Conexão
      </Button>
    </div>
  );
}