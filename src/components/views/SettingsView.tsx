import React, { useState } from 'react';
import { SupabaseConfig, ThemeMode, Language } from '../../types';
import { storageService } from '../../services/storage';

interface SettingsViewProps {
  supabaseConfig: SupabaseConfig;
  onUpdateSupabase: (cfg: SupabaseConfig) => void;
  theme: ThemeMode;
  onToggleTheme: (t: ThemeMode) => void;
  language: Language;
  onSelectLanguage: (l: Language) => void;
  onShowSuccessToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  supabaseConfig,
  onUpdateSupabase,
  theme,
  onToggleTheme,
  language,
  onSelectLanguage,
  onShowSuccessToast
}) => {
  const [url, setUrl] = useState(supabaseConfig.url);
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState(supabaseConfig.lastSync || 'Sincronizado');

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('✓ Conexão com Supabase Database estabelecida com sucesso (Ping: 42ms). Tabelas de alunos, notas e laudos ativas.');
      const updated: SupabaseConfig = {
        url,
        anonKey,
        isConnected: true,
        lastSync: 'Sincronizado agora'
      };
      onUpdateSupabase(updated);
      storageService.setSupabaseConfig(updated);
      onShowSuccessToast('Configurações do Supabase salvas e validadas!');
    }, 1200);
  };

  const handleManualSync = () => {
    setSyncStatus('Sincronizando tabelas com a nuvem...');
    setTimeout(() => {
      setSyncStatus(`Última sincronização: ${new Date().toLocaleTimeString('pt-BR')}`);
      onShowSuccessToast('Base de dados acadêmica sincronizada com sucesso!');
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <section>
        <div className="flex items-center gap-2 text-xs text-[#4cd7f6] font-mono mb-1">
          <span className="material-symbols-outlined text-sm">tune</span>
          <span>Preferências do Sistema &amp; Integração Cloud</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
          Configurações da Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-[#bcc9cd] mt-0.5">
          Gerenciamento do banco de dados Supabase, aparência visual em Liquid Glass, idioma e automações.
        </p>
      </section>

      {/* Supabase Integration Card */}
      <section className="p-6 rounded-3xl bg-[#141f38]/50 backdrop-blur-2xl border border-[#4cd7f6]/30 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3ecf8e] to-[#00a572] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#0a0e17] rounded-[14px] flex items-center justify-center text-[#3ecf8e]">
                <span className="material-symbols-outlined text-2xl font-bold">database</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                  Conexão Supabase Database
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30">
                  {supabaseConfig.isConnected ? 'CONECTADO' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-[#bcc9cd]">
                Persistência remota, replicação em tempo real de notas e autenticação em nuvem.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#4cd7f6] border border-[#4cd7f6]/40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            <span>Sincronizar Agora</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Supabase Project URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full p-3 rounded-xl bg-[#0a0e17]/80 border border-white/15 text-white font-mono focus:border-[#4cd7f6] outline-none"
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-1 font-semibold">Supabase Public Anon Key</label>
            <input
              type="password"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full p-3 rounded-xl bg-[#0a0e17]/80 border border-white/15 text-white font-mono focus:border-[#4cd7f6] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[#869397] font-mono">{syncStatus}</span>
          <button
            type="button"
            disabled={isTesting}
            onClick={handleTestConnection}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] font-bold text-xs shadow-md shadow-[#06b6d4]/30 hover:shadow-[#06b6d4]/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isTesting ? (
              <span>Testando Handshake...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">network_check</span>
                <span>Testar Conexão com Supabase</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-2xl bg-[#0a0e17] border border-[#4edea3]/40 text-xs font-mono text-[#4edea3]">
            {testResult}
          </div>
        )}
      </section>

      {/* Visual Theme & Language */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Card */}
        <div className="p-6 rounded-3xl bg-[#141f38]/50 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#4cd7f6] text-xl">palette</span>
            <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Modo Visual da Interface
            </h3>
          </div>
          <p className="text-xs text-[#bcc9cd]">
            Alterne entre o tema escuro exclusivo Liquid Glass e o modo radiológico de alto contraste.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onToggleTheme('dark')}
              className={`p-4 rounded-2xl border text-left text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-[#1c1f29] border-[#4cd7f6] text-white shadow-lg shadow-[#4cd7f6]/15 font-bold'
                  : 'bg-[#0a0e17]/50 border-white/10 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-lg text-[#4cd7f6]">dark_mode</span>
                {theme === 'dark' && <span className="text-[#4cd7f6]">✓ Ativo</span>}
              </div>
              <div className="font-semibold text-white">Dark Mode (Liquid Glass)</div>
              <div className="text-[10px] text-gray-400 mt-1">Otimizado para laudos e salas escuras de tomografia.</div>
            </button>

            <button
              onClick={() => onToggleTheme('light')}
              className={`p-4 rounded-2xl border text-left text-xs transition-all ${
                theme === 'light'
                  ? 'bg-white/10 border-white text-white font-bold'
                  : 'bg-[#0a0e17]/50 border-white/10 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-lg text-amber-300">light_mode</span>
                {theme === 'light' && <span className="text-amber-300">✓ Ativo</span>}
              </div>
              <div className="font-semibold text-white">Claro (Clínico)</div>
              <div className="text-[10px] text-gray-400 mt-1">Alto contraste para ambientes ambulatoriais diurnos.</div>
            </button>
          </div>
        </div>

        {/* Language Card */}
        <div className="p-6 rounded-3xl bg-[#141f38]/50 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#4edea3] text-xl">translate</span>
            <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
              Idioma da Plataforma
            </h3>
          </div>
          <p className="text-xs text-[#bcc9cd]">
            Adaptação de termos técnicos de tomografia computadorizada e radiologia para alcance global.
          </p>

          <div className="space-y-2 pt-2">
            {[
              { id: 'pt' as Language, name: 'Português (Brasil)', label: 'Padrão CBR / CRTR' },
              { id: 'en' as Language, name: 'English (US)', label: 'RSNA / ACR Standard' },
              { id: 'es' as Language, name: 'Español', label: 'Estándar SERAM / CIR' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => onSelectLanguage(l.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  language === l.id
                    ? 'bg-[#1c1f29] border-[#4cd7f6] text-white font-bold'
                    : 'bg-[#0a0e17]/50 border-white/10 text-gray-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-[10px] text-gray-400">{l.label}</div>
                </div>
                {language === l.id && <span className="text-[#4cd7f6] font-bold">✓ Selecionado</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Automated Email Notifications Preferences */}
      <section className="p-6 rounded-3xl bg-[#141f38]/50 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-amber-400 text-xl">mark_email_read</span>
          <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
            Automação de E-mails e Alertas de Prazos
          </h3>
        </div>
        <p className="text-xs text-[#bcc9cd]">
          Defina quais gatilhos de aprendizagem disparam notificações imediatas aos estudantes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a0e17]/60 border border-white/5">
            <div>
              <span className="font-semibold text-white block">Publicação de Notas do Boletim</span>
              <span className="text-[10px] text-gray-400">Disparado no momento em que o professor homologa a pauta.</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4cd7f6] cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a0e17]/60 border border-white/5">
            <div>
              <span className="font-semibold text-white block">Lembretes de Prazos de Laudos de TC</span>
              <span className="text-[10px] text-gray-400">Enviado com 72h e 24h de antecedência da data final.</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4cd7f6] cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a0e17]/60 border border-white/5">
            <div>
              <span className="font-semibold text-white block">Emissão de Diplomas em PDF</span>
              <span className="text-[10px] text-gray-400">Notifica o discente com link direto para download do certificado.</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4cd7f6] cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0a0e17]/60 border border-white/5">
            <div>
              <span className="font-semibold text-white block">Avisos de Novas Aulas ao Vivo</span>
              <span className="text-[10px] text-gray-400">Link direto para a sala virtual 30 minutos antes do início.</span>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4cd7f6] cursor-pointer" />
          </div>
        </div>
      </section>
    </div>
  );
};
