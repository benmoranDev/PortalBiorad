import React, { useState } from 'react';
import { Lesson, ThemeMode } from '../../types';
import { storageService } from '../../services/storage';

interface ClassroomViewProps {
  lessons: Lesson[];
  onOpenSimulator: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  activeLesson: Lesson;
  theme?: ThemeMode;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  lessons,
  onOpenSimulator,
  onSelectLesson,
  activeLesson,
  theme = 'dark'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.5x');
  const [activeTab, setActiveTab] = useState<'ementa' | 'downloads' | 'notes'>('ementa');
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'roadmap'>('chat');
  const [pollAnswer, setPollAnswer] = useState<string | null>('no');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'c1',
      sender: 'Lucas Andrade',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      time: '14:15',
      text: 'Professor, na fase portal da tomografia de abdômen total, qual o tempo de delay ideal após iniciar a injeção do meio de contraste iodado?'
    },
    {
      id: 'c2',
      isTutor: true,
      sender: 'Marcus Vinicius (Tutor RadBio)',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80',
      time: '14:17',
      text: 'Excelente pergunta, Lucas! O tempo de delay preconizado para a fase portal venosa é rigorosamente entre 65 e 75 segundos. Esse intervalo garante a opacificação homogênea do parênquima hepático e veia porta.'
    },
    {
      id: 'c3',
      sender: 'Beatriz Lima',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      time: '14:21',
      text: 'Para pacientes com taxa de filtração glomerular reduzida, é recomendado protocolo de hidratação venosa antes da TC?'
    }
  ]);

  const [personalNotes, setPersonalNotes] = useState(() => storageService.getNotes());
  const [handRaised, setHandRaised] = useState(false);
  const isDark = theme === 'dark';

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        sender: 'Lucas Mendonça',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        time: 'Agora',
        text: chatInput
      }
    ]);
    setChatInput('');
  };

  const handleSaveNotes = (val: string) => {
    setPersonalNotes(val);
    storageService.setNotes(val);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1720px] mx-auto space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video Player & Metadados Avançados (8 cols) */}
        <section className="col-span-12 xl:col-span-8 flex flex-col gap-5">
          {/* Interactive Video Player Container */}
          <div className="relative rounded-2xl overflow-hidden bg-[#1c1f29]/60 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.65)] ring-1 ring-[#4cd7f6]/20 group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4cd7f6]/50 to-transparent z-20" />

            {/* Video Simulation Frame */}
            <div className="relative w-full aspect-video bg-[#0a0e17] overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
                alt="Tomografia Computadorizada Sala de Aula"
                className="w-full h-full object-cover opacity-80 group-hover:scale-101 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/30 to-transparent pointer-events-none" />

              {/* On-Screen Telemetry HUD */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none z-10">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e17]/80 backdrop-blur-md border border-white/15 text-[#4cd7f6] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse shadow-[0_0_8px_#4cd7f6]" />
                  TRANSMISSÃO HD
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#0a0e17]/80 backdrop-blur-md border border-white/15 text-[#bcc9cd] text-xs font-mono">
                  AULA PRÁTICA TC • RADIOLOGIA
                </span>
              </div>

              {/* Central Play/Pause button */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute w-16 h-16 rounded-full bg-[#4cd7f6]/20 hover:bg-[#4cd7f6]/30 backdrop-blur-md border border-[#4cd7f6]/40 text-[#4cd7f6] flex items-center justify-center transition-all duration-300 scale-95 group-hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-3xl ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Glass Floating Player Controls Bar */}
              <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-[#181b25]/85 backdrop-blur-xl border border-white/15 shadow-2xl transition-all duration-300">
                {/* Timeline with Chapter Topic Markers */}
                <div className="relative w-full mb-3 cursor-pointer group/timeline">
                  <div className="w-full h-1.5 bg-[#31353f] rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full w-[70%] bg-white/30" />
                    <div className="absolute left-0 top-0 h-full w-[42%] bg-gradient-to-r from-[#06b6d4] to-[#4cd7f6] shadow-[0_0_12px_#4cd7f6]" />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-2 h-2 rounded-full bg-white ring-2 ring-[#4cd7f6]" title="Pitch e Espessura" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[42%] w-3 h-3 rounded-full bg-[#4cd7f6] shadow-[0_0_10px_#4cd7f6] ring-2 ring-white" title="Momento Atual" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[68%] w-2 h-2 rounded-full bg-gray-400 ring-2 ring-[#181b25]" title="Janelamento" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[85%] w-2 h-2 rounded-full bg-gray-400 ring-2 ring-[#181b25]" title="Contraste Iodado" />
                </div>

                {/* Controls Cluster */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg text-[#4cd7f6] hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <button className="p-1.5 rounded-lg text-[#bcc9cd] hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-xl">replay_10</span>
                    </button>
                    <button className="p-1.5 rounded-lg text-[#bcc9cd] hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-xl">forward_10</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-2 pl-1">
                      <span className="material-symbols-outlined text-lg text-[#bcc9cd]">volume_up</span>
                      <div className="w-16 h-1 bg-[#31353f] rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-[#4cd7f6]" />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#bcc9cd] pl-2">
                      <span className="text-white font-semibold">24:18</span> / 58:00
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPlaybackSpeed(playbackSpeed === '1.0x' ? '1.5x' : playbackSpeed === '1.5x' ? '2.0x' : '1.0x')}
                      className="px-2.5 py-1 rounded-lg bg-[#1c1f29]/80 hover:bg-[#1c1f29] border border-white/10 text-white text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="text-[#4cd7f6] font-bold">{playbackSpeed}</span>
                    </button>
                    <button
                      onClick={onOpenSimulator}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00a572]/20 border border-[#4edea3]/30 text-[#4edea3] text-xs font-mono cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                      <span>Simulador TC</span>
                    </button>
                    <button className="p-1.5 rounded-lg text-[#bcc9cd] hover:text-[#4cd7f6] cursor-pointer">
                      <span className="material-symbols-outlined text-xl">closed_caption</span>
                    </button>
                    <button className="p-1.5 rounded-lg text-[#bcc9cd] hover:text-[#4cd7f6] cursor-pointer">
                      <span className="material-symbols-outlined text-xl">fullscreen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Metadata & Instructor Capsule */}
          <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl space-y-6 ${
            isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200/20">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isDark
                      ? 'bg-[#4cd7f6]/10 border-[#4cd7f6]/30 text-[#4cd7f6]'
                      : 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  }`}>
                    Módulo 4 • Tomografia Computadorizada
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
                    isDark
                      ? 'bg-[#00a572]/10 border-[#4edea3]/30 text-[#4edea3]'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Turma 2026.1 (Alunos de Radiologia)
                  </span>
                </div>
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {activeLesson.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border ${
                    isDark ? 'bg-[#181b25]/70 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <img
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"
                      alt="Instrutor"
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-500/40"
                    />
                    <div>
                      <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Prof. Dr. Marcus Vinicius
                      </p>
                      <p className="text-[10px] text-cyan-600 font-medium">Especialista em TC e Diagnóstico por Imagem</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                    <span className="material-symbols-outlined text-cyan-600 text-base">school</span>
                    <span>98 alunos assistindo</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#06b6d4]/30 hover:opacity-95"
                >
                  <span className="material-symbols-outlined text-base">neurology</span>
                  <span>Praticar no Simulador de TC</span>
                </button>
              </div>
            </div>

            {/* Bottom Tabs: Ementa, Recursos para Download, Anotações */}
            <div>
              <div className="flex items-center gap-6 border-b border-slate-200/20 text-xs">
                <button
                  onClick={() => setActiveTab('ementa')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'ementa'
                      ? 'text-cyan-600 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">subject</span>
                  <span>Ementa da Aula</span>
                </button>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'downloads'
                      ? 'text-cyan-600 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">download_for_offline</span>
                  <span>Materiais Didáticos</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isDark ? 'bg-[#262a34] text-[#4cd7f6]' : 'bg-cyan-50 text-cyan-800'
                  }`}>
                    2
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'notes'
                      ? 'text-cyan-600 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">edit_note</span>
                  <span>Minhas Anotações</span>
                </button>
              </div>

              <div className="pt-5">
                {activeTab === 'ementa' && (
                  <div className={`space-y-4 text-xs leading-relaxed ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                    <p>
                      Nesta aula para alunos de radiologia, abordamos a aquisição helicoidal contínua, o controle de atenuação
                      em Unidades Hounsfield (HU) e o cálculo dosimétrico (CTDIvol e DLP) para otimização da proteção radiológica.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#0a0e17]/50 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-cyan-600 font-bold block mb-1">Módulo 4.1</span>
                        <span className={isDark ? 'text-white' : 'text-slate-900 font-medium'}>
                          Aquisição Helicoidal e Janelas
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#0a0e17]/50 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-emerald-600 font-bold block mb-1">Módulo 4.2</span>
                        <span className={isDark ? 'text-white' : 'text-slate-900 font-medium'}>
                          Reconstrução MPR 3D e Anatomia
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#0a0e17]/50 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-amber-500 font-bold block mb-1">Módulo 4.3</span>
                        <span className={isDark ? 'text-white' : 'text-slate-900 font-medium'}>
                          Fases de Contraste e Proteção
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'downloads' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isDark ? 'bg-[#0a0e17]/60 border-white/5 hover:border-cyan-500/40' : 'bg-slate-50 border-slate-200 hover:border-cyan-400'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/15 text-cyan-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Apostila_TC_Torax_Janelas.pdf
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                            Slides da Aula • 18.5 MB
                          </p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-cyan-500/15 text-cyan-600 cursor-pointer hover:bg-cyan-500/25">
                        <span className="material-symbols-outlined text-base">download</span>
                      </button>
                    </div>

                    <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isDark ? 'bg-[#0a0e17]/60 border-white/5 hover:border-emerald-500/40' : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">description</span>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Guia_Pratico_Posicionamento_TC.pdf
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                            Manual de Bolso • 4.2 MB
                          </p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 cursor-pointer hover:bg-emerald-500/25">
                        <span className="material-symbols-outlined text-base">download</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-2">
                    <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                      Suas notas são sincronizadas e salvas automaticamente:
                    </p>
                    <textarea
                      value={personalNotes}
                      onChange={e => handleSaveNotes(e.target.value)}
                      rows={5}
                      placeholder="Anote aqui pontos importantes da aula para seu resumo de provas..."
                      className={`w-full p-3 rounded-xl border outline-none text-xs font-sans ${
                        isDark
                          ? 'bg-[#0a0e17] border-white/10 text-white focus:border-[#4cd7f6]'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Chat & Roadmap (4 cols) */}
        <section className="col-span-12 xl:col-span-4 flex flex-col gap-4">
          <div className={`rounded-2xl border flex flex-col h-[750px] shadow-xl overflow-hidden ${
            isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Header Tabs */}
            <div className={`p-3 border-b flex items-center justify-between ${
              isDark ? 'bg-[#181b25]/70 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightPanelTab('chat')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    rightPanelTab === 'chat'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tirar Dúvidas
                </button>
                <button
                  onClick={() => setRightPanelTab('roadmap')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    rightPanelTab === 'roadmap'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Aulas do Módulo
                </button>
              </div>

              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  handRaised
                    ? 'bg-amber-500/20 text-amber-500 border-amber-400'
                    : isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title="Levantar mão para o monitor"
              >
                <span className="material-symbols-outlined text-sm">front_hand</span>
                <span className="hidden sm:inline">{handRaised ? 'Mão Levantada' : 'Levantar Mão'}</span>
              </button>
            </div>

            {/* Tab 1: Chat ao vivo com Professores e Monitores */}
            {rightPanelTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.isTutor
                          ? isDark
                            ? 'bg-[#4cd7f6]/10 border border-[#4cd7f6]/40'
                            : 'bg-cyan-50 border border-cyan-200'
                          : isDark
                            ? 'bg-[#0a0e17]/80 border border-white/5'
                            : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <img src={msg.avatar} alt={msg.sender} className="w-5 h-5 rounded-full object-cover" />
                          <span className={`font-semibold ${msg.isTutor ? 'text-cyan-600' : isDark ? 'text-white' : 'text-slate-900'}`}>
                            {msg.sender}
                          </span>
                          {msg.isTutor && (
                            <span className="material-symbols-outlined text-cyan-600 text-xs">verified</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-[#869397]' : 'text-slate-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                      <p className={`pl-1 leading-relaxed ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>{msg.text}</p>
                    </div>
                  ))}

                  {/* Micro Interactive Question */}
                  <div className={`p-3 rounded-xl border space-y-2 text-xs ${
                    isDark ? 'bg-[#0a0e17]/90 border-emerald-500/30' : 'bg-emerald-50/70 border-emerald-300'
                  }`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">quiz</span>
                        Fixação de Conceito
                      </span>
                    </div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Qual a atenuação média (HU) aproximada do pulmão saudável e do osso cortical, respectivamente?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setPollAnswer('a')}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          pollAnswer === 'a'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 font-bold'
                            : isDark ? 'bg-[#1c1f29] border-white/10 text-gray-300' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        0 HU e +100 HU
                      </button>
                      <button
                        onClick={() => setPollAnswer('b')}
                        className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          pollAnswer === 'b'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700'
                        }`}
                      >
                        -700 HU e +800 HU (✓)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className={`p-3 border-t ${
                  isDark ? 'bg-[#181b25]/90 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Tirar dúvida sobre TC ou radiologia..."
                      className={`w-full pl-3 pr-20 py-2 rounded-xl border text-xs outline-none ${
                        isDark
                          ? 'bg-[#0a0e17]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-[#4cd7f6]'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                      }`}
                    />
                    <button
                      type="submit"
                      className="absolute right-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#4cd7f6] text-[#090d16] font-bold text-xs shadow cursor-pointer hover:opacity-95"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Roteiro & Capítulos */}
            {rightPanelTab === 'roadmap' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Módulos da Especialização:
                </div>
                {lessons.map(les => (
                  <div
                    key={les.id}
                    onClick={() => onSelectLesson(les)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      les.id === activeLesson.id
                        ? isDark
                          ? 'bg-[#4cd7f6]/15 border-[#4cd7f6] text-white shadow-md'
                          : 'bg-cyan-50 border-cyan-500 text-slate-900 shadow-sm'
                        : isDark
                          ? 'bg-[#0a0e17]/60 border-white/5 text-[#bcc9cd] hover:bg-[#1c1f29]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-cyan-600 font-bold">
                        CAPÍTULO 0{les.chapterNumber}
                      </span>
                      {les.isCompleted ? (
                        <span className="text-emerald-600 flex items-center gap-0.5 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-xs">check_circle</span> Concluído
                        </span>
                      ) : (
                        <span className="text-amber-500 text-[10px] font-mono font-medium">Em Andamento</span>
                      )}
                    </div>
                    <p className={`font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{les.title}</p>
                    <div className={`flex justify-between items-center text-[10px] mt-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                      <span>Duração: {les.durationMinutes} min</span>
                      {les.testScore && <span className="text-emerald-600 font-semibold">Nota: {les.testScore}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* EXTRA BOTTOM SECTION: Roteiro de Aprendizagem & Módulos da Disciplina */}
        <section className="col-span-12">
          <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl space-y-4 ${
            isDark ? 'bg-[#141f38]/40 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`text-lg font-bold tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans'] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <span>Roteiro de Aprendizagem da Disciplina</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${
                    isDark
                      ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/20'
                      : 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold'
                  }`}>
                    Progresso Geral: 68%
                  </span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                  Complete os módulos teóricos, práticas no simulador de tomografia e entregas de trabalhos para obter seu diploma.
                </p>
              </div>
              <button
                onClick={onOpenSimulator}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/30'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm">science</span>
                <span>Laboratório Virtual de TC</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {lessons.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectLesson(item)}
                  className={`p-4 rounded-xl border relative overflow-hidden cursor-pointer transition-all ${
                    item.id === activeLesson.id
                      ? isDark
                        ? 'bg-[#1c1f29] border-2 border-[#4cd7f6] shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                        : 'bg-cyan-50/80 border-2 border-cyan-500 shadow-sm'
                      : isDark
                        ? 'bg-[#141f38]/60 border-[#4edea3]/30 hover:border-[#4edea3]'
                        : 'bg-white border-slate-200 hover:border-cyan-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold ${item.id === activeLesson.id ? 'text-cyan-600' : 'text-emerald-600'}`}>
                      CAPÍTULO 0{item.chapterNumber}
                    </span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <span className={`material-symbols-outlined text-sm ${item.isCompleted ? 'text-emerald-500' : 'text-cyan-500'}`}>
                        {item.isCompleted ? 'check_circle' : 'play_circle'}
                      </span>
                    </div>
                  </div>
                  <h3 className={`text-xs font-semibold mb-1 leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-[11px] mb-3 line-clamp-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                  <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                    <span>{item.durationMinutes} min</span>
                    {item.testScore && <span className="text-emerald-600 font-bold">Nota: {item.testScore}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
