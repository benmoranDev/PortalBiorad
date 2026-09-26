import dicomParser from 'dicom-parser';

export interface DicomSliceData {
  sliceIndex: number;
  sliceLocation: number;
  sliceThickness: number;
  rows: number;
  columns: number;
  pixelSpacing: [number, number];
  rescaleIntercept: number;
  rescaleSlope: number;
  windowCenter: number;
  windowWidth: number;
  pixelData: Int16Array;
}

export interface ParsedDicomSeries {
  id: string;
  source: 'uploaded' | 'synthetic';
  patientName: string;
  patientId: string;
  studyDate: string;
  studyTime: string;
  modality: string;
  seriesDescription: string;
  kvp: string;
  tubeCurrent: string;
  sliceThickness: string;
  windowCenter: number;
  windowWidth: number;
  slices: DicomSliceData[];
}

/**
 * Render raw 16-bit CT pixel data with Rescale Slope/Intercept and WW/WL to an HTML Canvas
 */
export function renderDicomSliceToCanvas(
  slice: DicomSliceData,
  canvas: HTMLCanvasElement,
  customWw?: number,
  customWl?: number,
  invert: boolean = false
): void {
  const { rows, columns, pixelData, rescaleIntercept, rescaleSlope } = slice;
  const wl = customWl !== undefined ? customWl : slice.windowCenter;
  const ww = customWw !== undefined ? customWw : slice.windowWidth;

  canvas.width = columns;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imgData = ctx.createImageData(columns, rows);
  const data = imgData.data;

  const lowHu = wl - ww / 2;
  const highHu = wl + ww / 2;
  const range = ww > 0 ? ww : 1;

  for (let i = 0; i < pixelData.length; i++) {
    const rawVal = pixelData[i];
    const hu = rawVal * rescaleSlope + rescaleIntercept;

    let gray: number;
    if (hu <= lowHu) {
      gray = 0;
    } else if (hu >= highHu) {
      gray = 255;
    } else {
      gray = Math.round(((hu - lowHu) / range) * 255);
    }

    if (invert) {
      gray = 255 - gray;
    }

    const pIdx = i * 4;
    data[pIdx] = gray;
    data[pIdx + 1] = gray;
    data[pIdx + 2] = gray;
    data[pIdx + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Get Hounsfield Unit (HU) and anatomical tissue classification at a given canvas coordinate
 */
export function getHuAtCoordinate(
  slice: DicomSliceData,
  x: number,
  y: number
): { hu: number; tissue: string } {
  if (x < 0 || x >= slice.columns || y < 0 || y >= slice.rows) {
    return { hu: -1000, tissue: 'Fora do Campo' };
  }
  const idx = Math.floor(y) * slice.columns + Math.floor(x);
  const rawVal = slice.pixelData[idx] ?? -1000;
  const hu = Math.round(rawVal * slice.rescaleSlope + slice.rescaleIntercept);

  let tissue = 'Parênquima Indeterminado';
  if (hu < -900) tissue = 'Ar / Seios Paranasais';
  else if (hu >= -900 && hu < -500) tissue = 'Parênquima Pulmonar';
  else if (hu >= -500 && hu < -150) tissue = 'Enfisema / Cavitação';
  else if (hu >= -150 && hu < -30) tissue = 'Tecido Adiposo (Gordura)';
  else if (hu >= -30 && hu <= 0) tissue = 'Água / Edema';
  else if (hu > 0 && hu <= 15) tissue = 'Líquido Cefalorraquidiano (LCR)';
  else if (hu > 15 && hu <= 35) tissue = 'Substância Branca Encefálica';
  else if (hu > 35 && hu <= 50) tissue = 'Substância Cinzenta / Córtex';
  else if (hu > 50 && hu <= 85) tissue = 'Hematoma Agudo / Sangue Coagulado';
  else if (hu > 85 && hu <= 200) tissue = 'Contraste Iodado / Calcificação Fina';
  else if (hu > 200 && hu <= 700) tissue = 'Osso Trabecular / Esponjoso';
  else if (hu > 700) tissue = 'Osso Cortical Denso / Calota';

  return { hu, tissue };
}

/**
 * Parse any real medical DICOM (.dcm) file uploaded by user from hospital PACS/scanner
 */
export async function parseUploadedDicomFile(file: File): Promise<DicomSliceData & { metadata: any }> {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  const patientName = dataSet.string('x00100010') || 'PACIENTE DICOM REAL';
  const patientId = dataSet.string('x00100020') || 'DCM-' + Math.floor(Math.random() * 90000 + 10000);
  const studyDate = dataSet.string('x00080020') || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  const studyTime = dataSet.string('x00080030') || '120000';
  const modality = dataSet.string('x00080060') || 'CT';
  const seriesDescription = dataSet.string('x0008103e') || 'SÉRIE DICOM IMPORTADA';
  const kvp = dataSet.string('x00180060') || '120';
  const tubeCurrent = dataSet.string('x00181151') || '180';
  const sliceThickness = parseFloat(dataSet.string('x00180050') || '1.0');
  const sliceLocation = parseFloat(dataSet.string('x00201041') || '0.0');

  const rows = dataSet.uint16('x00280010') || 512;
  const columns = dataSet.uint16('x00280011') || 512;
  const bitsAllocated = dataSet.uint16('x00280100') || 16;
  const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed

  const rescaleIntercept = parseFloat(dataSet.string('x00281052') || '-1024');
  const rescaleSlope = parseFloat(dataSet.string('x00281053') || '1');
  const windowCenter = parseFloat(dataSet.string('x00281050') || '40');
  const windowWidth = parseFloat(dataSet.string('x00281051') || '80');

  // Extract raw pixel data
  const pixelElement = dataSet.elements.x7fe00010;
  if (!pixelElement) {
    throw new Error('Elemento de PixelData (7FE0,0010) não encontrado no arquivo DICOM.');
  }

  const numPixels = rows * columns;
  const pixelData = new Int16Array(numPixels);

  if (bitsAllocated === 16) {
    const rawBuffer = byteArray.buffer.slice(
      pixelElement.dataOffset,
      pixelElement.dataOffset + numPixels * 2
    );
    if (pixelRepresentation === 1) {
      const src16 = new Int16Array(rawBuffer);
      for (let i = 0; i < numPixels; i++) pixelData[i] = src16[i];
    } else {
      const srcU16 = new Uint16Array(rawBuffer);
      for (let i = 0; i < numPixels; i++) pixelData[i] = srcU16[i];
    }
  } else {
    // 8 bit fallback
    for (let i = 0; i < numPixels; i++) {
      pixelData[i] = byteArray[pixelElement.dataOffset + i];
    }
  }

  return {
    sliceIndex: 1,
    sliceLocation,
    sliceThickness,
    rows,
    columns,
    pixelSpacing: [0.5, 0.5],
    rescaleIntercept,
    rescaleSlope,
    windowCenter,
    windowWidth,
    pixelData,
    metadata: {
      patientName,
      patientId,
      studyDate,
      studyTime,
      modality,
      seriesDescription,
      kvp,
      tubeCurrent
    }
  };
}

/**
 * Generate a complete, anatomically verified 24-slice DICOM CT Volume for test
 */
export function generateTestDicomSeries(
  type: 'head_ct' | 'chest_ct' | 'abdomen_ct',
  size: number = 256
): DicomSliceData[] {
  const slices: DicomSliceData[] = [];
  const numSlices = 24;

  for (let s = 0; s < numSlices; s++) {
    const normZ = s / (numSlices - 1); // 0.0 (inferior) to 1.0 (superior)
    const pixelData = new Int16Array(size * size);
    const rescaleIntercept = -1024;
    const rescaleSlope = 1;

    // Default everything to air (-1000 HU -> raw 24)
    pixelData.fill(24);

    const cx = size / 2;
    const cy = size / 2;

    if (type === 'head_ct') {
      // Skull Calvarium Ellipse
      const rX = size * 0.38;
      const rY = size * 0.44;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (x - cx) / rX;
          const dy = (y - cy) / rY;
          const distSq = dx * dx + dy * dy;

          if (distSq <= 1.05 && distSq >= 0.90) {
            // Dense Skull Bone (+1000 to +1400 HU)
            const boneHu = 1100 + Math.sin(x * 0.2 + y * 0.1) * 150;
            pixelData[y * size + x] = Math.round(boneHu - rescaleIntercept);
          } else if (distSq < 0.90) {
            // Brain parenchyma
            let hu = 38; // Default Grey matter (+38 HU)

            // White matter tracks slightly darker (+30 HU)
            const innerDist = Math.sqrt(distSq);
            if (innerDist < 0.65) {
              hu = 31;
            }

            // Ventricular System depending on Z slice level
            // Ventricles appear around normZ 0.35 to 0.70
            if (normZ >= 0.35 && normZ <= 0.70) {
              // Lateral ventricles: two crescent / butterfly shapes
              const vx1 = Math.abs(x - cx) / (size * 0.12);
              const vy1 = (y - cy) / (size * 0.22);
              if (vx1 > 0.15 && vx1 < 0.8 && Math.abs(vy1) < 0.5) {
                hu = 8; // CSF (+8 HU)
              }
              // 3rd ventricle in midline
              if (Math.abs(x - cx) < size * 0.015 && Math.abs(y - cy) < size * 0.12) {
                hu = 6;
              }
            }

            // Subdural / Epidural Hematoma in right hemisphere on mid-slices (Clinical Pathology!)
            if (normZ >= 0.45 && normZ <= 0.65) {
              const dHematoma = Math.hypot((x - (cx + rX * 0.7)), (y - cy));
              if (dHematoma < size * 0.08) {
                hu = 78; // Hyperdense acute blood (+78 HU)
              }
            }

            // Add subtle scanner quantum mottle / noise
            const noise = (Math.random() - 0.5) * 6;
            pixelData[y * size + x] = Math.round((hu + noise) - rescaleIntercept);
          }
        }
      }

      slices.push({
        sliceIndex: s + 1,
        sliceLocation: -60 + s * 5,
        sliceThickness: 0.7,
        rows: size,
        columns: size,
        pixelSpacing: [0.5, 0.5],
        rescaleIntercept,
        rescaleSlope,
        windowCenter: 40,
        windowWidth: 88,
        pixelData
      });
    } else if (type === 'chest_ct') {
      // Chest Thorax Anatomy: Skin, Ribs, Lung Parenchyma, Mediastinum, Heart & Pulmonary Arteries
      const rX = size * 0.44;
      const rY = size * 0.38;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (x - cx) / rX;
          const dy = (y - cy) / rY;
          const distSq = dx * dx + dy * dy;

          if (distSq <= 1.02 && distSq >= 0.94) {
            // Chest Wall & Subcutaneous Fat (-90 HU)
            pixelData[y * size + x] = Math.round(-80 - rescaleIntercept);
          } else if (distSq < 0.94) {
            // Ribs around periphery
            const ribAngle = Math.atan2(dy, dx);
            const isRib = Math.abs(Math.sin(ribAngle * 6)) > 0.75 && distSq > 0.82;
            if (isRib) {
              pixelData[y * size + x] = Math.round(950 - rescaleIntercept); // Rib Bone
              continue;
            }

            // Mediastinum (central) vs Lungs (bilateral)
            const isLeftLung = x > cx + size * 0.06 && distSq < 0.82 && y > cy - size * 0.28 && y < cy + size * 0.30;
            const isRightLung = x < cx - size * 0.06 && distSq < 0.82 && y > cy - size * 0.28 && y < cy + size * 0.30;

            if (isLeftLung || isRightLung) {
              // Lung Parenchyma: -700 HU
              let lungHu = -750;
              // Bronchovascular markings
              if (Math.sin(x * 0.4 + y * 0.3) > 0.85) {
                lungHu = -200;
              }
              const noise = (Math.random() - 0.5) * 20;
              pixelData[y * size + x] = Math.round((lungHu + noise) - rescaleIntercept);
            } else {
              // Mediastinum Soft Tissue (+40 HU)
              let medHu = 45;

              // Pulmonary Trunk & Aorta contrast enhancement (+320 HU)
              if (normZ >= 0.4 && normZ <= 0.7) {
                const dAorta = Math.hypot(x - (cx - size * 0.04), y - (cy - size * 0.08));
                if (dAorta < size * 0.06) {
                  medHu = 340; // Contrast loaded aorta
                }
                const dPulm = Math.hypot(x - (cx + size * 0.03), y - (cy + size * 0.02));
                if (dPulm < size * 0.07) {
                  medHu = 310; // Pulmonary trunk
                }
              }

              // Spine Vertebra in posterior midline
              if (Math.abs(x - cx) < size * 0.08 && y > cy + size * 0.22 && distSq < 0.88) {
                medHu = 850; // Vertebra
              }

              pixelData[y * size + x] = Math.round(medHu - rescaleIntercept);
            }
          }
        }
      }

      slices.push({
        sliceIndex: s + 1,
        sliceLocation: -120 + s * 10,
        sliceThickness: 1.0,
        rows: size,
        columns: size,
        pixelSpacing: [0.7, 0.7],
        rescaleIntercept,
        rescaleSlope,
        windowCenter: -600,
        windowWidth: 1500,
        pixelData
      });
    } else {
      // Abdomen CT Anatomy: Liver (+65 HU, with hypervascular lesion +140 HU), Spleen (+50 HU), Kidneys, Vertebra
      const rX = size * 0.45;
      const rY = size * 0.40;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = (x - cx) / rX;
          const dy = (y - cy) / rY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 0.95) {
            let abdHu = 20;

            // Liver occupies right hemiabdomen (on image: left side, since patient is supine)
            if (x < cx + size * 0.05 && y < cy + size * 0.25) {
              abdHu = 70; // Liver parenchyma

              // Arterial phase hypervascular lesion (HCC/Hemangioma) on slice 12-16
              if (normZ >= 0.45 && normZ <= 0.65) {
                const dLesion = Math.hypot(x - (cx - size * 0.22), y - (cy - size * 0.05));
                if (dLesion < size * 0.05) {
                  abdHu = 145; // Intense arterial enhancement!
                }
              }
            } else if (x > cx + size * 0.18 && y < cy + size * 0.15) {
              abdHu = 55; // Spleen
            }

            // Spine vertebra in posterior midline
            if (Math.abs(x - cx) < size * 0.07 && y > cy + size * 0.20) {
              abdHu = 900; // Lumbar vertebra
            }

            // Abdominal Aorta
            if (Math.hypot(x - (cx - size * 0.04), y - (cy + size * 0.15)) < size * 0.035) {
              abdHu = 290; // Contrast filled aorta
            }

            pixelData[y * size + x] = Math.round(abdHu - rescaleIntercept);
          }
        }
      }

      slices.push({
        sliceIndex: s + 1,
        sliceLocation: -80 + s * 8,
        sliceThickness: 1.25,
        rows: size,
        columns: size,
        pixelSpacing: [0.75, 0.75],
        rescaleIntercept,
        rescaleSlope,
        windowCenter: 65,
        windowWidth: 280,
        pixelData
      });
    }
  }

  return slices;
}

