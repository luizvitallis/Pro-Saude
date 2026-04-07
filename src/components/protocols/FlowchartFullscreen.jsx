import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, X, FileText, Download, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlowEditor from '../floweditor/FlowEditor';

export default function FlowchartFullscreen({ protocol, onBack }) {
  const [pdfPopup, setPdfPopup] = useState(null); // { url, label }
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleNodeClick = useCallback((node) => {
    const pdfUrl = node.data?.pdfUrl;
    const label = node.data?.label || 'Etapa';

    if (pdfUrl) {
      setPdfPopup({ url: pdfUrl, label });
      setPdfObjectUrl(null);
      loadPdf(pdfUrl);
    }
  }, []);

  const loadPdf = async (url) => {
    setLoadingPdf(true);
    try {
      const response = await fetch(url, { headers: { 'Accept': 'application/pdf' } });
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(pdfBlob);
      setPdfObjectUrl(objectUrl);
    } catch {
      // Fallback: use direct URL
      setPdfObjectUrl(url);
    } finally {
      setLoadingPdf(false);
    }
  };

  const closePdfPopup = useCallback(() => {
    if (pdfObjectUrl && pdfObjectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfObjectUrl);
    }
    setPdfPopup(null);
    setPdfObjectUrl(null);
  }, [pdfObjectUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <h2 className="font-semibold text-slate-800 text-sm truncate">
            {protocol.title} - Fluxograma
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:block">
          Clique em uma etapa com PDF para visualizar
        </span>
      </div>

      {/* Flowchart */}
      <div className="flex-1 relative">
        <FlowEditor
          initialFlow={protocol.flowchart}
          readOnly
          onSave={() => {}}
          onCancel={() => {}}
          onExternalNodeClick={handleNodeClick}
        />
      </div>

      {/* PDF Popup */}
      {pdfPopup && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={closePdfPopup} />
          <div className="fixed inset-4 sm:inset-8 lg:inset-16 z-[70] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Popup Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <h3 className="font-semibold text-slate-800 truncate">{pdfPopup.label}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="gap-1"
                  onClick={() => window.open(pdfPopup.url, '_blank')}>
                  <ExternalLink className="w-3 h-3" /> Abrir em nova aba
                </Button>
                <Button variant="outline" size="sm" className="gap-1"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfPopup.url;
                    link.download = `${pdfPopup.label.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                    link.click();
                  }}>
                  <Download className="w-3 h-3" /> Download
                </Button>
                <button onClick={closePdfPopup} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 bg-slate-100">
              {loadingPdf ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Carregando PDF...</p>
                  </div>
                </div>
              ) : pdfObjectUrl ? (
                <iframe
                  src={`${pdfObjectUrl}#view=FitH&toolbar=1&navpanes=0`}
                  className="w-full h-full border-0"
                  title={`PDF - ${pdfPopup.label}`}
                />
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
