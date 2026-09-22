import React, { useState } from 'react';
import { Certificate, ThemeMode } from '../../types';
import { pdfExportService } from '../../services/pdfExport';

interface CertificatesViewProps {
  certificates: Certificate[];
  onIssueCertificate: () => void;
  theme?: ThemeMode;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  onIssueCertificate,
  theme = 'dark'
}) => {
  const [selectedCert, setSelectedCert] = useState<Certificate>(certificates[0] || null);
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationInput.trim()) return;
    const found = certificates.find(c => c.code.toLowerCase() === verificationInput.trim().toLowerCase());
    if (found) {
      setVerificationResult(`✓ CERTIFICADO AUTÊNTICO: Emitido para ${found.studentName} em ${found.completionDate} no curso ${found.courseName}.`);
    } else {
      setVerificationResult('✕ Código não localizado na base de registros acadêmicos da RadBio.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#4cd7f6] font-mono mb-1">
            <span className="material-symbols-outlined text-sm">workspace_premium</span>
            <span>Certificação Acadêmica Reconhecida CBR / CRTR</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Diplomas &amp; Certificados Acadêmicos
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
            Documentos emitidos com registro acadêmico oficial, carimbo de tempo SHA-256 e validação por código.
          </p>
        </div>

        <button
          type="button"
          onClick={onIssueCertificate}
          className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isDark
              ? 'bg-white/5 hover:bg-white/10 text-[#4cd7f6] border-[#4cd7f6]/40'
              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
          }`}
        >
          <span className="material-symbols-outlined text-base">add_moderator</span>
          <span>Emitir Novo Certificado</span>
        </button>
      </section>

      {/* Main Container: Preview & Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Col: Certificate Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className={`text-sm font-bold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Certificados Disponíveis ({certificates.length})
          </h3>

          <div className="space-y-3">
            {certificates.map(cert => (
              <div
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedCert?.id === cert.id
                    ? isDark
                      ? 'bg-[#1c1f29] border-[#4cd7f6] shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-cyan-50/70 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                    : isDark
                      ? 'bg-[#141f38]/50 border-white/10 hover:border-white/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00a572]/20 text-[#4edea3]">
                    HOMOLOGADO
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                    {cert.completionDate}
                  </span>
                </div>
                <h4 className={`text-sm font-semibold mb-1 leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {cert.courseName}
                </h4>
                <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                  {cert.studentName} • {cert.workloadHours}h
                </p>

                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                  isDark ? 'border-white/5' : 'border-slate-100'
                }`}>
                  <span className="text-cyan-600 font-mono font-bold">Nota: {cert.finalScore.toFixed(1)}</span>
                  <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-[#869397]' : 'text-slate-500'}`}>
                    Ver documento <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Tool */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#141f38]/50 border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans'] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Validador de Autenticidade
            </h4>
            <p className={`text-xs ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
              Insira o código de registro do documento para confirmar autenticidade contra o livro acadêmico:
            </p>
            <form onSubmit={handleVerify} className="space-y-2">
              <input
                type="text"
                value={verificationInput}
                onChange={e => setVerificationInput(e.target.value)}
                placeholder="Ex: RADBIO-CERT-2025-9941-TC"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                  isDark
                    ? 'bg-[#0a0e17]/80 border-white/10 text-white placeholder:text-gray-500 focus:border-[#4cd7f6]'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                }`}
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#4cd7f6]/15 hover:bg-[#4cd7f6]/25 text-cyan-600 border border-cyan-400/40 text-xs font-bold transition-all cursor-pointer"
              >
                Checar Registro Acadêmico
              </button>
            </form>
            {verificationResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                isDark ? 'bg-[#0a0e17] border-white/10 text-[#4edea3]' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {verificationResult}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Diploma Realistic Preview & PDF Export (8 cols) */}
        {selectedCert && (
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                Visualização do Documento Acadêmico • Padrão A4 Paisagem
              </span>
              <button
                type="button"
                onClick={() => pdfExportService.exportDiploma(selectedCert)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] font-bold text-xs shadow-lg shadow-[#06b6d4]/40 hover:shadow-[#06b6d4]/60 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  picture_as_pdf
                </span>
                <span>Exportar Diploma em PDF</span>
              </button>
            </div>

            {/* Diploma Mock Card (Luxury Classical Style) */}
            <div className="p-6 sm:p-10 rounded-3xl bg-[#fdfdfd] text-[#0f172a] shadow-2xl border-8 border-double border-[#0f2942] relative overflow-hidden">
              {/* Classical Header */}
              <div className="text-center space-y-1 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#064e3b] text-white flex items-center justify-center font-bold text-lg mb-2 shadow">
                  RB
                </div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-[#064e3b] font-serif">
                  Faculdade de Ciências Médicas &amp; Radiologia RadBio
                </h2>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                  Centro de Excelência em Diagnóstico por Imagem e Tomografia Computadorizada
                </p>
                <div className="pt-3">
                  <span className="text-2xl sm:text-3xl font-serif tracking-widest text-[#032b43] font-bold uppercase block">
                    Certificado Acadêmico
                  </span>
                </div>
              </div>

              {/* Body text */}
              <div className="py-8 text-center max-w-2xl mx-auto space-y-4 text-sm sm:text-base leading-relaxed text-gray-800">
                <p>
                  Certificamos para todos os fins acadêmicos e profissionais que o estudante
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#064e3b] underline decoration-[#10b981] decoration-2 underline-offset-4">
                  {selectedCert.studentName}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedCert.studentDocument}
                </p>
                <p className="pt-2">
                  concluiu com êxito notável e média de excelência <strong>{selectedCert.finalScore.toFixed(1)} / 10.0</strong> o programa:
                </p>
                <p className="text-lg sm:text-xl font-serif font-bold text-[#044e54]">
                  {selectedCert.courseName}
                </p>
                <p className="text-xs text-gray-600">
                  Carga horária total integralizada de <strong>{selectedCert.workloadHours} horas</strong> teóricas, estações práticas de tomografia e dosimetria hospitalar.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="w-48 mx-auto border-t border-gray-900 pt-1 font-bold text-gray-900">
                    {selectedCert.instructorName}
                  </div>
                  <span className="text-[10px] text-gray-500">{selectedCert.instructorRole}</span>
                </div>
                <div>
                  <div className="w-48 mx-auto border-t border-gray-900 pt-1 font-bold text-gray-900">
                    Dra. Helena Vasconcelos
                  </div>
                  <span className="text-[10px] text-gray-500">Diretora Acadêmica Geral • CRTR/CBR</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 font-mono gap-2">
                <span>CÓDIGO OFICIAL: {selectedCert.code}</span>
                <span>DATA DE EXPEDIÇÃO: {selectedCert.completionDate}</span>
                <span>AUTENTICAÇÃO: VERIFICADA</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
