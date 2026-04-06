import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Protocol } from "@/entities/Protocol";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Printer, Share2, GitBranch } from "lucide-react";
import ProtocolViewer from "../components/protocols/ProtocolViewer";
import ProtocolEditor from "../components/protocols/ProtocolEditor";
import FlowEditor from "../components/floweditor/FlowEditor";
import { createPageUrl } from "@/utils";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ProtocolDetail() {
  const navigate = useNavigate();
  const query = useQuery();
  const protocolId = query.get('id');
  const isEditMode = query.get('edit') === 'true';

  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [isEditingFlowchart, setIsEditingFlowchart] = useState(false);

  useEffect(() => {
    if (protocolId) {
      loadProtocol();
    } else {
      setLoading(false);
    }
  }, [protocolId]);

  const loadProtocol = async () => {
    setLoading(true);
    try {
      const data = await Protocol.get(protocolId);
      setProtocol(data);
    } catch (error) {
      console.error("Failed to load protocol:", error);
      setProtocol(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData) => {
    try {
      await Protocol.update(protocolId, updatedData);
      setIsEditing(false);
      loadProtocol(); // Recarregar para ver os dados salvos
    } catch (error) {
      console.error("Failed to save protocol:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Carregando protocolo...</div>;
  }

  if (!protocol) {
    return <div className="p-6 text-center text-red-500">Protocolo não encontrado.</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Protocols"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Protocolos
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
          <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Compartilhar</Button>
          {!isEditing && !isEditingFlowchart && (
            <>
              <Button onClick={() => setIsEditingFlowchart(true)} variant="outline" className="gap-2">
                <GitBranch className="w-4 h-4" /> Fluxograma
              </Button>
              <Button onClick={() => setIsEditing(true)} className="gradient-primary">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <ProtocolEditor protocol={protocol} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : isEditingFlowchart ? (
        <div style={{ height: 'calc(100vh - 140px)' }}>
          <FlowEditor
            initialFlow={protocol.flowchart}
            onSave={async (flowchartData) => {
              await Protocol.update(protocolId, { flowchart: flowchartData });
              setIsEditingFlowchart(false);
              loadProtocol();
            }}
            onCancel={() => setIsEditingFlowchart(false)}
          />
        </div>
      ) : (
        <ProtocolViewer protocol={protocol} />
      )}
    </div>
  );
}