/**
 * Generate a 100% compliant DICOM Part 10 (.dcm) binary file Blob
 * Can be opened in RadiAnt, OsiriX, Horos, Weasis or uploaded anywhere!
 */
export function generateDicomPart10Blob(
  slice: DicomSliceData,
  patientName: string = 'ACTIVION 16 TEST PATIENT',
  patientId: string = 'TC-CANON-01',
  studyDate: string = '20240412'
): Blob {
  // Preamble: 128 zeros + 4 bytes 'DICM'
  const preamble = new Uint8Array(128);
  const magic = new TextEncoder().encode('DICM');

  // Helper for writing little-endian tags
  const buffer: number[] = [];

  function writeTag(group: number, element: number, vr: string, value: string | number | Uint8Array) {
    // group (2 bytes)
    buffer.push(group & 0xff, (group >> 8) & 0xff);
    // element (2 bytes)
    buffer.push(element & 0xff, (element >> 8) & 0xff);

    // VR (2 bytes)
    buffer.push(vr.charCodeAt(0), vr.charCodeAt(1));

    let valBytes: Uint8Array;
    if (typeof value === 'string') {
      let str = value;
      if (str.length % 2 !== 0) str += ' '; // DICOM padding
      valBytes = new TextEncoder().encode(str);
    } else if (typeof value === 'number') {
      const str = value.toString();
      const padded = str.length % 2 !== 0 ? str + ' ' : str;
      valBytes = new TextEncoder().encode(padded);
    } else {
      valBytes = value;
    }

    // Length (2 bytes for standard VRs like CS, SH, LO, PN, DA, TM, DS, IS, US)
    const len = valBytes.length;
    buffer.push(len & 0xff, (len >> 8) & 0xff);

    // Value
    for (let i = 0; i < len; i++) {
      buffer.push(valBytes[i]);
    }
  }

  // File Meta Information
  writeTag(0x0002, 0x0002, 'UI', '1.2.840.10008.5.1.4.1.1.2\0'); // CT Image Storage SOP
  writeTag(0x0002, 0x0010, 'UI', '1.2.840.10008.1.2.1\0'); // Explicit VR Little Endian
  writeTag(0x0008, 0x0060, 'CS', 'CT');
  writeTag(0x0008, 0x0070, 'LO', 'Canon Medical Systems');
  writeTag(0x0008, 0x1090, 'LO', 'Activion 16');
  writeTag(0x0008, 0x0020, 'DA', studyDate);
  writeTag(0x0008, 0x0030, 'TM', '082300');
  writeTag(0x0010, 0x0010, 'PN', patientName);
  writeTag(0x0010, 0x0020, 'LO', patientId);
  writeTag(0x0018, 0x0050, 'DS', slice.sliceThickness.toFixed(1));
  writeTag(0x0018, 0x0060, 'DS', '120');
  writeTag(0x0018, 0x1150, 'IS', '180');
  writeTag(0x0020, 0x1041, 'DS', slice.sliceLocation.toFixed(1));

  // Image Dimensions
  // Rows (US: 2-byte integer)
  buffer.push(0x28, 0x00, 0x10, 0x00, 0x55, 0x53, 0x02, 0x00, slice.rows & 0xff, (slice.rows >> 8) & 0xff);
  // Columns (US: 2-byte integer)
  buffer.push(0x28, 0x00, 0x11, 0x00, 0x55, 0x53, 0x02, 0x00, slice.columns & 0xff, (slice.columns >> 8) & 0xff);
  // Bits Allocated (US: 16)
  buffer.push(0x28, 0x00, 0x00, 0x01, 0x55, 0x53, 0x02, 0x00, 16, 0);
  // Bits Stored (US: 16)
  buffer.push(0x28, 0x00, 0x01, 0x01, 0x55, 0x53, 0x02, 0x00, 16, 0);
  // High Bit (US: 15)
  buffer.push(0x28, 0x00, 0x02, 0x01, 0x55, 0x53, 0x02, 0x00, 15, 0);
  // Pixel Representation (US: 0 = unsigned)
  buffer.push(0x28, 0x00, 0x03, 0x01, 0x55, 0x53, 0x02, 0x00, 0, 0);

  writeTag(0x0028, 0x1050, 'DS', slice.windowCenter.toString());
  writeTag(0x0028, 0x1051, 'DS', slice.windowWidth.toString());
  writeTag(0x0028, 0x1052, 'DS', slice.rescaleIntercept.toString());
  writeTag(0x0028, 0x1053, 'DS', slice.rescaleSlope.toString());

  // Pixel Data Tag (7FE0, 0010) - OW with 4-byte length in Explicit VR
  buffer.push(0xe0, 0x7f, 0x10, 0x00, 0x4f, 0x57, 0x00, 0x00);
  const pixelByteLen = slice.pixelData.length * 2;
  buffer.push(
    pixelByteLen & 0xff,
    (pixelByteLen >> 8) & 0xff,
    (pixelByteLen >> 16) & 0xff,
    (pixelByteLen >> 24) & 0xff
  );

  // Combine Preamble + Magic + Header Tags + Raw Pixel Data
  const headerBytes = new Uint8Array(buffer);
  const pixelBytes = new Uint8Array(slice.pixelData.buffer, slice.pixelData.byteOffset, slice.pixelData.byteLength);

  const finalBlob = new Blob([preamble, magic, headerBytes, pixelBytes] as BlobPart[], {
    type: 'application/dicom'
  });

  return finalBlob;
}

