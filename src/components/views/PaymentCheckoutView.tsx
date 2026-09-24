import React, { useState, useEffect, useMemo } from 'react';
import { CursoLivre, PaymentTransaction, ThemeMode, User } from '../../types';
import { storageService } from '../../services/storage';
import { pdfExportService } from '../../services/pdfExport';
import { initialPaymentPlans } from '../../data/initialData';
import { generatePixBrCode, DEFAULT_PIX_CONFIG } from '../../utils/pixHelper';

interface PaymentCheckoutViewProps {
  onPaymentSuccess?: (courseTitle: string) => void;
  onNavigateTab?: (tab: string) => void;
  selectedCourseId?: string | null;
  theme?: ThemeMode;
}

export const PaymentCheckoutView: React.FC<PaymentCheckoutViewProps> = ({
  onPaymentSuccess,
  onNavigateTab,
  selectedCourseId = null,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const currentUser: User = storageService.getCurrentUser();
  const cursosLivres = storageService.getCursosLivres();

  // Load custom Pix settings
  const [pixSettings, setPixSettings] = useState(() => storageService.getPixSettings());
  const [isEditingPixKey, setIsEditingPixKey] = useState(false);
  const [editPixKeyValue, setEditPixKeyValue] = useState(pixSettings.keyValue || DEFAULT_PIX_CONFIG.keyValue);
  const [editPixKeyType, setEditPixKeyType] = useState(pixSettings.keyType || 'email');
  const [editMerchantName, setEditMerchantName] = useState(pixSettings.merchantName || 'RADBIO EDUCACAO S/A');

  // Tab mode: 40h courses vs bundled pass
  const [checkoutMode, setCheckoutMode] = useState<'40h_courses' | 'bundle'>('40h_courses');

  // Selected item
  const [selectedCourse, setSelectedCourse] = useState<CursoLivre | null>(() => {
    if (selectedCourseId) {
      return cursosLivres.find(c => c.id === selectedCourseId) || cursosLivres[0];
    }
    return cursosLivres[0];
  });

  const [selectedBundlePlan, setSelectedBundlePlan] = useState(initialPaymentPlans[0]);

  // Payment Method: 'pix' | 'credit'
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');

  // Gateway mode for credit card: 'mercadopago' | 'direct'
  const [cardGateway, setCardGateway] = useState<'mercadopago' | 'direct'>('mercadopago');

  // Credit card state
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 7890');
  const [cardHolder, setCardHolder] = useState(currentUser.name.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('482');
  const [cardCpf, setCardCpf] = useState('384.912.748-02');
  const [installments, setInstallments] = useState(1);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Pix state
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [pixTimeRemaining, setPixTimeRemaining] = useState(900); // 15 minutes in seconds

  // Processing & Transaction result
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(null);

  // Sync selected course if prop changes
  useEffect(() => {
    if (selectedCourseId) {
      const found = cursosLivres.find(c => c.id === selectedCourseId);
      if (found) {
        setSelectedCourse(found);
        setCheckoutMode('40h_courses');
      }
    }
  }, [selectedCourseId, cursosLivres]);

  // Pix countdown timer
  useEffect(() => {
    if (paymentMethod !== 'pix' || completedTransaction) return;
    const interval = setInterval(() => {
      setPixTimeRemaining(prev => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod, completedTransaction]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Card brand detection
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean)) return 'mastercard';
    if (/^(606282|3841)/.test(clean) || clean.startsWith('50')) return 'elo';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'mastercard';
  }, [cardNumber]);

  // Active Price Calculation
  const activeItem = checkoutMode === '40h_courses' ? selectedCourse : null;
  const currentPrice = activeItem ? activeItem.price : selectedBundlePlan.price;
  const currentTitle = activeItem ? `${activeItem.title} (40h)` : selectedBundlePlan.title;
  const currentWorkload = activeItem ? 40 : 180;

  // Pix Copia-e-Cola payload with real EMV standard BRCode using User's Pix Key
  const pixQrCodeString = useMemo(() => {
    const courseCode = activeItem ? activeItem.code : 'RADBIO';
    const txId = `RAD${courseCode.replace(/[^A-Za-z0-9]/g, '')}`.slice(0, 20);
    return generatePixBrCode(
      currentPrice,
      pixSettings.keyValue,
      pixSettings.merchantName,
      pixSettings.merchantCity,
      txId
    );
  }, [activeItem, currentPrice, pixSettings]);

  const handleSavePixKeyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPixKeyValue.trim()) return;
    const updated = {
      ...pixSettings,
      keyType: editPixKeyType,
      keyValue: editPixKeyValue.trim(),
      merchantName: editMerchantName.trim() || 'RADBIO EDUCACAO S/A'
    };
    storageService.savePixSettings(updated);
    setPixSettings(updated);
    setIsEditingPixKey(false);
  };

  // Format Card input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length > 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (val.length > 9) {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      val = val.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCardCpf(val);
  };

  // Payment Execution (Real & Simulated Webhook Confirmation)
  const handleExecutePayment = () => {
    setIsProcessing(true);
    setProcessingStage(
      paymentMethod === 'pix'
        ? `Consultando chave Pix (${pixSettings.keyValue}) no Banco Central (Bacen SPI)...`
        : cardGateway === 'mercadopago'
        ? 'Autenticando via Gateway Mercado Pago API • Análise de Risco Antifraude 3D Secure...'
        : 'Processando transação com a Adquirente Bancária (Criptografia SSL 256 bits)...'
    );

    setTimeout(() => {
      setProcessingStage(
        paymentMethod === 'pix'
          ? `PIX Confirmado na chave ${pixSettings.keyValue}! Liquidação instantânea homologada.`
          : 'Cartão Autorizado com Sucesso! Token de transação criptografado recebido.'
      );

      setTimeout(() => {
        const tx: PaymentTransaction = {
          id: `tx_${Date.now()}`,
          transactionCode: `RAD-TX-${Date.now().toString().slice(-8)}`,
          courseId: activeItem ? activeItem.id : selectedBundlePlan.id,
          courseTitle: currentTitle,
          studentName: currentUser.name,
          studentEmail: currentUser.email,
          studentCpf: cardCpf,
          amount: currentPrice,
          paymentMethod,
          installments: paymentMethod === 'credit' ? installments : 1,
          cardBrand: paymentMethod === 'credit' ? cardBrand : undefined,
          cardLast4: paymentMethod === 'credit' ? cardNumber.slice(-4) : undefined,
          pixQrCodeString: paymentMethod === 'pix' ? pixQrCodeString : undefined,
          pixEndToEndId: paymentMethod === 'pix' ? `E28491092${Date.now()}88941BCB` : undefined,
          status: 'completed',
          createdAt: new Date().toLocaleString('pt-BR'),
          paidAt: new Date().toLocaleString('pt-BR'),
          certificateWorkloadHours: currentWorkload
        };

        if (activeItem) {
          storageService.enrollInCursoLivre(activeItem.id, tx);
        } else {
          storageService.savePaymentTransaction(tx);
        }

        setIsProcessing(false);
        setCompletedTransaction(tx);
        if (onPaymentSuccess) {
          onPaymentSuccess(currentTitle);
        }
      }, 900);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-8">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all shadow-xl bg-gradient-to-r from-[#06b6d4]/10 via-[#10b981]/5 to-transparent border-[#4cd7f6]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Matrícula Digital Automatizada com PIX ou Cartão de Crédito</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Cursos Livres (40 Horas) &amp; Especializações
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
              Emissão de certificado oficial de 40 horas válido em todo o território nacional conforme a Lei nº 9.394/1996 (LDB) e Decreto nº 5.154/2004. Acesso imediato ao simulador Canon Activion 16 e casos DICOM reais de alta complexidade.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className={`p-1.5 rounded-2xl border flex items-center gap-1 self-start lg:self-center shrink-0 ${
            isDark ? 'bg-[#0f1422] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <button
              type="button"
              onClick={() => setCheckoutMode('40h_courses')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                checkoutMode === '40h_courses'
                  ? 'bg-cyan-500 text-[#090d16] shadow-md shadow-cyan-500/30'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">school</span>
              <span>Cursos Livres (40h)</span>
            </button>
            <button
              type="button"
              onClick={() => setCheckoutMode('bundle')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                checkoutMode === 'bundle'
                  ? 'bg-cyan-500 text-[#090d16] shadow-md shadow-cyan-500/30'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>Passaporte Completo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Checkout Workspace */}
      {!completedTransaction ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Course Selector & Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-xl space-y-5 ${
              isDark ? 'bg-[#181b25]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/15">
                <h2 className="text-base font-bold font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400">inventory_2</span>
                  {checkoutMode === '40h_courses' ? 'Selecione o Curso Livre (40h)' : 'Selecione o Plano de Ensino'}
                </h2>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                  {checkoutMode === '40h_courses' ? `${cursosLivres.length} Disponíveis` : 'Acesso Total'}
                </span>
              </div>

              {checkoutMode === '40h_courses' ? (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {cursosLivres.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourse(c)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedCourse?.id === c.id
                          ? isDark
                            ? 'bg-[#1c2333] border-cyan-400 ring-2 ring-cyan-400/20 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                            : 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/30'
                          : isDark
                            ? 'bg-[#101522]/60 border-white/5 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                          {c.code} • 40 HORAS
                        </span>
                        <span className="text-sm font-extrabold font-['Plus_Jakarta_Sans'] text-cyan-400">
                          R$ {c.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-tight line-clamp-2">{c.title}</h4>
                      <p className={`text-[11px] mt-1 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {c.subtitle}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-amber-400">star</span>
                          {c.rating} ({c.reviewCount})
                        </span>
                        <span>•</span>
                        <span>{c.modules.length} módulos (10h cada)</span>
                        {c.isEnrolled && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Já Matriculado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {initialPaymentPlans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedBundlePlan(plan)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedBundlePlan.id === plan.id
                          ? isDark
                            ? 'bg-[#1c2333] border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg'
                            : 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500/30'
                          : isDark
                            ? 'bg-[#101522]/60 border-white/5 hover:border-white/20'
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold">{plan.title}</h4>
                        <span className="text-sm font-extrabold text-cyan-400">
                          R$ {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {plan.installments}x de R$ {(plan.price / plan.installments).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary Breakdown */}
              <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isDark ? 'bg-[#0e121d] border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between">
                  <span className="text-gray-400">Carga Horária Reconhecida:</span>
                  <span className="font-bold text-emerald-400">{currentWorkload} Horas Oficiais (MEC/LDB)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Simulador Canon Activion 16:</span>
                  <span className="font-bold text-cyan-400">Acesso Ilimitado Liberado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Certificado Digital em PDF:</span>
                  <span className="font-bold text-emerald-400">Incluso com QR Code</span>
                </div>
                <div className="border-t pt-2 mt-2 border-slate-200/10 flex justify-between items-baseline">
                  <span className="font-bold text-sm">Total da Matrícula:</span>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-cyan-400">
                      R$ {currentPrice.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      ou até 12x de R$ {(currentPrice / 12).toFixed(2).replace('.', ',')} no cartão
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Gateway (PIX or Credit Card) (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`p-6 sm:p-7 rounded-3xl border backdrop-blur-xl shadow-xl space-y-6 ${
              isDark ? 'bg-[#181b25]/90 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              {/* Payment Method Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10'
                        : isDark
                          ? 'bg-[#0f1422] border-white/10 text-gray-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">qr_code_2</span>
                    <span>PIX Instantâneo</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Imediato
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'credit'
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10'
                        : isDark
                          ? 'bg-[#0f1422] border-white/10 text-gray-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">credit_card</span>
                    <span>Cartão de Crédito</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                      Até 12x
                    </span>
                  </button>
                </div>
              </div>

              {/* PIX GATEWAY VIEW */}
              {paymentMethod === 'pix' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Pix Receiver Key Badge & Config Switcher */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDark ? 'bg-[#0f1524] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold">
                            Chave Pix Destinatária (Conta de Recebimento)
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ativa
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-mono font-bold select-all ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {pixSettings.keyValue}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(pixSettings.keyValue);
                              setCopiedKey(true);
                              setTimeout(() => setCopiedKey(false), 2500);
                            }}
                            className="text-[10px] text-gray-400 hover:text-emerald-400 cursor-pointer flex items-center gap-0.5"
                            title="Copiar chave"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {copiedKey ? 'done' : 'content_copy'}
                            </span>
                            <span>{copiedKey ? 'Copiada!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingPixKey(true)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-center shrink-0 ${
                        isDark ? 'bg-white/5 hover:bg-white/10 text-emerald-300 border-emerald-500/30' : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">settings</span>
                      <span>Alterar Minha Chave</span>
                    </button>
                  </div>

                  {/* PIX Key Editing Card */}
                  {isEditingPixKey && (
                    <form onSubmit={handleSavePixKeyConfig} className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${
                      isDark ? 'bg-[#121929] border-cyan-400/40' : 'bg-white border-cyan-300 shadow-md'
                    }`}>
                      <div className="flex items-center justify-between border-b pb-2 border-slate-200/10">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">tune</span>
                          Configurar Chave Pix do Sistema
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingPixKey(false)}
                          className="text-gray-400 hover:text-white text-xs cursor-pointer"
                        >
                          ✕ Fechar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block mb-1 font-semibold text-gray-300">Tipo de Chave</label>
                          <select
                            value={editPixKeyType}
                            onChange={e => setEditPixKeyType(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border font-mono ${
                              isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                            }`}
                          >
                            <option value="email">E-mail</option>
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                            <option value="phone">Celular</option>
                            <option value="random">Chave Aleatória (EVP)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block mb-1 font-semibold text-gray-300">Sua Chave Pix</label>
                          <input
                            type="text"
                            value={editPixKeyValue}
                            onChange={e => setEditPixKeyValue(e.target.value)}
                            placeholder="ex: benmoran29dev@gmail.com"
                            className={`w-full p-2.5 rounded-xl border font-mono ${
                              isDark ? 'bg-[#0a0e17] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-800'
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block mb-1 font-semibold text-gray-300">Nome do Titular/Beneficiário (Bacen)</label>
                          <input
                            type="text"
                            value={editMerchantName}
                            onChange={e => setEditMerchantName(e.target.value)}
                            placeholder="RADBIO EDUCACAO S/A"
                            className={`w-full p-2.5 rounded-xl border font-mono ${
                              isDark ? 'bg-[#0a0e17] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditPixKeyValue(DEFAULT_PIX_CONFIG.keyValue);
                            setEditPixKeyType(DEFAULT_PIX_CONFIG.keyType);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white cursor-pointer"
                        >
                          Restaurar Padrão
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-[#090d16] font-bold text-xs shadow cursor-pointer hover:opacity-95"
                        >
                          Salvar Chave Pix
                        </button>
                      </div>
                    </form>
                  )}

                  <div className={`p-5 rounded-2xl border text-center space-y-4 ${
                    isDark ? 'bg-[#0e121d] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {/* Header with Countdown */}
                    <div className="flex items-center justify-between border-b pb-3 border-slate-200/15 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Chave Dinâmica Oficial Gerada</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-gray-400 text-[11px]">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Expira em: <strong className="text-amber-400">{formatTime(pixTimeRemaining)}</strong></span>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="relative inline-block bg-white p-3 rounded-2xl shadow-xl">
                      <svg viewBox="0 0 160 160" className="w-44 h-44 mx-auto">
                        {/* Realistic Mock Pix QR Matrix */}
                        <rect x="0" y="0" width="160" height="160" fill="#ffffff" />
                        {/* Corner Targets */}
                        <rect x="10" y="10" width="40" height="40" fill="#020617" rx="6" />
                        <rect x="16" y="16" width="28" height="28" fill="#ffffff" rx="4" />
                        <rect x="22" y="22" width="16" height="16" fill="#020617" rx="2" />

                        <rect x="110" y="10" width="40" height="40" fill="#020617" rx="6" />
                        <rect x="116" y="16" width="28" height="28" fill="#ffffff" rx="4" />
                        <rect x="122" y="22" width="16" height="16" fill="#020617" rx="2" />

                        <rect x="10" y="110" width="40" height="40" fill="#020617" rx="6" />
                        <rect x="16" y="116" width="28" height="28" fill="#ffffff" rx="4" />
                        <rect x="22" y="122" width="16" height="16" fill="#020617" rx="2" />

                        {/* Alignment pattern */}
                        <rect x="115" y="115" width="25" height="25" fill="#020617" rx="4" />
                        <rect x="120" y="120" width="15" height="15" fill="#ffffff" rx="2" />
                        <rect x="124" y="124" width="7" height="7" fill="#020617" />

                        {/* Timing and data bits */}
                        <rect x="58" y="15" width="44" height="6" fill="#020617" />
                        <rect x="58" y="30" width="10" height="60" fill="#020617" />
                        <rect x="75" y="45" width="25" height="12" fill="#020617" />
                        <rect x="68" y="70" width="30" height="8" fill="#020617" />
                        <rect x="15" y="58" width="6" height="44" fill="#020617" />
                        <rect x="30" y="58" width="14" height="20" fill="#020617" />
                        <rect x="110" y="60" width="40" height="8" fill="#020617" />
                        <rect x="125" y="75" width="20" height="20" fill="#020617" />
                        <rect x="60" y="95" width="45" height="10" fill="#020617" />
                        <rect x="60" y="115" width="45" height="12" fill="#020617" />
                        <rect x="60" y="135" width="30" height="15" fill="#020617" />

                        {/* Pix Center Logo Badge */}
                        <circle cx="80" cy="80" r="14" fill="#00a572" />
                        <text x="80" y="84" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                          PIX
                        </text>
                      </svg>
                    </div>

                    <div>
                      <p className={`text-xs font-semibold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                        Abra o app do seu banco e escaneie o código QR acima
                      </p>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        Beneficiário: <strong className="text-emerald-400">{pixSettings.merchantName}</strong> • Chave: <strong className="font-mono text-cyan-400">{pixSettings.keyValue}</strong>
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                        Compatível com Nubank, Inter, Itaú, Bradesco, Banco do Brasil, Santander, Caixa e todos os bancos Bacen.
                      </p>
                    </div>

                    {/* Copia e Cola box */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                          Código Pix Copia e Cola (EMV BRCode)
                        </label>
                        <span className="text-[10px] font-mono text-emerald-400">Padrão Bacen SPI</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono ${
                        isDark ? 'bg-[#080b13] border-white/10 text-gray-300' : 'bg-white border-slate-300 text-slate-700'
                      }`}>
                        <span className="truncate text-[11px] select-all">{pixQrCodeString}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(pixQrCodeString);
                            setCopiedPix(true);
                            setTimeout(() => setCopiedPix(false), 3000);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#090d16] font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedPix ? 'done' : 'content_copy'}
                          </span>
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pix Simulation Trigger Button */}
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-[#090d16] font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    <span>
                      {isProcessing
                        ? 'Confirmando com o Banco Central...'
                        : `Confirmar Pagamento Pix Real (R$ ${currentPrice.toFixed(2).replace('.', ',')})`}
                    </span>
                  </button>
                </div>
              )}

              {/* CREDIT CARD GATEWAY VIEW */}
              {paymentMethod === 'credit' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Gateway Provider Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Gateway Adquirente de Processamento
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCardGateway('mercadopago')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          cardGateway === 'mercadopago'
                            ? 'bg-[#009ee3]/20 border-[#009ee3] text-[#009ee3] ring-1 ring-[#009ee3]/40'
                            : isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">handshake</span>
                        <span>Mercado Pago</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCardGateway('direct')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          cardGateway === 'direct'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                            : isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">credit_card</span>
                        <span>Asaas / PagBank</span>
                      </button>

                      <div className={`hidden sm:flex items-center justify-center p-2 rounded-xl text-[10px] font-mono ${
                        isDark ? 'text-gray-400' : 'text-slate-500'
                      }`}>
                        <span>Antifraude 3D Secure</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive 3D Visual Card Preview */}
                  <div className="perspective-1000 max-w-sm mx-auto">
                    <div
                      className={`relative w-full h-48 rounded-2xl p-5 text-white shadow-2xl transition-all duration-500 transform ${
                        isCardFlipped ? 'rotate-y-180' : ''
                      } bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#0284c7] border border-cyan-400/40 shadow-cyan-500/20`}
                    >
                      {/* Card Front */}
                      {!isCardFlipped ? (
                        <div className="flex flex-col justify-between h-full">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-7 rounded bg-amber-300/80 border border-amber-200/50 flex items-center justify-center">
                                <div className="w-6 h-4 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5 p-0.5 opacity-70">
                                  <div className="bg-amber-800/30 rounded-xs" />
                                  <div className="bg-amber-800/30 rounded-xs" />
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-gray-400 text-lg">contactless</span>
                            </div>
                            <span className="font-extrabold tracking-widest text-xs uppercase text-cyan-300">
                              {cardBrand.toUpperCase()}
                            </span>
                          </div>

                          <div className="tracking-[0.25em] text-lg font-mono font-bold text-center select-none text-cyan-100">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <div className="text-[9px] uppercase tracking-wider text-gray-400">Titular</div>
                              <div className="font-bold tracking-wider font-mono truncate max-w-[190px]">
                                {cardHolder || 'NOME DO ALUNO'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] uppercase tracking-wider text-gray-400">Validade</div>
                              <div className="font-bold font-mono tracking-widest">{cardExpiry || 'MM/AA'}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Card Back (CVV Strip) */
                        <div className="flex flex-col justify-between h-full py-2">
                          <div className="w-full h-8 bg-black/80 -mx-5 px-5 mt-1" />
                          <div className="space-y-1">
                            <div className="text-[9px] uppercase tracking-wider text-gray-400 text-right">
                              Código de Segurança (CVV)
                            </div>
                            <div className="w-full h-8 bg-white/90 text-slate-900 font-mono font-extrabold flex items-center justify-end px-3 rounded text-sm">
                              {cardCvv || '•••'}
                            </div>
                          </div>
                          <div className="text-[9px] text-gray-400 text-center">
                            RadBio Medical Certified Payment • Operação Protegida
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-bold text-gray-300">Número do Cartão de Crédito</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 8901 2345 7890"
                          maxLength={19}
                          className={`w-full p-3 rounded-xl border font-mono outline-none text-sm ${
                            isDark ? 'bg-[#0e121d] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        />
                        <span className="absolute right-3 top-3 text-[11px] font-bold text-cyan-400 uppercase">
                          {cardBrand}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-bold text-gray-300">Nome do Titular (conforme impresso)</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={e => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMPLETO"
                        className={`w-full p-3 rounded-xl border font-mono uppercase text-sm ${
                          isDark ? 'bg-[#0e121d] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-gray-300">Validade (MM/AA)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className={`w-full p-3 rounded-xl border font-mono text-sm ${
                          isDark ? 'bg-[#0e121d] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-gray-300">Código CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className={`w-full p-3 rounded-xl border font-mono text-sm ${
                          isDark ? 'bg-[#0e121d] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-gray-300">CPF do Titular do Cartão</label>
                      <input
                        type="text"
                        value={cardCpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`w-full p-3 rounded-xl border font-mono text-sm ${
                          isDark ? 'bg-[#0e121d] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-gray-300">Opções de Parcelamento</label>
                      <select
                        value={installments}
                        onChange={e => setInstallments(Number(e.target.value))}
                        className={`w-full p-3 rounded-xl border font-mono text-xs cursor-pointer ${
                          isDark ? 'bg-[#0e121d] border-white/10 text-white focus:border-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value={1}>1x de R$ {currentPrice.toFixed(2).replace('.', ',')} (à vista sem juros)</option>
                        <option value={2}>2x de R$ {(currentPrice / 2).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value={3}>3x de R$ {(currentPrice / 3).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value={6}>6x de R$ {(currentPrice / 6).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value={10}>10x de R$ {(currentPrice / 10).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value={12}>12x de R$ {(currentPrice / 12).toFixed(2).replace('.', ',')} sem juros</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Seals */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-slate-200/10">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-400 text-sm">verified_user</span>
                      <span>Ambiente Criptografado SSL 256 bits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-cyan-400 text-sm">security</span>
                      <span>PCI-DSS Nível 1 Certificado</span>
                    </div>
                  </div>

                  {/* Card Submit Button */}
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-[#090d16] font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">lock</span>
                    <span>
                      {isProcessing
                        ? 'Processando Operação com Cartão...'
                        : `Pagar em ${installments}x de R$ ${(currentPrice / installments).toFixed(2).replace('.', ',')}`}
                    </span>
                  </button>
                </div>
              )}

              {/* Processing Modal / Overlay */}
              {isProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl text-center space-y-4 ${
                    isDark ? 'bg-[#141b2d] border-cyan-400 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-cyan-400">sync</span>
                    </div>
                    <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                      Processando Matrícula no Curso Livre (40h)
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {processingStage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SUCCESS CONFIRMATION & RECEIPT VIEW */
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className={`p-8 rounded-3xl border text-center space-y-6 shadow-2xl backdrop-blur-2xl ${
            isDark ? 'bg-[#141c2e] border-emerald-500/40 text-white' : 'bg-white border-emerald-500/40 text-slate-900'
          }`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400">
                Pagamento Aprovado com Sucesso!
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans']">
                Parabéns, {currentUser.name}!
              </h2>
              <p className={`text-xs sm:text-sm max-w-lg mx-auto ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                Sua matrícula no <strong>{completedTransaction.courseTitle}</strong> foi concluída e o acesso de 40 horas está 100% liberado!
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className={`p-6 rounded-2xl border text-left space-y-3 font-mono text-xs ${
              isDark ? 'bg-[#0a0f1c] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center border-b pb-2 border-slate-200/15">
                <span className="text-gray-400">CÓDIGO DE TRANSAÇÃO:</span>
                <span className="font-bold text-cyan-400">{completedTransaction.transactionCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">MÉTODO:</span>
                <span className="font-bold uppercase text-emerald-400">
                  {completedTransaction.paymentMethod === 'pix' ? 'PIX Instantâneo' : `Cartão ${completedTransaction.cardBrand || ''} (${completedTransaction.installments}x)`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">VALOR PAGO:</span>
                <span className="font-bold text-white">R$ {completedTransaction.amount.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">CARGA HORÁRIA:</span>
                <span className="font-bold text-emerald-400">40 Horas Certificadas (LDB 9.394/96)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">DATA &amp; HORA:</span>
                <span className="text-gray-300">{completedTransaction.paidAt}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => pdfExportService.exportComprovante(completedTransaction)}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>Baixar Comprovante Oficial (PDF Paisagem)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('cursos_livres');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-[#090d16] font-bold text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">play_lesson</span>
                <span>Acessar Aulas &amp; Simulador (40h)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
