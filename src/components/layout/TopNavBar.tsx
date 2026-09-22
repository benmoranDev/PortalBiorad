import React, { useState } from 'react';
import { User, UserRole, Language, EmailNotification, ThemeMode } from '../../types';

interface TopNavBarProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSimulator: () => void;
  notifications: EmailNotification[];
  onOpenMobileMenu: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectNotification: (notif: EmailNotification) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentUser,
  onRoleChange,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  onOpenSimulator,
  notifications,
  onOpenMobileMenu,
  searchTerm,
  onSearchChange,
  onSelectNotification
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 right-0 z-30 w-full lg:pl-64 backdrop-blur-2xl transition-colors duration-200 border-b ${
        isDark
          ? 'bg-[#181b25]/80 border-[#3d494c]/30 shadow-lg shadow-black/30'
          : 'bg-white/85 border-slate-200/80 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-8 w-full">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-3 w-full max-w-xs md:max-w-md">
          <button
            onClick={onOpenMobileMenu}
            className={`p-2 rounded-lg lg:hidden transition-colors ${
              isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Abrir Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="relative w-full">
            <span
              className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg ${
                isDark ? 'text-[#869397]' : 'text-slate-400'
              }`}
            >
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Pesquisar aulas, TC helicoidal, protocolos..."
              className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs md:text-sm outline-none transition-all ${
                isDark
                  ? 'bg-[#0a0e17]/65 border border-white/10 text-[#dfe2ef] placeholder:text-[#869397] focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/25'
                  : 'bg-slate-100/90 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-1 focus:ring-cyan-600/20'
              }`}
            />
          </div>
        </div>

        {/* Center: Brand Context */}
        <div className="hidden xl:flex items-center gap-2">
          <span
            className={`text-sm font-semibold font-['Plus_Jakarta_Sans'] ${
              isDark ? 'text-[#dfe2ef]' : 'text-slate-800'
            }`}
          >
            RadBio Academic Portal
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
              isDark
                ? 'bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/25'
                : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
            }`}
          >
            Semestre 2026.1
          </span>
        </div>

        {/* Right Side: GPA, Theme Toggle, Simulator CTA, Notifications, Lang, Role, Profile */}
        <div className="flex items-center gap-2 md:gap-3.5">
          {/* GPA Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isDark
                ? 'bg-[#00a572]/15 border border-[#4edea3]/30 text-[#4edea3]'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPA: {currentUser.gpa.toFixed(2)} A+</span>
          </div>

          {/* Quick Theme Toggle Button (Dark / Light) */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Mudar para Modo Claro (Clínico)' : 'Mudar para Modo Escuro (Liquid Glass)'}
            className={`p-1.5 md:p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
              isDark
                ? 'bg-[#1c1f29] border-[#3d494c]/50 text-amber-300 hover:text-amber-200 hover:bg-[#262a34]'
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Virtual CT Lab Simulator Button */}
          <button
            type="button"
            onClick={onOpenSimulator}
            title="Simulador Prático de Tomografia Computadorizada (TC)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isDark
                ? 'bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 border-[#4cd7f6]/30 text-[#4cd7f6]'
                : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">science</span>
            <span className="hidden md:inline">Simulador TC</span>
          </button>

          {/* Language Switcher */}
          <div
            className={`flex items-center rounded-lg p-0.5 text-xs font-mono border ${
              isDark ? 'bg-[#0a0e17]/70 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => onLanguageChange('pt')}
              className={`px-1.5 py-0.5 rounded ${
                language === 'pt'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded ${
                language === 'en'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('es')}
              className={`px-1.5 py-0.5 rounded ${
                language === 'es'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ES
            </button>
          </div>

          {/* Role Switcher Pill */}
          <div
            className={`hidden md:flex items-center rounded-lg p-0.5 text-[11px] border ${
              isDark ? 'bg-[#0a0e17]/70 border-[#3d494c]/50' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => onRoleChange('student')}
              className={`px-2 py-0.5 rounded transition-all ${
                currentUser.role === 'student'
                  ? isDark ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] font-semibold' : 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aluno
            </button>
            <button
              onClick={() => onRoleChange('professor')}
              className={`px-2 py-0.5 rounded transition-all ${
                currentUser.role === 'professor'
                  ? isDark ? 'bg-[#4edea3]/20 text-[#4edea3] font-semibold' : 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Professor
            </button>
            <button
              onClick={() => onRoleChange('admin')}
              className={`px-2 py-0.5 rounded transition-all ${
                currentUser.role === 'admin'
                  ? isDark ? 'bg-amber-400/20 text-amber-300 font-semibold' : 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-1.5 md:p-2 rounded-lg transition-colors relative cursor-pointer ${
                isDark
                  ? 'text-[#bcc9cd] hover:text-[#4cd7f6] hover:bg-[#1c1f29]/50'
                  : 'text-slate-600 hover:text-cyan-700 hover:bg-slate-100'
              }`}
              title="Notificações Automáticas de Prazos e Resultados"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 md:w-96 rounded-2xl shadow-2xl p-4 z-50 border ${
                  isDark ? 'bg-[#1c1f29] border-[#3d494c]/60 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/20 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-lg">mail</span>
                    <h4 className="text-sm font-semibold">Notificações por E-mail</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#4edea3] bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {unreadCount} novas
                  </span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onSelectNotification(n);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        !n.isRead
                          ? isDark ? 'bg-[#262a34]/90 border-[#4cd7f6]/40 text-white' : 'bg-cyan-50/70 border-cyan-200 text-slate-900'
                          : isDark ? 'bg-[#0a0e17]/50 border-white/5 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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

          <div className={`h-5 w-px ${isDark ? 'bg-[#3d494c]/40' : 'bg-slate-200'}`} />

          {/* Profile Capsule */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 cursor-pointer group"
            >
              <div className="text-right hidden lg:block">
                <p
                  className={`text-xs font-semibold leading-tight transition-colors ${
                    isDark ? 'text-[#dfe2ef] group-hover:text-[#4cd7f6]' : 'text-slate-800 group-hover:text-cyan-700'
                  }`}
                >
                  {currentUser.name}
                </p>
                <p className={`text-[10px] ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
                  {currentUser.role === 'student' ? 'Tecnólogo em Radiologia' : currentUser.role === 'professor' ? 'Docente Titular TC' : 'Administrador Geral'}
                </p>
              </div>
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400/40 ring-2 ring-cyan-400/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
              </div>
            </button>

            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl p-3 z-50 text-xs border ${
                  isDark ? 'bg-[#1c1f29] border-[#3d494c]/60 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-2 py-2 border-b border-slate-200/20 mb-2">
                  <p className="font-bold">{currentUser.name}</p>
                  <p className="text-gray-400 text-[11px] font-mono">{currentUser.enrollmentId}</p>
                  <p className="text-[11px] text-[#4cd7f6] truncate">{currentUser.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[11px] text-gray-400 font-semibold">Alternar Perfil:</div>
                  <button
                    onClick={() => {
                      onRoleChange('student');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-500/10 flex items-center justify-between"
                  >
                    <span>Aluno (Lucas Mendonça)</span>
                    {currentUser.role === 'student' && <span className="text-[#4cd7f6]">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange('professor');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-500/10 flex items-center justify-between"
                  >
                    <span>Professor (Dr. Aris Thorne)</span>
                    {currentUser.role === 'professor' && <span className="text-[#4edea3]">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange('admin');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-500/10 flex items-center justify-between"
                  >
                    <span>Admin (Dra. Helena V.)</span>
                    {currentUser.role === 'admin' && <span className="text-amber-400">✓</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
