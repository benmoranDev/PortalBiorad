import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  brandTitle?: string;
  brandSubtitle?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  brandTitle = 'RadBio',
  brandSubtitle = 'Portal Acadêmico de Radiologia & Tomografia Computadorizada'
}) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Inicializando subsistemas de diagnóstico...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(25);
      setStageText('Carregando algoritmos de janelamento Hounsfield (HU)...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(55);
      setStageText('Sincronizando bancos de dados de protocolos de TC multislice...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(85);
      setStageText('Carregando grade curricular e simuladores práticos...');
    }, 1400);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setStageText('Pronto! Conectando ao ambiente do aluno...');
    }, 1800);

    const timer5 = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    const timer6 = setTimeout(() => {
      onFinish();
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070b12] text-white transition-opacity duration-500 select-none overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient medical glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid overlay for high-tech medical radiology look */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #4cd7f6 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Animated CT Gantry Icon Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#06b6d4]/40 to-[#4edea3]/40 blur-xl opacity-75 animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-3xl bg-[#0e1626] border border-[#4cd7f6]/40 flex items-center justify-center shadow-2xl shadow-[#4cd7f6]/20">
            {/* Rotating Gantry Ring SVG */}
            <svg
              className="absolute inset-2 w-20 h-20 animate-spin"
              style={{ animationDuration: '8s' }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#4cd7f6"
                strokeWidth="2"
                strokeDasharray="6 8"
                opacity="0.6"
              />
              <circle
                cx="50"
                cy="50"
                r="34"
                fill="none"
                stroke="#4edea3"
                strokeWidth="1.5"
                strokeDasharray="14 10"
                opacity="0.8"
              />
            </svg>

            {/* Central Imaging / Radiance Symbol */}
            <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#4edea3] flex items-center justify-center text-[#090d16] shadow-lg">
              <span className="material-symbols-outlined text-3xl font-black">
                radiology
              </span>
            </div>
          </div>
        </div>

        {/* Brand Name & Typography */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[#4cd7f6] text-[11px] font-mono uppercase tracking-widest font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-ping" />
            Sistema Hospitalar & Ensino
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] bg-gradient-to-r from-white via-cyan-100 to-[#4cd7f6] bg-clip-text text-transparent">
            {brandTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-xs mx-auto leading-snug">
            {brandSubtitle}
          </p>
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="w-full space-y-2 mt-3">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="truncate max-w-[280px] text-left text-cyan-300/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {stageText}
            </span>
            <span className="text-[#4cd7f6] font-bold">{progress}%</span>
          </div>

          <div className="w-full h-1.5 bg-[#141f38] rounded-full overflow-hidden border border-white/10 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-[#06b6d4] via-[#4cd7f6] to-[#4edea3] rounded-full transition-all duration-300 shadow-[0_0_12px_#4cd7f6]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Student platform badges footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-emerald-400">school</span>
            Portal 100% do Aluno
          </span>
          <span>•</span>
          <span>Simulador TC & RM</span>
          <span>•</span>
          <span>Versão 2026.1</span>
        </div>

        {/* Skip button for rapid development testing */}
        <button
          type="button"
          onClick={onFinish}
          className="mt-6 text-[11px] text-slate-500 hover:text-slate-300 font-mono transition-colors underline cursor-pointer"
        >
          Pular introdução [Enter]
        </button>
      </div>
    </div>
  );
};
