import React, { useState } from 'react';
import { CursoLivre, ThemeMode, UserRole } from '../../types';
import { storageService } from '../../services/storage';

interface CursosLivresViewProps {
  onSelectCourseForEnrollment: (courseId: string) => void;
  onOpenSimulator: () => void;
  onNavigateTab: (tab: string) => void;
  userRole?: UserRole;
  theme?: ThemeMode;
}

export const CursosLivresView: React.FC<CursosLivresViewProps> = ({
  onSelectCourseForEnrollment,
  onOpenSimulator,
  onNavigateTab,
  userRole = 'student',
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const [cursos, setCursos] = useState<CursoLivre[]>(() => storageService.getCursosLivres());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEnrolledOnly, setFilterEnrolledOnly] = useState<boolean>(false);
  const [detailModalCourse, setDetailModalCourse] = useState<CursoLivre | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form state for creating a new 40h course (Admin / Professor)
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<CursoLivre['category']>('Tomografia Computadorizada');
  const [newPrice, setNewPrice] = useState('149.00');
  const [newInstructor, setNewInstructor] = useState('Prof. Dr. Marcus Vinicius');
  const [newDescription, setNewDescription] = useState('');
  const [newSimulatorToggle, setNewSimulatorToggle] = useState(true);

  // Sync state on change
  const handleReload = () => {
    setCursos(storageService.getCursosLivres());
  };

  // Categories list
  const categories = [
    { id: 'all', label: 'Todos os Cursos (40h)' },
    { id: 'Tomografia Computadorizada', label: 'Tomografia Computadorizada' },
    { id: 'Urgência & Trauma', label: 'Urgência & Trauma' },
    { id: 'Angiotomografia', label: 'Angiotomografia' },
    { id: 'Radioproteção', label: 'Radioproteção' },
    { id: 'Reconstrução 3D & DICOM', label: 'Reconstrução 3D & DICOM' }
  ];

  // Filtering
  const filteredCourses = cursos.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (filterEnrolledOnly && !c.isEnrolled) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSub = c.subtitle.toLowerCase().includes(q);
      const matchCode = c.code.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCourse: CursoLivre = {
      id: `cl_${Date.now()}`,
      code: `CL-TC-${Math.floor(4000 + Math.random() * 999)}`,
      title: newTitle,
      subtitle: newSubtitle || 'Capacitação Prática em Tomografia Computadorizada',
      category: newCategory,
      workloadHours: 40,
      price: parseFloat(newPrice) || 149.00,
      originalPrice: (parseFloat(newPrice) || 149.00) * 2,
      installments: 12,
      rating: 5.0,
      reviewCount: 1,
      enrolledStudentsCount: 0,
      instructor: newInstructor,
      instructorTitle: 'Especialista em Tomografia Computadorizada & Radiologia',
      instructorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
      coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      description: newDescription || 'Curso livre com 40 horas de carga horária para capacitação e aperfeiçoamento prático com simulador.',
      targetAudience: 'Estudantes e profissionais de Radiologia, Biomedicina e Medicina.',
      objectives: [
        'Compreender fundamentos avançados de tomografia computadorizada de 16 canais',
        'Operar o simulador Canon Activion 16 em cenários simulados',
        'Realizar pós-processamento de imagens médicas e análise por Hounsfield Units'
      ],
      legalCompliance: 'Curso Livre de Formação Continuada em conformidade com a Lei nº 9.394/96 Art. 42 e Decreto nº 5.154/04.',
      hasActivionSimulator: newSimulatorToggle,
      hasRealDicomCases: true,
      featured: false,
      isEnrolled: false,
      modules: [
        {
          id: `mod_${Date.now()}_1`,
          moduleNumber: 1,
          title: 'Módulo 1: Fundamentos & Princípios Físicos de TC (10h)',
          workloadHours: 10,
          description: 'Conceitos básicos, formação de imagem seccional e parâmetros do feixe.',
          topics: ['Física das Radiações', 'Detectores Multislice', 'Resolução Espacial']
        },
        {
          id: `mod_${Date.now()}_2`,
          moduleNumber: 2,
          title: 'Módulo 2: Protocolos Clínicos & Prática de Aquisição (10h)',
          workloadHours: 10,
          description: 'Aplicações clínicas em exames de rotina e urgência.',
          topics: ['Posicionamento', 'Scout View', 'Janelamento Hounsfield']
        },
        {
          id: `mod_${Date.now()}_3`,
          moduleNumber: 3,
          title: 'Módulo 3: Casos Práticos no Simulador Activion 16 (10h)',
          workloadHours: 10,
          description: 'Treinamento prático direto no console do tomógrafo virtual.',
          topics: ['Console Virtual', 'Reconstrução de Imagens', 'Artefatos de Movimento']
        },
        {
          id: `mod_${Date.now()}_4`,
          moduleNumber: 4,
          title: 'Módulo 4: Avaliação Final & Emissão de Certificado 40h (10h)',
          workloadHours: 10,
          description: 'Prova teórica e prática para certificação de 40 horas.',
          topics: ['Estudo de Caso', 'Laudo Técnico de TC', 'Certificação Oficial']
        }
      ]
    };

    storageService.addCursoLivre(newCourse);
    handleReload();
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewDescription('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-8">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all shadow-xl bg-gradient-to-r from-[#06b6d4]/10 via-[#10b981]/5 to-transparent border-[#4cd7f6]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-[#06b6d4]/15 text-[#4cd7f6] border-[#4cd7f6]/30">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Educação Continuada • Cursos Livres de 40 Horas Reconhecidos</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Cursos Livres com Certificação de 40 Horas
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
              Cursos rápidos de aperfeiçoamento profissional em tomografia computadorizada multislice, urgência, angiotomografia e dosimetria. Regulamentados pela <strong>Lei nº 9.394/1996 (LDB)</strong> e <strong>Decreto nº 5.154/2004</strong>. Válidos para horas complementares, progressão funcional e concursos públicos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(userRole === 'admin' || userRole === 'professor') && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-[#090d16] font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer hover:opacity-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">add_box</span>
                <span>Cadastrar Novo Curso (40h)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('pagamentos')}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-cyan-400 border-cyan-400/40'
                  : 'bg-white hover:bg-slate-50 text-cyan-700 border-cyan-300 shadow-sm'
              }`}
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Central Pix &amp; Cartão</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-[#090d16] shadow-md shadow-cyan-500/25'
                    : isDark
                      ? 'bg-[#181b25]/80 text-gray-300 hover:text-white border border-white/5 hover:border-white/20'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search and toggle enrolled */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar curso de 40h..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none w-56 sm:w-64 ${
                  isDark
                    ? 'bg-[#141824] border-white/10 text-white placeholder-gray-500 focus:border-cyan-400'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-cyan-500'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setFilterEnrolledOnly(!filterEnrolledOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-all ${
                filterEnrolledOnly
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : isDark
                    ? 'bg-[#141824] border-white/10 text-gray-400'
                    : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {filterEnrolledOnly ? 'check_circle' : 'school'}
              </span>
              <span>Já Matriculados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className={`rounded-3xl border overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
              course.isEnrolled
                ? isDark
                  ? 'bg-[#151d2f]/80 border-emerald-500/40 ring-1 ring-emerald-500/30'
                  : 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-400/20'
                : isDark
                  ? 'bg-[#181b25]/80 border-white/10 hover:border-cyan-400/40'
                  : 'bg-white border-slate-200 hover:border-cyan-500 shadow-sm'
            }`}
          >
            {/* Top Image & Badges */}
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-full object-cover opacity-85 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent" />

              {/* Workload 40h Badge */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-cyan-500 text-[#090d16] shadow-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">timer</span>
                  40 HORAS
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/40">
                  MEC / LDB 9.394
                </span>
              </div>

              {/* Rating & Review */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                <span>{course.rating}</span>
                <span className="text-gray-400 text-[9px]">({course.reviewCount})</span>
              </div>

              {/* Category label bottom left */}
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-[#06b6d4]/20 text-[#4cd7f6] border border-[#4cd7f6]/30">
                  {course.category}
                </span>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[10px] font-mono text-gray-400 font-semibold mb-1">
                  {course.code} • 4 MÓDULOS DE 10 HORAS
                </div>
                <h3 className={`text-base font-extrabold font-['Plus_Jakarta_Sans'] leading-snug line-clamp-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {course.title}
                </h3>
                <p className={`text-xs mt-1.5 line-clamp-2 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                  {course.description}
                </p>
              </div>

              {/* Highlights & Simulator indicator */}
              <div className="space-y-2 pt-2 border-t border-slate-200/10 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                  <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                  <span className="font-semibold">Simulador Canon Activion 16 Habilitado</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 text-[11px]">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>Certificado Digital Oficial 40h com QR Code</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span>{course.instructor}</span>
                </div>
              </div>

              {/* Pricing & Actions */}
              <div className="pt-3 border-t border-slate-200/10 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] text-gray-400 line-through">
                    R$ {course.originalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-xl font-extrabold text-cyan-400 font-['Plus_Jakarta_Sans']">
                    R$ {course.price.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    ou 12x de R$ {(course.price / course.installments).toFixed(2).replace('.', ',')} no cartão
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDetailModalCourse(course)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Ver Ementa (40h)
                  </button>

                  {course.isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('aulas')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#090d16] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
                    >
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                      <span>Acessar Aulas</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectCourseForEnrollment(course.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-[#090d16] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
                    >
                      <span className="material-symbols-outlined text-sm">shopping_cart</span>
                      <span>Pix / Cartão</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Syllabus Modal (40 Horas Breakdown) */}
      {detailModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`max-w-3xl w-full p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#181b25] border-cyan-400/40 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200/15">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500 text-[#090d16]">
                    40 HORAS CERTIFICADAS
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {detailModalCourse.code}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans']">
                  {detailModalCourse.title}
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                  {detailModalCourse.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalCourse(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Legal compliance notice box */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              isDark ? 'bg-[#0f1422] border-cyan-400/20 text-gray-300' : 'bg-cyan-50/70 border-cyan-200 text-slate-700'
            }`}>
              <strong className="text-cyan-400">Regulamentação e Validade Acadêmica:</strong> {detailModalCourse.legalCompliance}
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Objetivos de Aprendizagem (40h)
              </h4>
              <ul className="space-y-1.5 text-xs">
                {detailModalCourse.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-emerald-400 shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules (4 modules x 10h) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Ementa Programática Dividida em 4 Módulos (10 Horas Cada)
              </h4>
              <div className="space-y-3">
                {detailModalCourse.modules.map(m => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      isDark ? 'bg-[#101522] border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-cyan-400">
                        {m.title}
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-extrabold">
                        {m.workloadHours} HORAS
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                      {m.description}
                    </p>
                    {m.simulatorProtocolName && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <span className="material-symbols-outlined text-xs">precision_manufacturing</span>
                        <span>Protocolo Prático: {m.simulatorProtocolName}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded-md ${
                            isDark ? 'bg-white/5 text-gray-400' : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          • {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/15">
              <div>
                <span className="text-xs text-gray-400">Investimento:</span>
                <div className="text-2xl font-extrabold text-cyan-400">
                  R$ {detailModalCourse.price.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-emerald-400">
                  Liberação imediata via Pix ou Cartão em 12x
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailModalCourse(null)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-slate-300 text-slate-700'
                  }`}
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = detailModalCourse.id;
                    setDetailModalCourse(null);
                    onSelectCourseForEnrollment(id);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-[#090d16] font-bold text-xs shadow-lg shadow-cyan-500/30 cursor-pointer hover:opacity-95 transition-all"
                >
                  Matricular Agora (Pix ou Cartão)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New 40h Free Course (Admin / Professor) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateCourse}
            className={`max-w-xl w-full p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-[#181b25] border-cyan-400/40 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/15">
              <div>
                <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                  Cadastrar Novo Curso Livre (40 Horas)
                </h3>
                <p className="text-xs text-gray-400">
                  Formação de 40h com 4 módulos de 10h e integração com simulador.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-bold text-gray-300">Título do Curso Livre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tomografia de Abdome Agudo & Pâncreas (40h)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0f1422] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Subtítulo / Especialidade</label>
                <input
                  type="text"
                  placeholder="Ex: Protocolos Multifásicos com Contraste Iodado e Sonda HU"
                  value={newSubtitle}
                  onChange={e => setNewSubtitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0f1422] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-gray-300">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as CursoLivre['category'])}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0f1422] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Tomografia Computadorizada">Tomografia Computadorizada</option>
                    <option value="Urgência & Trauma">Urgência & Trauma</option>
                    <option value="Angiotomografia">Angiotomografia</option>
                    <option value="Radioproteção">Radioproteção</option>
                    <option value="Reconstrução 3D & DICOM">Reconstrução 3D & DICOM</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-gray-300">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0f1422] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Docente Responsável</label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={e => setNewInstructor(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0f1422] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-gray-300">Descrição do Conteúdo</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Detalhamento das competências desenvolvidas durante as 40 horas..."
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0f1422] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sim-check"
                  checked={newSimulatorToggle}
                  onChange={e => setNewSimulatorToggle(e.target.checked)}
                  className="rounded text-cyan-500 cursor-pointer"
                />
                <label htmlFor="sim-check" className="font-semibold cursor-pointer text-gray-300">
                  Habilitar módulo prático no Simulador Canon Activion 16
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/15">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-white/10 text-gray-300' : 'border-slate-300 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-[#090d16] font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer hover:opacity-95"
              >
                Salvar Curso Livre (40h)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
