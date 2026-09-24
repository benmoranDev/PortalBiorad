import React, { useState, useRef, useEffect } from 'react';
import { CANON_ACTIVION_CASES, RealActivionCase } from '../../data/canonActivionData';
import {
  SCAN_PROTOCOLS,
  ActivionScanProtocol,
  Activion3DParameters,
  ActivionFilmingSheet,
  RawDataReconstructionPlan
} from '../../data/canonConsoleScreensData';
import {
  DicomSliceData,
  renderDicomSliceToCanvas,
  getHuAtCoordinate,
  parseUploadedDicomFile,
  generateTestDicomSeries,
  generateDicomPart10Blob
} from '../../utils/dicomEngine';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose }) => {
  const [selectedCase, setSelectedCase] = useState<RealActivionCase>(CANON_ACTIVION_CASES[0]);
  const [activeTab, setActiveTab] = useState<'Tool1' | 'Tool2' | 'Application'>('Tool1');
  
  // Top Operation Modes corresponding directly to Canon Activion 16 hardware buttons
  const [topMode, setTopMode] = useState<'MPR' | '3D' | 'Clinical' | 'Scan' | 'Filming' | 'RawData'>('MPR');
  
  // Real DICOM Multi-Slice Dataset State
  const [dicomSlices, setDicomSlices] = useState<DicomSliceData[]>(() => generateTestDicomSeries('head_ct', 256));
  const [isCustomDicomUploaded, setIsCustomDicomUploaded] = useState<boolean>(false);
  const [hoveredHu, setHoveredHu] = useState<{ hu: number; tissue: string; x: number; y: number } | null>(null);
  const [showDicomDirectoryModal, setShowDicomDirectoryModal] = useState<boolean>(false);
  const [dicomStatusNotice, setDicomStatusNotice] = useState<{ message: string; isError?: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const axialCanvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport adjustments for MPR mode
  const [activeViewport, setActiveViewport] = useState<'coronal' | 'sagittal' | 'axial'>('axial');
  const [sliceIndex, setSliceIndex] = useState<number>(12);
  const [ww, setWw] = useState<number>(selectedCase.ww);
  const [wl, setWl] = useState<number>(selectedCase.wl);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<
    'Filming' | 'Filter' | 'ImageSelector' | 'Measure' | 'Annotation' | 'Rotate' | 'ScreenSave' | 'Cursor' | 'Oblique' | 'Reset' | 'BatchMPR'
  >('Cursor');
  const [projectMode, setProjectMode] = useState<'Average' | 'MIP' | 'MinIP' | 'VR'>('Average');
  const [thicknessOption, setThicknessOption] = useState<'none' | '1.0mm' | '2.0mm' | '5.0mm'>('none');
  const [showClinicalNotes, setShowClinicalNotes] = useState<boolean>(false);
  const [showScoutLines, setShowScoutLines] = useState<boolean>(true);
  const [measureActive, setMeasureActive] = useState<boolean>(false);
  const [invertGrayscale, setInvertGrayscale] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // 3D VR Console State
  const [threeDParams, setThreeDParams] = useState<Activion3DParameters>({
    renderMode: 'Volume Rendering (VR)',
    colorMap: 'Bone & Vessel Contrast',
    windowLevel: 300,
    windowWidth: 700,
    rotationX: 18,
    rotationY: -25,
    rotationZ: 0,
    zoom: 1.1,
    cutPlaneActive: false,
    cutPlaneDepth: 50
  });

  // Scan Protocol & Execution State
  const [scanStep, setScanStep] = useState<'scout_view' | 'plan_box' | 'scan_running' | 'scan_completed'>('scout_view');
  const [activeProtocol, setActiveProtocol] = useState<ActivionScanProtocol>(SCAN_PROTOCOLS.head_standard);
  const [scoutProgress, setScoutProgress] = useState<number>(100);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [voiceCommand, setVoiceCommand] = useState<string>('Pronto para Aquisição');
  const [xrayTubeHeat, setXrayTubeHeat] = useState<number>(34); // % HU heat storage

  // Filming Camera Console State
  const [filmingSheet, setFilmingSheet] = useState<ActivionFilmingSheet>({
    sheetFormat: '3 x 4 (12 Img)',
    filmSize: '14 x 17 in',
    copies: 2,
    selectedSeries: 'AXIAL BRAIN 0.7mm',
    startSlice: 1,
    endSlice: 24,
    interval: 2,
    totalFilms: 2,
    targetPrinter: 'DRYPIX 7000 (Laser DICOM Print)'
  });
  const [printSuccessAlert, setPrintSuccessAlert] = useState<boolean>(false);

  // Raw-Data Reconstruction Plan State
  const [rawDataPlan, setRawDataPlan] = useState<RawDataReconstructionPlan>({
    reconMatrix: '512 x 512',
    filterKernel: 'FC13 (Brain Soft)',
    iterativeDenoising: 'AIDR 3D Standard',
    sliceThickness: '0.7mm',
    sliceInterval: '0.7mm',
    fovDiameter: '240mm'
  });
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [reconDoneNotice, setReconDoneNotice] = useState<boolean>(false);

  const dragStartRef = useRef<{ x: number; y: number; startWw: number; startWl: number }>({
    x: 0,
    y: 0,
    startWw: selectedCase.ww,
    startWl: selectedCase.wl
  });
  const isDraggingRef = useRef<boolean>(false);

  const handleSelectCase = (c: RealActivionCase) => {
    setSelectedCase(c);
    setSliceIndex(c.currentSlice);
    setWw(c.ww);
    setWl(c.wl);
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setRotationAngle(0);
    setShowClinicalNotes(false);

    if (c.id === 'case_karina_cranio') {
      setActiveProtocol(SCAN_PROTOCOLS.head_standard);
      setRawDataPlan(prev => ({ ...prev, filterKernel: 'FC13 (Brain Soft)', sliceThickness: '0.7mm' }));
      setDicomSlices(generateTestDicomSeries('head_ct', 256));
      setIsCustomDicomUploaded(false);
      setSliceIndex(12);
    } else if (c.id === 'case_torax_tep') {
      setActiveProtocol(SCAN_PROTOCOLS.chest_angio);
      setRawDataPlan(prev => ({ ...prev, filterKernel: 'FC07 (Lung Sharp)', sliceThickness: '1.0mm' }));
      setDicomSlices(generateTestDicomSeries('chest_ct', 256));
      setIsCustomDicomUploaded(false);
      setSliceIndex(12);
    } else {
      setActiveProtocol(SCAN_PROTOCOLS.abdomen_tri);
      setRawDataPlan(prev => ({ ...prev, filterKernel: 'FC01 (Standard Soft)', sliceThickness: '1.0mm' }));
      setDicomSlices(generateTestDicomSeries('abdomen_ct', 256));
      setIsCustomDicomUploaded(false);
      setSliceIndex(12);
    }
  };

  // Render DICOM slice to HTML5 Canvas in Axial Viewport
  useEffect(() => {
    if (topMode !== 'MPR' || !axialCanvasRef.current || dicomSlices.length === 0) return;
    const currentIdx = Math.min(dicomSlices.length - 1, Math.max(0, sliceIndex - 1));
    const slice = dicomSlices[currentIdx];
    if (slice) {
      renderDicomSliceToCanvas(slice, axialCanvasRef.current, ww, wl, invertGrayscale);
    }
  }, [topMode, sliceIndex, ww, wl, invertGrayscale, dicomSlices]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!axialCanvasRef.current || dicomSlices.length === 0) return;
    const currentIdx = Math.min(dicomSlices.length - 1, Math.max(0, sliceIndex - 1));
    const slice = dicomSlices[currentIdx];
    if (!slice) return;

    const rect = axialCanvasRef.current.getBoundingClientRect();
    const scaleX = slice.columns / rect.width;
    const scaleY = slice.rows / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const probe = getHuAtCoordinate(slice, px, py);
    setHoveredHu({ hu: probe.hu, tissue: probe.tissue, x: px, y: py });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedDicomFile(file);
      const newSlice: DicomSliceData = {
        sliceIndex: 1,
        sliceLocation: parsed.sliceLocation,
        sliceThickness: parsed.sliceThickness,
        rows: parsed.rows,
        columns: parsed.columns,
        pixelSpacing: parsed.pixelSpacing,
        rescaleIntercept: parsed.rescaleIntercept,
        rescaleSlope: parsed.rescaleSlope,
        windowCenter: parsed.windowCenter,
        windowWidth: parsed.windowWidth,
        pixelData: parsed.pixelData
      };

      setDicomSlices([newSlice]);
      setIsCustomDicomUploaded(true);
      setSliceIndex(1);
      setWw(parsed.windowWidth || 400);
      setWl(parsed.windowCenter || 40);

      setSelectedCase(prev => ({
        ...prev,
        patientName: parsed.metadata.patientName || 'PACIENTE DICOM REAL',
        patientId: parsed.metadata.patientId || 'DCM-001',
        protocolName: `${parsed.metadata.modality} ${parsed.metadata.seriesDescription || 'SCAN IMPORTADO'}`,
        studyDateTime: parsed.metadata.studyDate || prev.studyDateTime,
        kv: `${parsed.metadata.kvp || '120'}kV`,
        ma: `${parsed.metadata.tubeCurrent || '200'}mAs`,
        thickness: `${parsed.sliceThickness || '1.0'}mm`,
        totalImages: 1,
        currentSlice: 1,
        findingDescription: `Exame DICOM importado com sucesso diretamente do arquivo binário (.dcm). Resolução de matriz: ${parsed.columns}x${parsed.rows}. WL=${parsed.windowCenter} / WW=${parsed.windowWidth}. Unidades Hounsfield calculadas com Rescale Intercept = ${parsed.rescaleIntercept} e Rescale Slope = ${parsed.rescaleSlope}.`
      }));

      setDicomStatusNotice({
        message: `✅ DICOM Real Carregado: ${parsed.metadata.patientName} (${parsed.columns}x${parsed.rows}) - Tags DICOM extraídas!`,
        isError: false
      });
      setShowDicomDirectoryModal(false);
      setTimeout(() => setDicomStatusNotice(null), 5000);
    } catch (err: any) {
      console.error(err);
      setDicomStatusNotice({
        message: `❌ Erro ao ler arquivo DICOM: ${err.message || 'Arquivo corrompido ou formato não suportado'}`,
        isError: true
      });
      setTimeout(() => setDicomStatusNotice(null), 6000);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadCurrentSliceDicom = () => {
    if (dicomSlices.length === 0) return;
    const currentIdx = Math.min(dicomSlices.length - 1, Math.max(0, sliceIndex - 1));
    const slice = dicomSlices[currentIdx];
    const blob = generateDicomPart10Blob(
      slice,
      selectedCase.patientName,
      selectedCase.patientId,
      new Date().toISOString().slice(0, 10).replace(/-/g, '')
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ACTIVION16_${selectedCase.patientId}_SLICE_${sliceIndex}.dcm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDicomStatusNotice({
      message: `📥 Arquivo binário DICOM Parte 10 (.dcm) gerado e baixado! Pronto para abrir no RadiAnt, Horos ou Weasis.`,
      isError: false
    });
    setTimeout(() => setDicomStatusNotice(null), 5000);
  };

  const handleMouseDown = (e: React.MouseEvent, viewportName: 'coronal' | 'sagittal' | 'axial') => {
    setActiveViewport(viewportName);
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startWw: ww,
      startWl: wl
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (topMode === 'MPR') {
      if (activeTool === 'Cursor' || activeTool === 'Filter') {
        const nextWw = Math.max(10, Math.min(2500, dragStartRef.current.startWw + dx * 2));
        const nextWl = Math.max(-800, Math.min(1000, dragStartRef.current.startWl - dy * 1.5));
        setWw(Math.round(nextWw));
        setWl(Math.round(nextWl));
      } else if (activeTool === 'Rotate') {
        setRotationAngle(prev => (prev + dx * 0.5) % 360);
      }
    } else if (topMode === '3D') {
      setThreeDParams(prev => ({
        ...prev,
        rotationY: prev.rotationY + dx * 0.4,
        rotationX: prev.rotationX - dy * 0.4
      }));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Keyboard navigation for slice scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setSliceIndex(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        setSliceIndex(prev => Math.min(selectedCase.totalImages, prev + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCase.totalImages]);

  // Scan simulation timer
  const handleTriggerScan = () => {
    setScanStep('scan_running');
    setScanProgress(0);
    setVoiceCommand('Atenção: Respire Fundo e Prenda a Respiração...');
    setXrayTubeHeat(prev => Math.min(95, prev + 12));

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setScanStep('scan_completed');
        setVoiceCommand('Exame Concluído. Pode respirar normalmente.');
      }
    }, 350);
  };

  const handleExecuteReconstruction = () => {
    setIsReconstructing(true);
    setReconDoneNotice(false);
    setTimeout(() => {
      setIsReconstructing(false);
      setReconDoneNotice(true);
    }, 1800);
  };

  const handleSendToPrint = () => {
    setPrintSuccessAlert(true);
    setTimeout(() => setPrintSuccessAlert(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0.5 sm:p-2 bg-black/95 backdrop-blur-md select-none font-sans text-gray-200">
      {/* Activion 16 Physical Monitor Bezel Styling */}
      <div className="relative w-full max-w-[1440px] h-[98vh] max-h-[960px] bg-[#22252e] rounded-xl border-4 border-[#3a3f4b] shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-[11px]">

        {/* ===================== TOP HEADER CONSOLE (Activion 16 Style) ===================== */}
        <div className="h-8 bg-[#2d323d] border-b border-[#434958] px-3 flex items-center justify-between shrink-0 text-[#c8d1e0] font-mono text-xs">
          <div className="flex items-center gap-3">
            {/* Activion 16 Logo Script matching physical photo */}
            <div className="flex items-center gap-1.5 font-bold tracking-tight">
              <span className="italic font-serif text-base text-gray-200 font-extrabold tracking-wider drop-shadow-sm">
                Activion
              </span>
              <span className="text-[10px] text-cyan-300 font-sans font-bold bg-[#142338] px-1 rounded border border-cyan-500/40">
                16
              </span>
            </div>

            <div className="h-4 w-px bg-gray-600" />

            {/* Date Time & Volume Counters exactly as in photo */}
            <span className="text-[11px] text-gray-300 font-bold">
              Apr 12 08:23:2024
            </span>

            <div className="flex items-center gap-1.5 text-[10px] bg-[#1a1d25] px-2 py-0.5 rounded border border-[#3e4554]">
              <span className="text-gray-400 font-medium">Vol.</span>
              <span className="text-cyan-400 font-bold">5800</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400 font-medium">Img.</span>
              <span className="text-emerald-400 font-bold">{selectedCase.totalImages}</span>
            </div>

            {/* Current Active Mode Tag */}
            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 text-[10px]">
              MODO: {topMode}
            </span>
          </div>

          {/* Machine ID Tag from user's photo: "Cod. TC01" */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-black/70 border border-gray-700 text-gray-300 font-mono text-xs font-bold tracking-wider">
              {selectedCase.caseCode}
            </span>

            {/* Hidden DICOM File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".dcm,application/dicom"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Real DICOM Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Carregar arquivo DICOM (.dcm) do seu computador"
                className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xs">upload_file</span>
                <span>Importar .dcm</span>
              </button>

              <button
                onClick={handleDownloadCurrentSliceDicom}
                title="Baixar corte atual como arquivo binário DICOM Parte 10 (.dcm) oficial"
                className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                <span>Exportar .dcm</span>
              </button>

              <button
                onClick={() => setShowDicomDirectoryModal(true)}
                title="Abrir Diretório PACS / Casos DICOM de Teste"
                className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/50 text-purple-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xs">folder_open</span>
                <span>PACS DICOM</span>
              </button>
            </div>

            {/* Case Switcher Menu */}
            <select
              value={selectedCase.id}
              onChange={e => {
                const found = CANON_ACTIVION_CASES.find(c => c.id === e.target.value);
                if (found) handleSelectCase(found);
              }}
              className="bg-[#181a23] border border-gray-600 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-mono cursor-pointer"
            >
              {CANON_ACTIVION_CASES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.patientName} ({c.protocolName.slice(0, 26)})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowClinicalNotes(!showClinicalNotes)}
              className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-300 text-[10px] font-bold cursor-pointer"
            >
              Guia Clínico
            </button>

            <button
              onClick={onClose}
              title="Fechar Console Canon"
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Real DICOM Floating Status Notification Banner */}
        {dicomStatusNotice && (
          <div
            className={`px-4 py-1 text-xs font-mono font-bold flex items-center justify-between z-30 transition-all ${
              dicomStatusNotice.isError
                ? 'bg-red-950 border-b border-red-500 text-red-200'
                : 'bg-emerald-950 border-b border-emerald-500 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                {dicomStatusNotice.isError ? 'error' : 'check_circle'}
              </span>
              <span>{dicomStatusNotice.message}</span>
            </div>
            <button
              onClick={() => setDicomStatusNotice(null)}
              className="text-gray-400 hover:text-white text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* ===================== MAIN INTERACTION BODY ===================== */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden bg-[#0d0f14]" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>

          {/* ----------------- LEFT SIDEBAR: ACTIVION OPERATING SYSTEM MENU (3 Cols) ----------------- */}
          <div className="col-span-3 bg-[#303541] border-r border-[#474f60] flex flex-col justify-between overflow-y-auto p-2.5 shadow-inner">
            <div className="space-y-2">

              {/* Status Indicators (0 / 0 / 736) exactly as in photo */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#1e222b] p-1.5 rounded-lg border border-[#434b5b] text-center font-mono text-xs shadow-inner">
                <div className="bg-[#2d3340] py-1 rounded border border-[#4d5668] text-cyan-300 font-bold">
                  0
                </div>
                <div className="bg-[#2d3340] py-1 rounded border border-[#4d5668] text-cyan-300 font-bold">
                  0
                </div>
                <div className="bg-[#2d3340] py-1 rounded border border-cyan-500/50 text-emerald-400 font-extrabold shadow-sm">
                  {sliceIndex}
                </div>
              </div>

              {/* Mode Selection Grid (MPR, 3D, Clinical, Scan, Filming, Raw-Data) */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { id: 'MPR', label: 'MPR', icon: 'view_quilt' },
                  { id: '3D', label: '3D', icon: 'view_in_ar' },
                  { id: 'Clinical', label: 'Clinical', icon: 'medical_information' },
                  { id: 'Scan', label: 'Scan', icon: 'radar' },
                  { id: 'Filming', label: 'Filming', icon: 'print' },
                  { id: 'RawData', label: 'Raw-Data', icon: 'database' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTopMode(item.id as any)}
                    className={`h-12 rounded-lg border flex flex-col items-center justify-center gap-0.5 font-bold text-[10px] tracking-tight transition-all cursor-pointer ${
                      topMode === item.id
                        ? 'bg-gradient-to-b from-[#e6b422] to-[#b38600] text-slate-950 border-[#ffd043] shadow-md font-black'
                        : 'bg-gradient-to-b from-[#414757] to-[#2c313d] text-[#e0e5f0] border-[#555d70] hover:brightness-110 shadow-sm'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm leading-none">{item.icon}</span>
                    <span className="leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Sub-Panels depending on active Top Mode */}
              {topMode === 'MPR' && (
                <>
                  {/* Utility Sub-Bar with Directory & Auto Load */}
                  <div className="bg-[#242833] p-1.5 rounded-lg border border-[#444c5d] flex items-center justify-between shadow-sm">
                    <span className="text-[10px] text-gray-300 font-mono flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-xs text-amber-400">tune</span>
                      Utility
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowDicomDirectoryModal(true)}
                        className="px-2 py-0.5 bg-[#363d4e] hover:bg-[#434b5f] rounded text-[9px] font-mono border border-gray-600 text-gray-200 cursor-pointer transition-colors"
                      >
                        Directory
                      </button>
                      <button
                        onClick={() => {
                          handleSelectCase(selectedCase);
                          setDicomStatusNotice({
                            message: `Auto Load: ${dicomSlices.length} cortes DICOM recarregados com sucesso no Activion 16!`,
                            isError: false
                          });
                          setTimeout(() => setDicomStatusNotice(null), 3500);
                        }}
                        className="px-2 py-0.5 bg-[#363d4e] hover:bg-[#434b5f] rounded text-[9px] font-mono border border-gray-600 text-cyan-300 font-bold cursor-pointer transition-colors"
                      >
                        Auto Load
                      </button>
                      <div className="grid grid-cols-2 gap-0.5 ml-1">
                        <span className="px-1 py-0.2 bg-[#1b1e26] text-[8px] font-mono text-cyan-400 rounded">Cr</span>
                        <span className="px-1 py-0.2 bg-[#1b1e26] text-[8px] font-mono text-cyan-400 rounded">Sg</span>
                        <span className="px-1 py-0.2 bg-[#1b1e26] text-[8px] font-mono text-cyan-400 rounded">Ax</span>
                        <span className="px-1 py-0.2 bg-[#1b1e26] text-[8px] font-mono text-cyan-400 rounded">Ob</span>
                      </div>
                    </div>
                  </div>

                  {/* Projection & Thickness Selectors */}
                  <div className="bg-[#242833] p-2 rounded-lg border border-[#444c5d] space-y-1.5 text-[10px] font-mono shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Project:</span>
                      <select
                        value={projectMode}
                        onChange={e => setProjectMode(e.target.value as any)}
                        className="bg-[#363d4e] border border-gray-600 rounded px-2 py-0.5 text-white font-bold cursor-pointer"
                      >
                        <option value="Average">Average</option>
                        <option value="MIP">MIP</option>
                        <option value="MinIP">MinIP</option>
                        <option value="VR">VR 3D</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Thickness:</span>
                      <select
                        value={thicknessOption}
                        onChange={e => setThicknessOption(e.target.value as any)}
                        className="bg-[#363d4e] border border-gray-600 rounded px-2 py-0.5 text-white font-bold cursor-pointer"
                      >
                        <option value="none">none</option>
                        <option value="1.0mm">1.0mm</option>
                        <option value="2.0mm">2.0mm</option>
                        <option value="5.0mm">5.0mm</option>
                      </select>
                    </div>

                    <button className="w-full mt-1 py-1 rounded bg-gradient-to-b from-[#4a5264] to-[#343b48] border border-gray-600 text-gray-100 font-bold flex items-center justify-center gap-1 hover:brightness-110 shadow-sm">
                      <span className="material-symbols-outlined text-xs">save</span>
                      <span>Image Save</span>
                    </button>
                  </div>

                  {/* Tool1 / Tool2 / Application Tabs */}
                  <div className="flex border-b border-gray-600 text-[10px] font-bold">
                    {(['Tool1', 'Tool2', 'Application'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1 text-center border-t border-x rounded-t transition-all cursor-pointer ${
                          activeTab === tab
                            ? 'bg-[#3e4555] text-amber-400 border-gray-500 font-black shadow-sm'
                            : 'bg-[#252933] text-gray-400 border-transparent hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tool1 Circular Action Grid */}
                  {activeTab === 'Tool1' && (
                    <div className="grid grid-cols-3 gap-2 p-2 bg-[#242833] rounded-b-lg border-x border-b border-[#444c5d] shadow-inner">
                      {[
                        { id: 'Filming', label: 'Filming', icon: 'print', color: 'text-cyan-400' },
                        { id: 'Filter', label: 'Filter', icon: 'lens_blur', color: 'text-emerald-400' },
                        { id: 'ImageSelector', label: 'Image selector', icon: 'collections', color: 'text-amber-400' },
                        { id: 'Measure', label: 'Measure', icon: 'straighten', color: 'text-cyan-400' },
                        { id: 'Annotation', label: 'Annotation', icon: 'edit_note', color: 'text-emerald-400' },
                        { id: 'Rotate', label: 'Rotate', icon: 'rotate_right', color: 'text-amber-400' },
                        { id: 'ScreenSave', label: 'Screen Save', icon: 'photo_camera', color: 'text-cyan-400' },
                        { id: 'Cursor', label: 'Cursor', icon: 'arrow_selector_tool', color: 'text-emerald-400' },
                        { id: 'Oblique', label: 'Oblique', icon: 'view_agenda', color: 'text-amber-400' },
                        { id: 'BatchMPR', label: 'Batch MPR', icon: 'layers', color: 'text-cyan-400' },
                        { id: 'Reset', label: 'Reset', icon: 'restart_alt', color: 'text-emerald-400' },
                      ].map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            if (tool.id === 'Reset') {
                              setWw(selectedCase.ww);
                              setWl(selectedCase.wl);
                              setZoomLevel(1.0);
                              setPanOffset({ x: 0, y: 0 });
                              setRotationAngle(0);
                              setActiveTool('Cursor');
                            } else if (tool.id === 'Filming') {
                              setTopMode('Filming');
                            } else {
                              setActiveTool(tool.id as any);
                              if (tool.id === 'Measure') setMeasureActive(true);
                            }
                          }}
                          className={`h-15 w-15 mx-auto rounded-full border-2 flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                            activeTool === tool.id
                              ? 'bg-gradient-to-b from-[#0284c7] to-[#0369a1] border-cyan-300 text-white font-black shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/50'
                              : 'bg-gradient-to-b from-[#3a4150] to-[#252933] border-[#555e71] text-gray-200 hover:border-gray-400 hover:text-white shadow-md'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-base leading-none ${tool.color}`}>
                            {tool.icon}
                          </span>
                          <span className="text-[8px] mt-0.5 leading-tight font-sans text-center">
                            {tool.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tool2 Quick Windows */}
                  {activeTab === 'Tool2' && (
                    <div className="p-2 bg-[#242833] rounded-b-lg border-x border-b border-[#444c5d] space-y-1.5 text-[10px]">
                      <div className="font-bold text-gray-300 mb-1">Janelas Rápidas:</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => { setWw(88); setWl(40); }}
                          className="p-1.5 bg-[#363d4e] border border-gray-600 rounded text-cyan-300 text-left font-mono cursor-pointer"
                        >
                          <div>Crânio (Brain)</div>
                          <div className="text-[9px] text-gray-400">WW:88 WL:40</div>
                        </button>
                        <button
                          onClick={() => { setWw(2000); setWl(500); }}
                          className="p-1.5 bg-[#363d4e] border border-gray-600 rounded text-cyan-300 text-left font-mono cursor-pointer"
                        >
                          <div>Óssea (Bone)</div>
                          <div className="text-[9px] text-gray-400">WW:2000 WL:500</div>
                        </button>
                        <button
                          onClick={() => { setWw(1500); setWl(-600); }}
                          className="p-1.5 bg-[#363d4e] border border-gray-600 rounded text-cyan-300 text-left font-mono cursor-pointer"
                        >
                          <div>Pulmão (Lung)</div>
                          <div className="text-[9px] text-gray-400">WW:1500 WL:-600</div>
                        </button>
                        <button
                          onClick={() => { setWw(400); setWl(40); }}
                          className="p-1.5 bg-[#363d4e] border border-gray-600 rounded text-cyan-300 text-left font-mono cursor-pointer"
                        >
                          <div>Partes Moles</div>
                          <div className="text-[9px] text-gray-400">WW:400 WL:40</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Application Tab: SUREStart */}
                  {activeTab === 'Application' && (
                    <div className="p-2 bg-[#242833] rounded-b-lg border-x border-b border-[#444c5d] space-y-2 text-[10px] font-mono">
                      <div className="text-emerald-400 font-bold">SUREStart Tracker: 140 HU</div>
                      <div className="text-gray-400">Threshold de disparo no lúmen aórtico.</div>
                      <button
                        onClick={() => setTopMode('Scan')}
                        className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded cursor-pointer"
                      >
                        Abrir Console de Aquisição (Scan)
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 3D MODE LEFT CONTROLS */}
              {topMode === '3D' && (
                <div className="bg-[#242833] p-2.5 rounded-lg border border-[#444c5d] space-y-2 text-[10px] font-mono">
                  <div className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">view_in_ar</span>
                    <span>Parâmetros 3D VR</span>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Color Palette (LUT):</label>
                    <select
                      value={threeDParams.colorMap}
                      onChange={e => setThreeDParams(prev => ({ ...prev, colorMap: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="Bone & Vessel Contrast">Bone & Vessel Contrast</option>
                      <option value="Soft Tissue / Muscle">Soft Tissue / Muscle</option>
                      <option value="Airways (Bronchogram)">Airways (Bronchogram)</option>
                      <option value="Bone High Opacity">Bone High Opacity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Modo de Render:</label>
                    <select
                      value={threeDParams.renderMode}
                      onChange={e => setThreeDParams(prev => ({ ...prev, renderMode: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="Volume Rendering (VR)">Volume Rendering (VR)</option>
                      <option value="Shaded Surface Display (SSD)">Shaded Surface Display (SSD)</option>
                      <option value="MIP Angio">MIP Angio</option>
                      <option value="Virtual Endoscopy">Virtual Endoscopy</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-gray-700 space-y-1.5">
                    <div className="flex justify-between text-gray-300">
                      <span>Rotação 3D:</span>
                      <span className="text-cyan-300">{threeDParams.rotationY.toFixed(0)}°</span>
                    </div>
                    <button
                      onClick={() => setThreeDParams(prev => ({ ...prev, rotationY: prev.rotationY + 45 }))}
                      className="w-full py-1 bg-[#363d4e] hover:bg-[#454e63] border border-gray-600 rounded text-gray-200 font-bold"
                    >
                      Girar Objeto 3D (+45°)
                    </button>
                    <button
                      onClick={() => setThreeDParams(prev => ({ ...prev, cutPlaneActive: !prev.cutPlaneActive }))}
                      className={`w-full py-1 border rounded font-bold transition-all ${
                        threeDParams.cutPlaneActive
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-[#363d4e] border-gray-600 text-gray-300'
                      }`}
                    >
                      {threeDParams.cutPlaneActive ? 'Plano de Corte ATIVO' : 'Ativar Plano de Corte'}
                    </button>
                  </div>
                </div>
              )}

              {/* SCAN MODE LEFT CONTROLS */}
              {topMode === 'Scan' && (
                <div className="bg-[#242833] p-2.5 rounded-lg border border-[#444c5d] space-y-2 text-[10px] font-mono">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">radar</span>
                    <span>Console de Aquisição</span>
                  </div>

                  <div className="bg-black/50 p-2 rounded border border-gray-700 space-y-1">
                    <div className="text-cyan-300 font-bold">{activeProtocol.protocolName}</div>
                    <div className="text-gray-400">{activeProtocol.scanType} • {activeProtocol.pitch}</div>
                    <div className="text-amber-300 font-bold">Colimação: {activeProtocol.sliceCollimation}</div>
                    <div className="text-emerald-300">Tempo de Rotação: {activeProtocol.rotationTime}</div>
                  </div>

                  {/* Tube Capacity Display */}
                  <div className="bg-black/50 p-2 rounded border border-gray-700 space-y-1">
                    <div className="flex justify-between text-gray-300">
                      <span>Aquecimento do Tubo:</span>
                      <span className={xrayTubeHeat > 80 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {xrayTubeHeat}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${xrayTubeHeat > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${xrayTubeHeat}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700 space-y-1.5">
                    <button
                      onClick={handleTriggerScan}
                      disabled={scanStep === 'scan_running'}
                      className={`w-full py-2 rounded font-black text-xs tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                        scanStep === 'scan_running'
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:brightness-110'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      <span>{scanStep === 'scan_running' ? 'VARRENDO...' : 'INICIAR DISPARO RAIO-X'}</span>
                    </button>

                    <button
                      onClick={() => setScanStep('scout_view')}
                      className="w-full py-1 bg-[#363d4e] border border-gray-600 rounded text-gray-200"
                    >
                      Reprogramar Scout View
                    </button>
                  </div>
                </div>
              )}

              {/* FILMING CAMERA LEFT CONTROLS */}
              {topMode === 'Filming' && (
                <div className="bg-[#242833] p-2.5 rounded-lg border border-[#444c5d] space-y-2 text-[10px] font-mono">
                  <div className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">print</span>
                    <span>Câmera Laser DICOM</span>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Layout do Filme:</label>
                    <select
                      value={filmingSheet.sheetFormat}
                      onChange={e => setFilmingSheet(prev => ({ ...prev, sheetFormat: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="3 x 4 (12 Img)">3 x 4 (12 Imagens)</option>
                      <option value="4 x 5 (20 Img)">4 x 5 (20 Imagens)</option>
                      <option value="2 x 3 (6 Img)">2 x 3 (6 Imagens)</option>
                      <option value="1 x 1 (Single Full)">1 x 1 (1 Imagem Total)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Tamanho da Película:</label>
                    <select
                      value={filmingSheet.filmSize}
                      onChange={e => setFilmingSheet(prev => ({ ...prev, filmSize: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="14 x 17 in">14 x 17 polegadas (Padrão)</option>
                      <option value="11 x 14 in">11 x 14 polegadas</option>
                      <option value="8 x 10 in">8 x 10 polegadas</option>
                    </select>
                  </div>

                  <div className="bg-black/50 p-2 rounded border border-gray-700 text-gray-300 space-y-0.5">
                    <div>Impressora: <strong className="text-cyan-300">{filmingSheet.targetPrinter}</strong></div>
                    <div>Cópias: <strong>{filmingSheet.copies}</strong></div>
                    <div>Películas Geradas: <strong>{filmingSheet.totalFilms}</strong></div>
                  </div>

                  <button
                    onClick={handleSendToPrint}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:brightness-110 text-white font-bold rounded flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    <span>IMPRIMIR PELÍCULA</span>
                  </button>

                  {printSuccessAlert && (
                    <div className="p-2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-center font-bold animate-fade-in">
                      Enviado com Sucesso ao Spooler DICOM!
                    </div>
                  )}
                </div>
              )}

              {/* RAW-DATA RECONSTRUCTION LEFT CONTROLS */}
              {topMode === 'RawData' && (
                <div className="bg-[#242833] p-2.5 rounded-lg border border-[#444c5d] space-y-2 text-[10px] font-mono">
                  <div className="text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">database</span>
                    <span>Reconstrução Raw-Data</span>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Filtro de Convolução (Kernel):</label>
                    <select
                      value={rawDataPlan.filterKernel}
                      onChange={e => setRawDataPlan(prev => ({ ...prev, filterKernel: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="FC13 (Brain Soft)">FC13 (Brain Soft Tissue)</option>
                      <option value="FC07 (Lung Sharp)">FC07 (Lung High-Res Sharp)</option>
                      <option value="FC01 (Standard Soft)">FC01 (Standard Soft Tissue)</option>
                      <option value="FC30 (Bone High-Freq)">FC30 (Bone High-Frequency)</option>
                      <option value="FC52 (Inner Ear/HRCT)">FC52 (Inner Ear / Ultra HRCT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Denoising Iterativo Canon:</label>
                    <select
                      value={rawDataPlan.iterativeDenoising}
                      onChange={e => setRawDataPlan(prev => ({ ...prev, iterativeDenoising: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="AIDR 3D Standard">AIDR 3D Standard</option>
                      <option value="AIDR 3D Strong">AIDR 3D Strong</option>
                      <option value="AiCE Deep Learning">AiCE Deep Learning (Recon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Espessura do Corte:</label>
                    <select
                      value={rawDataPlan.sliceThickness}
                      onChange={e => setRawDataPlan(prev => ({ ...prev, sliceThickness: e.target.value as any }))}
                      className="w-full bg-[#363d4e] border border-gray-600 rounded px-2 py-1 text-white font-bold cursor-pointer"
                    >
                      <option value="0.5mm">0.5mm Submilimétrico</option>
                      <option value="0.7mm">0.7mm Padrão Activion</option>
                      <option value="1.0mm">1.0mm</option>
                      <option value="2.0mm">2.0mm</option>
                      <option value="5.0mm">5.0mm Grosso (Triagem)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExecuteReconstruction}
                    disabled={isReconstructing}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:brightness-110 text-white font-bold rounded flex items-center justify-center gap-1 cursor-pointer shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">memory</span>
                    <span>{isReconstructing ? 'RECONSTRUINDO...' : 'RECONSTRUIR SÉRIE'}</span>
                  </button>

                  {reconDoneNotice && (
                    <div className="p-2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-center font-bold">
                      Série Concluída com Filtro {rawDataPlan.filterKernel.slice(0, 4)}!
                    </div>
                  )}
                </div>
              )}

              {/* CLINICAL SUMMARY LEFT CONTROLS */}
              {topMode === 'Clinical' && (
                <div className="bg-[#242833] p-2.5 rounded-lg border border-[#444c5d] space-y-2 text-[10px] font-mono">
                  <div className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">medical_information</span>
                    <span>Dados Clínicos & Dose</span>
                  </div>

                  <div className="bg-black/50 p-2 rounded border border-gray-700 text-gray-300 space-y-1">
                    <div>CTDIvol Estimado: <strong className="text-amber-400">{activeProtocol.doseEstimate.ctdiVol} mGy</strong></div>
                    <div>DLP Total: <strong className="text-emerald-400">{activeProtocol.doseEstimate.dlp} mGy*cm</strong></div>
                    <div>Proteção: <strong className="text-cyan-300">SUREExposure 3D Ativo</strong></div>
                  </div>

                  <div className="text-[9px] text-gray-400 leading-tight">
                    Os níveis de dose respeitam os Níveis de Referência Diagnóstica (DRL) estabelecidos pelo Colégio Brasileiro de Radiologia (CBR).
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Status Panel */}
            <div className="mt-2 p-2 rounded-lg bg-[#1a1d25] border border-gray-800 text-[10px] font-mono text-gray-400">
              <div className="flex justify-between text-cyan-300 font-bold">
                <span>WL={wl}</span>
                <span>WW={ww}</span>
              </div>
              <div className="text-gray-500 mt-0.5">Activion16 • Canon Medical Systems</div>
            </div>
          </div>

          {/* ----------------- RIGHT AREA: DYNAMIC WORKSTATION VIEW (9 Cols) ----------------- */}
          <div className="col-span-9 bg-black overflow-hidden relative">

            {/* ==================== MODO 1: MPR 2x2 MULTI-VIEWPORT (Original da foto) ==================== */}
            {topMode === 'MPR' && (
              <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-1">

                {/* VIEWPORT 1: CORONAL */}
                <div
                  onClick={() => setActiveViewport('coronal')}
                  onMouseDown={e => handleMouseDown(e, 'coronal')}
                  className={`relative bg-black border ${
                    activeViewport === 'coronal' ? 'border-[#38bdf8] shadow-[inset_0_0_10px_rgba(56,189,248,0.3)]' : 'border-gray-800'
                  } flex items-center justify-center overflow-hidden cursor-crosshair group`}
                >
                  <div className="absolute top-1.5 left-2 z-10 font-mono text-[10px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none">
                    <div className="font-bold tracking-tight text-gray-100 flex items-center gap-1.5">
                      <span>{selectedCase.patientName}</span>
                      <span className="text-gray-300">{selectedCase.patientId}</span>
                    </div>
                    <div className="text-gray-400 text-[9px]">(239.82)</div>
                    <div className="text-gray-300 text-[9px]">173052 : 3 : 10001</div>
                    <div className="text-amber-300 font-bold text-[9px]">-0.7mm</div>
                  </div>

                  <div className="absolute top-1.5 right-2 z-10 font-mono text-[9px] text-right text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none leading-tight">
                    <div>{selectedCase.studyDateTime}</div>
                    <div>{selectedCase.kv} {selectedCase.ma}</div>
                    <div>{selectedCase.rotTime}</div>
                    <div className="text-emerald-400 font-bold">{selectedCase.hp}</div>
                  </div>

                  <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-red-500/90 bg-black/60 flex flex-col items-center justify-center font-mono text-[8px] text-red-400 font-bold z-10 pointer-events-none shadow-md">
                    <span className="text-[7px] text-white">H</span>
                    <span className="text-[7px] text-red-400">COR</span>
                  </div>

                  <img
                    src={selectedCase.images.coronal}
                    alt="Coronal MPR"
                    style={{
                      filter: `${invertGrayscale ? 'invert(1)' : 'none'} contrast(${Math.max(0.5, 200 / ww)}) brightness(${Math.max(0.6, 1 + wl / 500)})`
                    }}
                    className="w-full h-full object-contain select-none pointer-events-none"
                  />

                  {showScoutLines && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="absolute inset-x-4 h-[1.5px] bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"
                        style={{ top: `${(sliceIndex / selectedCase.totalImages) * 100}%` }}
                      >
                        <div className="absolute left-1/2 -top-1 w-2 h-2 -translate-x-1/2 border border-[#00e5ff] bg-black/50" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-1.5 left-2 z-10 font-mono text-[9px] text-gray-300 pointer-events-none leading-tight drop-shadow">
                    <div>WL={wl}</div>
                    <div>WW={ww}</div>
                    <div className="text-gray-400 text-[8px]">Activion16</div>
                  </div>
                </div>

                {/* VIEWPORT 2: SAGITTAL */}
                <div
                  onClick={() => setActiveViewport('sagittal')}
                  onMouseDown={e => handleMouseDown(e, 'sagittal')}
                  className={`relative bg-black border ${
                    activeViewport === 'sagittal' ? 'border-[#38bdf8] shadow-[inset_0_0_10px_rgba(56,189,248,0.3)]' : 'border-gray-800'
                  } flex items-center justify-center overflow-hidden cursor-crosshair group`}
                >
                  <div className="absolute top-1.5 left-2 z-10 font-mono text-[10px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none">
                    <div className="font-bold tracking-tight text-gray-100 flex items-center gap-1.5">
                      <span>{selectedCase.patientName}</span>
                      <span className="text-gray-300">{selectedCase.patientId}</span>
                    </div>
                    <div className="text-gray-400 text-[9px]">(239.82)</div>
                    <div className="text-gray-300 text-[9px]">173052 : 3 : 10001</div>
                    <div className="text-amber-300 font-bold text-[9px]">-0.7mm</div>
                  </div>

                  <div className="absolute top-1.5 right-2 z-10 font-mono text-[9px] text-right text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none leading-tight">
                    <div>{selectedCase.studyDateTime}</div>
                    <div>{selectedCase.kv} {selectedCase.ma}</div>
                    <div>{selectedCase.rotTime}</div>
                    <div className="text-emerald-400 font-bold">{selectedCase.hp}</div>
                  </div>

                  <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-emerald-400/90 bg-black/60 flex flex-col items-center justify-center font-mono text-[8px] text-emerald-300 font-bold z-10 pointer-events-none shadow-md">
                    <span className="text-[7px] text-white">H</span>
                    <span className="text-[7px] text-emerald-400">SAG</span>
                  </div>

                  <img
                    src={selectedCase.images.sagittal}
                    alt="Sagittal MPR"
                    style={{
                      filter: `${invertGrayscale ? 'invert(1)' : 'none'} contrast(${Math.max(0.5, 200 / ww)}) brightness(${Math.max(0.6, 1 + wl / 500)})`
                    }}
                    className="w-full h-full object-contain select-none pointer-events-none"
                  />

                  {showScoutLines && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="absolute inset-x-4 h-[1.5px] bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"
                        style={{ top: `${(sliceIndex / selectedCase.totalImages) * 100}%` }}
                      >
                        <div className="absolute left-1/2 -top-1 w-2 h-2 -translate-x-1/2 border border-[#00e5ff] bg-black/50" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-1.5 left-2 z-10 font-mono text-[9px] text-gray-300 pointer-events-none leading-tight drop-shadow">
                    <div>WL={wl}</div>
                    <div>WW={ww}</div>
                    <div className="text-gray-400 text-[8px]">Activion16</div>
                  </div>
                </div>

                {/* VIEWPORT 3: AXIAL (Orange Border from photo) */}
                <div
                  onClick={() => setActiveViewport('axial')}
                  onMouseDown={e => handleMouseDown(e, 'axial')}
                  onWheel={e => {
                    e.preventDefault();
                    setSliceIndex(prev => Math.min(dicomSlices.length, Math.max(1, prev + (e.deltaY > 0 ? 1 : -1))));
                  }}
                  className={`relative bg-black border-2 ${
                    activeViewport === 'axial'
                      ? 'border-[#ff9800] shadow-[0_0_20px_rgba(255,152,0,0.35)] ring-1 ring-[#ff9800]/50'
                      : 'border-gray-800'
                  } flex items-center justify-center overflow-hidden cursor-crosshair group`}
                >
                  <div className="absolute top-1.5 left-2 z-10 font-mono text-[10px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none">
                    <div className="font-bold tracking-tight text-gray-100 flex items-center gap-1.5">
                      <span>{selectedCase.patientName}</span>
                      <span className="text-gray-300">{selectedCase.patientId}</span>
                    </div>
                    <div className="text-gray-400 text-[9px]">(239.82)</div>
                    <div className="text-gray-300 text-[9px]">173052 : 3 : 10001</div>
                    <div className="text-amber-300 font-bold text-[9px]">
                      Loc: {(dicomSlices[Math.min(dicomSlices.length - 1, Math.max(0, sliceIndex - 1))]?.sliceLocation ?? 0).toFixed(1)}mm
                    </div>
                  </div>

                  <div className="absolute top-1.5 right-2 z-10 font-mono text-[9px] text-right text-gray-300 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none leading-tight">
                    <div>{selectedCase.studyDateTime}</div>
                    <div>{selectedCase.kv} {selectedCase.ma}</div>
                    <div>{selectedCase.rotTime}</div>
                    <div className="text-emerald-400 font-bold">{selectedCase.hp}</div>
                  </div>

                  {/* Real-Time Hounsfield Unit (HU) Probe HUD Badge */}
                  {hoveredHu && (
                    <div className="absolute top-11 left-2 z-20 pointer-events-none bg-black/90 border border-cyan-400/80 px-2 py-1 rounded shadow-xl font-mono text-[10px] flex items-center gap-2 backdrop-blur-sm animate-fade-in">
                      <span className="material-symbols-outlined text-xs text-amber-400">colorize</span>
                      <span className="text-amber-400 font-extrabold text-xs">
                        HU: {hoveredHu.hu > 0 ? `+${hoveredHu.hu}` : hoveredHu.hu}
                      </span>
                      <span className="text-cyan-300 text-[9px] bg-[#1a2333] px-1.5 py-0.5 rounded border border-cyan-500/40">
                        {hoveredHu.tissue}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-[#00e5ff] bg-black/60 flex flex-col items-center justify-center font-mono text-[8px] text-[#00e5ff] font-bold z-10 pointer-events-none shadow-md">
                    <span className="text-[7px] text-white">H</span>
                    <span className="text-[7px] text-[#00e5ff]">AXI</span>
                  </div>

                  <div className="absolute right-3 inset-y-12 w-2 flex flex-col justify-between py-4 pointer-events-none z-10 opacity-70">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-2 h-0.5 bg-gray-400 ml-auto" />
                    ))}
                  </div>

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <div className="w-3 h-5 border-l-2 border-y-2 border-red-500" />
                  </div>

                  <div
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px) rotate(${rotationAngle}deg)`,
                      transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="w-full h-full flex items-center justify-center relative"
                  >
                    {/* Real DICOM 16-Bit Grayscale HTML5 Canvas */}
                    <canvas
                      ref={axialCanvasRef}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={() => setHoveredHu(null)}
                      className="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl rounded"
                    />

                    {measureActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <line x1="45" y1="50" x2="55" y2="50" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="1,1" />
                          <circle cx="45" cy="50" r="1" fill="#f59e0b" />
                          <circle cx="55" cy="50" r="1" fill="#f59e0b" />
                          <text x="46" y="47" fill="#f59e0b" fontSize="3.5" fontFamily="monospace" fontWeight="bold">
                            12.4 mm
                          </text>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-1.5 left-2 z-10 font-mono text-[9px] text-gray-200 pointer-events-none leading-tight drop-shadow">
                    <div>WL={wl}</div>
                    <div>WW={ww}</div>
                    <div className="text-cyan-400 font-bold text-[8px]">
                      Corte {sliceIndex}/{dicomSlices.length} • {selectedCase.thickness}
                    </div>
                    <div className="text-gray-400 text-[8px]">Activion16 DICOM Engine</div>
                  </div>
                </div>

                {/* VIEWPORT 4: BONE 3D */}
                <div
                  onClick={() => setActiveViewport('axial')}
                  className="relative bg-black border border-gray-800 flex items-center justify-center overflow-hidden cursor-crosshair group"
                >
                  <div className="absolute top-1.5 left-2 z-10 font-mono text-[10px] leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none">
                    <div className="font-bold tracking-tight text-gray-100 flex items-center gap-1.5">
                      <span>{selectedCase.patientName}</span>
                    </div>
                    <div className="text-cyan-400 font-bold text-[9px]">BONE FILTER 0.5mm</div>
                  </div>

                  <div className="absolute bottom-2 right-2 w-7 h-7 border-2 border-purple-400/80 bg-black/60 flex items-center justify-center font-mono text-[8px] text-purple-300 font-bold z-10 pointer-events-none shadow-md">
                    3D
                  </div>

                  <img
                    src={selectedCase.images.boneAxial || selectedCase.images.axial}
                    alt="3D Bone View"
                    style={{ filter: 'contrast(1.6) brightness(1.2)' }}
                    className="w-full h-full object-contain select-none pointer-events-none opacity-85"
                  />

                  <div className="absolute bottom-1.5 left-2 z-10 font-mono text-[9px] text-gray-300 pointer-events-none leading-tight drop-shadow">
                    <div>WL=500</div>
                    <div>WW=2000</div>
                    <div className="text-gray-400 text-[8px]">Bone High-Res</div>
                  </div>
                </div>

              </div>
            )}

            {/* ==================== MODO 2: 3D VOLUME RENDERING SCREEN ==================== */}
            {topMode === '3D' && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0d14] via-[#050608] to-black p-4 relative">
                <div className="absolute top-3 left-4 z-10 font-mono text-xs text-cyan-300 bg-black/60 p-2 rounded border border-cyan-500/30">
                  <div className="font-bold text-white text-sm">CANON ACTIVION 16 • 3D VOLUME RENDERING</div>
                  <div>Paciente: {selectedCase.patientName} ({selectedCase.patientId})</div>
                  <div>LUT: {threeDParams.colorMap}</div>
                  <div>Algoritmo: {threeDParams.renderMode}</div>
                </div>

                <div className="absolute top-3 right-4 z-10 font-mono text-xs text-right text-amber-300 bg-black/60 p-2 rounded border border-amber-500/30">
                  <div>Ângulo de Visão: X={threeDParams.rotationX.toFixed(0)}° Y={threeDParams.rotationY.toFixed(0)}°</div>
                  <div>Zoom VR: {(threeDParams.zoom * 100).toFixed(0)}%</div>
                  <div className="text-emerald-400">Shading: Gouraud 3D Iluminado</div>
                </div>

                {/* Simulated 3D Render Canvas */}
                <div
                  style={{
                    transform: `perspective(800px) rotateX(${threeDParams.rotationX}deg) rotateY(${threeDParams.rotationY}deg) scale(${threeDParams.zoom})`,
                    transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out'
                  }}
                  className="relative w-96 h-96 sm:w-[480px] sm:h-[480px] rounded-2xl border border-cyan-500/40 bg-black/80 shadow-[0_0_80px_rgba(6,182,212,0.25)] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={selectedCase.images.boneAxial || selectedCase.images.coronal}
                    alt="3D Volume"
                    className="w-full h-full object-cover select-none pointer-events-none mix-blend-screen filter contrast-150 brightness-110 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]"
                  />

                  {/* Cut Plane Visualizer if enabled */}
                  {threeDParams.cutPlaneActive && (
                    <div className="absolute inset-y-0 right-0 w-1/2 border-l-2 border-red-500 bg-red-500/10 pointer-events-none flex items-center justify-center">
                      <span className="font-mono text-xs text-red-400 font-bold bg-black/80 px-2 py-1 rounded">
                        PLANO DE CORTE ATIVO (50%)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center font-mono text-xs text-gray-400">
                  Arraste com o mouse para rotacionar o volume 3D em 360° no espaço cartesiano.
                </div>
              </div>
            )}

            {/* ==================== MODO 3: SCAN & SCOUT VIEW ACQUISITION SCREEN ==================== */}
            {topMode === 'Scan' && (
              <div className="w-full h-full p-4 flex flex-col justify-between bg-[#0e1118]">
                {/* Acquisition Header Bar */}
                <div className="bg-[#181d26] p-3 rounded-xl border border-gray-700 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <div className="text-white font-bold text-sm">SISTEMA PRONTO PARA VARREDURA (Activion 16)</div>
                      <div className="text-gray-400 text-xs">
                        Protocolo: {activeProtocol.protocolName} • kV={activeProtocol.scanKv} • mAs={activeProtocol.scanMa}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-amber-400 font-bold">AVISO SONORO DO GANTRY:</div>
                    <div className="text-cyan-300 font-bold text-sm">"{voiceCommand}"</div>
                  </div>
                </div>

                {/* Central Scout View Planning Graphic */}
                <div className="flex-1 my-3 bg-black rounded-xl border border-gray-800 relative flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedCase.images.sagittal}
                    alt="Scout View"
                    className="h-full w-auto object-contain opacity-65"
                  />

                  {/* Planning Box with Top and Bottom Collimation Margins */}
                  <div className="absolute inset-y-8 inset-x-24 border-2 border-dashed border-emerald-400 bg-emerald-500/10 flex flex-col justify-between p-2 pointer-events-none">
                    <div className="flex justify-between text-emerald-300 font-mono text-xs font-bold">
                      <span>INÍCIO DO CORTE: {activeProtocol.scanRange.start}</span>
                      <span>FOV: 240mm</span>
                    </div>

                    {/* Scan Progress Bar if running */}
                    {scanStep === 'scan_running' && (
                      <div className="space-y-1">
                        <div className="h-1 w-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-pulse" style={{ marginTop: `${scanProgress}%` }} />
                        <div className="text-center font-mono text-cyan-300 font-bold text-xs bg-black/80 py-1 rounded">
                          DISPARO EM ANDAMENTO: {scanProgress}% ({activeProtocol.tableSpeed})
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-emerald-300 font-mono text-xs font-bold">
                      <span>FIM DO CORTE: {activeProtocol.scanRange.end}</span>
                      <span>ESPESSURA: {activeProtocol.sliceCollimation}</span>
                    </div>
                  </div>
                </div>

                {/* Scan Telemetry Footer */}
                <div className="grid grid-cols-4 gap-3 font-mono text-xs text-gray-300 bg-[#181d26] p-2.5 rounded-xl border border-gray-700">
                  <div>Colimação: <strong className="text-cyan-300">{activeProtocol.sliceCollimation}</strong></div>
                  <div>Avanço de Mesa: <strong className="text-white">{activeProtocol.tableSpeed}</strong></div>
                  <div>CTDIvol: <strong className="text-amber-400">{activeProtocol.doseEstimate.ctdiVol} mGy</strong></div>
                  <div>DLP: <strong className="text-emerald-400">{activeProtocol.doseEstimate.dlp} mGy*cm</strong></div>
                </div>
              </div>
            )}

            {/* ==================== MODO 4: FILMING CAMERA SCREEN (Laser DICOM Film) ==================== */}
            {topMode === 'Filming' && (
              <div className="w-full h-full p-4 flex flex-col items-center justify-center bg-[#0a0c10] overflow-y-auto">
                <div className="text-center mb-2 font-mono">
                  <h4 className="text-white font-bold text-sm">PREVIEW DE IMPRESSÃO EM PELÍCULA RADIOLÓGICA</h4>
                  <p className="text-gray-400 text-xs">
                    Formato: {filmingSheet.sheetFormat} • Película: {filmingSheet.filmSize} • Impressora: {filmingSheet.targetPrinter}
                  </p>
                </div>

                {/* Simulated Physical Black X-Ray Film Sheet with 12 Cut Windows */}
                <div className="w-[520px] h-[640px] bg-black border-4 border-gray-800 rounded-lg shadow-2xl p-3 grid grid-cols-3 grid-rows-4 gap-1.5 relative">
                  {/* Film Header Details */}
                  <div className="absolute top-1 left-3 right-3 flex justify-between font-mono text-[8px] text-gray-400">
                    <span>{selectedCase.patientName} ({selectedCase.patientId})</span>
                    <span>{selectedCase.studyDateTime} • {selectedCase.protocolName.slice(0, 20)}</span>
                    <span>HOSPITAL RADBIO CANON</span>
                  </div>

                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="relative bg-[#0d0f14] border border-gray-800 flex items-center justify-center overflow-hidden">
                      <img
                        src={selectedCase.images.axial}
                        alt={`Slice ${i + 1}`}
                        className="w-full h-full object-cover filter contrast-125"
                      />
                      <span className="absolute bottom-0.5 right-1 font-mono text-[7px] text-gray-400">
                        IMG {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== MODO 5: RAW-DATA RECONSTRUCTION SCREEN ==================== */}
            {topMode === 'RawData' && (
              <div className="w-full h-full p-6 flex flex-col justify-between bg-[#0e1119] font-mono text-xs">
                <div>
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-base mb-1">
                    <span className="material-symbols-outlined">database</span>
                    <span>ESTAÇÃO DE RECONSTRUÇÃO RETROSPECTIVA RAW-DATA (CANON ACTIVION)</span>
                  </div>
                  <p className="text-gray-400">
                    Permite reprocessar os dados brutos armazenados nos detectores com filtros de convolução e algoritmos iterativos avançados.
                  </p>
                </div>

                {/* Reconstruction Matrix Grid */}
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div className="p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-2">
                    <div className="text-white font-bold text-sm">Dados do Estudo Bruto:</div>
                    <div className="flex justify-between text-gray-400"><span>Paciente:</span> <span className="text-white">{selectedCase.patientName}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Aquisição:</span> <span className="text-white">16 Canais x 0.5mm Helical</span></div>
                    <div className="flex justify-between text-gray-400"><span>Filtro Selecionado:</span> <span className="text-cyan-300 font-bold">{rawDataPlan.filterKernel}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Espessura:</span> <span className="text-amber-300 font-bold">{rawDataPlan.sliceThickness}</span></div>
                    <div className="flex justify-between text-gray-400"><span>Denoising:</span> <span className="text-emerald-400 font-bold">{rawDataPlan.iterativeDenoising}</span></div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-gray-700 flex flex-col justify-center items-center text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-purple-400">memory</span>
                    <div className="text-white font-bold">Processador de Reconstrução GPU</div>
                    <div className="text-gray-400 text-[11px]">
                      {isReconstructing ? 'Processando projeções Radon 3D...' : 'Aguardando parâmetros do operador.'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-purple-200 text-center">
                  Dica: Para o caso de crânio, utilize o filtro <strong>FC13</strong> para diferenciar substância cinzenta e branca, ou <strong>FC30</strong> para fraturas da base do crânio.
                </div>
              </div>
            )}

            {/* ==================== MODO 6: CLINICAL SUMMARY SCREEN ==================== */}
            {topMode === 'Clinical' && (
              <div className="w-full h-full p-6 flex flex-col justify-between bg-[#0e1119] font-mono text-xs">
                <div>
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-base mb-1">
                    <span className="material-symbols-outlined">clinical_notes</span>
                    <span>DOSSIÊ CLÍNICO E LAUDO OFICIAL DO CASO</span>
                  </div>
                  <p className="text-gray-400">
                    Histórico do paciente, protocolo de injeção de contraste e relatório radiológico estruturado.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3">
                  <div className="p-4 rounded-xl bg-black/60 border border-gray-700 space-y-2">
                    <div className="text-white font-bold text-sm">História Clínica:</div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">
                      {selectedCase.findingDescription}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
                    <div className="text-cyan-300 font-bold text-sm">Dica Pedagógica do Console Canon:</div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">
                      {selectedCase.educationalNotes}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-200 text-center">
                  Status do Exame: <strong>ASSINADO ELETRONICAMENTE POR RADIOLOGISTA TITULAR</strong>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ===================== BOTTOM SLICE CONTROL & STATUS STRIP ===================== */}
        <div className="h-8 bg-[#20242e] border-t border-[#3e4554] px-3 flex items-center justify-between text-[11px] font-mono text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Ferramenta:</span>
            <span className="text-cyan-300 font-bold uppercase">{activeTool}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Modo Console:</span>
            <span className="text-amber-400 font-bold uppercase">{topMode}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSliceIndex(prev => Math.max(1, prev - 1))}
              className="px-2 py-0.5 rounded bg-[#2e3442] hover:bg-[#3b4355] text-gray-200 text-[10px] font-bold border border-gray-600 cursor-pointer"
            >
              -1
            </button>
            <input
              type="range"
              min="1"
              max={dicomSlices.length}
              value={sliceIndex}
              onChange={e => setSliceIndex(Number(e.target.value))}
              className="w-48 sm:w-72 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <button
              onClick={() => setSliceIndex(prev => Math.min(dicomSlices.length, prev + 1))}
              className="px-2 py-0.5 rounded bg-[#2e3442] hover:bg-[#3b4355] text-gray-200 text-[10px] font-bold border border-gray-600 cursor-pointer"
            >
              +1
            </button>
            <span className="text-emerald-400 font-bold min-w-[75px] text-center">
              {sliceIndex} / {dicomSlices.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScoutLines(!showScoutLines)}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                showScoutLines ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-gray-800 text-gray-500'
              }`}
            >
              Scout Lines
            </button>
          </div>
        </div>

        {/* ===================== CLINICAL GUIDANCE OVERLAY MODAL ===================== */}
        {showClinicalNotes && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#232733] border border-[#434b5b] rounded-xl p-5 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">clinical_notes</span>
                  <span>Gabarito Técnico & Diagnóstico Canon Activion 16</span>
                </div>
                <button onClick={() => setShowClinicalNotes(false)} className="text-gray-400 hover:text-white">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div>
                <span className="text-amber-400 font-bold">PACIENTE:</span>{' '}
                <span className="text-white">{selectedCase.patientName} ({selectedCase.patientId})</span>
              </div>

              <div>
                <span className="text-cyan-400 font-bold">PROTOCOLO:</span>{' '}
                <span className="text-gray-300">{selectedCase.protocolName}</span>
              </div>

              <div>
                <span className="text-emerald-400 font-bold">DESCRIÇÃO DOS ACHADOS:</span>
                <p className="text-gray-300 bg-black/50 p-2.5 rounded mt-1 leading-relaxed text-[11px]">
                  {selectedCase.findingDescription}
                </p>
              </div>

              <div>
                <span className="text-purple-400 font-bold">ORIENTAÇÕES PEDAGÓGICAS DA PLATAFORMA CANON:</span>
                <p className="text-gray-300 bg-black/50 p-2.5 rounded mt-1 leading-relaxed text-[11px]">
                  {selectedCase.educationalNotes}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowClinicalNotes(false)}
                  className="px-4 py-1.5 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors cursor-pointer"
                >
                  Continuar no Simulador
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DICOM DIRECTORY & REAL TEST DATASET MODAL ===================== */}
        {showDicomDirectoryModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-4xl bg-[#1e222c] border-2 border-[#475267] rounded-2xl p-5 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4 font-mono text-xs my-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <span className="material-symbols-outlined text-lg">folder_open</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-wide">
                      DIRETÓRIO DICOM PACS & BANCO DE CASOS REAIS (CANON ACTIVION 16)
                    </h2>
                    <p className="text-[10px] text-gray-400">
                      Imagens DICOM de 16 bits com Unidades Hounsfield reais, suporte a upload de arquivos .dcm e exportação homologada
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDicomDirectoryModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Section 1: Upload Real .DCM from PC */}
              <div className="bg-[#151821] border border-cyan-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                    <span className="material-symbols-outlined text-sm text-emerald-400">upload_file</span>
                    <span>CARREGAR ARQUIVO DICOM REAL (.dcm) DO SEU COMPUTADOR</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Você pode selecionar qualquer arquivo DICOM real (.dcm) de tomografia de qualquer fabricante (Canon, Toshiba, GE, Siemens, Philips). O motor extrai as tags de identificação, dimensões, escala HU e renderiza o corte nativo em tempo real!
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    <span>Selecionar Arquivo .dcm</span>
                  </button>

                  <button
                    onClick={handleDownloadCurrentSliceDicom}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:brightness-110 text-white font-bold rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Baixar Corte (.dcm)</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Built-in 24-slice DICOM Test Series */}
              <div className="space-y-2">
                <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">medical_services</span>
                  <span>Séries Volumétricas DICOM de Teste (24 Cortes cada com HU Calibradas)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Case 1: Cranio */}
                  <div className="bg-[#242936] border border-gray-700 hover:border-cyan-500 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 text-[9px]">
                          CRÂNIO • 0.7mm
                        </span>
                        <span className="text-gray-400 text-[10px]">24 Cortes</span>
                      </div>
                      <div className="text-white font-bold text-xs">TC Crânio Urgência (Trauma)</div>
                      <p className="text-gray-300 text-[10px] leading-relaxed">
                        Varredura axial desde a fossa posterior até o vértex. Demonstra substância branca (+31 HU), cinzenta (+38 HU), ventrículos laterais e calota craniana (+1100 HU).
                      </p>
                      <div className="text-emerald-400 text-[10px] font-bold">
                        Achado: Hematoma subdural hiperdenso (+78 HU) nos cortes 11 a 16.
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const found = CANON_ACTIVION_CASES[0];
                        if (found) handleSelectCase(found);
                        setShowDicomDirectoryModal(false);
                      }}
                      className="w-full py-1.5 bg-[#343b4d] hover:bg-cyan-600 hover:text-white text-cyan-300 font-bold rounded border border-cyan-500/40 text-center cursor-pointer transition-colors text-[10px]"
                    >
                      Carregar Série de Crânio
                    </button>
                  </div>

                  {/* Case 2: Torax TEP */}
                  <div className="bg-[#242936] border border-gray-700 hover:border-cyan-500 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800 text-[9px]">
                          TÓRAX • 1.0mm
                        </span>
                        <span className="text-gray-400 text-[10px]">24 Cortes</span>
                      </div>
                      <div className="text-white font-bold text-xs">Angio-TC de Tórax (TEP)</div>
                      <p className="text-gray-300 text-[10px] leading-relaxed">
                        Estudo angiográfico com artérias pulmonares contrastadas (+310 HU), aorta (+340 HU) e parênquima pulmonar em janela de pulmão (-750 HU).
                      </p>
                      <div className="text-cyan-400 text-[10px] font-bold">
                        Janelamento recomendado: WL -600 / WW 1500 (Pulmonar) ou WL 40 / WW 400 (Mediastino).
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const found = CANON_ACTIVION_CASES[1];
                        if (found) handleSelectCase(found);
                        setShowDicomDirectoryModal(false);
                      }}
                      className="w-full py-1.5 bg-[#343b4d] hover:bg-cyan-600 hover:text-white text-cyan-300 font-bold rounded border border-cyan-500/40 text-center cursor-pointer transition-colors text-[10px]"
                    >
                      Carregar Série de Tórax
                    </button>
                  </div>

                  {/* Case 3: Abdomen */}
                  <div className="bg-[#242936] border border-gray-700 hover:border-cyan-500 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800 text-[9px]">
                          ABDÔMEN • 1.25mm
                        </span>
                        <span className="text-gray-400 text-[10px]">24 Cortes</span>
                      </div>
                      <div className="text-white font-bold text-xs">TC Abdômen Multifásico</div>
                      <p className="text-gray-300 text-[10px] leading-relaxed">
                        Cortes axiais com contraste na fase arterial. Avaliação do parênquima hepático (+70 HU), baço (+55 HU), aorta abdominal (+290 HU) e coluna lombar (+900 HU).
                      </p>
                      <div className="text-amber-400 text-[10px] font-bold">
                        Achado: Nódulo hepático hipervascularizado com realce precoce (+145 HU).
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const found = CANON_ACTIVION_CASES[2];
                        if (found) handleSelectCase(found);
                        setShowDicomDirectoryModal(false);
                      }}
                      className="w-full py-1.5 bg-[#343b4d] hover:bg-cyan-600 hover:text-white text-cyan-300 font-bold rounded border border-cyan-500/40 text-center cursor-pointer transition-colors text-[10px]"
                    >
                      Carregar Série de Abdômen
                    </button>
                  </div>

                </div>
              </div>

              {/* Section 3: Technical Specifications Footer */}
              <div className="p-3 bg-black/60 rounded-xl border border-gray-700 text-[10px] text-gray-300 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">Conformidade DICOM:</span>
                  <span>SOP Class 1.2.840.10008.5.1.4.1.1.2 (CT Image Storage) • Matriz 16-Bit Grayscale</span>
                </div>
                <button
                  onClick={() => setShowDicomDirectoryModal(false)}
                  className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold cursor-pointer"
                >
                  Voltar ao Console
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
