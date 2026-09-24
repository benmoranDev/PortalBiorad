import React, { useState } from 'react';
import { User, UserRole, ThemeMode } from '../../types';
import { storageService } from '../../services/storage';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  theme,
  onToggleTheme
}) => {
  // Selected Profile Tab: 'admin' | 'professor' | 'student'
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('admin');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Self-Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('Tecnologia em Radiologia');

  const isDark = theme === 'dark';

  // Role metadata configurations
  const roleConfig = {
    admin: {
      title: 'Painel do Administrador Geral',
      subtitle: 'Gestão institucional, controle de alunos, banco Supabase e ajustes do sistema',
      badge: 'Super Administrador (Ben Moran)',
      badgeColor: isDark ? 'bg-amber-500/10 border-amber-400/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800',
      icon: 'admin_panel_settings',
      iconColor: 'text-amber-400',
      gradient: 'from-[#d97706] to-[#f59e0b]',
      demoEmail: 'benmoran29dev@gmail.com',
      demoName: 'Ben Moran (Administrador Geral)',
      inputLabel: 'Credencial ADM ou E-mail',
      inputPlaceholder: 'benmoran29dev@gmail.com ou ADM-BEN-2026',
      scopeDescription: 'Funções: Acesso Total Irrestrito, Banco Supabase, Credenciais, Gestão de Cursos e Usuários.'
    },
    professor: {
      title: 'Portal do Professor',
      subtitle: 'Gestão de turmas, lançamento de notas e acompanhamento pedagógico',
      badge: 'Área Docente',
      badgeColor: isDark ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: 'psychology',
      iconColor: 'text-emerald-400',
      gradient: 'from-[#059669] to-[#10b981]',
      demoEmail: 'marcus.vinicius@radbio.edu.br',
      demoName: 'Prof. Dr. Marcus Vinicius (Docente)',
      inputLabel: 'Matrícula Docente ou E-mail',
      inputPlaceholder: 'DOC-TC-09 ou marcus.vinicius@radbio.edu.br',
      scopeDescription: 'Funções: Diário de Classe, Lançamento & Homologação de Notas. Sem acesso ao banco de dados.'
    },
    student: {
      title: 'Portal do Aluno',
      subtitle: 'Acesso a aulas interativas, simulador de TC, trabalhos e boletim',
      badge: 'Área do Discente',
      badgeColor: isDark ? 'bg-cyan-500/10 border-cyan-400/30 text-[#4cd7f6]' : 'bg-cyan-50 border-cyan-200 text-cyan-800',
      icon: 'school',
      iconColor: 'text-[#06b6d4]',
      gradient: 'from-[#06b6d4] to-[#4edea3]',
      demoEmail: 'lucas.mendonca@radbio.edu.br',
      demoName: 'Lucas Mendonça (Aluno)',
      inputLabel: 'Matrícula do Aluno ou E-mail',
      inputPlaceholder: '2025-RAD-8841 ou lucas.mendonca@radbio.edu.br',
      scopeDescription: 'Funções: Aulas, Simulador TC 3D, Trabalhos e Boletim. Sem acesso ao painel admin ou banco de dados.'
    }
  };

  const currentConfig = roleConfig[activeRoleTab];

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsRegisterMode(false);
    // Autofill demo for this role if field is empty or was previously a demo
    setIdentifier('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const loginId = identifier.trim() || currentConfig.demoEmail;
    const loginPass = password || '123';

    setIsLoading(true);

    setTimeout(() => {
      const res = storageService.login(loginId, loginPass);
      setIsLoading(false);

      if (res.success && res.user) {
        // Enforce role consistency or automatically switch to matching role
        setSuccessMsg(`Autenticado como ${res.user.role === 'student' ? 'Aluno' : res.user.role === 'professor' ? 'Professor' : 'Administrador'}`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message);
      }
    }, 500);
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    setErrorMsg(null);
    setIsLoading(true);

    const email = roleConfig[role].demoEmail;

    setTimeout(() => {
      const res = storageService.login(email, '123');
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Preencha os campos obrigatórios (Nome Completo e E-mail).');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim(),
        role: activeRoleTab,
        avatar:
          activeRoleTab === 'student'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
            : activeRoleTab === 'professor'
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
        enrollmentId:
          activeRoleTab === 'student'
            ? `2026-RAD-${Math.floor(1000 + Math.random() * 9000)}`
            : activeRoleTab === 'professor'
            ? `DOC-TC-${Math.floor(10 + Math.random() * 90)}`
            : `ADM-${Math.floor(10 + Math.random() * 90)}`,
        specialty:
          regSpecialty ||
          (activeRoleTab === 'student'
            ? 'Tecnologia em Radiologia & TC'
            : activeRoleTab === 'professor'
            ? 'Docência & Diagnóstico por Imagem'
            : 'Gestão Acadêmica e Secretaria'),
        gpa: 4.0,
        completedHours: 0,
        totalRequiredHours: 180,
        attendanceRate: 100,
        status: 'regular',
        password: regPassword || '123'
      };

      const res = storageService.registerUser(newUser);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`Cadastro realizado com sucesso! Conectando como ${activeRoleTab === 'student' ? 'Aluno' : activeRoleTab === 'professor' ? 'Docente' : 'Admin'}...`);
        storageService.setAuthSession({ isAuthenticated: true, user: res.user });
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 700);
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden font-['Inter'] ${
        isDark ? 'bg-[#090d16] text-[#dfe2ef]' : 'bg-[#f4f7fb] text-slate-800'
      }`}
    >
      {/* Background Radiance Lights */}
      {isDark ? (
        <>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#06b6d4]/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00a572]/10 rounded-full blur-[130px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-200/50 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      {/* Subtle Pattern Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 1px 1px, #4cd7f6 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, #0284c7 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Top Controls: Theme Switcher */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer border ${
            isDark
              ? 'bg-[#141f38]/80 hover:bg-[#141f38] border-white/10 text-amber-300'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="hidden sm:inline">
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </span>
        </button>
      </div>

      <div className="relative z-10 max-w-lg w-full my-auto">
        {/* Main Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
            isDark
              ? 'bg-[#141f38]/70 border-white/10 shadow-black/40 text-white'
              : 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-900'
          }`}
        >
          {/* Header Brand */}
          <div className="text-center mb-5">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr ${currentConfig.gradient} p-0.5 flex items-center justify-center shadow-lg`}>
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isDark ? 'bg-[#090d16]' : 'bg-white'
                }`}
              >
                <span className={`material-symbols-outlined text-3xl ${currentConfig.iconColor}`}>
                  {currentConfig.icon}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
              RadBio Acadêmico
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentConfig.subtitle}
            </p>
          </div>

          {/* Role Attribution Switcher Tabs (Aluno | Professor | Admin) */}
          <div className="mb-6">
            <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
              isDark ? 'bg-[#0a0e17]/80 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => handleRoleTabChange('student')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleTab === 'student'
                    ? isDark
                      ? 'bg-cyan-500/20 text-[#4cd7f6] border border-cyan-400/40 shadow-sm'
                      : 'bg-white text-cyan-800 border border-cyan-200 shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">school</span>
                <span>Aluno</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('professor')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleTab === 'professor'
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-sm'
                      : 'bg-white text-emerald-800 border border-emerald-200 shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">psychology</span>
                <span>Professor</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-sm'
                      : 'bg-white text-amber-800 border border-amber-200 shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Admin</span>
              </button>
            </div>

            {/* Scope explanation box */}
            <div className={`mt-2.5 px-3 py-2 rounded-xl text-[11px] flex items-center justify-between border ${
              isDark ? 'bg-[#0e1626]/70 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <span className="truncate">{currentConfig.scopeDescription}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ml-2 border ${currentConfig.badgeColor}`}>
                {currentConfig.badge}
              </span>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label
                  className={`block mb-1.5 font-semibold ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {currentConfig.inputLabel}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    badge
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={currentConfig.inputPlaceholder}
                    required
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none font-mono transition-all ${
                      isDark
                        ? 'bg-[#0a0e17]/80 border-white/10 text-white placeholder:text-slate-500 focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 font-semibold">
                  <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Senha de Acesso
                  </label>
                  <span className={`text-[11px] font-normal ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                    Senha Padrão: <strong>123</strong>
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border outline-none font-mono transition-all ${
                      isDark
                        ? 'bg-[#0a0e17]/80 border-white/10 text-white placeholder:text-slate-500 focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 text-base cursor-pointer"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl bg-gradient-to-r ${currentConfig.gradient} text-[#090d16] font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#090d16] border-t-transparent animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Entrar no {currentConfig.title}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Registration Form for Selected Role */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Nome do titular"
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark
                      ? 'bg-[#0a0e17]/80 border-white/10 text-white focus:border-[#4cd7f6]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  E-mail Institucional ou Pessoal
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="exemplo@radbio.edu.br"
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark
                      ? 'bg-[#0a0e17]/80 border-white/10 text-white focus:border-[#4cd7f6]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {activeRoleTab === 'student' ? 'Curso / Especialidade' : activeRoleTab === 'professor' ? 'Área de Docência' : 'Cargo / Departamento'}
                </label>
                <input
                  type="text"
                  value={regSpecialty}
                  onChange={e => setRegSpecialty(e.target.value)}
                  placeholder={
                    activeRoleTab === 'student'
                      ? 'Ex: Tecnologia em Radiologia'
                      : activeRoleTab === 'professor'
                      ? 'Ex: Especialista em Tomografia Computadorizada'
                      : 'Ex: Coordenação de Ensino e Registro Acadêmico'
                  }
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark
                      ? 'bg-[#0a0e17]/80 border-white/10 text-white focus:border-[#4cd7f6]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-cyan-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Criar Senha de Acesso
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Defina sua senha (ex: 123)"
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark
                      ? 'bg-[#0a0e17]/80 border-white/10 text-white focus:border-[#4cd7f6]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-cyan-600'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl bg-gradient-to-r ${currentConfig.gradient} text-[#090d16] font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#090d16] border-t-transparent animate-spin" />
                    <span>Realizando Cadastro...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">how_to_reg</span>
                    <span>Confirmar Cadastro no Sistema</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Login for the Selected Role */}
          <div className={`mt-6 pt-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <p className={`text-[11px] text-center mb-2.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Para testar com perfil pré-configurado deste papel (1-clique):
            </p>
            <button
              type="button"
              onClick={() => handleQuickRoleLogin(activeRoleTab)}
              className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRoleTab === 'student'
                  ? isDark
                    ? 'bg-cyan-500/10 border-cyan-400/30 hover:bg-cyan-500/20 text-cyan-300'
                    : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-800'
                  : activeRoleTab === 'professor'
                  ? isDark
                    ? 'bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800'
                  : isDark
                    ? 'bg-amber-500/10 border-amber-400/30 hover:bg-amber-500/20 text-amber-300'
                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                login
              </span>
              <span>Acessar como {currentConfig.demoName}</span>
            </button>
          </div>

          {/* Switch Login / Registration */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`text-xs transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isRegisterMode ? (
                <span>
                  Já possui credencial? <strong className="text-[#06b6d4] underline">Fazer Login</strong>
                </span>
              ) : (
                <span>
                  Cadastrar novo usuário neste perfil? <strong className="text-emerald-600 dark:text-[#4edea3] underline">Criar Conta</strong>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className={`mt-4 text-center text-[11px] space-y-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          <p className="font-medium">RadBio Academic • Ensino & Gestão em Radiologia</p>
          <p className="text-[10px]">Perfis e atribuições segregados por Controle de Acesso (RBAC)</p>
        </div>
      </div>
    </div>
  );
};
