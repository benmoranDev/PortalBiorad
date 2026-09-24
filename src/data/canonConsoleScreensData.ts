export interface ActivionScanProtocol {
  protocolCode: string;
  protocolName: string;
  bodyRegion: 'HEAD' | 'CHEST' | 'ABDOMEN' | 'EXTREMITIES' | 'VASCULAR';
  scoutLength: string; // e.g. "350mm"
  scoutKv: string;
  scoutMa: string;
  scanType: 'Helical' | 'Sequential' | 'Dynamic';
  scanKv: string;
  scanMa: string;
  rotationTime: string; // "0.5s", "0.75s", "1.0s"
  sliceCollimation: string; // "16 x 0.5mm"
  pitch: string; // "HP 11.0", "HP 15.0"
  tableSpeed: string; // "13.75 mm/rot"
  scanRange: { start: string; end: string }; // "I 50.0mm" to "S 210.0mm"
  contrastInjected: boolean;
  contrastProtocol?: {
    volume: string;
    flow: string;
    delay: string;
    triggerHu: number;
    triggerVessel: string;
  };
  doseEstimate: {
    ctdiVol: number; // mGy
    dlp: number; // mGy*cm
  };
}

export interface Activion3DParameters {
  renderMode: 'Volume Rendering (VR)' | 'Shaded Surface Display (SSD)' | 'MIP Angio' | 'Virtual Endoscopy';
  colorMap: 'Bone & Vessel Contrast' | 'Soft Tissue / Muscle' | 'Airways (Bronchogram)' | 'Bone High Opacity';
  windowLevel: number;
  windowWidth: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  zoom: number;
  cutPlaneActive: boolean;
  cutPlaneDepth: number; // %
}

export interface ActivionFilmingSheet {
  sheetFormat: '3 x 4 (12 Img)' | '4 x 5 (20 Img)' | '2 x 3 (6 Img)' | '1 x 1 (Single Full)';
  filmSize: '14 x 17 in' | '11 x 14 in' | '8 x 10 in';
  copies: number;
  selectedSeries: string;
  startSlice: number;
  endSlice: number;
  interval: number;
  totalFilms: number;
  targetPrinter: string;
}

export interface RawDataReconstructionPlan {
  reconMatrix: '512 x 512' | '1024 x 1024 High-Res';
  filterKernel: 'FC01 (Standard Soft)' | 'FC07 (Lung Sharp)' | 'FC13 (Brain Soft)' | 'FC30 (Bone High-Freq)' | 'FC52 (Inner Ear/HRCT)';
  iterativeDenoising: 'AIDR 3D Standard' | 'AIDR 3D Strong' | 'AiCE Deep Learning';
  sliceThickness: '0.5mm' | '0.7mm' | '1.0mm' | '2.0mm' | '5.0mm';
  sliceInterval: '0.5mm' | '0.7mm' | '1.0mm' | '2.0mm' | '5.0mm';
  fovDiameter: string; // "240mm"
}

export const SCAN_PROTOCOLS: Record<string, ActivionScanProtocol> = {
  head_standard: {
    protocolCode: 'P-CRN-01',
    protocolName: 'HEAD STANDARD ACTIVION 16',
    bodyRegion: 'HEAD',
    scoutLength: '250mm Lat',
    scoutKv: '120kV',
    scoutMa: '30mA',
    scanType: 'Helical',
    scanKv: '120kV',
    scanMa: '180mAs',
    rotationTime: '1.0s',
    sliceCollimation: '16 x 0.5mm',
    pitch: 'HP 11.0',
    tableSpeed: '11.0 mm/rot',
    scanRange: { start: 'C1 Foramen', end: 'Vertex' },
    contrastInjected: false,
    doseEstimate: { ctdiVol: 48.5, dlp: 680 }
  },
  chest_angio: {
    protocolCode: 'P-TX-04',
    protocolName: 'CHEST ANGIO TEP SURESTART',
    bodyRegion: 'CHEST',
    scoutLength: '450mm AP',
    scoutKv: '120kV',
    scoutMa: '50mA',
    scanType: 'Helical',
    scanKv: '120kV',
    scanMa: '220mAs',
    rotationTime: '0.5s',
    sliceCollimation: '16 x 0.5mm',
    pitch: 'HP 15.0',
    tableSpeed: '20.0 mm/rot',
    scanRange: { start: 'Apices', end: 'Costophrenic Angles' },
    contrastInjected: true,
    contrastProtocol: {
      volume: '70 mL Iohexol 350',
      flow: '4.5 mL/s',
      delay: 'SureStart 120 HU',
      triggerHu: 120,
      triggerVessel: 'Tronco da Artéria Pulmonar'
    },
    doseEstimate: { ctdiVol: 11.2, dlp: 340 }
  },
  abdomen_tri: {
    protocolCode: 'P-ABD-02',
    protocolName: 'ABDOMEN 3-PHASE LIVER',
    bodyRegion: 'ABDOMEN',
    scoutLength: '500mm AP',
    scoutKv: '120kV',
    scoutMa: '50mA',
    scanType: 'Helical',
    scanKv: '120kV',
    scanMa: '240mAs',
    rotationTime: '0.75s',
    sliceCollimation: '16 x 0.5mm',
    pitch: 'HP 13.5',
    tableSpeed: '18.0 mm/rot',
    scanRange: { start: 'Dome of Diaphragm', end: 'Iliac Crest' },
    contrastInjected: true,
    contrastProtocol: {
      volume: '100 mL Iopamiron 370',
      flow: '3.5 mL/s',
      delay: 'Arterial (35s) / Portal (70s) / Late (180s)',
      triggerHu: 140,
      triggerVessel: 'Aorta Abdominal L1'
    },
    doseEstimate: { ctdiVol: 14.8, dlp: 590 }
  }
};