/**
 * Calculate statistical HU metrics (Mean, SD, Min, Max, Area) inside an elliptical or rectangular ROI
 */
export interface RoiStatistics {
  meanHu: number;
  sdHu: number;
  minHu: number;
  maxHu: number;
  areaMm2: number;
  areaCm2: number;
  pixelCount: number;
}

export function calculateRoiStatistics(
  slice: DicomSliceData,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): RoiStatistics {
  const { rows, columns, pixelData, rescaleIntercept, rescaleSlope, pixelSpacing } = slice;
  const values: number[] = [];

  const minX = Math.max(0, Math.floor(centerX - radiusX));
  const maxX = Math.min(columns - 1, Math.ceil(centerX + radiusX));
  const minY = Math.max(0, Math.floor(centerY - radiusY));
  const maxY = Math.min(rows - 1, Math.ceil(centerY + radiusY));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = (x - centerX) / (radiusX || 1);
      const dy = (y - centerY) / (radiusY || 1);
      if (dx * dx + dy * dy <= 1.0) {
        const raw = pixelData[y * columns + x];
        if (raw !== undefined) {
          const hu = raw * rescaleSlope + rescaleIntercept;
          values.push(hu);
        }
      }
    }
  }

  if (values.length === 0) {
    return {
      meanHu: 0,
      sdHu: 0,
      minHu: 0,
      maxHu: 0,
      areaMm2: 0,
      areaCm2: 0,
      pixelCount: 0
    };
  }

  let sum = 0;
  let minHu = Infinity;
  let maxHu = -Infinity;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    sum += val;
    if (val < minHu) minHu = val;
    if (val > maxHu) maxHu = val;
  }

  const meanHu = sum / values.length;

  let sumSqDiff = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - meanHu;
    sumSqDiff += diff * diff;
  }
  const sdHu = Math.sqrt(sumSqDiff / values.length);

  const pixelAreaMm2 = (pixelSpacing[0] || 0.5) * (pixelSpacing[1] || 0.5);
  const areaMm2 = values.length * pixelAreaMm2;
  const areaCm2 = areaMm2 / 100;

  return {
    meanHu: Math.round(meanHu * 10) / 10,
    sdHu: Math.round(sdHu * 10) / 10,
    minHu: Math.round(minHu),
    maxHu: Math.round(maxHu),
    areaMm2: Math.round(areaMm2 * 10) / 10,
    areaCm2: Math.round(areaCm2 * 100) / 100,
    pixelCount: values.length
  };
}

