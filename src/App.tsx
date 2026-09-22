import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Course,
  Lesson,
  TaskPendency,
  StudentGradeRecord,
  Certificate,
  EmailNotification,
  SupabaseConfig,
  Language,
  ThemeMode
} from './types';
import { storageService } from './services/storage';
import { SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';
import { DashboardView } from './components/views/DashboardView';
import { GradesView } from './components/views/GradesView';
import { ClassroomView } from './components/views/ClassroomView';
import { TeacherGradesView } from './components/views/TeacherGradesView';
import { PendenciasView } from './components/views/PendenciasView';
import { CertificatesView } from './components/views/CertificatesView';
import { AdminManagementView } from './components/views/AdminManagementView';
import { PaymentCheckoutView } from './components/views/PaymentCheckoutView';
import { SettingsView } from './components/views/SettingsView';
import { SimulatorModal } from './components/views/SimulatorModal';
import { SubmissionModal } from './components/modals/SubmissionModal';
import { LabSupportModal } from './components/modals/LabSupportModal';

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [courses, setCourses] = useState<Course[]>(() => storageService.getCourses());
  const [lessons, setLessons] = useState<Lesson[]>(() => storageService.getLessons());
  const [tasks, setTasks] = useState<TaskPendency[]>(() => storageService.getTasks());
  const [studentGrades, setStudentGrades] = useState<StudentGradeRecord[]>(() => storageService.getStudentGrades());
  const [certificates, setCertificates] = useState<Certificate[]>(() => storageService.getCertificates());
  const [notifications, setNotifications] = useState<EmailNotification[]>(() => storageService.getNotifications());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => storageService.getSupabaseConfig());
  const [language, setLanguage] = useState<Language>(() => storageService.getLanguage());
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getTheme());

  // UI Flow States
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[3] || lessons[0]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isLabSupportOpen, setIsLabSupportOpen] = useState<boolean>(false);
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<TaskPendency | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with document element theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync with storage events
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(storageService.getCurrentUser());
      setCourses(storageService.getCourses());
      setLessons(storageService.getLessons());
      setTasks(storageService.getTasks());
      setStudentGrades(storageService.getStudentGrades());
      setCertificates(storageService.getCertificates());
      setNotifications(storageService.getNotifications());
      setSupabaseConfig(storageService.getSupabaseConfig());
      setLanguage(storageService.getLanguage());
      setTheme(storageService.getTheme());
    };

    window.addEventListener('radbio_state_changed', handleStorageChange);
    return () => window.removeEventListener('radbio_state_changed', handleStorageChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'Modo Escuro (Liquid Glass) ativado' : 'Modo Claro (Clínico) ativado');
  };

  const handleRoleChange = (newRole: UserRole) => {
    let updatedUser = { ...currentUser, role: newRole };
    if (newRole === 'professor') {
      updatedUser = {
        ...updatedUser,
        name: 'Prof. Dr. Aris Thorne',
        email: 'aris.thorne@radbio.edu.br',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
        enrollmentId: 'DOC-RAD-2026',
        specialty: 'Médico Radiologista & Físico das Radiações (CBR)'
      };
      if (currentTab === 'dashboard') setCurrentTab('professor_notas');
    } else if (newRole === 'admin') {
      updatedUser = {
        ...updatedUser,
        name: 'Dra. Helena Vasconcelos',
        email: 'helena.v@radbio.edu.br',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
        enrollmentId: 'ADM-RAD-001',
        specialty: 'Diretoria Acadêmica e Regulação de Ensino'
      };
      if (currentTab === 'dashboard') setCurrentTab('admin');
    } else {
      updatedUser = {
        ...updatedUser,
        name: 'Lucas Mendonça',
        email: 'lucas.mendonca@radbio.edu.br',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        enrollmentId: '2025-RAD-8841',
        specialty: 'Tecnólogo em Radiologia & Tomografia Computadorizada'
      };
    }
    setCurrentUser(updatedUser);
    storageService.setCurrentUser(updatedUser);
    showToast(`Perfil alterado para ${newRole === 'student' ? 'Aluno' : newRole === 'professor' ? 'Docente' : 'Administrador'}`);
  };

  const handleTaskSubmitted = (taskId: string, fileName: string) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, status: 'submitted' as const, submittedFile: fileName } : t
    );
    setTasks(updated);
    storageService.setTasks(updated);

    // Auto notification
    storageService.addNotification({
      id: `notif_${Date.now()}`,
      recipientEmail: currentUser.email,
      subject: '[Confirmação de Envio] Trabalho Protocolado no Portal',
      body: `Seu arquivo "${fileName}" foi recebido pelo sistema e protocolado com sucesso na disciplina de Tomografia Computadorizada.`,
      type: 'deadline_warning',
      timestamp: 'Agora mesmo',
      isRead: false,
      status: 'delivered'
    });

    showToast(`Arquivo "${fileName}" enviado com sucesso!`);
  };

  const handlePaymentSuccess = (courseTitle: string) => {
    showToast(`Matrícula confirmada no curso ${courseTitle}! Acesso liberado.`);
    setCurrentTab('aulas');
  };

  const handleIssueCertificate = () => {
    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      code: `RADBIO-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}-TC`,
      studentName: currentUser.name,
      studentDocument: `${currentUser.enrollmentId} • CPF Registrado`,
      courseName: 'Aperfeiçoamento em Tomografia Computadorizada de Alta Resolução (HRCT)',
      workloadHours: 120,
      completionDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      instructorName: 'Prof. Dr. Aris Thorne',
      instructorRole: 'Supervisor de Tomografia CBR',
      finalScore: 9.6,
      sha256Hash: 'a7c98b21...4920fc99e01',
      qrValidationUrl: 'https://radbio.edu.br/validar'
    };
    storageService.addCertificate(newCert);
    setCertificates(storageService.getCertificates());
    showToast('Novo Certificado emitido e assinado digitalmente!');
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  // Filter courses or lessons by search
  const displayCourses = searchTerm
    ? courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()))
    : courses;

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen font-['Inter'] relative transition-colors duration-200 ${
        isDark
          ? 'bg-[#090d16] text-[#dfe2ef] selection:bg-[#4cd7f6]/20 selection:text-[#4cd7f6]'
          : 'bg-[#f1f5f9] text-[#0f172a] selection:bg-cyan-200 selection:text-cyan-900'
      }`}
    >
      {/* Background Decorative Glow Orbs */}
      {isDark ? (
        <>
          <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="fixed top-1/3 -right-40 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-[160px] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="fixed -top-40 -left-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="fixed top-1/3 -right-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-sky-200/40 rounded-full blur-[160px] pointer-events-none z-0" />
        </>
      )}

      {/* Side Navigation Bar */}
      <SideNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={currentUser.role}
        pendingCount={pendingCount}
        theme={theme}
        onOpenLabSupport={() => setIsLabSupportOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Top Header Bar */}
        <TopNavBar
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          language={language}
          onLanguageChange={lang => {
            setLanguage(lang);
            storageService.setLanguage(lang);
          }}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          notifications={notifications}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectNotification={notif => {
            storageService.markNotificationAsRead(notif.id);
            if (notif.type === 'grade_published') setCurrentTab('boletim');
            else if (notif.type === 'certificate_issued') setCurrentTab('certificados');
            else if (notif.type === 'deadline_warning') setCurrentTab('pendencias');
          }}
        />

        {/* View Switcher */}
        <main className="flex-1 lg:pl-64">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              courses={displayCourses}
              tasks={tasks}
              theme={theme}
              recentGrades={[
                { id: '1', title: 'Relatório #04: Reconstrução MPR e Angiotomografia', course: 'Tomografia Computadorizada Avançada', instructor: 'Prof. Dr. Aris Thorne', grade: 9.8, statusText: 'Aprovado A+', date: 'Hoje' },
                { id: '2', title: 'Artigo Crítico: Ressonância com Difusão em Neuroimagem', course: 'Ressonância Magnética Estrutural', instructor: 'Prof. Dr. Carlos Vane', grade: 9.0, statusText: 'Aprovado A', date: 'Ontem' },
                { id: '3', title: 'Auditoria de Dosimetria e Controle de Qualidade DR', course: 'Radiologia Digital e Posicionamento', instructor: 'Dra. Sofia Albarracín', grade: 8.2, statusText: 'Aprovado B+', date: 'Há 3 dias' }
              ]}
              onNavigateTab={setCurrentTab}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onOpenSubmissionModal={task => setSelectedTaskForSubmission(task)}
            />
          )}

          {currentTab === 'aulas' && (
            <ClassroomView
              lessons={lessons}
              activeLesson={activeLesson}
              onSelectLesson={setActiveLesson}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              theme={theme}
            />
          )}

          {currentTab === 'boletim' && (
            <GradesView
              courses={courses}
              studentName={currentUser.name}
              enrollmentId={currentUser.enrollmentId}
              onRequestReview={() => showToast('Solicitação de revisão enviada para a banca docente.')}
              onValidateAuthenticity={() => setCurrentTab('certificados')}
              theme={theme}
            />
          )}

          {currentTab === 'pendencias' && (
            <PendenciasView
              tasks={tasks}
              onOpenSubmissionModal={task => setSelectedTaskForSubmission(task)}
              onTasksUpdated={setTasks}
              theme={theme}
            />
          )}

          {currentTab === 'professor_notas' && (
            <TeacherGradesView
              grades={studentGrades}
              onUpdateGrades={setStudentGrades}
              onShowSuccessToast={showToast}
              theme={theme}
            />
          )}

          {currentTab === 'certificados' && (
            <CertificatesView
              certificates={certificates}
              onIssueCertificate={handleIssueCertificate}
              theme={theme}
            />
          )}

          {currentTab === 'pagamentos' && (
            <PaymentCheckoutView onPaymentSuccess={handlePaymentSuccess} theme={theme} />
          )}

          {currentTab === 'admin' && (
            <AdminManagementView
              courses={courses}
              notifications={notifications}
              theme={theme}
              onAddCourse={newCourse => {
                const updated = [newCourse, ...courses];
                setCourses(updated);
                storageService.setCourses(updated);
                showToast(`Disciplina ${newCourse.title} criada com sucesso!`);
              }}
            />
          )}

          {currentTab === 'configuracoes' && (
            <SettingsView
              supabaseConfig={supabaseConfig}
              onUpdateSupabase={setSupabaseConfig}
              theme={theme}
              onToggleTheme={t => {
                setTheme(t);
                storageService.setTheme(t);
              }}
              language={language}
              onSelectLanguage={l => {
                setLanguage(l);
                storageService.setLanguage(l);
              }}
              onShowSuccessToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      <SubmissionModal
        task={selectedTaskForSubmission}
        onClose={() => setSelectedTaskForSubmission(null)}
        onSubmitSuccess={handleTaskSubmitted}
        theme={theme}
      />

      <LabSupportModal
        isOpen={isLabSupportOpen}
        onClose={() => setIsLabSupportOpen(false)}
        onShowSuccessToast={showToast}
      />

      {/* Floating System Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl text-xs flex items-center gap-3 animate-bounce ${
            isDark
              ? 'bg-[#1c1f29] border-[#4cd7f6]/50 text-white'
              : 'bg-white border-cyan-300 text-slate-800'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">notifications_active</span>
          </div>
          <div>
            <span className="font-bold text-[#4cd7f6] block">RadBio Acadêmico</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
