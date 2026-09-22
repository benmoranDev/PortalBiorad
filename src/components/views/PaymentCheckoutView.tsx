import React, { useState } from 'react';
import { initialPaymentPlans } from '../../data/initialData';
import { PaymentPlan, ThemeMode } from '../../types';
import { storageService } from '../../services/storage';

interface PaymentCheckoutViewProps {
  onPaymentSuccess: (courseTitle: string) => void;
  theme?: ThemeMode;
}

export const PaymentCheckoutView: React.FC<PaymentCheckoutViewProps> = ({
  onPaymentSuccess,
  theme = 'dark'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isDark = theme === 'dark';

  const handleSimulatePayment = () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Trigger notification
      storageService.addNotification({
        id: `notif_${Date.now()}`,
        recipientEmail: 'lucas.mendonca@radbio.edu.br',
        subject: `[Acesso Liberado] Matrícula Confirmada: ${selectedPlan.title}`,
        body: `Seu pagamento via ${paymentMethod.toUpperCase()} foi aprovado com sucesso. O módulo já está desbloqueado em sua conta com acesso total ao simulador de TC e emissão de certificados acadêmicos.`,
        type: 'payment_confirmed',
        timestamp: 'Agora mesmo',
        isRead: false,
        status: 'delivered'
      });

      onPaymentSuccess(selectedPlan.title);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-8">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
          isDark
            ? 'bg-[#00a572]/15 text-[#4edea3] border-[#4edea3]/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Liberação Instantânea de Acesso para Estudantes
        </div>
        <h1 className={`text-3xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Planos de Especialização em Radiologia &amp; TC
        </h1>
        <p className={`text-sm ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
          Acesso completo ao simulador interativo de tomografia, videoaulas gravadas, monitoria com professores e emissão de diplomas oficiais em PDF.
        </p>
      </section>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {initialPaymentPlans.map(plan => (
          <div
            key={plan.id}
            className={`p-7 rounded-3xl backdrop-blur-2xl border shadow-xl flex flex-col justify-between relative transition-all ${
              plan.isPopular
                ? isDark
                  ? 'bg-gradient-to-b from-[#1c1f29] via-[#141f38]/80 to-[#141f38] border-[#4cd7f6] ring-2 ring-[#4cd7f6]/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]'
                  : 'bg-white border-cyan-500 ring-2 ring-cyan-400/30 shadow-lg'
                : isDark
                  ? 'bg-[#141f38]/50 border-white/10'
                  : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#4edea3] text-[#090d16] font-extrabold text-[11px] shadow-lg">
                MAIS ESCOLHIDO PELOS ALUNOS
              </div>
            )}

            <div>
              <h3 className={`text-xl font-bold font-['Plus_Jakarta_Sans'] mb-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {plan.title}
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-[#bcc9cd]' : 'text-slate-600'}`}>
                Acesso imediato às videoaulas e ao simulador de tomografia computadorizada.
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className={`text-4xl font-extrabold font-['Plus_Jakarta_Sans'] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  ou {plan.installments}x de R$ {(plan.price / plan.installments).toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className={`space-y-3 pt-4 border-t text-xs ${
                isDark ? 'border-white/10 text-[#dfe2ef]' : 'border-slate-100 text-slate-700'
              }`}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] shadow-lg shadow-[#06b6d4]/40 hover:opacity-95'
                    : isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                <span>Matricular-se Agora</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`max-w-lg w-full p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 ${
            isDark ? 'bg-[#1c1f29] border-[#4cd7f6]/40 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/20">
              <div>
                <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                  Finalizar Matrícula
                </h3>
                <p className="text-xs text-cyan-500 font-semibold">{selectedPlan.title}</p>
              </div>
              <button
                onClick={() => { setSelectedPlan(null); setIsSuccess(false); }}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {!isSuccess ? (
              <>
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                        : isDark ? 'bg-[#0a0e17] border-white/10 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">qr_code_2</span>
                    Pix Instantâneo
                  </button>
                  <button
                    onClick={() => setPaymentMethod('credit')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'credit'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600'
                        : isDark ? 'bg-[#0a0e17] border-white/10 text-gray-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">credit_card</span>
                    Cartão de Crédito
                  </button>
                </div>

                {paymentMethod === 'pix' ? (
                  <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                    isDark ? 'bg-[#0a0e17] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                      {/* Simulated Pix QR Code */}
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="0" y="0" width="30" height="30" fill="#000" />
                        <rect x="5" y="5" width="20" height="20" fill="#fff" />
                        <rect x="10" y="10" width="10" height="10" fill="#000" />
                        <rect x="70" y="0" width="30" height="30" fill="#000" />
                        <rect x="75" y="5" width="20" height="20" fill="#fff" />
                        <rect x="80" y="10" width="10" height="10" fill="#000" />
                        <rect x="0" y="70" width="30" height="30" fill="#000" />
                        <rect x="5" y="75" width="20" height="20" fill="#fff" />
                        <rect x="10" y="80" width="10" height="10" fill="#000" />
                        <rect x="40" y="20" width="10" height="40" fill="#000" />
                        <rect x="60" y="50" width="20" height="10" fill="#000" />
                        <rect x="45" y="70" width="35" height="15" fill="#000" />
                      </svg>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                      Escaneie com seu app de banco para liberação imediata.
                    </p>
                    <div className={`p-2 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                      isDark ? 'bg-[#141f38] border-white/5 text-gray-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <span className="truncate">00020126580014br.gov.bcb.pix0136radbio...</span>
                      <button
                        onClick={() => {}}
                        className="text-cyan-500 hover:underline shrink-0 ml-2 font-bold cursor-pointer"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• 4242"
                        className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                          isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        defaultValue="4111 2222 3333 4444"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          Validade
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                            isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                          defaultValue="12/28"
                        />
                      </div>
                      <div>
                        <label className={`block mb-1 font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          className={`w-full p-2.5 rounded-xl border font-mono outline-none ${
                            isDark ? 'bg-[#0a0e17] border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                          defaultValue="888"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-[#090d16] font-bold text-xs shadow-lg shadow-[#06b6d4]/40 flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>{isProcessing ? 'Validando Pagamento...' : `Pagar R$ ${selectedPlan.price.toFixed(2).replace('.', ',')}`}</span>
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#00a572]/20 border-2 border-[#4edea3] flex items-center justify-center text-[#4edea3]">
                  <span className="material-symbols-outlined text-3xl">check</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold">Matrícula Concluída com Sucesso!</h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    Um e-mail de confirmação foi encaminhado. O simulador de TC e as aulas já estão liberados!
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedPlan(null); setIsSuccess(false); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00a572] to-[#4edea3] text-[#090d16] font-bold text-xs cursor-pointer"
                >
                  Ir para as Aulas
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
