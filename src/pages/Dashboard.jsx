
import React, { useState, useEffect } from "react";
import { Protocol, User } from "@/entities/all";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity } from
"lucide-react";

import MetricCard from "../components/dashboard/MetricCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProtocols from "../components/dashboard/RecentProtocols";

export default function Dashboard({ currentUser }) {
  const [protocols, setProtocols] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [protocolData, userData] = await Promise.all([
      Protocol.list('-updated_date', 50),
      User.list('-created_date', 50)]
      );

      setProtocols(protocolData || []);
      setUsers(userData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approvedProtocols = protocols.filter((p) => p.status === 'Aprovado').length;
  const criticalProtocols = protocols.filter((p) => p.priority === 'Crítica').length;
  const pendingReview = protocols.filter((p) => p.status === 'Revisão').length;
  const activeUsers = users.length;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-full">
      {/* Welcome Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5 rounded-2xl"></div>
        <div className="relative p-8 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo ao Pro-Saúde
              </h1>
              <p className="text-slate-600 text-lg">
                Gerencie protocolos de saúde com eficiência e segurança
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Sistema online
                </div>
                <div className="text-sm text-slate-500">
                  Última sincronização: agora
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 gradient-primary rounded-full opacity-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Protocolos Aprovados"
          value={approvedProtocols}
          icon={CheckCircle}
          gradient="gradient-primary"
          trend="up"
          trendValue="+12%"
          subtitle={`${protocols.length} total`} />

        
        <MetricCard
          title="Protocolos Críticos"
          value={criticalProtocols}
          icon={AlertTriangle}
          gradient="bg-gradient-to-r from-red-500 to-red-600"
          badge="Atenção"
          subtitle="Requerem atenção" />

        
        <MetricCard
          title="Em Revisão"
          value={pendingReview}
          icon={Clock}
          gradient="bg-gradient-to-r from-yellow-500 to-amber-600"
          subtitle="Aguardando aprovação" />

        
        <MetricCard
          title="Usuários Ativos"
          value={activeUsers}
          icon={Users}
          gradient="bg-gradient-to-r from-purple-500 to-indigo-600"
          subtitle="Na plataforma" />

      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <QuickActions currentUser={currentUser} />
        </div>
        
        <div className="lg:col-span-2">
          <RecentProtocols />
        </div>
      </div>

      {/* Department Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-red-900">UTI</h3>
              <p className="text-sm text-red-700">Unidade de Terapia Intensiva</p>
            </div>
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-800">Protocolos Ativos:</span>
              <span className="font-medium text-red-900">
                {protocols.filter((p) => p.department === 'uti' && p.status === 'Aprovado').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-800">Em Revisão:</span>
              <span className="font-medium text-red-900">
                {protocols.filter((p) => p.department === 'uti' && p.status === 'Revisão').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-orange-900">Emergência</h3>
              <p className="text-sm text-orange-700">Pronto Socorro</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-orange-800">Protocolos Ativos:</span>
              <span className="font-medium text-orange-900">
                {protocols.filter((p) => p.department === 'emergencia' && p.status === 'Aprovado').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-800">Críticos:</span>
              <span className="font-medium text-orange-900">
                {protocols.filter((p) => p.department === 'emergencia' && p.priority === 'Crítica').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-blue-900">Ambulatório</h3>
              <p className="text-sm text-blue-700">Consultas Externas</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-800">Protocolos Ativos:</span>
              <span className="font-medium text-blue-900">
                {protocols.filter((p) => p.department === 'ambulatorio' && p.status === 'Aprovado').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-800">Total:</span>
              <span className="font-medium text-blue-900">
                {protocols.filter((p) => p.department === 'ambulatorio').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
