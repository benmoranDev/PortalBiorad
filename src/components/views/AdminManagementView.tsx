import React, { useState } from 'react';
import { Course, ThemeMode, EmailNotification } from '../../types';

interface AdminManagementViewProps {
  courses: Course[];
  notifications: EmailNotification[];
  onAddCourse: (newCourse: Course) => void;
  theme?: ThemeMode;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  courses,
  notifications,
  onAddCourse,
  theme = 'dark'
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'logs'>('courses');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newCategory, setNewCategory] = useState<Course['category']>('Tomografia Computadorizada');
  const isDark = theme === 'dark';

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;
    const course: Course = {
      id: `course_${Date.now()}`,
      code: newCode,
      title: newTitle,
      description: 'Especialização técnica com ênfase em diagnóstico por imagem e tomografia.',
      credits: 4,
      instructor: newInstructor || 'Prof. Dr. Marcus Vinicius',
      instructorTitle: 'Especialista em Tomografia Computadorizada CBR',
      category: newCategory,
      progress: 0,
      currentModule: 1,
      totalModules: 8,
      grade: 0,
      status: 'active',
      price: 450.00
    };
    onAddCourse(course);
    setShowAddCourseModal(false);
    setNewTitle('');
    setNewCode('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-7">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-mono mb-1">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Painel de Controle Institucional • Coordenação de Radiologia</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Gestão Administrativa &amp; Cursos
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
            Supervisão de matrículas de alunos, alocação de professores e auditoria de notificações automáticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-[#090d16] font-bold text-xs shadow-md shadow-[#06b6d4]/30 flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Criar Nova Disciplina</span>
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-xl ${
          isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs block mb-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
            Total de Alunos Matriculados
          </span>
          <div className={`text-3xl font-extrabold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            1.428
          </div>
          <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-xs">trending_up</span> +14% neste semestre
          </div>
        </div>

        <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-xl ${
          isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs block mb-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
            Corpo Docente de Radiologia
          </span>
          <div className="text-3xl font-extrabold text-cyan-600 font-['Plus_Jakarta_Sans']">28</div>
          <div className={`text-xs mt-2 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>100% especialistas CBR</div>
        </div>

        <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-xl ${
          isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs block mb-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
            Diplomas Emitidos e Válidos
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 font-['Plus_Jakarta_Sans']">384</div>
          <div className={`text-xs mt-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>Registro Acadêmico Reconhecido</div>
        </div>

        <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-xl ${
          isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <span className={`text-xs block mb-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
            Notificações por E-mail
          </span>
          <div className="text-3xl font-extrabold text-amber-500 font-['Plus_Jakarta_Sans']">
            {notifications.length * 142}
          </div>
          <div className="text-xs text-amber-600 mt-2 font-medium">Taxa de entrega 99.4%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 text-xs ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'courses'
              ? isDark ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-300'
              : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Disciplinas &amp; Módulos ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? isDark ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-300'
              : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gestão de Usuários (Alunos &amp; Professores)
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? isDark ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-300'
              : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Logs de Notificações por E-mail
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                  isDark ? 'text-[#4cd7f6] bg-[#4cd7f6]/10' : 'text-cyan-700 bg-cyan-50 font-semibold'
                }`}>
                  {course.code}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">{course.credits} Créditos</span>
              </div>
              <h4 className={`text-base font-bold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {course.title}
              </h4>
              <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>{course.description}</p>
              <div className={`flex items-center justify-between text-xs pt-2 border-t ${
                isDark ? 'border-white/5 text-gray-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span>Docente: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{course.instructor}</strong></span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900 font-semibold'}`}>
                  R$ {course.price?.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Diretório de Usuários Ativos
          </h3>
          <div className="space-y-3 text-xs">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-600 flex items-center justify-center font-bold">LM</div>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Lucas Mendonça (Aluno)</div>
                  <div className={`font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    2025-RAD-8841 • Tecnólogo em Radiologia
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">Ativo • CR 9.1</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">MV</div>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Prof. Dr. Marcus Vinicius (Professor Titular)
                  </div>
                  <div className={`font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    DOC-TC-09 • Especialista em TC CBR
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-600 font-semibold">Corpo Docente</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center font-bold">HV</div>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Dra. Helena Vasconcelos (Administradora)
                  </div>
                  <div className={`font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    ADM-01 • Coordenação Acadêmica
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-500 font-semibold">Coordenação Geral</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Fila de Notificações por E-mail Automáticas
          </h3>
          <div className="space-y-2.5 text-xs">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-[#0a0e17]/70 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="text-cyan-600">{n.subject}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isDark ? 'bg-white/10 text-gray-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {n.type}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Destinatário: {n.recipientEmail}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-emerald-500 font-mono font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Entregue
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{n.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Course */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDark ? 'bg-[#1c1f29] border-[#4cd7f6]/40 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">Nova Disciplina</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Título da Disciplina
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Angiotomografia Coronariana"
                  required
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Código</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    placeholder="RAD-910"
                    required
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Categoria</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Tomografia Computadorizada">Tomografia Computadorizada</option>
                    <option value="Ressonância Magnética">Ressonância Magnética</option>
                    <option value="Radiologia Geral">Radiologia Geral</option>
                    <option value="Radioproteção">Radioproteção</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Docente Responsável</label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={e => setNewInstructor(e.target.value)}
                  placeholder="Prof. Dr. Marcus Vinicius"
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold shadow cursor-pointer hover:opacity-95"
                >
                  Cadastrar Disciplina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
