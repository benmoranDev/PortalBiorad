import React, { useState } from 'react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose }) => {
  const [sliceIndex, setSliceIndex] = useState(32);
  const [windowPreset, setWindowPreset] = useState<'bone' | 'lung' | 'mediastinum' | 'brain'>('lung');
  const [activePlane, setActivePlane] = useState<'axial' | 'sagittal' | 'coronal'>('axial');
  const [contrastEnabled, setContrastEnabled] = useState(true);
  const [mouseHU, setMouseHU] = useState<number | null>(-620);
  const [caliperActive, setCaliperActive] = useState(false);

  if (!isOpen) return null;

  const presets = {
    lung: { name: 'Pulmonar (HRCT)', ww: 1500, wl: -600, desc: 'Ideal para nódulos, bronquiectasias e padrão em vidro fosco.' },
    mediastinum: { name: 'Mediastino / Partes Moles', ww: 400, wl: 40, desc: 'Realce de vasos aórticos, linfonodos e hilo pulmonar.' },
    bone: { name: 'Óssea / Alta Frequência', ww: 2000, wl: 500, desc: 'Visualização de arcos costais, trabéculas vertebrais e cortical.' },
    brain: { name: 'Neuro / Crânio', ww: 80, wl: 40, desc: 'Diferenciação precisa entre substância branca e cinzenta.' }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Approximate HU based on location
    const distFromCenter = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
    if (distFromCenter > 0.44) {
      setMouseHU(-1000); // Outside air
    } else if (distFromCenter > 0.38) {
      setMouseHU(-80); // Subcutaneous fat
    } else if (windowPreset === 'bone' || (x > 0.45 && x < 0.55 && y > 0.65)) {
      setMouseHU(840); // Bone structure
    } else if (windowPreset === 'lung') {
      setMouseHU(Math.round(-750 + Math.sin(x * 10) * 120));
    } else if (contrastEnabled && distFromCenter < 0.15) {
      setMouseHU(310); // Contrast enhanced aorta / vessels
    } else {
      setMouseHU(Math.round(35 + Math.cos(y * 8) * 15));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0f131c] border border-[#4cd7f6]/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3d494c]/50 flex items-center justify-between bg-[#181b25]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#10b981] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0e17] rounded-[10px] flex items-center justify-center text-[#4cd7f6]">
                <span className="material-symbols-outlined text-2xl">neurology</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                  Simulador Interativo de Tomografia Computadorizada (TC)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30">
                  LAB VIRTUAL PARA ALUNOS
                </span>
              </div>
              <p className="text-xs text-[#bcc9cd]">
                Treinamento prático de anatomia seccional, janelamento de tecidos e atenuação Hounsfield (HU).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Simulator Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Main Visualizer Area (8 cols) */}
          <div className="lg:col-span-8 p-4 md:p-6 flex flex-col items-center justify-center bg-black/60 relative">
            {/* Telemetry OSD HUD */}
            <div className="absolute top-6 left-6 text-[11px] font-mono text-[#4cd7f6] space-y-0.5 pointer-events-none z-10 bg-black/40 p-2 rounded backdrop-blur">
              <div>PACIENTE: JOÃO SILVA (M, 48a)</div>
              <div>PROTOCOLO: TC TÓRAX TOTAL CONTRASTADO</div>
              <div>CORTE: {sliceIndex} / 64 • ESPESSURA: 1.0mm</div>
              <div>FOV: 350mm • MATRIZ: 512x512</div>
            </div>

            <div className="absolute top-6 right-6 text-[11px] font-mono text-[#4edea3] text-right pointer-events-none z-10 bg-black/40 p-2 rounded backdrop-blur">
              <div>PLANO: {activePlane.toUpperCase()}</div>
              <div>WW: {presets[windowPreset].ww} • WL: {presets[windowPreset].wl}</div>
              <div>CONTRASTE: {contrastEnabled ? 'Fase Arterial 4.0 mL/s' : 'Sem Contraste'}</div>
              <div className="text-amber-300 font-bold">SONDA: {mouseHU !== null ? `${mouseHU} HU` : '--'}</div>
            </div>

            {/* CT Scan Slice Canvas Simulation */}
            <div
              onMouseMove={handleMouseMove}
              className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] rounded-2xl border-2 border-[#3d494c]/60 bg-black flex items-center justify-center overflow-hidden cursor-crosshair shadow-2xl group"
            >
              {/* Animated scan line */}
              <div className="absolute inset-x-0 h-0.5 bg-[#4cd7f6]/40 shadow-[0_0_8px_#4cd7f6] pointer-events-none animate-pulse" style={{ top: `${(sliceIndex / 64) * 100}%` }} />

              {/* CT Anatomy Vector SVG Mock with dynamic window rendering */}
              <svg viewBox="0 0 400 400" className="w-full h-full select-none">
                {/* Outer Body Contour */}
                <ellipse
                  cx="200"
                  cy="200"
                  rx="160"
                  ry="130"
                  fill={windowPreset === 'bone' ? '#111827' : '#1e293b'}
                  stroke="#334155"
                  strokeWidth="3"
                />

                {/* Subcutaneous Fat Layer */}
                <ellipse cx="200" cy="200" rx="150" ry="122" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />

                {/* Ribs (Costas e Arcos Costais) */}
                <g fill={windowPreset === 'bone' ? '#f8fafc' : '#94a3b8'} stroke={windowPreset === 'bone' ? '#38bdf8' : 'none'}>
                  <circle cx="80" cy="180" r="10" />
                  <circle cx="85" cy="140" r="9" />
                  <circle cx="105" cy="110" r="9" />
                  <circle cx="320" cy="180" r="10" />
                  <circle cx="315" cy="140" r="9" />
                  <circle cx="295" cy="110" r="9" />
                  {/* Spine Vertebra */}
                  <path d="M185 270 L215 270 L220 300 L180 300 Z" fill={windowPreset === 'bone' ? '#ffffff' : '#cbd5e1'} />
                  <circle cx="200" cy="285" r="7" fill="#0f172a" />
                  <path d="M195 300 L205 300 L200 325 Z" fill={windowPreset === 'bone' ? '#ffffff' : '#cbd5e1'} />
                </g>

                {/* Lungs (Pulmões Direito e Esquerdo) */}
                {windowPreset === 'lung' ? (
                  <>
                    {/* Right Lung */}
                    <path
                      d="M110 140 C110 100 160 110 175 140 C185 170 175 240 120 230 C90 220 100 170 110 140 Z"
                      fill="#020617"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                    />
                    {/* Bronchovascular Tree in lung */}
                    <path d="M145 150 Q130 180 120 200 M145 160 Q160 185 165 210" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                    <circle cx="130" cy="175" r="4" fill="#ef4444" opacity="0.8" /> {/* Simulated nodule */}

                    {/* Left Lung */}
                    <path
                      d="M290 140 C290 100 240 110 225 140 C215 170 225 240 280 230 C310 220 300 170 290 140 Z"
                      fill="#020617"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                    />
                    <path d="M255 150 Q270 180 280 200 M255 160 Q240 185 235 210" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
                  </>
                ) : (
                  <>
                    <path d="M110 140 C110 100 160 110 175 140 C185 170 175 240 120 230 C90 220 100 170 110 140 Z" fill="#0f172a" />
                    <path d="M290 140 C290 100 240 110 225 140 C215 170 225 240 280 230 C310 220 300 170 290 140 Z" fill="#0f172a" />
                  </>
                )}

                {/* Mediastinum & Cardiac Shadow (Coração e Grandes Vasos) */}
                <path
                  d="M175 140 C185 115 215 115 225 140 C235 180 235 230 175 230 Z"
                  fill={windowPreset === 'mediastinum' ? '#475569' : '#1e293b'}
                />

                {/* Aorta Ascendente e Descendente com realce de contraste */}
                {contrastEnabled && (
                  <g>
                    {/* Ascending Aorta */}
                    <circle cx="190" cy="155" r="14" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" opacity="0.9" />
                    <text x="183" y="158" fill="#fff" fontSize="8" fontWeight="bold">AA</text>
                    {/* Descending Aorta */}
                    <circle cx="185" cy="245" r="12" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" opacity="0.9" />
                    <text x="179" y="248" fill="#fff" fontSize="8" fontWeight="bold">AD</text>
                    {/* Pulmonary Artery */}
                    <circle cx="215" cy="165" r="13" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" opacity="0.85" />
                  </g>
                )}

                {/* Crosshair when Caliper active */}
                {caliperActive && (
                  <g stroke="#eab308" strokeWidth="1" strokeDasharray="3 3">
                    <line x1="120" y1="175" x2="140" y2="175" />
                    <text x="145" y="178" fill="#eab308" fontSize="10" fontFamily="monospace">8.4 mm</text>
                  </g>
                )}
              </svg>

              {/* Caliper overlay label */}
              {caliperActive && (
                <div className="absolute bottom-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  PAQUÍMETRO ATIVO: Medição de nódulo 8.4mm
                </div>
              )}
            </div>

            {/* Slice Slider Bar */}
            <div className="w-full max-w-lg mt-4 px-2">
              <div className="flex justify-between items-center text-xs font-mono text-[#bcc9cd] mb-1.5">
                <span>Corte Apical (1)</span>
                <span className="text-[#4cd7f6] font-bold">Fatia Axial: {sliceIndex} / 64</span>
                <span>Corte Basal (64)</span>
              </div>
              <input
                type="range"
                min="1"
                max="64"
                value={sliceIndex}
                onChange={e => setSliceIndex(Number(e.target.value))}
                className="w-full h-2 bg-[#1c1f29] rounded-lg appearance-none cursor-pointer accent-[#4cd7f6]"
              />
            </div>
          </div>

          {/* Controls & Learning Panel (4 cols) */}
          <div className="lg:col-span-4 p-4 md:p-6 bg-[#181b25]/60 border-t lg:border-t-0 lg:border-l border-[#3d494c]/40 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Presets de Janelamento */}
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2 font-['Plus_Jakarta_Sans']">
                  Preset de Janelamento (WW / WL)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(presets) as Array<keyof typeof presets>).map(key => (
                    <button
                      key={key}
                      onClick={() => setWindowPreset(key)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        windowPreset === key
                          ? 'bg-[#4cd7f6]/20 border-[#4cd7f6] text-white shadow-sm shadow-[#4cd7f6]/20 font-bold'
                          : 'bg-[#0a0e17]/60 border-white/10 text-gray-300 hover:bg-[#1c1f29]'
                      }`}
                    >
                      <div className="truncate">{presets[key].name}</div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {presets[key].ww} / {presets[key].wl} HU
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#bcc9cd] mt-1.5 italic">
                  {presets[windowPreset].desc}
                </p>
              </div>

              {/* Plano de Visualização MPR */}
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2 font-['Plus_Jakarta_Sans']">
                  Reconstrução Multiplanar (MPR)
                </label>
                <div className="flex gap-2">
                  {(['axial', 'sagittal', 'coronal'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setActivePlane(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        activePlane === p
                          ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]'
                          : 'bg-[#0a0e17]/50 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {p === 'axial' ? 'Axial' : p === 'sagittal' ? 'Sagital' : 'Coronal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ferramentas de Estudo Radiológico */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-white uppercase tracking-wider block font-['Plus_Jakarta_Sans']">
                  Ferramentas do Operador
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e17]/60 border border-white/10 text-xs">
                  <span className="text-gray-300">Injeção de Contraste Iodado</span>
                  <button
                    onClick={() => setContrastEnabled(!contrastEnabled)}
                    className={`px-3 py-1 rounded-full font-semibold font-mono text-[11px] transition-all ${
                      contrastEnabled ? 'bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444]' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {contrastEnabled ? 'ATIVO' : 'DESLIGADO'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e17]/60 border border-white/10 text-xs">
                  <span className="text-gray-300">Paquímetro Eletrônico</span>
                  <button
                    onClick={() => setCaliperActive(!caliperActive)}
                    className={`px-3 py-1 rounded-full font-semibold font-mono text-[11px] transition-all ${
                      caliperActive ? 'bg-amber-400/20 border border-amber-400 text-amber-300' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {caliperActive ? 'MEDINDO' : 'INATIVO'}
                  </button>
                </div>
              </div>

              {/* Resumo da Escala Hounsfield */}
              <div className="p-3 rounded-xl bg-[#0a0e17]/80 border border-[#4cd7f6]/20 text-[11px] space-y-1 font-mono">
                <div className="text-[#4cd7f6] font-bold">REFERÊNCIA DE DENSIDADE (HU):</div>
                <div className="flex justify-between text-gray-400"><span>Osso Cortical:</span> <span className="text-white">+700 a +1000 HU</span></div>
                <div className="flex justify-between text-gray-400"><span>Sangue / Aorta c/ contraste:</span> <span className="text-white">+200 a +350 HU</span></div>
                <div className="flex justify-between text-gray-400"><span>Músculo / Parênquima:</span> <span className="text-white">+35 a +55 HU</span></div>
                <div className="flex justify-between text-gray-400"><span>Água Pura:</span> <span className="text-white">0 HU</span></div>
                <div className="flex justify-between text-gray-400"><span>Gordura:</span> <span className="text-white">-50 a -100 HU</span></div>
                <div className="flex justify-between text-gray-400"><span>Parênquima Pulmonar:</span> <span className="text-white">-600 a -800 HU</span></div>
                <div className="flex justify-between text-gray-400"><span>Ar Ambiente:</span> <span className="text-white">-1000 HU</span></div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] font-bold text-xs shadow-lg shadow-[#06b6d4]/30 hover:shadow-[#06b6d4]/50 transition-all"
            >
              Concluir Estudo de Caso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
