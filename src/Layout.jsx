import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Heart,
  ChevronDown,
  PlusCircle,
  RefreshCw } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Protocol } from "@/entities/Protocol";
import { useAdmin } from "@/lib/AdminContext";

const pageTitles = {
  Dashboard: "Dashboard",
  Protocols: "Protocolos",
  ManageProtocols: "Gerenciar Protocolos",
  ProtocolDetail: "Detalhes do Protocolo",
  Settings: "Configuracoes"
};

const defaultUser = {
  full_name: "Administrador",
  email: "admin@pro-saude.com",
  department: "administracao",
  position: "Administrador do Sistema",
  role: "admin",
  avatar_url: null
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notifications, setNotifications] = React.useState([]);
  const [notifOpen, setNotifOpen] = React.useState(false);

  const { isAdmin, logout: adminLogout } = useAdmin();
  const currentUser = { ...defaultUser, role: isAdmin ? 'admin' : 'user' };

  React.useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const lastSeenAt = localStorage.getItem('notif_last_seen');
      const protocols = await Protocol.list('-updated_date', 30);
      const cutoff = lastSeenAt ? new Date(lastSeenAt) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const recent = protocols
        .map(p => {
          const updatedAt = new Date(p.updated_date);
          const createdAt = new Date(p.created_date);
          const isNew = createdAt > cutoff;
          const isUpdated = !isNew && updatedAt > cutoff;
          if (!isNew && !isUpdated) return null;
          return { ...p, _type: isNew ? 'new' : 'updated', _date: isNew ? createdAt : updatedAt };
        })
        .filter(Boolean)
        .sort((a, b) => b._date - a._date);

      setNotifications(recent);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const handleOpenNotifications = () => {
    setNotifOpen(v => {
      if (!v) {
        localStorage.setItem('notif_last_seen', new Date().toISOString());
        setTimeout(() => setNotifications([]), 300);
      }
      return !v;
    });
  };

  React.useEffect(() => {
    const translatedTitle = pageTitles[currentPageName] || currentPageName;
    document.title = translatedTitle === "Dashboard" ? "Pro-Saude" : `${translatedTitle} - Pro-Saude`;
  }, [currentPageName]);

  const navigationItems = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: LayoutDashboard,
        description: "Visao geral"
      }
    ];

    if (isAdmin) {
      items.push({
        title: "Gerenciar Protocolos",
        url: createPageUrl("ManageProtocols"),
        icon: FileText,
        description: "Criar e editar protocolos"
      });
      items.push({
        title: "Configuracoes",
        url: createPageUrl("Settings"),
        icon: Settings,
        description: "Ajustes do sistema"
      });
    } else {
      items.push({
        title: "Protocolos",
        url: createPageUrl("Protocols"),
        icon: FileText,
        description: "Consultar protocolos"
      });
    }

    return items;
  }, [isAdmin]);

  const translatedTitle = pageTitles[currentPageName] || currentPageName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
          --success-gradient: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          --warning-gradient: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
          --danger-gradient: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
          --purple-gradient: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
          --surface-gradient: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);
        }

        .gradient-primary {
          background: var(--primary-gradient);
        }

        .gradient-surface {
          background: var(--surface-gradient);
        }

        .sidebar-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl sidebar-transition transform lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
        }>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 gradient-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Pro-Saude</h1>
                <p className="text-xs text-blue-100">Protocolos de Saude</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover-lift ${
                    isActive ?
                    'gradient-primary text-white shadow-lg' :
                    'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                    }>
                    <item.icon className="w-5 h-5" />
                    <div>
                      <div>{item.title}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>);
              })}
            </nav>
          </div>

          {/* Info Badge */}
          <div className="p-4">
            <div className={`bg-gradient-to-r ${isAdmin ? 'from-purple-50 to-indigo-50 border-purple-100' : 'from-blue-50 to-indigo-50 border-blue-100'} rounded-xl p-4 border`}>
              <div className="flex items-center justify-between mb-2">
                <Badge className={isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                  {isAdmin ? 'Administrador' : 'Acesso Livre'}
                </Badge>
                {isAdmin && (
                  <button onClick={adminLogout} className="text-xs text-slate-500 hover:text-red-600 transition-colors">
                    Sair
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600">
                {isAdmin ? 'Acesso completo ao sistema' : 'Consulta de protocolos'}
              </p>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen &&
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
        }

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {/* Header */}
          <header className="glass-effect border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-slate-100"
                  onClick={() => setSidebarOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{translatedTitle}</h2>
                  <p className="text-sm text-slate-500">
                    Pro-Saude - Protocolos de Saude
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar protocolos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 border-slate-200 focus:border-blue-300 focus:ring-blue-100" />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="icon" className="relative hover:bg-slate-100" onClick={handleOpenNotifications}>
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </Button>

                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900">Notificacoes</h3>
                          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setNotifOpen(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <ScrollArea className="max-h-80">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-sm">
                              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              Nenhuma novidade recente
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {notifications.map(n => (
                                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${n._type === 'new' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    {n._type === 'new'
                                      ? <PlusCircle className="w-4 h-4 text-green-600" />
                                      : <RefreshCw className="w-4 h-4 text-blue-600" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {n._type === 'new' ? 'Novo protocolo adicionado' : 'Protocolo atualizado'}
                                      {' · '}
                                      {n._date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {React.cloneElement(children, { currentUser })}
          </main>
        </div>
      </div>
    </div>);
}
