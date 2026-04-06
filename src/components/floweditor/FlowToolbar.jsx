import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Download, Upload, Trash2, Save, XCircle, Eye, Grid3X3,
} from 'lucide-react';

function ToolbarButton({ icon: Icon, label, onClick, disabled, active }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-md transition-colors duration-150 disabled:opacity-40 ${
              active ? 'bg-slate-200' : 'hover:bg-slate-100'
            }`}
          >
            <Icon size={18} className="text-slate-600" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Separator() {
  return <div className="w-px h-6 mx-1" style={{ backgroundColor: '#E2E8F0' }} />;
}

export default function FlowToolbar({
  onUndo, onRedo, canUndo, canRedo,
  onZoomIn, onZoomOut, onFitView,
  onExportJSON, onImportJSON, onExportPNG,
  onClear, onSave, onCancel,
  snapToGrid, onToggleSnap,
  readOnly, onToggleReadOnly,
}) {
  const fileInputRef = React.useRef(null);

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onImportJSON(data);
      } catch {
        alert('Arquivo JSON inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="flex items-center gap-0.5 px-3 bg-white border-b flex-shrink-0"
      style={{ height: 52, borderColor: '#E2E8F0' }}
    >
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <ToolbarButton icon={Undo2} label="Desfazer (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} />
      <ToolbarButton icon={Redo2} label="Refazer (Ctrl+Y)" onClick={onRedo} disabled={!canRedo} />

      <Separator />

      <ToolbarButton icon={ZoomIn} label="Zoom +" onClick={onZoomIn} />
      <ToolbarButton icon={ZoomOut} label="Zoom −" onClick={onZoomOut} />
      <ToolbarButton icon={Maximize2} label="Ajustar à tela" onClick={onFitView} />

      <Separator />

      <ToolbarButton icon={Grid3X3} label="Snap to Grid" onClick={onToggleSnap} active={snapToGrid} />
      <ToolbarButton icon={Eye} label="Modo leitura" onClick={onToggleReadOnly} active={readOnly} />

      <Separator />

      <ToolbarButton icon={Download} label="Exportar JSON" onClick={onExportJSON} />
      <ToolbarButton icon={Upload} label="Importar JSON" onClick={handleImportClick} />
      <ToolbarButton icon={Trash2} label="Limpar tela" onClick={onClear} />

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1 text-slate-600">
        <XCircle size={16} /> Cancelar
      </Button>
      <Button size="sm" onClick={onSave} className="gap-1 ml-2" style={{ background: 'hsl(185, 60%, 32%)' }}>
        <Save size={16} /> Salvar
      </Button>
    </div>
  );
}