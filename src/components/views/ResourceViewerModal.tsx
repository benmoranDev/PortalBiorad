import React from 'react';
import { LessonResource, ThemeMode } from '../../types';

interface ResourceViewerModalProps {
  resource: LessonResource | null;
  onClose: () => void;
  theme?: ThemeMode;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  onClose,
  theme = 'dark'
}) => {
  if (!resource) return null;
  const isDark = theme === 'dark';

  const handleDownload = () => {
    // Generate simulated download file with resource content
    const content = `RadBio - Instituto de Radiologia & Tomografia Computadorizada
DOCUMENTO ACADÊMICO OFICIAL
------------------------------------------------------------
Título: ${resource.title}
Tipo: ${resource.type.toUpperCase()}
Data de Inclusão: ${resource.dateAdded}
Autor: ${resource.authorName || 'Corpo Docente RadBio'}
------------------------------------------------------------
DESCRIÇÃO:
${resource.description}

CONTEÚDO DO MATERIAL DIDÁTICO:
${resource.previewContent || 'Consulte o material anexo no portal do aluno ou entre em contato com o professor da disciplina para esclarecimentos adicionais.'}

------------------------------------------------------------
Autenticação Digital: RADBIO-DOC-${Date.now()}-TC
Uso exclusivo para fins de ensino e aprendizagem acadêmica.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resource.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = () => {
    switch (resource.type) {
      case 'pdf': return 'picture_as_pdf';
      case 'protocol': return 'medical_services';
      case 'case_study': return 'analytics';
      case 'spreadsheet': return 'table_chart';
      case 'podcast': return 'podcasts';
      case 'article': return 'article';
      default: return 'description';
    }
  };

  const getTypeColor = () => {
    switch (resource.type) {
      case 'pdf': return 'text-red-400 bg-red-500/15 border-red-500/30';
      case 'protocol': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'case_study': return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
      case 'spreadsheet': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'podcast': return 'text-purple-400 bg-purple-500/15 border-purple-500/30';
      default: return 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`max-w-2xl w-full max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-[#1c1f29] border-[#4cd7f6]/40 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between gap-4 border-slate-200/15">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getTypeColor()}`}>
              <span className="material-symbols-outlined text-2xl">{getTypeIcon()}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 font-bold">
                Material Didático • {resource.type.toUpperCase()}
              </span>
              <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] leading-snug">
                {resource.title}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                {resource.authorName || 'Corpo Docente'} • {resource.dateAdded} {resource.fileSize && `• ${resource.fileSize}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed">
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#141f38]/60 border-white/5' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-cyan-500 mb-1">
              Visão Geral do Recurso
            </h4>
            <p className={isDark ? 'text-gray-300' : 'text-slate-700'}>
              {resource.description}
            </p>
          </div>

          {resource.previewContent ? (
            <div className={`p-5 rounded-2xl border font-mono whitespace-pre-wrap leading-relaxed text-[11px] ${
              isDark ? 'bg-[#0a0e17] border-white/10 text-[#4cd7f6]/90' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              {resource.previewContent}
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${
              isDark ? 'bg-[#0a0e17]/40 border-white/5 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <span className="material-symbols-outlined text-4xl text-cyan-500/60">menu_book</span>
              <p>Este material está pronto para download ou consulta externa.</p>
            </div>
          )}

          <div className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
            isDark ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Conteúdo revisado e validado pelo Colégio Brasileiro de Radiologia (CBR).</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#181b25] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[11px] font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Tamanho: {resource.fileSize || '3.2 MB'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fechar
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-[#090d16] font-bold text-xs shadow-md shadow-[#06b6d4]/25 flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Baixar Arquivo Completo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
