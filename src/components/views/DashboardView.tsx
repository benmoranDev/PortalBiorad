import React, { useState } from 'react';
import { User, Course, TaskPendency, ThemeMode } from '../../types';

interface DashboardViewProps {
  currentUser: User;
  courses: Course[];
  tasks: TaskPendency[];
  recentGrades: Array<{
    id: string;
    title: string;
    course: string;
    instructor: string;
    grade: number;
    statusText: string;
    date: string;
  }>;
  theme?: ThemeMode;
  onNavigateTab: (tab: string) => void;
  onOpenSimulator: () => void;
  onOpenSubmissionModal: (task: TaskPendency) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  courses,
  tasks,
  recentGrades,
  theme = 'dark',
  onNavigateTab,
  onOpenSimulator,
  onOpenSubmissionModal
}) => {
  const isDark = theme === 'dark';
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter(c => c.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto space-y-7">
      {/* SECTION 1: Liquid Glass Welcome Banner / Hero */}
      <section
        aria-label="Boas-vindas"
        className={`relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-6 sm:p-8 transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-[#141f38]/80 via-[#181b25]/90 to-[#141f38]/70 border-white/10 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.65)] ring-1 ring-[#4cd7f6]/20'
            : 'bg-gradient-to-r from-cyan-50/80 via-white to-sky-50/70 border-slate-200/90 shadow-md ring-1 ring-cyan-500/20 text-slate-800'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#06b6d4]/15 via-transparent to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  currentUser.role === 'student'
                    ? isDark ? 'bg-[#00a572]/15 border border-[#4edea3]/30 text-[#4edea3]' : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                    : currentUser.role === 'professor'
                    ? isDark ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300' : 'bg-cyan-50 border border-cyan-300 text-cyan-800'
                    : isDark ? 'bg-amber-500/15 border border-amber-400/30 text-amber-300' : 'bg-amber-50 border border-amber-300 text-amber-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {currentUser.role === 'student' ? 'Matrícula Ativa • Período Letivo 2026.1' : currentUser.role === 'professor' ? 'Corpo Docente • Turma TC-402' : 'Gestão Acadêmica & Administração'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                  isDark
                    ? 'bg-[#1c1f29] border border-[#3d494c]/50 text-[#bcc9cd]'
                    : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                {currentUser.role === 'student' ? `Matrícula: ${currentUser.enrollmentId}` : currentUser.role === 'professor' ? `Cód. Docente: ${currentUser.enrollmentId}` : `Registro ADM: ${currentUser.enrollmentId}`}
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Bem-vindo ao RadBio,{' '}
              <span className="bg-gradient-to-r from-[#06b6d4] to-[#10b981] bg-clip-text text-transparent">
                {currentUser.name}
              </span>
            </h1>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#bcc9cd]' : 'text-slate-600'
              }`}
            >
              {currentUser.role === 'student' && (
                <>
                  Área do Aluno em Tomografia Computadorizada Avançada e Diagnóstico por Imagem. Você possui{' '}
                  <strong className={isDark ? 'text-[#4cd7f6]' : 'text-cyan-700'}>
                    {pendingTasks.length} trabalhos pendentes
                  </strong>{' '}
                  com prazos de entrega nesta quinzena.
                </>
              )}
              {currentUser.role === 'professor' && (
                <>
                  Ambiente Docente de Gestão de Aulas e Avaliação. Há turmas aguardando fechamento de médias ponderadas, revisão de casos de TC e homologação final de notas.
                </>
              )}
              {currentUser.role === 'admin' && (
                <>
                  Painel de Controle Institucional. Gerencie matrículas, grade curricular, relatórios de auditoria e segurança dos dados hospitalares e acadêmicos.
                </>
              )}
            </p>
          </div>

          {/* Role-Specific Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {currentUser.role === 'student' && (
              <>
                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] text-xs font-bold shadow-lg shadow-[#06b6d4]/30 hover:shadow-[#06b6d4]/50 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-base">science</span>
                  <span>Abrir Simulador de TC</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('cursos_livres')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isDark
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">school</span>
                  <span>Cursos Livres (40h)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('aulas')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isDark
                      ? 'bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/30'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">play_circle</span>
                  <span>Minhas Aulas</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('pendencias')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">pending_actions</span>
                  <span>Ver Trabalhos ({pendingTasks.length})</span>
                </button>
              </>
            )}

            {currentUser.role === 'professor' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('professor_notas')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10b981] text-[#090d16] text-xs font-bold shadow-lg shadow-emerald-500/30 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">fact_check</span>
                  <span>Lançamento & Homologação de Notas</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isDark
                      ? 'bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/30'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">science</span>
                  <span>Simulador TC (Modo Aula)</span>
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('admin')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#090d16] text-xs font-bold shadow-lg shadow-amber-500/30 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  <span>Gerenciar Usuários & Cursos</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('configuracoes')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  <span>Configurações & Backup</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: Metrics Row (4 Bento Cards) */}
      <section aria-label="Métricas Acadêmicas" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Média Geral (GPA) */}
        <div
          className={`p-5 rounded-2xl backdrop-blur-2xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-[#141f38]/50 border-white/10 hover:border-[#4cd7f6]/40 text-white'
              : 'bg-white border-slate-200/90 shadow-sm hover:border-cyan-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
              Média Geral (GPA)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-cyan-500">
              <span className="material-symbols-outlined text-lg">grade</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">8.9</span>
            <span className={`text-sm ${isDark ? 'text-[#869397]' : 'text-slate-400'}`}>/ 10.0</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/15">
              <span className="material-symbols-outlined text-xs">trending_up</span> +0.4 pts
            </span>
            <span className={`text-[11px] ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
              vs. semestre anterior
            </span>
          </div>
        </div>

        {/* Card 2: Aulas Assistidas */}
        <div
          className={`p-5 rounded-2xl backdrop-blur-2xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-[#141f38]/50 border-white/10 hover:border-[#4edea3]/40 text-white'
              : 'bg-white border-slate-200/90 shadow-sm hover:border-emerald-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
              Aulas Assistidas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-lg">smart_display</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">84%</span>
            <span className="text-xs text-emerald-500 font-medium">Meta: 75%</span>
          </div>
          <div className={`mt-3 w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-[#31353f]' : 'bg-slate-200'}`}>
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full" style={{ width: '84%' }} />
          </div>
        </div>

        {/* Card 3: Trabalhos (ALTERADO CONFORME SOLICITADO: APENAS "TRABALHOS") */}
        <div
          onClick={() => onNavigateTab('pendencias')}
          className={`p-5 rounded-2xl backdrop-blur-2xl border shadow-xl relative overflow-hidden transition-all duration-300 cursor-pointer ${
            isDark
              ? 'bg-[#141f38]/50 border-white/10 hover:border-amber-400/40 text-white'
              : 'bg-white border-slate-200/90 shadow-sm hover:border-amber-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-[#bcc9cd]' : 'text-slate-700'}`}>
              Trabalhos
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-500">
              <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">18</span>
            <span className={`text-sm ${isDark ? 'text-[#869397]' : 'text-slate-400'}`}>/ 20 entregues</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className={`text-[11px] font-medium ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
              {pendingTasks.length} pendentes • Ver prazos →
            </span>
          </div>
        </div>

        {/* Card 4: Horas de Estágio / Lab */}
        <div
          className={`p-5 rounded-2xl backdrop-blur-2xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-[#141f38]/50 border-white/10 hover:border-[#4cd7f6]/40 text-white'
              : 'bg-white border-slate-200/90 shadow-sm hover:border-cyan-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
              Horas de Estágio / Lab
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-cyan-500">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">142h</span>
            <span className={`text-sm ${isDark ? 'text-[#869397]' : 'text-slate-400'}`}>/ 180h</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-cyan-500 font-semibold">78% concluído</span>
            <span className={isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}>Faltam 38 horas</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Próxima Aula ao Vivo (Callout com Vídeo & Protocolo TC) */}
      <section aria-label="Aula ao Vivo">
        <div
          className={`p-6 sm:p-7 rounded-3xl backdrop-blur-2xl border shadow-2xl relative overflow-hidden ${
            isDark
              ? 'bg-[#141f38]/60 border-white/10 shadow-black/40'
              : 'bg-gradient-to-r from-cyan-50/40 via-white to-emerald-50/40 border-slate-200 shadow-sm text-slate-800'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative w-full sm:w-44 aspect-video rounded-2xl overflow-hidden shadow-lg border border-cyan-400/30 group cursor-pointer" onClick={() => onNavigateTab('aulas')}>
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80"
                  alt="Aula de Tomografia"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/80 text-slate-950 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-2xl">play_arrow</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-600 border border-cyan-500/30 uppercase">
                    Ao Vivo Hoje • 19:30 BRT
                  </span>
                  <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Sala Virtual Aberta
                  </span>
                </div>
                <h2 className={`text-lg sm:text-xl font-bold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Módulo 4: Técnicas de Angiotomografia Coronariana e Reconstruções 3D MPR / VR
                </h2>
                <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                  Prof. Dr. Aris Thorne • Especialista em Tomografia Computadorizada Multislice &amp; Radiofísica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => onNavigateTab('aulas')}
                className="w-full lg:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-[#090d16] font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">videocam</span>
                <span>Entrar na Aula Interativa</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Two Columns Grid (Disciplinas em Andamento vs Trabalhos & Notas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* LEFT COLUMN: Disciplinas em Andamento (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div
            className={`p-6 sm:p-7 rounded-3xl backdrop-blur-2xl border shadow-xl space-y-5 ${
              isDark ? 'bg-[#141f38]/50 border-white/10 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/20">
              <div>
                <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  <span>Disciplinas em Andamento</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 font-mono font-bold">
                    {courses.length} ativas
                  </span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
                  Acompanhamento de notas parciais, módulos teóricos e estações laboratoriais
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setSelectedCategory('Tomografia')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === 'Tomografia'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tomografia
                </button>
                <button
                  onClick={() => setSelectedCategory('Contrastados')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === 'Contrastados'
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Contrastados
                </button>
                <button
                  onClick={() => setSelectedCategory('Cirúrgico')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === 'Cirúrgico'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Centro Cirúrgico
                </button>
                <button
                  onClick={() => setSelectedCategory('Ressonância')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === 'Ressonância'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Ressonância
                </button>
              </div>
            </div>

            {/* Courses Cards List */}
            <div className="space-y-4">
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 space-y-3.5 ${
                    isDark
                      ? 'bg-[#0a0e17]/55 border-white/5 hover:border-[#4cd7f6]/40 hover:bg-[#0a0e17]/80'
                      : 'bg-slate-50/70 border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-wider">
                        {course.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold font-['Plus_Jakarta_Sans']">
                        {course.title}
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
                        Código: {course.code} • {course.credits} Créditos • Docente: {course.instructor}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {course.progress > 80 ? 'Excelente' : 'Em Dia'}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${isDark ? 'bg-[#1c1f29] text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                        Média: {course.grade.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}>
                        Módulo {course.currentModule} de {course.totalModules} concluído
                      </span>
                      <span className="font-mono text-cyan-500 font-bold">{course.progress}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-[#31353f]' : 'bg-slate-200'}`}>
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {course.nextDeadline && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/20">
                      <span className={`flex items-center gap-1 truncate ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                        <span className="material-symbols-outlined text-xs text-amber-500">event_upcoming</span>
                        Próximo Trabalho: <strong>{course.nextDeliveryTitle}</strong> ({course.nextDeadline})
                      </span>
                      <button
                        onClick={() => onNavigateTab('aulas')}
                        className="text-cyan-600 hover:text-cyan-700 font-semibold shrink-0 ml-2"
                      >
                        Acessar Aula →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Trabalhos a Entregar + Notas Recentes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Próximos Trabalhos a Entregar (ALTERADO CONFORME SOLICITADO: APENAS TRABALHOS) */}
          <div
            className={`p-6 rounded-3xl backdrop-blur-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-[#141f38]/50 border-white/10 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">assignment</span>
                <h3 className="text-sm font-bold font-['Plus_Jakarta_Sans']">Trabalhos Pendentes</h3>
              </div>
              <span className="text-xs font-mono text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded-full font-bold">
                {pendingTasks.length} a entregar
              </span>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 3).map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                    idx === 0
                      ? isDark
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-amber-50/70 border-amber-200'
                      : isDark
                        ? 'bg-[#0a0e17]/60 border-white/5'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Prazo: {task.deadlineDate} ({task.daysRemaining}d)
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 font-bold">
                      {task.format}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-snug">{task.title}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className={isDark ? 'text-[#869397]' : 'text-slate-500'}>{task.courseTitle}</span>
                    <button
                      onClick={() => onOpenSubmissionModal(task)}
                      className="text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Enviar</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('pendencias')}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                isDark
                  ? 'bg-[#262a34]/40 hover:bg-[#262a34] text-[#bcc9cd] hover:text-white border-white/5'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Ver todos os trabalhos acadêmicos
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Notas Recentes */}
          <div
            className={`p-6 rounded-3xl backdrop-blur-2xl border shadow-xl space-y-4 ${
              isDark ? 'bg-[#141f38]/50 border-white/10 text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">fact_check</span>
                <h3 className="text-sm font-bold font-['Plus_Jakarta_Sans']">Últimas Notas</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
                Homologadas
              </span>
            </div>

            <div className="space-y-3">
              {recentGrades.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="max-w-[70%]">
                    <h4 className="text-xs font-bold leading-snug">{item.title}</h4>
                    <p className={`text-[11px] truncate ${isDark ? 'text-[#bcc9cd]' : 'text-slate-500'}`}>
                      {item.course} • {item.instructor}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-base font-bold text-emerald-500 font-mono">{item.grade.toFixed(1)}</span>
                    <p className={`text-[10px] ${isDark ? 'text-[#869397]' : 'text-slate-400'}`}>{item.statusText}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('boletim')}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                isDark
                  ? 'bg-[#262a34]/40 hover:bg-[#262a34] text-[#bcc9cd] hover:text-white border-white/5'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Ver boletim oficial completo
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
