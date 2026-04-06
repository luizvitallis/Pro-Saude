import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Protocol } from '@/entities/Protocol';

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

export default function RecentProtocols({ currentUser }) {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentProtocols = async () => {
      try {
        const data = await Protocol.list('-updated_date', 5);
        
        // Se for usuário comum, mostrar apenas protocolos aprovados
        let filteredData = data || [];
        if (currentUser?.role !== 'admin') {
          filteredData = filteredData.filter(p => p.status === 'Aprovado');
        }
        
        setProtocols(filteredData);
      } catch (error) {
        console.error('Error loading recent protocols:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentProtocols();
  }, [currentUser]);

  // Definir URL baseado no perfil
  const getProtocolsUrl = () => {
    return currentUser?.role === 'admin' ? createPageUrl("ManageProtocols") : createPageUrl("Protocols");
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Protocolos Recentes
        </CardTitle>
        <Link to={getProtocolsUrl()}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : protocols.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">
              {currentUser?.role === 'admin' ? 'Nenhum protocolo encontrado' : 'Nenhum protocolo aprovado'}
            </p>
            <p className="text-sm text-slate-400">
              {currentUser?.role === 'admin' ? 'Crie seu primeiro protocolo para vê-lo aqui' : 'Aguarde a aprovação de protocolos pelos administradores'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {protocols.map((protocol) => (
              <Link
                key={protocol.id}
                to={createPageUrl('ProtocolDetail') + `?id=${protocol.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 hover-lift">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${departmentColors[protocol.department] || defaultColor} bg-opacity-50`}>
                      {protocol.priority === 'Crítica' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">
                        {protocol.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${departmentColors[protocol.department] || defaultColor}`}>
                          {protocol.department}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${priorityColors[protocol.priority] || defaultColor}`}>
                          {protocol.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${statusColors[protocol.status] || defaultColor}`}>
                          {protocol.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(protocol.updated_date), 'dd MMM', { locale: ptBR })}
                        </span>
                        {protocol.created_by && <span>por {protocol.created_by}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}