import React, { useState } from 'react';
import { User, UserRole, EmailNotification, ThemeMode } from '../../types';

interface TopNavBarProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSimulator: () => void;
  notifications: EmailNotification[];
  onOpenMobileMenu: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectNotification: (notif: EmailNotification) => void;
  onLogout?: () => void;
  onNavigateToTab?: (tab: string) => void;
  isSupabaseConnected?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentUser,
  onRoleChange,
  theme,
  onToggleTheme,
  onOpenSimulator,
  notifications,
  onOpenMobileMenu,
  searchTerm,
  onSearchChange,
  onSelectNotification,
  onLogout,
  onNavigateToTab,
  isSupabaseConnected = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 right-0 z-30 w-full lg:pl-72 p-2 sm:p-3 lg:px-6 lg:pt-3 lg:pb-1.5 transition-all duration-300">
      <div
        className={`w-full mx-auto px-3.5 sm:px-5 h-14 sm:h-16 rounded-full backdrop-blur-2xl border transition-all duration-300 flex items-center justify-between shadow-xl gap-2 sm:gap-3 ${
          isDark
            ? 'bg-[#141b2d]/90 border-white/15 shadow-black/50 ring-1 ring-white/10'
            : 'bg-white/95 border-slate-200 shadow-slate-200/80 ring-1 ring-slate-200/60'
        }`}
      >
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs md:max-w-md">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full lg:hidden transition-all cursor-pointer border flex items-center justify-center shrink-0 ${
              isDark
                ? 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
            }`}
            aria-label="Abrir Menu"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">menu</span>
          </button>

          <div className="relative w-full">
            <span
              className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-base sm:text-lg pointer-events-none ${
                isDark ? 'text-[#869397]' : 'text-slate-400'
              }`}
            >
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar aulas, protocolos TC..."
              className={`w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 rounded-full text-xs sm:text-sm outline-none transition-all ${
                isDark
                  ? 'bg-[#0a0e17]/80 border border-white/10 text-[#dfe2ef] placeholder:text-[#869397] focus:border-[#4cd7f6] focus:ring-2 focus:ring-[#4cd7f6]/20'
                  : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-600/15'
              }`}
            />
          </div>
        </div>

        {/* Center: Brand Context (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <span
            className={`text-xs sm:text-sm font-bold font-['Plus_Jakarta_Sans'] ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            Biorad Cursos
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
              isDark
                ? 'bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30'
                : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
            }`}
          >
            Cursos 40h
          </span>
        </div>

        {/* Right Side: Role, Theme, Simulator CTA, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Role Pill Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm whitespace-nowrap shrink-0 ${
              currentUser.role === 'student'
                ? isDark
                  ? 'bg-cyan-500/15 border-cyan-400/30 text-[#4cd7f6]'
                  : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                : currentUser.role === 'professor'
                ? isDark
                  ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : isDark
                ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentUser.role === 'student'
                  ? 'bg-[#4cd7f6] animate-pulse'
                  : currentUser.role === 'professor'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-bold text-[11px]">
              {currentUser.role === 'student'
                ? 'Aluno'
                : currentUser.role === 'professor'
                ? 'Professor'
                : 'Admin'}
            </span>
          </div>

          {/* Supabase Status Indicator (Admin only) */}
          {currentUser.role === 'admin' ? (
            onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('configuracoes')}
                title={isSupabaseConnected ? 'Supabase Conectado' : 'Supabase Desconectado'}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-sm whitespace-nowrap shrink-0 ${
                  isSupabaseConnected
                    ? isDark
                      ? 'bg-[#3ecf8e]/10 hover:bg-[#3ecf8e]/20 border-[#3ecf8e]/40 text-[#4edea3]'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : isDark
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                }`}
              >
                <span className="material-symbols-outlined text-sm">database</span>
                <span className="hidden md:inline">
                  {isSupabaseConnected ? 'Supabase Ativo' : 'Configurar DB'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-[#4edea3] animate-pulse' : 'bg-amber-400'}`} />
              </button>
            )
          ) : (
            <div
              title="Portal Conectado"
              className={`hidden lg:flex items-center gap-1.5 px-3 h-9 rounded-full text-[11px] font-medium border opacity-80 whitespace-nowrap shrink-0 ${
                isSupabaseConnected
                  ? isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isDark ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-sm">cloud_done</span>
              <span>Online</span>
            </div>
          )}

          {/* Quick Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all flex items-center justify-center cursor-pointer border shadow-sm shrink-0 ${
              isDark
                ? 'bg-[#1c2333] border-white/10 text-amber-300 hover:text-amber-200 hover:bg-[#252d40]'
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Virtual CT Lab Simulator Button */}
          <button
            type="button"
            onClick={onOpenSimulator}
            title="Abrir Simulador Canon Activion 16"
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 h-9 sm:h-10 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-sm whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-[#4cd7f6]/15 hover:bg-[#4cd7f6]/25 border-[#4cd7f6]/40 text-[#4cd7f6]'
                : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">precision_manufacturing</span>
            <span className="hidden sm:inline">Simulador TC</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all relative cursor-pointer border shadow-sm flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-[#1c2333] border-white/10 text-[#bcc9cd] hover:text-[#4cd7f6] hover:bg-[#252d40]'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-cyan-700 hover:bg-slate-200'
              }`}
              title="Notificações e Avisos"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-3 w-80 md:w-96 rounded-[32px] shadow-2xl p-4 z-50 border backdrop-blur-2xl animate-fade-in ${
                  isDark ? 'bg-[#141c2e]/95 border-white/15 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/15 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-lg">mail</span>
                    <h4 className="text-sm font-bold">Notificações Acadêmicas</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#4edea3] bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {unreadCount} novas
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onSelectNotification(n);
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        !n.isRead
                          ? isDark ? 'bg-[#1c273e] border-[#4cd7f6]/40 text-white shadow-md' : 'bg-cyan-50/80 border-cyan-200 text-slate-900'
                          : isDark ? 'bg-[#0a0e17]/50 border-white/5 text-gray-300 hover:bg-white/5' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className={`truncate flex-1 ${isDark ? 'text-[#4cd7f6]' : 'text-cyan-700'}`}>{n.subject}</span>
                        <span className="text-[10px] text-gray-400 font-mono ml-2 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className={`text-[11px] line-clamp-2 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Capsule */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-1 sm:pr-3 rounded-full transition-all cursor-pointer border shadow-sm shrink-0 ${
                isDark ? 'bg-[#1c2333] border-white/10 hover:border-cyan-400/40' : 'bg-slate-100 border-slate-200 hover:border-cyan-400'
              }`}
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-400/40 ring-2 ring-cyan-400/20"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
              </div>
              <div className="text-left hidden sm:block">
                <p
                  className={`text-xs font-bold leading-tight truncate max-w-[100px] ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {currentUser.name}
                </p>
                <p className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${
                  currentUser.role === 'student'
                    ? 'text-cyan-400'
                    : currentUser.role === 'professor'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {currentUser.role === 'student' ? 'Aluno' : currentUser.role === 'professor' ? 'Professor' : 'Admin'}
                </p>
              </div>
              <span className="material-symbols-outlined text-xs text-gray-400 hidden sm:inline">
                expand_more
              </span>
            </button>

            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-3 w-72 rounded-[32px] shadow-2xl p-4 z-50 text-xs border backdrop-blur-2xl animate-fade-in ${
                  isDark ? 'bg-[#141c2e]/95 border-white/15 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
                }`}
              >
                <div className="px-2 py-2 border-b border-slate-200/15 mb-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm truncate">{currentUser.name}</p>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {currentUser.role === 'student' ? 'Aluno' : currentUser.role === 'professor' ? 'Professor' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] font-mono mt-0.5">{currentUser.enrollmentId}</p>
                  <p className="text-[11px] text-[#4cd7f6] truncate">{currentUser.email}</p>
                </div>

                <div className="space-y-1.5 py-1 text-xs">
                  <div className="px-2 py-1 flex items-center justify-between text-slate-400">
                    <span>Especialidade:</span>
                    <span className="font-semibold text-slate-200 text-right truncate max-w-[130px]">{currentUser.specialty || 'Radiologia'}</span>
                  </div>
                  <div className="px-2 py-1 flex items-center justify-between text-slate-400">
                    <span>Acesso:</span>
                    <span className="font-semibold text-emerald-400 uppercase text-[11px]">
                      {currentUser.role === 'student' ? 'Discente' : currentUser.role === 'professor' ? 'Docente' : 'Administrador'}
                    </span>
                  </div>
                </div>

                {/* Alternar Perfil */}
                <div className="pt-2 mt-2 border-t border-slate-200/10">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-cyan-400">switch_account</span>
                    Alternar Perfil:
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onRoleChange('admin');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-full flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-amber-400">shield_person</span>
                        <span>Ben Moran (Admin)</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-amber-400">Gestão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onRoleChange('professor');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-full flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        currentUser.role === 'professor'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-emerald-400">school</span>
                        <span>Prof. Marcus (Docente)</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-emerald-400">Aulas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onRoleChange('student');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-full flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        currentUser.role === 'student'
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-cyan-400">person</span>
                        <span>Lucas Mendonça (Aluno)</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-cyan-400">Estudo</span>
                    </button>
                  </div>
                </div>

                {onLogout && (
                  <div className="pt-2 mt-2 border-t border-slate-200/10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-full hover:bg-red-500/15 text-red-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Encerrar Sessão / Sair</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
