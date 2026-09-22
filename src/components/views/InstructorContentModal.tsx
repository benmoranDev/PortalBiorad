import React, { useState } from 'react';
import { Lesson, LessonResource, LessonQuizQuestion, ThemeMode } from '../../types';
import { parseVideoUrl, formatDuration, parseTimeStringToSeconds } from '../../utils/videoHelper';

interface InstructorContentModalProps {
  lessons: Lesson[];
  activeLesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onSaveLesson: (updated: Lesson) => void;
  onAddNewLesson: (newLesson: Lesson) => void;
  theme?: ThemeMode;
}

export const InstructorContentModal: React.FC<InstructorContentModalProps> = ({
  lessons,
  activeLesson,
  isOpen,
  onClose,
  onSaveLesson,
  onAddNewLesson,
  theme = 'dark'
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'video' | 'resources' | 'quiz'>('video');
  const [selectedLessonId, setSelectedLessonId] = useState(activeLesson.id);

  const currentLesson = lessons.find(l => l.id === selectedLessonId) || activeLesson;

  // Video Form State
  const [title, setTitle] = useState(currentLesson.title);
  const [description, setDescription] = useState(currentLesson.description);
  const [durationMinutes, setDurationMinutes] = useState(currentLesson.durationMinutes);
  const [videoUrl, setVideoUrl] = useState(currentLesson.videoUrl);
  const [ctWindowType, setCtWindowType] = useState(currentLesson.ctWindowType || 'pulmonary');
  const [markers, setMarkers] = useState(currentLesson.markers || []);

  // New Marker state
  const [newMarkerTime, setNewMarkerTime] = useState('02:00');
  const [newMarkerLabel, setNewMarkerLabel] = useState('');

  // Resource Form State
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceType, setResourceType] = useState<LessonResource['type']>('pdf');
  const [resourceSize, setResourceSize] = useState('5.4 MB');
  const [resourcePreview, setResourcePreview] = useState('');

  // Quiz Form State
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');

  // When switching selected lesson
  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
    const target = lessons.find(l => l.id === id);
    if (target) {
      setTitle(target.title);
      setDescription(target.description);
      setDurationMinutes(target.durationMinutes);
      setVideoUrl(target.videoUrl);
      setCtWindowType(target.ctWindowType || 'pulmonary');
      setMarkers(target.markers || []);
    }
  };

  // Quick preset video URLs
  const videoPresets = [
    { label: 'Vídeo MP4 Educacional (Big Buck)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { label: 'Vídeo MP4 TC Tórax (Elephants Dream)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { label: 'Vídeo MP4 Angiotomografia (Tears of Steel)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { label: 'YouTube: Aula TC Tórax CBR', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
  ];

  const handleAddMarker = () => {
    if (!newMarkerLabel.trim()) return;
    const timeSec = parseTimeStringToSeconds(newMarkerTime);
    const updatedMarkers = [...markers, { timeSeconds: timeSec, label: newMarkerLabel.trim() }]
      .sort((a, b) => a.timeSeconds - b.timeSeconds);
    setMarkers(updatedMarkers);
    setNewMarkerLabel('');
  };

  const handleRemoveMarker = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  const handleSaveVideoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Lesson = {
      ...currentLesson,
      title,
      description,
      durationMinutes: Number(durationMinutes) || 45,
      videoUrl,
      ctWindowType,
      markers
    };
    onSaveLesson(updated);
  };

  const handleCreateNewLesson = () => {
    const nextChapter = lessons.length + 1;
    const newLesson: Lesson = {
      id: `les_${Date.now()}`,
      courseId: activeLesson.courseId || 'course_tc_701',
      chapterNumber: nextChapter,
      title: `Nova Aula: Módulo ${nextChapter} - Tomografia Computadorizada`,
      description: 'Aula gravada com foco em protocolos e diagnóstico radiológico por imagem.',
      durationMinutes: 45,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoSource: 'direct_mp4',
      isCompleted: false,
      ctWindowType: 'pulmonary',
      markers: [
        { timeSeconds: 60, label: 'Introdução e Objetivos' },
        { timeSeconds: 600, label: 'Parâmetros de Aquisição' },
        { timeSeconds: 1500, label: 'Casos Clínicos e Discussão' }
      ],
      resources: [],
      quizQuestions: []
    };
    onAddNewLesson(newLesson);
    handleSelectLesson(newLesson.id);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim()) return;
    const newRes: LessonResource = {
      id: `res_${Date.now()}`,
      lessonId: currentLesson.id,
      title: resourceTitle.trim(),
      description: resourceDesc.trim() || 'Material complementar disponibilizado pelo corpo docente.',
      type: resourceType,
      fileSize: resourceSize,
      dateAdded: 'Hoje',
      authorName: 'Prof. Dr. Marcus Vinicius',
      previewContent: resourcePreview.trim()
    };

    const updated: Lesson = {
      ...currentLesson,
      resources: [...(currentLesson.resources || []), newRes]
    };

    onSaveLesson(updated);
    setResourceTitle('');
    setResourceDesc('');
    setResourcePreview('');
  };

  const handleRemoveResource = (resourceId: string) => {
    const updated: Lesson = {
      ...currentLesson,
      resources: (currentLesson.resources || []).filter(r => r.id !== resourceId)
    };
    onSaveLesson(updated);
  };

  const handleAddQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion.trim() || quizOptions.some(o => !o.trim())) return;

    const newQ: LessonQuizQuestion = {
      id: `quiz_${Date.now()}`,
      lessonId: currentLesson.id,
      question: quizQuestion.trim(),
      options: quizOptions.map(o => o.trim()),
      correctAnswerIndex: quizCorrectIdx,
      explanation: quizExplanation.trim() || 'Explicação pedagógica elaborada pelo professor titular.'
    };

    const updated: Lesson = {
      ...currentLesson,
      quizQuestions: [...(currentLesson.quizQuestions || []), newQ]
    };

    onSaveLesson(updated);
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizExplanation('');
  };

  const handleRemoveQuizQuestion = (qId: string) => {
    const updated: Lesson = {
      ...currentLesson,
      quizQuestions: (currentLesson.quizQuestions || []).filter(q => q.id !== qId)
    };
    onSaveLesson(updated);
  };

  const parsedVideo = parseVideoUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className={`max-w-4xl w-full max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-[#181b25] border-[#4cd7f6]/40 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'border-white/10 bg-[#141f38]/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <span className="material-symbols-outlined text-2xl">video_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 font-bold">
                  Studio do Professor • Gestão de Conteúdo
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  Docente Autorizado
                </span>
              </div>
              <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                Upload de Vídeos, Capítulos e Recursos Didáticos
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNewLesson}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Nova Aula</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Lesson Selector Bar */}
        <div className={`px-5 py-3 border-b flex items-center gap-3 text-xs overflow-x-auto ${
          isDark ? 'bg-[#0e111a] border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className={`font-semibold shrink-0 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Selecione a Aula:
          </span>
          <div className="flex items-center gap-2">
            {lessons.map(les => (
              <button
                key={les.id}
                onClick={() => handleSelectLesson(les.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                  les.id === currentLesson.id
                    ? isDark
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold'
                      : 'bg-cyan-600 text-white font-bold'
                    : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                Cap. {les.chapterNumber}: {les.title.slice(0, 26)}...
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`px-5 pt-3 border-b flex items-center gap-6 text-xs ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">play_circle</span>
            <span>Vídeo &amp; Capítulos (Timestamps)</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-3 font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'resources'
                ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">folder_open</span>
            <span>Materiais Didáticos ({currentLesson.resources?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`pb-3 font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">quiz</span>
            <span>Quiz de Fixação ({currentLesson.quizQuestions?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: VIDEO & TIMESTAMPS */}
          {activeTab === 'video' && (
            <form onSubmit={handleSaveVideoSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Título da Aula
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#0e111a] border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Duração (minutos)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                        isDark ? 'bg-[#0e111a] border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Janela TC
                    </label>
                    <select
                      value={ctWindowType}
                      onChange={e => setCtWindowType(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-[#0e111a] border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                      }`}
                    >
                      <option value="pulmonary">Pulmonar (WW 1500 / WL -600)</option>
                      <option value="bone">Óssea (WW 2500 / WL +450)</option>
                      <option value="mediastinum">Mediastino (WW 400 / WL +40)</option>
                      <option value="brain">Crânio/Cerebral (WW 80 / WL +35)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Descrição e Objetivos Pedagógicos
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#0e111a] border-white/10 text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                  }`}
                />
              </div>

              {/* Video URL Input & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    URL do Vídeo da Aula (Suporta YouTube, Vimeo, ou Link MP4/WebM)
                  </label>
                  <span className="text-[10px] text-cyan-500 font-mono font-bold">
                    Tipo Detectado: {parsedVideo.type.toUpperCase()}
                  </span>
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://.../aula.mp4"
                  className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                    isDark ? 'bg-[#0e111a] border-white/10 text-cyan-300 focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-cyan-800 focus:border-cyan-500'
                  }`}
                />

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Exemplos Rápidos:</span>
                  {videoPresets.map((vp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVideoUrl(vp.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {vp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Live Preview */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#0a0e17] border-white/10' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-cyan-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">tv</span>
                    Pré-visualização do Player do Aluno
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Verifique se o vídeo carrega adequadamente
                  </span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center relative">
                  {parsedVideo.type === 'youtube' && (
                    <iframe
                      src={parsedVideo.embedUrl}
                      title="YouTube Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}

                  {parsedVideo.type === 'vimeo' && (
                    <iframe
                      src={parsedVideo.embedUrl}
                      title="Vimeo Preview"
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}

                  {parsedVideo.type === 'html5' && (
                    <video
                      controls
                      src={videoUrl}
                      className="w-full h-full object-contain"
                    >
                      Seu navegador não suporta a tag de vídeo.
                    </video>
                  )}

                  {parsedVideo.type === 'unknown' && (
                    <div className="text-gray-400 text-xs">Insira uma URL de vídeo válida acima.</div>
                  )}
                </div>
              </div>

              {/* Timestamps / Chapters Management */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#141f38]/40 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-cyan-500">schedule</span>
                    <span>Capítulos da Aula (Marcadores Clicáveis)</span>
                  </h4>
                  <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {markers.length} marcadores cadastrados
                  </span>
                </div>

                <div className="space-y-2">
                  {markers.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-[#0a0e17]/80 border-white/5' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/15 text-cyan-400 text-[11px]">
                          {formatDuration(m.timeSeconds)}
                        </span>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {m.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMarker(idx)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        title="Remover marcador"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new marker */}
                <div className="grid grid-cols-12 gap-2 pt-1">
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="03:45"
                      value={newMarkerTime}
                      onChange={e => setNewMarkerTime(e.target.value)}
                      className={`w-full p-2 rounded-xl border text-center font-mono outline-none ${
                        isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-8">
                    <input
                      type="text"
                      placeholder="Ex: Aquisição com Contraste / Janela Óssea..."
                      value={newMarkerLabel}
                      onChange={e => setNewMarkerLabel(e.target.value)}
                      className={`w-full p-2 rounded-xl border outline-none ${
                        isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddMarker}
                      className="w-full h-full rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow cursor-pointer hover:opacity-95"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>Inserir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Lesson */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-[#090d16] font-bold text-xs shadow-lg shadow-[#06b6d4]/30 cursor-pointer hover:opacity-95"
                >
                  Salvar Alterações da Aula
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: RESOURCES / MATERIAIS */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Existing Resources list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-500">
                    Materiais Anexados a Esta Aula ({currentLesson.resources?.length || 0})
                  </h3>
                </div>

                {(!currentLesson.resources || currentLesson.resources.length === 0) ? (
                  <div className={`p-6 rounded-2xl border text-center ${
                    isDark ? 'bg-[#0a0e17]/50 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    Nenhum material cadastrado nesta aula. Adicione apostilas, protocolos ou casos abaixo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentLesson.resources.map(res => (
                      <div
                        key={res.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                          isDark ? 'bg-[#141f38]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-lg">
                                {res.type === 'pdf' ? 'picture_as_pdf' : res.type === 'protocol' ? 'medical_services' : 'description'}
                              </span>
                            </div>
                            <div>
                              <h4 className={`font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {res.title}
                              </h4>
                              <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                {res.type.toUpperCase()} • {res.fileSize || '3.5 MB'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveResource(res.id)}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            title="Remover material"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                        <p className={`text-[11px] line-clamp-2 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                          {res.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form to attach new material */}
              <form onSubmit={handleAddResource} className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#0a0e17]/70 border-cyan-500/20' : 'bg-cyan-50/50 border-cyan-200'
              }`}>
                <h4 className="font-bold text-xs text-cyan-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  <span>Disponibilizar Novo Material de Apoio</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Título do Material / Documento
                    </label>
                    <input
                      type="text"
                      value={resourceTitle}
                      onChange={e => setResourceTitle(e.target.value)}
                      placeholder="Ex: Protocolo de Janelamento Pulmonar em HRCT"
                      required
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Categoria
                    </label>
                    <select
                      value={resourceType}
                      onChange={e => setResourceType(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="pdf">Apostila / Slides em PDF</option>
                      <option value="protocol">Protocolo Clínico de TC</option>
                      <option value="case_study">Estudo de Caso Ilustrado</option>
                      <option value="spreadsheet">Tabela / Planilha de Cálculo</option>
                      <option value="article">Artigo Científico / Diretriz</option>
                      <option value="podcast">Podcast / Áudio Didático</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Descrição Rápida
                    </label>
                    <input
                      type="text"
                      value={resourceDesc}
                      onChange={e => setResourceDesc(e.target.value)}
                      placeholder="Resumo em 1 linha sobre o objetivo do material..."
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Tamanho Estimado
                    </label>
                    <input
                      type="text"
                      value={resourceSize}
                      onChange={e => setResourceSize(e.target.value)}
                      placeholder="Ex: 8.2 MB"
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                        isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Conteúdo / Resumo Acadêmico para Leitura Prévia do Aluno
                  </label>
                  <textarea
                    rows={3}
                    value={resourcePreview}
                    onChange={e => setResourcePreview(e.target.value)}
                    placeholder="Insira os principais tópicos, parâmetros ou diretrizes contidas neste material..."
                    className={`w-full p-2.5 rounded-xl border outline-none font-mono text-[11px] ${
                      isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow cursor-pointer hover:opacity-95 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">attachment</span>
                    <span>Anexar Material à Aula</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: QUIZ DE FIXAÇÃO */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              {/* Existing Quiz Questions */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-500">
                  Questões Cadastradas para o Quiz ({currentLesson.quizQuestions?.length || 0})
                </h3>

                {(!currentLesson.quizQuestions || currentLesson.quizQuestions.length === 0) ? (
                  <div className={`p-6 rounded-2xl border text-center ${
                    isDark ? 'bg-[#0a0e17]/50 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    Nenhuma pergunta cadastrada. Crie questionários para fixar o aprendizado dos alunos.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentLesson.quizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border space-y-2.5 ${
                          isDark ? 'bg-[#141f38]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-cyan-500 font-bold">
                              QUESTÃO #{qIdx + 1}
                            </span>
                            <h4 className={`font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {q.question}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(q.id)}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            title="Remover pergunta"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border flex items-center gap-2 ${
                                oIdx === q.correctAnswerIndex
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-semibold'
                                  : isDark ? 'bg-black/30 border-white/5 text-gray-400' : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="font-mono font-bold">{String.fromCharCode(65 + oIdx)})</span>
                              <span>{opt}</span>
                              {oIdx === q.correctAnswerIndex && (
                                <span className="ml-auto material-symbols-outlined text-xs text-emerald-500">check</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className={`p-2 rounded-lg text-[10px] border flex items-start gap-1.5 ${
                            isDark ? 'bg-[#0a0e17] border-white/5 text-gray-300' : 'bg-white border-slate-200 text-slate-600'
                          }`}>
                            <span className="material-symbols-outlined text-xs text-cyan-500 shrink-0">info</span>
                            <span><strong>Gabarito Comentado:</strong> {q.explanation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Question */}
              <form onSubmit={handleAddQuizQuestion} className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#0a0e17]/70 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200'
              }`}>
                <h4 className="font-bold text-xs text-emerald-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">add_task</span>
                  <span>Adicionar Nova Questão de Fixação</span>
                </h4>

                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Enunciado da Questão
                  </label>
                  <input
                    type="text"
                    value={quizQuestion}
                    onChange={e => setQuizQuestion(e.target.value)}
                    placeholder="Ex: Qual o valor médio de HU da gordura corporal na TC?"
                    required
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Alternativas de Resposta (Selecione a Correta):
                  </label>
                  {quizOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuizCorrectIdx(idx)}
                        className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer border transition-all ${
                          quizCorrectIdx === idx
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow'
                            : isDark ? 'bg-[#181b25] border-white/10 text-gray-400' : 'bg-white border-slate-300 text-slate-600'
                        }`}
                        title="Marcar como gabarito correto"
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const updated = [...quizOptions];
                          updated[idx] = e.target.value;
                          setQuizOptions(updated);
                        }}
                        placeholder={`Alternativa ${String.fromCharCode(65 + idx)}...`}
                        required
                        className={`w-full p-2 rounded-xl border outline-none ${
                          quizCorrectIdx === idx
                            ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                            : isDark ? 'border-white/10' : 'border-slate-300'
                        } ${isDark ? 'bg-[#181b25] text-white' : 'bg-white text-slate-900'}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                    Justificativa / Comentário Pedagógico do Professor
                  </label>
                  <textarea
                    rows={2}
                    value={quizExplanation}
                    onChange={e => setQuizExplanation(e.target.value)}
                    placeholder="Explicação exibida ao aluno para justificar a resposta correta..."
                    className={`w-full p-2.5 rounded-xl border outline-none text-[11px] ${
                      isDark ? 'bg-[#181b25] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow cursor-pointer hover:opacity-95 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Salvar Pergunta no Quiz</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'bg-[#141f38]/60 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            As alterações são refletidas instantaneamente em tempo real para os alunos da turma.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
          >
            Concluir Edições
          </button>
        </div>
      </div>
    </div>
  );
};
