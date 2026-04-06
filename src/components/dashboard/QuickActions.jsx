import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions({ currentUser }) {
  const quickActions = React.useMemo(() => {
    if (!currentUser) return [];

    const actions = [];

    if (currentUser.role === 'admin') {
      // Ações para administradores
      actions.push(
        {
          title: "Novo Protocolo",
          description: "Criar protocolo de atendimento", 
          icon: Plus,
          color: "gradient-primary",
          href: createPageUrl("ManageProtocols") + "?action=new"
        },
        {
          title: "Gerenciar Protocolos",
          description: "Editar protocolos existentes",
          icon: FileText,
          color: "bg-blue-500",
          href: createPageUrl("ManageProtocols")
        },
        {
          title: "Configurações",
          description: "Personalizar sistema",
          icon: Settings,
          color: "bg-slate-500", 
          href: createPageUrl("Settings")
        }
      );
    } else {
      // Ações para usuários
      actions.push(
        {
          title: "Ver Protocolos",
          description: "Consultar protocolos aprovados",
          icon: BookOpen,
          color: "gradient-primary",
          href: createPageUrl("Protocols")
        }
      );
    }

    return actions;
  }, [currentUser]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button
                variant="outline"
                className="h-auto p-4 w-full justify-start hover-lift border border-slate-200 hover:border-blue-300"
              >
                <div className={`p-2 rounded-lg mr-3 ${action.color} text-white`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-slate-900">{action.title}</div>
                  <div className="text-sm text-slate-500 mt-1">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}