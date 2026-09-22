import React, { useState, useRef, useEffect } from 'react';
import { Lesson, LessonResource, LessonNote, ThemeMode, User } from '../../types';
import { storageService } from '../../services/storage';
import { parseVideoUrl, formatDuration } from '../../utils/videoHelper';
import { InstructorContentModal } from './InstructorContentModal';
import { ResourceViewerModal } from './ResourceViewerModal';

interface ClassroomViewProps {
  lessons: Lesson[];
  onOpenSimulator: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  activeLesson: Lesson;
  currentUser?: User;
  theme?: ThemeMode;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  lessons,
  onOpenSimulator,
  onSelectLesson,
  activeLesson,
  currentUser,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const isTeacherOrAdmin = currentUser?.role === 'professor' || currentUser?.role === 'admin';

  // Video State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(activeLesson.durationMinutes * 60 || 2700);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Tabs & Panels
  const [activeTab, setActiveTab] = useState<'ementa' | 'downloads' | 'notes' | 'quiz'>('ementa');
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'roadmap'>('chat');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  // Modals
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [selectedResourceForView, setSelectedResourceForView] = useState<LessonResource | null>(null);

  // Student Notes with Timestamps
  const [noteText, setNoteText] = useState('');
  const [studentNotes, setStudentNotes] = useState<LessonNote[]>(() => activeLesson.studentNotes || []);

  // Quiz State
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(activeLesson.testScore || null);

