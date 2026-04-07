import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, FileText, Download, Maximize, X, Loader2, ExternalLink, GitBranch, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// These color maps will now act as a 'best effort'. If an option is not found, a default gray will be used.
const departmentColors = {
  'Atenção Primária': "bg-blue-100 text-blue-700 border-blue-200",
  'Atenção Especializada': "bg-purple-100 text-purple-700 border-purple-200",
  'Saúde Mental': "bg-teal-100 text-teal-700 border-teal-200",
  'Vigilância em Saúde': "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const priorityColors = {
  'Baixa': "bg-green-100 text-green-800",
  'Média': "bg-yellow-100 text-yellow-800",
  'Alta': "bg-orange-100 text-orange-800",
  'Crítica': "bg-red-100 text-red-800"
};

const statusColors = {
  'Rascunho': "bg-gray-100 text-gray-800",
  'Revisão': "bg-yellow-100 text-yellow-800",
  'Aprovado': "bg-green-100 text-green-800",
  'Arquivado': "bg-slate-100 text-slate-800"
};

const defaultColor = "bg-gray-100 text-gray-800 border-gray-200";

const departmentColorsForSteps = {
  'Atenção Primária': "bg-blue-100 text-blue-700 border-blue-200",
  'Atenção Especializada': "bg-purple-100 text-purple-700 border-purple-200",
  'Saúde Mental': "bg-teal-100 text-teal-700 border-teal-200",
  'Vigilância em Saúde': "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function ProtocolViewer({ protocol, onOpenFlowchart }) {
  const [showPdfViewer, setShowPdfViewer] = React.useState(false);
  const [pdfObjectUrl, setPdfObjectUrl] = React.useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = React.useState(false);
  const [loadingStepPdf, setLoadingStepPdf] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedStep, setHighlightedStep] = React.useState(null);
  const stepRefs = React.useRef({});

  const hasFlowchart = protocol?.flowchart?.nodes?.length > 0;

  // Effect to clean up the object URL when the component unmounts or pdfObjectUrl changes
  React.useEffect(() => {
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
    };
  }, [pdfObjectUrl]);

  if (!protocol) return null;

  const buildViewableUrl = (originalUrl) => {
    // Try common parameters that might force inline viewing
    const url = new URL(originalUrl);
    
    // Remove any download-forcing parameters
    url.searchParams.delete('download');
    url.searchParams.delete('attachment');
    
    // Add parameters that might encourage inline viewing
    url.searchParams.set('view', 'inline');
    url.searchParams.set('inline', '1');
    url.searchParams.set('display', 'inline');
    
    return url.toString();
  };

  const handleViewPdf = async (openInNewTab = false) => {
    // If PDF is already loaded and an object URL exists, use it
    if (pdfObjectUrl) { 
      if (openInNewTab) {
        window.open(pdfObjectUrl, '_blank');
      } else {
        setShowPdfViewer(true);
      }
      return;
    }

    setIsLoadingPdf(true);
    let tempObjectUrl = null; // Store object URL for cleanup in error case if needed
    try {
      // Fetch the PDF as a blob to create a reliable object URL
      // This bypasses server headers that force downloads for the iframe embed.
      const viewableUrl = buildViewableUrl(protocol.pdf_url);
      
      const response = await fetch(viewableUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf', // Request PDF content type
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Ensure we're working with a PDF blob, explicitly setting the type
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      
      tempObjectUrl = URL.createObjectURL(pdfBlob);
      setPdfObjectUrl(tempObjectUrl); // Set the state variable only on success
      
      if (openInNewTab) {
        window.open(tempObjectUrl, '_blank');
      } else {
        setShowPdfViewer(true);
      }
    } catch (error) {
      console.error("Error loading PDF for viewing:", error);
      // Fallback: if fetching as a blob fails, try the direct URL approach with inline parameters.
      // This might still trigger a download in some browsers/server configurations, but it's a best effort.
      const directViewableUrl = buildViewableUrl(protocol.pdf_url);
      setPdfObjectUrl(directViewableUrl); // Set state to direct URL
      if (openInNewTab) {
        window.open(directViewableUrl, '_blank');
      } else {
        setShowPdfViewer(true);
      }
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleToggleViewer = () => {
    if (showPdfViewer) {
      setShowPdfViewer(false);
    } else {
      handleViewPdf(false); // Try to load and show the PDF viewer
    }
  };

  // New function to open step PDFs
  const openPdfForViewing = async (pdfUrl, index) => {
    setLoadingStepPdf(prev => ({ ...prev, [index]: true }));
    let tempObjectUrl = null;
    try {
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      tempObjectUrl = URL.createObjectURL(pdfBlob);
      window.open(tempObjectUrl, '_blank');
    } catch (error) {
      console.error("Failed to open PDF for viewing, falling back to direct URL:", error);
      window.open(pdfUrl, '_blank'); // Fallback to direct link
    } finally {
      setLoadingStepPdf(prev => ({ ...prev, [index]: false }));
      if (tempObjectUrl) {
        // Clean up the object URL after it's opened in a new tab.
        // There's no direct way to know when the new tab is closed, but this helps prevent memory leaks
        // if the current component unmounts and the URL is no longer needed.
        // A short delay might be beneficial to ensure the browser has time to load it.
        setTimeout(() => URL.revokeObjectURL(tempObjectUrl), 5000); 
      }
    }
  };


  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{protocol.title}</CardTitle>
          <CardDescription className="text-base">{protocol.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <Badge className={departmentColors[protocol.department] || defaultColor}>{protocol.department}</Badge>
            <Badge variant="outline" className={priorityColors[protocol.priority] || defaultColor}>{protocol.priority}</Badge>
            <Badge variant="outline" className={statusColors[protocol.status] || defaultColor}>{protocol.status}</Badge>
            <Badge variant="outline">{protocol.category}</Badge>
            {protocol.version && <Badge variant="secondary">v{protocol.version}</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {/* Documents Section */}
          {(protocol.pdf_url || hasFlowchart) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Documentos do Protocolo</h4>
                    <p className="text-sm text-blue-700">PDF e fluxograma interativo</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {hasFlowchart && (
                    <Button
                      variant="outline"
                      onClick={onOpenFlowchart}
                      className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
                    >
                      <GitBranch className="w-4 h-4" />
                      Ver Fluxograma
                    </Button>
                  )}
                  {protocol.pdf_url && (
                  <Button
                    variant="outline"
                    onClick={handleToggleViewer}
                    className="gap-2"
                    disabled={isLoadingPdf}
                  >
                    {isLoadingPdf && !showPdfViewer ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                    ) : showPdfViewer ? (
                      <>
                        <X className="w-4 h-4" />
                        Ocultar PDF
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Visualizar PDF
                      </>
                    )}
                  </Button>
                  )}
                  {protocol.pdf_url && (
                  <>
                  <Button
                    variant="outline"
                    onClick={() => handleViewPdf(true)}
                    className="gap-2"
                    disabled={isLoadingPdf}
                  >
                     {isLoadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize className="w-4 h-4" />}
                    Tela Cheia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = protocol.pdf_url;
                      link.download = `${protocol.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {showPdfViewer && pdfObjectUrl && ( // Only render iframe if viewer is active and object URL is ready
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Visualização do PDF</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPdfViewer(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <iframe
                  src={`${pdfObjectUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} // Use the generated object URL
                  className="w-full h-96 md:h-[70vh] border-0" // Responsive height for better viewing
                  title="Visualizador de PDF do Protocolo"
                />
              </div>
            </div>
          )}

          <div className="prose max-w-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Passos do Protocolo</h3>
              {protocol.steps && protocol.steps.length > 0 && (
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar passo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
            </div>
            {protocol.steps && protocol.steps.length > 0 ? (
              <ol className="space-y-4 list-none p-0">
                {protocol.steps.filter(step => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return step.title?.toLowerCase().includes(query) || 
                         step.description?.toLowerCase().includes(query) ||
                         step.department?.toLowerCase().includes(query);
                }).map((step, originalIndex) => {
                  const hasPdf = !!step.step_pdf_url;
                  
                  const StepContent = () => (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm mt-1">
                        {step.order || originalIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{step.title}</h4>
                          {step.department && (
                            <Badge className={`${departmentColorsForSteps[step.department] || defaultColor} text-xs`}>
                              {step.department}
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 mt-1">{step.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          {step.required && (
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-green-600" /> 
                              Obrigatório
                            </span>
                          )}
                          {step.estimated_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 
                              {step.estimated_time}
                            </span>
                          )}
                        </div>
                      </div>
                       {hasPdf && (
                        <div className="p-2 text-blue-500">
                          {loadingStepPdf[originalIndex] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-5 h-5" />
                          )}
                        </div>
                      )}
                    </div>
                  );

                  return (
                     <li
                       key={originalIndex}
                       ref={el => stepRefs.current[originalIndex] = el}
                       className={`transition-all duration-500 rounded-lg ${highlightedStep === originalIndex ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg scale-[1.01]' : ''}`}
                     >
                      {hasPdf ? (
                        <button
                          onClick={() => openPdfForViewing(step.step_pdf_url, originalIndex)}
                          disabled={loadingStepPdf[originalIndex]}
                          className="w-full text-left p-4 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          <StepContent />
                        </button>
                      ) : (
                        <div className="p-4 rounded-lg">
                           <StepContent />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-slate-500">Nenhum passo definido para este protocolo.</p>
            )}
            {protocol.steps && protocol.steps.length > 0 && searchQuery && protocol.steps.filter(step => {
              const query = searchQuery.toLowerCase();
              return step.title?.toLowerCase().includes(query) || 
                     step.description?.toLowerCase().includes(query) ||
                     step.department?.toLowerCase().includes(query);
            }).length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Nenhum passo encontrado com "{searchQuery}"</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-4 border-t text-sm text-slate-500">
            <p>Última atualização: {format(new Date(protocol.updated_date), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}</p>
            {protocol.created_by && <p>Criado por: {protocol.created_by}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}