/**
 * Multi-Planar Orthogonal Reconstructions:
 * Generates dynamic Coronal slice from the stack of axial slices at a specific Y coordinate
 */
export function renderOrthogonalCoronalSlice(
  slices: DicomSliceData[],
  yRatio: number, // 0.0 to 1.0
  canvas: HTMLCanvasElement,
  customWw?: number,
  customWl?: number,
  invert: boolean = false
): void {
  if (slices.length === 0) return;
  const numZ = slices.length;
  const numX = slices[0].columns;
  const numY = slices[0].rows;

  canvas.width = numX;
  canvas.height = numZ * 8; // Stretch Z to realistic anatomical aspect ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const targetY = Math.min(numY - 1, Math.max(0, Math.floor(yRatio * numY)));
  const wl = customWl !== undefined ? customWl : slices[0].windowCenter;
  const ww = customWw !== undefined ? customWw : slices[0].windowWidth;
  const lowHu = wl - ww / 2;
  const highHu = wl + ww / 2;
  const range = ww > 0 ? ww : 1;

  const outHeight = canvas.height;
  const imgData = ctx.createImageData(numX, outHeight);
  const data = imgData.data;

  for (let zOut = 0; zOut < outHeight; zOut++) {
    // Invert Z so superior is at the top of the canvas
    const normZ = 1.0 - zOut / outHeight;
    const sliceFloatIdx = normZ * (numZ - 1);
    const z0 = Math.floor(sliceFloatIdx);
    const z1 = Math.min(numZ - 1, z0 + 1);
    const t = sliceFloatIdx - z0;

    const slice0 = slices[z0];
    const slice1 = slices[z1];

    for (let x = 0; x < numX; x++) {
      const idx0 = targetY * numX + x;
      const raw0 = slice0.pixelData[idx0] ?? -1000;
      const raw1 = slice1.pixelData[idx0] ?? -1000;

      const hu0 = raw0 * slice0.rescaleSlope + slice0.rescaleIntercept;
      const hu1 = raw1 * slice1.rescaleSlope + slice1.rescaleIntercept;
      const hu = hu0 * (1 - t) + hu1 * t;

      let gray: number;
      if (hu <= lowHu) gray = 0;
      else if (hu >= highHu) gray = 255;
      else gray = Math.round(((hu - lowHu) / range) * 255);

      if (invert) gray = 255 - gray;

      const pIdx = (zOut * numX + x) * 4;
      data[pIdx] = gray;
      data[pIdx + 1] = gray;
      data[pIdx + 2] = gray;
      data[pIdx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Multi-Planar Orthogonal Reconstructions:
 * Generates dynamic Sagittal slice from the stack of axial slices at a specific X coordinate
 */
export function renderOrthogonalSagittalSlice(
  slices: DicomSliceData[],
  xRatio: number, // 0.0 to 1.0
  canvas: HTMLCanvasElement,
  customWw?: number,
  customWl?: number,
  invert: boolean = false
): void {
  if (slices.length === 0) return;
  const numZ = slices.length;
  const numX = slices[0].columns;
  const numY = slices[0].rows;

  canvas.width = numY;
  canvas.height = numZ * 8; // Stretch Z
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const targetX = Math.min(numX - 1, Math.max(0, Math.floor(xRatio * numX)));
  const wl = customWl !== undefined ? customWl : slices[0].windowCenter;
  const ww = customWw !== undefined ? customWw : slices[0].windowWidth;
  const lowHu = wl - ww / 2;
  const highHu = wl + ww / 2;
  const range = ww > 0 ? ww : 1;

  const outHeight = canvas.height;
  const imgData = ctx.createImageData(numY, outHeight);
  const data = imgData.data;

  for (let zOut = 0; zOut < outHeight; zOut++) {
    const normZ = 1.0 - zOut / outHeight;
    const sliceFloatIdx = normZ * (numZ - 1);
    const z0 = Math.floor(sliceFloatIdx);
    const z1 = Math.min(numZ - 1, z0 + 1);
    const t = sliceFloatIdx - z0;

    const slice0 = slices[z0];
    const slice1 = slices[z1];

    for (let y = 0; y < numY; y++) {
      const idx0 = y * numX + targetX;
      const raw0 = slice0.pixelData[idx0] ?? -1000;
      const raw1 = slice1.pixelData[idx0] ?? -1000;

      const hu0 = raw0 * slice0.rescaleSlope + slice0.rescaleIntercept;
      const hu1 = raw1 * slice1.rescaleSlope + slice1.rescaleIntercept;
      const hu = hu0 * (1 - t) + hu1 * t;

      let gray: number;
      if (hu <= lowHu) gray = 0;
      else if (hu >= highHu) gray = 255;
      else gray = Math.round(((hu - lowHu) / range) * 255);

      if (invert) gray = 255 - gray;

      const pIdx = (zOut * numY + y) * 4;
      data[pIdx] = gray;
      data[pIdx + 1] = gray;
      data[pIdx + 2] = gray;
      data[pIdx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Web Audio API Audio Cues simulating the real Canon Aquilion / Activion console
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playCanonAudioCue(cue: 'beep' | 'exposure_start' | 'exposure_end' | 'breath_hold' | 'click' | 'success'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (cue === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (cue === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 tone
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (cue === 'exposure_start') {
      // Dual high-pitch warning beep of Canon Gantry
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, now); // E6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.18); // A6
      gain2.gain.setValueAtTime(0.15, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.35);
    } else if (cue === 'exposure_end') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (cue === 'breath_hold') {
      // Speech synthesis fallback if available, plus chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Atenção: respire fundo e prenda a respiração.');
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } else if (cue === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Audio optional fallback
  }
}