  // Chat / Dúvidas
  const [chatInput, setChatInput] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'c1',
      sender: 'Lucas Andrade',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      time: '14:15',
      timeOffset: '08:20',
      text: 'Professor, na fase portal da tomografia de abdômen total, qual o tempo de delay ideal após iniciar a injeção do contraste iodado?'
    },
    {
      id: 'c2',
      isTutor: true,
      sender: 'Prof. Dr. Marcus Vinicius',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80',
      time: '14:17',
      text: 'Excelente pergunta, Lucas! O tempo de delay preconizado para a fase portal venosa é rigorosamente entre 65 e 75 segundos. Isso garante a opacificação homogênea do parênquima hepático e veia porta.'
    },
    {
      id: 'c3',
      sender: 'Beatriz Lima',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      time: '14:21',
      timeOffset: '15:40',
      text: 'Para pacientes com taxa de filtração glomerular reduzida, é recomendado protocolo de hidratação venosa antes da TC com contraste?'
    }
  ]);

  // Video parsing
  const parsedVideo = parseVideoUrl(activeLesson.videoUrl);

  // Sync state when activeLesson changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(activeLesson.durationMinutes * 60 || 2700);
    setStudentNotes(activeLesson.studentNotes || []);
    setUserQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(activeLesson.testScore || null);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [activeLesson.id]);

  // Video Event Handlers
  const togglePlayPause = () => {
    if (parsedVideo.type === 'html5' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * duration;
    handleSeek(newTime);
  };

  const handleSkip = (delta: number) => {
    const nextTime = Math.max(0, Math.min(duration, currentTime + delta));
    handleSeek(nextTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const handleToggleFullscreen = () => {
    const container = document.getElementById('lesson-player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Lesson Completion Toggle
  const handleToggleComplete = () => {
    const updatedLesson: Lesson = {
      ...activeLesson,
      isCompleted: !activeLesson.isCompleted,
      testScore: !activeLesson.isCompleted ? (activeLesson.testScore || 95) : activeLesson.testScore
    };
    storageService.updateLesson(updatedLesson);
    onSelectLesson(updatedLesson);
  };

  // Navigation between lessons
  const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Add Note at Current Timestamp
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote: LessonNote = {
      id: `note_${Date.now()}`,
      lessonId: activeLesson.id,
      timeSeconds: Math.floor(currentTime),
      content: noteText.trim(),
      createdAt: 'Agora'
    };

    const updatedNotes = [newNote, ...studentNotes];
    setStudentNotes(updatedNotes);
    setNoteText('');

    const updatedLesson: Lesson = {
      ...activeLesson,
      studentNotes: updatedNotes
    };
    storageService.updateLesson(updatedLesson);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = studentNotes.filter(n => n.id !== noteId);
    setStudentNotes(updatedNotes);
    const updatedLesson: Lesson = {
      ...activeLesson,
      studentNotes: updatedNotes
    };
    storageService.updateLesson(updatedLesson);
  };

  // Quiz submission
  const handleAnswerSelect = (questionId: string, optionIdx: number) => {
    setUserQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const questions = activeLesson.quizQuestions || [];
    if (questions.length === 0) return;

    let correctCount = 0;
    questions.forEach(q => {
      if (userQuizAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const calculatedPct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(calculatedPct);
    setQuizSubmitted(true);

    const updatedLesson: Lesson = {
      ...activeLesson,
      testScore: calculatedPct,
      isCompleted: calculatedPct >= 70 ? true : activeLesson.isCompleted
    };
    storageService.updateLesson(updatedLesson);
  };

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `c_${Date.now()}`,
      sender: currentUser?.name || 'Lucas Mendonça (Aluno)',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      time: 'Agora',
      timeOffset: formatDuration(currentTime),
      text: chatInput.trim()
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  // Resources filtering
  const allResources = activeLesson.resources || [];
  const filteredResources = allResources.filter(res => {
    if (resourceFilter === 'all') return true;
    return res.type === resourceFilter;
  });

  // Calculate percentage of video watched
  const playbackPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-[1720px] mx-auto space-y-6">
      {/* PROFESSOR CONTROL BANNER */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
        isDark
          ? 'bg-gradient-to-r from-[#141f38] via-[#1c1f29] to-[#0a1826] border-cyan-500/30'
          : 'bg-gradient-to-r from-cyan-50 via-white to-emerald-50 border-cyan-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#4edea3] flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-cyan-500">
                Central Docente &amp; Sala de Aulas
              </span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                isTeacherOrAdmin
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isTeacherOrAdmin ? 'Painel do Professor' : 'Ambiente Virtual do Aluno'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              Gerenciamento de vídeos em alta resolução, marcadores de capítulos, apostilas em PDF e questionários de fixação.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsInstructorModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] font-bold text-xs flex items-center gap-2 shadow-md shadow-[#06b6d4]/25 hover:opacity-95 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Studio do Professor (Gerenciar Vídeos &amp; Materiais)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video Player & Conteúdo Didático (8 cols) */}
        <section className="col-span-12 xl:col-span-8 flex flex-col gap-5">
          {/* Interactive Video Player Container */}
          <div
            id="lesson-player-container"
            className="relative rounded-2xl overflow-hidden bg-[#0a0e17] border border-white/15 shadow-[0_12px_45px_-5px_rgba(0,0,0,0.8)] ring-1 ring-[#4cd7f6]/25 group"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4cd7f6]/60 to-transparent z-20" />

            {/* Video Canvas / Player */}
            <div className="relative w-full aspect-video bg-[#000000] overflow-hidden flex items-center justify-center">
              {/* Case 1: Direct MP4 / WebM / HTML5 video */}
              {parsedVideo.type === 'html5' && (
                <video
                  ref={videoRef}
                  src={parsedVideo.originalUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlayPause}
                  className="w-full h-full object-contain cursor-pointer"
                  playsInline
                />
              )}

              {/* Case 2: YouTube Embed */}
              {parsedVideo.type === 'youtube' && (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}

              {/* Case 3: Vimeo Embed */}
              {parsedVideo.type === 'vimeo' && (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}

              {/* HUD Radiológico Superior */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none z-10">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e17]/85 backdrop-blur-md border border-white/20 text-[#4cd7f6] text-xs font-semibold shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse shadow-[0_0_8px_#4cd7f6]" />
                  AULA DIGITAL TC • 4K
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#0a0e17]/85 backdrop-blur-md border border-white/20 text-[#bcc9cd] text-xs font-mono shadow-lg">
                  CAPÍTULO 0{activeLesson.chapterNumber} • {activeLesson.ctWindowType?.toUpperCase() || 'PULMONAR'}
                </span>
              </div>

              {/* Status "Concluída" Badge no canto superior direito */}
              {activeLesson.isCompleted && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-bold text-xs shadow-lg backdrop-blur-md pointer-events-none">
                  <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                  <span>Concluída</span>
                </div>
              )}

              {/* Central Play/Pause button for HTML5 video */}
              {parsedVideo.type === 'html5' && (
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className={`absolute w-16 h-16 rounded-full bg-[#4cd7f6]/25 hover:bg-[#4cd7f6]/40 backdrop-blur-md border border-[#4cd7f6]/50 text-[#4cd7f6] flex items-center justify-center transition-all duration-300 shadow-[0_0_35px_rgba(6,182,212,0.5)] cursor-pointer z-10 ${
                    isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100 scale-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
              )}

              {/* Glass Floating Player Controls Bar (para HTML5) */}
              {parsedVideo.type === 'html5' && (
                <div className="absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 p-2.5 sm:p-3 rounded-2xl bg-[#141824]/90 backdrop-blur-xl border border-white/15 shadow-2xl z-20 transition-all duration-300">
                  {/* Timeline with Clickable Chapter Markers */}
                  <div
                    onClick={handleProgressBarClick}
                    className="relative w-full mb-2.5 sm:mb-3 h-3 flex items-center cursor-pointer group/timeline select-none"
                  >
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#06b6d4] to-[#4cd7f6] shadow-[0_0_12px_#4cd7f6] transition-all"
                        style={{ width: `${playbackPercent}%` }}
                      />
                    </div>

                    {/* Interactive Chapter Markers on timeline */}
                    {activeLesson.markers?.map((marker, idx) => {
                      const markerPercent = duration > 0 ? (marker.timeSeconds / duration) * 100 : 0;
                      if (markerPercent < 0 || markerPercent > 100) return null;
                      return (
                        <div
                          key={idx}
                          onClick={e => {
                            e.stopPropagation();
                            handleSeek(marker.timeSeconds);
                          }}
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white ring-2 ring-[#06b6d4] hover:scale-150 hover:bg-[#4cd7f6] transition-all cursor-pointer z-10 group/marker"
                          style={{ left: `${markerPercent}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:flex flex-col items-center pointer-events-none z-30">
                            <span className="px-2.5 py-1 rounded-lg bg-black/90 border border-white/20 text-[10px] font-sans text-white whitespace-nowrap shadow-xl">
                              {formatDuration(marker.timeSeconds)} • {marker.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Controls Cluster */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={togglePlayPause}
                        className="p-1.5 rounded-lg text-[#4cd7f6] hover:bg-white/10 transition-colors cursor-pointer"
                        title={isPlaying ? 'Pausar' : 'Reproduzir'}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleSkip(-10)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Voltar 10 segundos"
                      >
                        <span className="material-symbols-outlined text-xl">replay_10</span>
                      </button>

                      <button
                        onClick={() => handleSkip(10)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Avançar 10 segundos"
                      >
                        <span className="material-symbols-outlined text-xl">forward_10</span>
                      </button>

                      {/* Volume Slider */}
                      <div className="hidden sm:flex items-center gap-1.5 pl-1">
                        <button
                          onClick={handleToggleMute}
                          className="text-gray-300 hover:text-white cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isMuted || volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                          </span>
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-white/20 accent-[#4cd7f6] rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Time Counter */}
                      <span className="text-xs font-mono text-gray-300 pl-1 sm:pl-2">
                        <span className="text-white font-bold">{formatDuration(currentTime)}</span> / {formatDuration(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* Playback Speed Selector */}
                      <div className="relative flex items-center gap-1">
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map(spd => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                              playbackSpeed === spd
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      {/* Simulator Shortcut */}
                      <button
                        onClick={onOpenSimulator}
                        className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00a572]/20 border border-[#4edea3]/30 text-[#4edea3] text-xs font-mono cursor-pointer hover:bg-[#00a572]/30"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                        <span>Simulador TC</span>
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={handleToggleFullscreen}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-[#4cd7f6] cursor-pointer"
                        title="Tela Cheia"
                      >
                        <span className="material-symbols-outlined text-xl">fullscreen</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Navigation Between Lessons Bar */}
            <div className={`px-4 py-2.5 border-t flex items-center justify-between text-xs ${
              isDark ? 'bg-[#10141f] border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  disabled={!prevLesson}
                  onClick={() => prevLesson && onSelectLesson(prevLesson)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1 font-semibold transition-all ${
                    prevLesson
                      ? isDark
                        ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                        : 'bg-white hover:bg-slate-200 text-slate-800 cursor-pointer shadow-sm'
                      : 'opacity-40 cursor-not-allowed text-gray-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Aula Anterior</span>
                </button>

                <button
                  disabled={!nextLesson}
                  onClick={() => nextLesson && onSelectLesson(nextLesson)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1 font-semibold transition-all ${
                    nextLesson
                      ? isDark
                        ? 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                        : 'bg-white hover:bg-slate-200 text-slate-800 cursor-pointer shadow-sm'
                      : 'opacity-40 cursor-not-allowed text-gray-500'
                  }`}
                >
                  <span>Próxima Aula</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleComplete}
                  className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    activeLesson.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-slate-950 hover:opacity-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {activeLesson.isCompleted ? 'check_circle' : 'done'}
                  </span>
                  <span>{activeLesson.isCompleted ? 'Aula Concluída ✓' : 'Marcar como Concluída'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chapter Markers Strip */}
          {activeLesson.markers && activeLesson.markers.length > 0 && (
            <div className={`p-3.5 rounded-2xl border flex items-center gap-2 overflow-x-auto ${
              isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[11px] font-bold shrink-0 flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                <span className="material-symbols-outlined text-sm text-cyan-500">bookmarks</span>
                Capítulos:
              </span>
              <div className="flex items-center gap-2">
                {activeLesson.markers.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSeek(m.timeSeconds)}
                    className={`px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 shrink-0 border transition-all cursor-pointer ${
                      currentTime >= m.timeSeconds && (!activeLesson.markers[idx + 1] || currentTime < activeLesson.markers[idx + 1].timeSeconds)
                        ? isDark
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold shadow'
                          : 'bg-cyan-50 border-cyan-500 text-cyan-800 font-bold'
                        : isDark
                          ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-cyan-500 font-bold">
                      {formatDuration(m.timeSeconds)}
                    </span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Metadata & Instructor Profile */}
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
                    Capítulo 0{activeLesson.chapterNumber} • Tomografia Computadorizada
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
                    isDark
                      ? 'bg-[#00a572]/10 border-[#4edea3]/30 text-[#4edea3]'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Turma de Radiologia 2026
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
                      <p className="text-[10px] text-cyan-600 font-medium">Médico Radiologista • Especialista em TC</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                    <span className="material-symbols-outlined text-cyan-600 text-base">timer</span>
                    <span>Duração: {activeLesson.durationMinutes} minutos</span>
                  </div>

                  {activeLesson.testScore && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                      <span className="material-symbols-outlined text-base">grade</span>
                      <span>Nota no Quiz: {activeLesson.testScore}%</span>
                    </div>
                  )}
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

            {/* Bottom Tabs: Ementa, Recursos para Download, Anotações, Quiz */}
            <div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-b border-slate-200/20 text-xs">
                <button
                  onClick={() => setActiveTab('ementa')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'ementa'
                      ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">subject</span>
                  <span>Ementa &amp; Objetivos</span>
                </button>

                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'downloads'
                      ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">folder_open</span>
                  <span>Materiais Didáticos</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                    isDark ? 'bg-[#262a34] text-[#4cd7f6]' : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {activeLesson.resources?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'notes'
                      ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">edit_note</span>
                  <span>Minhas Anotações ({studentNotes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`pb-3 font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeTab === 'quiz'
                      ? 'text-cyan-500 border-b-2 border-cyan-500 font-bold'
                      : isDark ? 'text-[#bcc9cd] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">quiz</span>
                  <span>Quiz de Fixação</span>
                  {quizScore !== null && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      {quizScore}%
                    </span>
                  )}
                </button>
              </div>

              <div className="pt-5">
                {/* TAB 1: EMENTA */}
                {activeTab === 'ementa' && (
                  <div className={`space-y-4 text-xs leading-relaxed ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                    <p className="text-sm font-medium leading-relaxed">
                      {activeLesson.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-cyan-500 font-bold block mb-1">Competência 01</span>
                        <span className={isDark ? 'text-white' : 'text-slate-900 font-medium'}>
                          Diferenciação de Atenuação e Janelamento Hounsfield (HU)
                        </span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-emerald-500 font-bold block mb-1">Competência 02</span>
                        <span className={isDark ? 'text-white' : 'text-slate-900 font-medium'}>
                          Reconstruções 3D Multiplanares (MPR e Volume Rendering)
                        </span>
                      </div>
                      <div className={`p-3.5 rounded-xl border ${
                        isDark ? 'bg-[#0a0e17]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="text-amber-400 font-bold block mb-1">Competência 03</span>
                        <span className={isDark ? 'text-white' : 'text-slate-900 font-medium'}>
                          Protocolos de Contraste Iodado e Radioproteção (ALARA)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: MATERIAIS & RECURSOS DIDÁTICOS */}
                {activeTab === 'downloads' && (
                  <div className="space-y-4">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'all', label: 'Todos os Recursos' },
                        { id: 'pdf', label: 'Apostilas (PDF)' },
                        { id: 'protocol', label: 'Protocolos de TC' },
                        { id: 'case_study', label: 'Casos Clínicos' },
                        { id: 'spreadsheet', label: 'Planilhas & Tabelas' },
                        { id: 'podcast', label: 'Podcasts' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setResourceFilter(tab.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            resourceFilter === tab.id
                              ? isDark
                                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                                : 'bg-cyan-600 text-white font-bold'
                              : isDark
                                ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}

                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => setIsInstructorModalOpen(true)}
                          className="ml-auto px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-cyan-500/30"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          <span>Anexar Novo</span>
                        </button>
                      )}
                    </div>

                    {/* Resources Cards Grid */}
                    {filteredResources.length === 0 ? (
                      <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                        isDark ? 'bg-[#0a0e17]/50 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span className="material-symbols-outlined text-3xl text-cyan-500">folder_off</span>
                        <p>Nenhum recurso encontrado nesta categoria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {filteredResources.map(res => (
                          <div
                            key={res.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                              isDark
                                ? 'bg-[#0a0e17]/70 border-white/10 hover:border-cyan-500/40 shadow-sm'
                                : 'bg-slate-50 border-slate-200 hover:border-cyan-400 shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-2xl">
                                  {res.type === 'pdf' ? 'picture_as_pdf' : res.type === 'protocol' ? 'medical_services' : res.type === 'spreadsheet' ? 'table_chart' : res.type === 'podcast' ? 'podcasts' : 'description'}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-500">
                                    {res.type}
                                  </span>
                                  {res.fileSize && (
                                    <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                      • {res.fileSize}
                                    </span>
                                  )}
                                </div>
                                <h4 className={`text-xs font-bold leading-snug mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {res.title}
                                </h4>
                                <p className={`text-[11px] mt-1 line-clamp-2 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                                  {res.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/15 text-xs">
                              <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                                {res.authorName || 'Coordenação RadBio'}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedResourceForView(res)}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">visibility</span>
                                  <span>Visualizar</span>
                                </button>
                                <button
                                  onClick={() => setSelectedResourceForView(res)}
                                  className="p-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 cursor-pointer transition-colors"
                                  title="Baixar material"
                                >
                                  <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ANOTAÇÕES COM CARIMBO DE TEMPO */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    {/* Add note input */}
                    <form onSubmit={handleAddNote} className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-[#0a0e17]/70 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-500 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">timer</span>
                          <span>Criar Nota no Minuto Atual: <strong>{formatDuration(currentTime)}</strong></span>
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          Ao clicar no timestamp, o vídeo salta para o momento anotado
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Escreva sua anotação ou dúvida sobre este trecho da aula..."
                          className={`flex-1 p-2.5 rounded-xl border text-xs outline-none ${
                            isDark ? 'bg-[#181b25] border-white/10 text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow cursor-pointer hover:opacity-95 shrink-0 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">bookmark_add</span>
                          <span>Salvar Nota</span>
                        </button>
                      </div>
                    </form>

                    {/* Saved Notes List */}
                    <div className="space-y-2.5">
                      {studentNotes.length === 0 ? (
                        <div className={`p-6 rounded-2xl border text-center ${
                          isDark ? 'bg-[#0a0e17]/40 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          Você ainda não adicionou anotações nesta aula. Use o campo acima para gravar observações importantes.
                        </div>
                      ) : (
                        studentNotes.map(note => (
                          <div
                            key={note.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                              isDark ? 'bg-[#0a0e17]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleSeek(note.timeSeconds)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-mono font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                                title="Saltar para este momento no vídeo"
                              >
                                <span className="material-symbols-outlined text-xs">play_arrow</span>
                                <span>{formatDuration(note.timeSeconds)}</span>
                              </button>
                              <div>
                                <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                                  {note.content}
                                </p>
                                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                                  Gravado {note.createdAt}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-gray-400 hover:text-red-400 p-1 cursor-pointer"
                              title="Excluir nota"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: QUIZ DE FIXAÇÃO */}
                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    {(!activeLesson.quizQuestions || activeLesson.quizQuestions.length === 0) ? (
                      <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                        isDark ? 'bg-[#0a0e17]/50 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span className="material-symbols-outlined text-3xl text-cyan-500">quiz</span>
                        <p>Nenhum questionário cadastrado para esta aula.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitQuiz} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase tracking-wider text-cyan-500">
                            Teste de Fixação de Conhecimentos ({activeLesson.quizQuestions.length} questões)
                          </span>
                          {quizScore !== null && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Nota Final: {quizScore}%
                            </span>
                          )}
                        </div>

                        {activeLesson.quizQuestions.map((q, qIdx) => (
                          <div
                            key={q.id}
                            className={`p-4 rounded-2xl border space-y-3 ${
                              isDark ? 'bg-[#0a0e17]/80 border-white/10' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-cyan-500 font-bold">
                                QUESTÃO 0{qIdx + 1}
                              </span>
                              <h4 className={`text-xs font-bold leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {q.question}
                              </h4>
                            </div>

                            <div className="space-y-2 pt-1 text-xs">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = userQuizAnswers[q.id] === optIdx;
                                const isCorrect = optIdx === q.correctAnswerIndex;
                                let optionClasses = isDark
                                  ? 'bg-[#181b25] border-white/10 text-gray-300'
                                  : 'bg-white border-slate-200 text-slate-700';

                                if (quizSubmitted) {
                                  if (isCorrect) {
                                    optionClasses = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                                  } else if (isSelected && !isCorrect) {
                                    optionClasses = 'bg-red-500/20 border-red-500 text-red-400 font-bold';
                                  }
                                } else if (isSelected) {
                                  optionClasses = isDark
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold'
                                    : 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold';
                                }

                                return (
                                  <label
                                    key={optIdx}
                                    onClick={() => !quizSubmitted && handleAnswerSelect(q.id, optIdx)}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${optionClasses}`}
                                  >
                                    <span className="font-mono font-bold w-5 text-center">
                                      {String.fromCharCode(65 + optIdx)})
                                    </span>
                                    <span className="flex-1 leading-snug">{opt}</span>
                                    {quizSubmitted && isCorrect && (
                                      <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                                    )}
                                    {quizSubmitted && isSelected && !isCorrect && (
                                      <span className="material-symbols-outlined text-sm text-red-400">cancel</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>

                            {quizSubmitted && q.explanation && (
                              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                                isDark ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                              }`}>
                                <span className="material-symbols-outlined text-sm text-cyan-500 shrink-0 mt-0.5">help</span>
                                <div>
                                  <strong className="block mb-0.5">Comentário do Professor:</strong>
                                  <span>{q.explanation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-2">
                          <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            {quizSubmitted ? 'Respostas salvas e registradas no boletim.' : 'Responda todas as questões e clique em Enviar.'}
                          </span>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-slate-950 font-bold text-xs shadow-md shadow-[#06b6d4]/25 cursor-pointer hover:opacity-95"
                          >
                            {quizSubmitted ? 'Refazer Teste' : 'Enviar Respostas & Calcular Nota'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Chat / Dúvidas & Roadmap (4 cols) */}
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
                  Aulas do Módulo ({lessons.length})
                </button>
              </div>

              <button
                onClick={() => setHandRaised(!handRaised)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  handRaised
                    ? 'bg-amber-500/20 text-amber-500 border-amber-400'
                    : isDark ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
                title="Pedir ajuda do monitor"
              >
                <span className="material-symbols-outlined text-sm">front_hand</span>
                <span className="hidden sm:inline">{handRaised ? 'Mão Levantada' : 'Pedir Ajuda'}</span>
              </button>
            </div>

            {/* TAB 1: CHAT / FÓRUM */}
            {rightPanelTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1.5 ${
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
                          <span className={`font-semibold ${msg.isTutor ? 'text-cyan-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                            {msg.sender}
                          </span>
                          {msg.isTutor && (
                            <span className="material-symbols-outlined text-cyan-500 text-xs">verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {msg.timeOffset && (
                            <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-cyan-500/15 text-cyan-400 font-bold">
                              @{msg.timeOffset}
                            </span>
                          )}
                          <span className={`text-[10px] font-mono ${isDark ? 'text-[#869397]' : 'text-slate-400'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                      <p className={`pl-1 leading-relaxed ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>{msg.text}</p>
                    </div>
                  ))}
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
                      placeholder={`Dúvida aos ${formatDuration(currentTime)}...`}
                      className={`w-full pl-3 pr-20 py-2.5 rounded-xl border text-xs outline-none ${
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

            {/* TAB 2: ROADMAP DE AULAS */}
            {rightPanelTab === 'roadmap' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className={`text-xs font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Módulos e Aulas Disponíveis:
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
                      <span className="font-mono text-[10px] text-cyan-500 font-bold">
                        CAPÍTULO 0{les.chapterNumber}
                      </span>
                      {les.isCompleted ? (
                        <span className="text-emerald-500 flex items-center gap-0.5 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-xs">check_circle</span> Concluído
                        </span>
                      ) : (
                        <span className="text-amber-500 text-[10px] font-mono font-medium">Em Andamento</span>
                      )}
                    </div>
                    <p className={`font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{les.title}</p>
                    <div className={`flex justify-between items-center text-[10px] mt-2 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                      <span>Duração: {les.durationMinutes} min</span>
                      {les.testScore && <span className="text-emerald-500 font-semibold">Nota: {les.testScore}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM SECTION: Roteiro Completo da Disciplina */}
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
                    Progresso Geral: {Math.round((lessons.filter(l => l.isCompleted).length / lessons.length) * 100)}%
                  </span>
                </h2>
                <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                  Complete as aulas gravadas, realize os testes de fixação e pratique no simulador de tomografia para aprovação.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInstructorModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border-cyan-500/30'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">video_settings</span>
                  <span>Gerenciar Aulas e Vídeos</span>
                </button>
                <button
                  onClick={onOpenSimulator}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/30'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">science</span>
                  <span>Laboratório Virtual de TC</span>
                </button>
              </div>
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
                    <span className={`text-[10px] font-mono font-bold ${item.id === activeLesson.id ? 'text-cyan-400' : 'text-emerald-500'}`}>
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
                    <span>{item.durationMinutes} min • {item.resources?.length || 0} anexos</span>
                    {item.testScore && <span className="text-emerald-500 font-bold">Nota: {item.testScore}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <InstructorContentModal
        lessons={lessons}
        activeLesson={activeLesson}
        isOpen={isInstructorModalOpen}
        onClose={() => setIsInstructorModalOpen(false)}
        onSaveLesson={updated => {
          storageService.updateLesson(updated);
          onSelectLesson(updated);
        }}
        onAddNewLesson={newLesson => {
          storageService.addLesson(newLesson);
          onSelectLesson(newLesson);
        }}
        theme={theme}
      />

      <ResourceViewerModal
        resource={selectedResourceForView}
        onClose={() => setSelectedResourceForView(null)}
        theme={theme}
      />
    </div>
  );
};
