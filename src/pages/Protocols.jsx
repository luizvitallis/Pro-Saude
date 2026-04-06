import React, { useState, useEffect } from "react";
import { Protocol } from "@/entities/Protocol";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  AlertCircle,
  BookOpen
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CustomOption } from "@/entities/CustomOption";

// Color maps for graceful fallback
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

export default function Protocols({ currentUser }) {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [options, setOptions] = useState({ departments: [], statuses: [], priorities: [] });

  useEffect(() => {
    loadProtocols();
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [depts, stats, prios] = await Promise.all([
        CustomOption.filter({ listName: 'department_options' }),
        CustomOption.filter({ listName: 'status_options' }),
        CustomOption.filter({ listName: 'priority_options' }),
      ]);
      setOptions({
        departments: depts[0]?.options || [],
        statuses: stats[0]?.options || [],
        priorities: prios[0]?.options || [],
      });
    } catch (error) {
      console.error("Failed to fetch custom options:", error);
    }
  };

  const loadProtocols = async () => {
    try {
      // Usuários só veem protocolos aprovados
      const data = await Protocol.list('-updated_date');
      const approvedProtocols = data?.filter(p => p.status === 'Aprovado') || [];
      setProtocols(approvedProtocols);
    } catch (error) {
      console.error('Error loading protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const depts = Array.isArray(protocol.department) ? protocol.department : [protocol.department];
    const matchesDepartment = departmentFilter === "all" || depts.includes(departmentFilter);
    const matchesStatus = statusFilter === "all" || protocol.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || protocol.priority === priorityFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Protocolos de Saúde</h1>
          <p className="text-slate-600">
            Consulte os protocolos aprovados para utilização
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <BookOpen className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">Apenas protocolos aprovados</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por título, descrição ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-300"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {options.departments.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {options.priorities.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{protocols.length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-orange-600">
                  {protocols.filter(p => p.priority === 'Alta').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {protocols.filter(p => p.priority === 'Crítica').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocols List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Carregando protocolos...</p>
          </div>
        ) : filteredProtocols.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery || departmentFilter !== "all" || priorityFilter !== "all" 
                  ? "Nenhum protocolo encontrado" 
                  : "Nenhum protocolo aprovado disponível"}
              </h3>
              <p className="text-slate-500">
                {searchQuery || departmentFilter !== "all" || priorityFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Aguarde a aprovação de novos protocolos pelos administradores"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProtocols.map((protocol) => (
            <Link key={protocol.id} to={createPageUrl('ProtocolDetail') + `?id=${protocol.id}`}>
              <Card className="shadow-sm border-0 hover-lift hover:border-blue-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${departmentColors[protocol.department] || defaultColor} bg-opacity-50`}>
                      {protocol.priority === 'Crítica' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 hover:text-blue-600">
                        {protocol.title}
                      </h3>
                      
                      {protocol.description && (
                        <p className="text-slate-600 mb-3 line-clamp-2">
                          {protocol.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {(Array.isArray(protocol.department) ? protocol.department : [protocol.department]).map((dept, idx) => (
                          <Badge key={idx} className={`${departmentColors[dept] || defaultColor}`}>
                            {dept}
                          </Badge>
                        ))}
                        <Badge variant="outline" className={`${priorityColors[protocol.priority] || defaultColor}`}>
                          {protocol.priority}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          Aprovado
                        </Badge>
                        <Badge variant="outline">
                          {protocol.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Atualizado {format(new Date(protocol.updated_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {protocol.version && (
                          <span>v{protocol.version}</span>
                        )}
                        {protocol.steps && (
                          <span>{protocol.steps.length} passos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}