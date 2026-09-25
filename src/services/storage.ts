import {
  User,
  Course,
  Lesson,
  LessonResource,
  LessonQuizQuestion,
  LessonNote,
  TaskPendency,
  StudentGradeRecord,
  Certificate,
  EmailNotification,
  SupabaseConfig,
  Language,
  ThemeMode,
  CursoLivre,
  PaymentTransaction
} from '../types';
import {
  initialCurrentUser,
  adminUserBen,
  demoAccounts,
  initialCourses,
  initialLessons,
  initialTasks,
  initialStudentGrades,
  initialCertificates,
  initialEmailNotifications,
  defaultSupabaseConfig
} from '../data/initialData';
import { initialCursosLivres } from '../data/cursosLivresData';

const KEYS = {
  USER: 'radbio_current_user',
  AUTH_SESSION: 'radbio_auth_session',
  USERS_REGISTRY: 'radbio_users_registry',
  COURSES: 'radbio_courses',
  LESSONS: 'radbio_lessons',
  TASKS: 'radbio_tasks',
  GRADES: 'radbio_grades',
  CERTIFICATES: 'radbio_certificates',
  NOTIFICATIONS: 'radbio_notifications',
  SUPABASE: 'radbio_supabase_config',
  LANGUAGE: 'radbio_language',
  THEME: 'radbio_theme',
  NOTES: 'radbio_student_notes',
  CURSOS_LIVRES: 'radbio_cursos_livres',
  PAYMENTS: 'radbio_payments',
  PIX_SETTINGS: 'radbio_pix_settings'
};

function syncToSupabaseAsync(table: string, id: string, data: any) {
  try {
    import('./supabaseClient').then(({ supabaseService }) => {
      supabaseService.pushSingleRecord(table, id, data).catch(() => {});
    }).catch(() => {});
  } catch {
    // offline or local
  }
}

export const storageService = {
  getAuthSession(): { isAuthenticated: boolean; user: User | null } {
    const data = localStorage.getItem(KEYS.AUTH_SESSION);
    if (!data) {
      return { isAuthenticated: false, user: null };
    }
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.isAuthenticated === 'boolean') {
        return parsed;
      }
      return { isAuthenticated: false, user: null };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  },

  setAuthSession(session: { isAuthenticated: boolean; user: User | null }): void {
    localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(session));
    if (session.isAuthenticated && session.user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(session.user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  logout(): void {
    const unauthSession = { isAuthenticated: false, user: null };
    localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(unauthSession));
    localStorage.removeItem(KEYS.USER);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getRegisteredUsers(): User[] {
    const data = localStorage.getItem(KEYS.USERS_REGISTRY);
    let list: User[] = [];
    if (!data) {
      list = [...demoAccounts];
    } else {
      try {
        list = JSON.parse(data);
      } catch {
        list = [...demoAccounts];
      }
    }

    // Ensure Ben Moran (admin) is always present in users list with admin privileges
    const benIndex = list.findIndex(u => u.email.toLowerCase() === 'benmoran29dev@gmail.com');
    if (benIndex === -1) {
      list.unshift(adminUserBen);
      localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(list));
    } else if (list[benIndex].role !== 'admin') {
      list[benIndex] = { ...list[benIndex], role: 'admin', specialty: adminUserBen.specialty };
      localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(list));
    }

    return list;
  },

  registerUser(user: User): { success: boolean; message: string; user?: User } {
    const list = this.getRegisteredUsers();
    const normalizedEmail = user.email.toLowerCase().trim();
    if (list.some(u => u.email.toLowerCase().trim() === normalizedEmail)) {
      return { success: false, message: 'Este e-mail já está cadastrado no sistema acadêmico.' };
    }
    const newUser: User = {
      ...user,
      id: user.id || `usr_${Date.now()}`,
      enrollmentId: user.enrollmentId || `2026-RAD-${Math.floor(1000 + Math.random() * 9000)}`,
      gpa: user.gpa || 3.85,
      completedHours: user.completedHours || 0,
      totalRequiredHours: user.totalRequiredHours || 180,
      attendanceRate: user.attendanceRate || 100,
      status: user.status || 'regular',
      createdAt: user.createdAt || new Date().toLocaleDateString('pt-BR')
    };
    list.push(newUser);
    localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(list));
    syncToSupabaseAsync('radbio_users', newUser.id, newUser);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
    return { success: true, message: 'Cadastro acadêmico realizado com sucesso!', user: newUser };
  },

  getStudents(): User[] {
    return this.getRegisteredUsers().filter(u => u.role === 'student');
  },

  updateUser(updatedUser: User): { success: boolean; message: string } {
    const list = this.getRegisteredUsers();
    const index = list.findIndex(u => u.id === updatedUser.id);
    if (index === -1) {
      return { success: false, message: 'Usuário não encontrado para atualização.' };
    }
    list[index] = { ...list[index], ...updatedUser };
    localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(list));
    syncToSupabaseAsync('radbio_users', updatedUser.id, list[index]);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
    return { success: true, message: 'Cadastro de aluno atualizado com sucesso!' };
  },

  deleteUser(userId: string): { success: boolean; message: string } {
    const list = this.getRegisteredUsers();
    const user = list.find(u => u.id === userId);
    if (user?.email.toLowerCase() === 'benmoran29dev@gmail.com') {
      return { success: false, message: 'Não é permitido excluir o Administrador Geral do Sistema.' };
    }
    const filtered = list.filter(u => u.id !== userId);
    localStorage.setItem(KEYS.USERS_REGISTRY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
    return { success: true, message: 'Aluno removido do registro acadêmico.' };
  },

  login(identifier: string, pass: string): { success: boolean; message: string; user?: User } {
    const list = this.getRegisteredUsers();
    const cleanId = identifier.toLowerCase().trim();
    const cleanPass = pass.trim();

    // Check if user matches by email or enrollmentId
    let user = list.find(
      u => u.email.toLowerCase().trim() === cleanId || u.enrollmentId.toLowerCase().trim() === cleanId
    );

    // If not found yet in registry, ensure admin fallback if matching Ben Moran
    if (!user && (cleanId === 'benmoran29dev@gmail.com' || cleanId === 'adm-ben-2026' || cleanId === 'admin')) {
      user = adminUserBen;
    }

    if (!user) {
      return { success: false, message: 'Usuário não localizado. Verifique a matrícula ou e-mail.' };
    }

    // Passwords check:
    // Accept user's set password, user's enrollment code (e.g. ADM-BEN-2026), '123', or 'admin'
    const isBenAdmin =
      user.email.toLowerCase() === 'benmoran29dev@gmail.com' ||
      user.enrollmentId.toLowerCase() === 'adm-ben-2026';

    const isPasswordValid =
      !user.password ||
      user.password === cleanPass ||
      user.password.toLowerCase() === cleanPass.toLowerCase() ||
      user.enrollmentId.toLowerCase() === cleanPass.toLowerCase() ||
      cleanPass === '123' ||
      cleanPass.toLowerCase() === 'admin' ||
      (isBenAdmin && (
        cleanPass.toUpperCase() === 'ADM-BEN-2026' ||
        cleanPass.toLowerCase() === 'benmoran29dev@gmail.com' ||
        cleanPass === '123' ||
        cleanPass === 'admin'
      ));

    if (!isPasswordValid) {
      return { success: false, message: 'Senha incorreta. Você pode utilizar sua senha cadastrada ou seu código de matrícula.' };
    }

    const session = { isAuthenticated: true, user };
    this.setAuthSession(session);
    return { success: true, message: `Bem-vindo de volta, ${user.name}!`, user };
  },

  getCurrentUser(): User {
    const session = this.getAuthSession();
    if (session.isAuthenticated && session.user) {
      return session.user;
    }
    const data = localStorage.getItem(KEYS.USER);
    if (data) {
      try {
        const user = JSON.parse(data);
        if (user && user.id) return user;
      } catch {}
    }
    return {
      id: 'guest',
      name: 'Visitante',
      email: 'visitante@radbio.edu.br',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      enrollmentId: 'VISITANTE',
      specialty: 'Visitante',
      gpa: 0,
      completedHours: 0,
      totalRequiredHours: 0,
      attendanceRate: 0,
      status: 'regular'
    };
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    const session = this.getAuthSession();
    if (session.isAuthenticated) {
      localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify({ ...session, user }));
    }
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getCourses(): Course[] {
    const data = localStorage.getItem(KEYS.COURSES);
    if (!data) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
      return initialCourses;
    }
    const cached: Course[] = JSON.parse(data);
    // Ensure all initial courses (including new ones like contrastados and centro cirurgico) are present
    const missing = initialCourses.filter(ic => !cached.some(c => c.id === ic.id));
    if (missing.length > 0) {
      const merged = [...cached, ...missing];
      localStorage.setItem(KEYS.COURSES, JSON.stringify(merged));
      return merged;
    }
    return cached;
  },

  setCourses(courses: Course[]): void {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getLessons(): Lesson[] {
    const data = localStorage.getItem(KEYS.LESSONS);
    if (!data) {
      localStorage.setItem(KEYS.LESSONS, JSON.stringify(initialLessons));
      return initialLessons;
    }
    const cached: Lesson[] = JSON.parse(data);
    // Ensure new lessons (contrastados, centro cirurgico, tc abdomen) are merged
    const missing = initialLessons.filter(il => !cached.some(l => l.id === il.id));
    if (missing.length > 0) {
      const merged = [...cached, ...missing];
      localStorage.setItem(KEYS.LESSONS, JSON.stringify(merged));
      return merged;
    }
    return cached;
  },

  setLessons(lessons: Lesson[]): void {
    localStorage.setItem(KEYS.LESSONS, JSON.stringify(lessons));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  updateLesson(updatedLesson: Lesson): void {
    const list = this.getLessons();
    const index = list.findIndex(l => l.id === updatedLesson.id);
    if (index >= 0) {
      list[index] = updatedLesson;
    } else {
      list.push(updatedLesson);
    }
    this.setLessons(list);
    syncToSupabaseAsync('radbio_lessons', updatedLesson.id, updatedLesson);
  },

  addLesson(newLesson: Lesson): void {
    const list = this.getLessons();
    list.push(newLesson);
    this.setLessons(list);
    syncToSupabaseAsync('radbio_lessons', newLesson.id, newLesson);
  },

  deleteLesson(lessonId: string): void {
    const list = this.getLessons().filter(l => l.id !== lessonId);
    this.setLessons(list);
  },

  addResourceToLesson(lessonId: string, resource: LessonResource): void {
    const list = this.getLessons();
    const lesson = list.find(l => l.id === lessonId);
    if (lesson) {
      lesson.resources = [...(lesson.resources || []), resource];
      this.setLessons(list);
    }
  },

  removeResourceFromLesson(lessonId: string, resourceId: string): void {
    const list = this.getLessons();
    const lesson = list.find(l => l.id === lessonId);
    if (lesson && lesson.resources) {
      lesson.resources = lesson.resources.filter(r => r.id !== resourceId);
      this.setLessons(list);
    }
  },

  addQuizQuestionToLesson(lessonId: string, question: LessonQuizQuestion): void {
    const list = this.getLessons();
    const lesson = list.find(l => l.id === lessonId);
    if (lesson) {
      lesson.quizQuestions = [...(lesson.quizQuestions || []), question];
      this.setLessons(list);
    }
  },

  addNoteToLesson(lessonId: string, note: LessonNote): void {
    const list = this.getLessons();
    const lesson = list.find(l => l.id === lessonId);
    if (lesson) {
      lesson.studentNotes = [...(lesson.studentNotes || []), note];
      this.setLessons(list);
    }
  },

  deleteNoteFromLesson(lessonId: string, noteId: string): void {
    const list = this.getLessons();
    const lesson = list.find(l => l.id === lessonId);
    if (lesson && lesson.studentNotes) {
      lesson.studentNotes = lesson.studentNotes.filter(n => n.id !== noteId);
      this.setLessons(list);
    }
  },

  getTasks(): TaskPendency[] {
    const data = localStorage.getItem(KEYS.TASKS);
    if (!data) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(initialTasks));
      return initialTasks;
    }
    const cached: TaskPendency[] = JSON.parse(data);
    const missing = initialTasks.filter(it => !cached.some(t => t.id === it.id));
    if (missing.length > 0) {
      const merged = [...cached, ...missing];
      localStorage.setItem(KEYS.TASKS, JSON.stringify(merged));
      return merged;
    }
    return cached;
  },

  setTasks(tasks: TaskPendency[]): void {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getStudentGrades(): StudentGradeRecord[] {
    const data = localStorage.getItem(KEYS.GRADES);
    if (!data) {
      localStorage.setItem(KEYS.GRADES, JSON.stringify(initialStudentGrades));
      return initialStudentGrades;
    }
    return JSON.parse(data);
  },

  setStudentGrades(grades: StudentGradeRecord[]): void {
    localStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getCertificates(): Certificate[] {
    const data = localStorage.getItem(KEYS.CERTIFICATES);
    if (!data) {
      localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(initialCertificates));
      return initialCertificates;
    }
    return JSON.parse(data);
  },

  addCertificate(cert: Certificate): void {
    const list = this.getCertificates();
    list.unshift(cert);
    localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(list));
    syncToSupabaseAsync('radbio_certificates', cert.id, cert);
    
    // Auto trigger notification
    this.addNotification({
      id: `notif_${Date.now()}`,
      recipientEmail: initialCurrentUser.email,
      subject: `[Certificado Emitido] ${cert.courseName}`,
      body: `Parabéns! O seu certificado com código ${cert.code} foi emitido com sucesso e já está disponível em formato PDF assinado.`,
      type: 'certificate_issued',
      timestamp: 'Agora mesmo',
      isRead: false,
      status: 'delivered'
    });

    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getNotifications(): EmailNotification[] {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialEmailNotifications));
      return initialEmailNotifications;
    }
    return JSON.parse(data);
  },

  addNotification(notif: EmailNotification): void {
    const list = this.getNotifications();
    list.unshift(notif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    syncToSupabaseAsync('radbio_notifications', notif.id, notif);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map(item => item.id === id ? { ...item, isRead: true } : item);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getSupabaseConfig(): SupabaseConfig {
    const data = localStorage.getItem(KEYS.SUPABASE);
    if (!data) {
      localStorage.setItem(KEYS.SUPABASE, JSON.stringify(defaultSupabaseConfig));
      return defaultSupabaseConfig;
    }
    try {
      const cfg: SupabaseConfig = JSON.parse(data);
      // Clean up legacy placeholder URL or empty URL to use default project credentials
      if (!cfg.url || cfg.url.includes('radbio-tomography-db.supabase.co')) {
        const configured: SupabaseConfig = {
          ...defaultSupabaseConfig
        };
        localStorage.setItem(KEYS.SUPABASE, JSON.stringify(configured));
        return configured;
      }
      return cfg;
    } catch {
      return defaultSupabaseConfig;
    }
  },

  setSupabaseConfig(config: SupabaseConfig): void {
    localStorage.setItem(KEYS.SUPABASE, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getLanguage(): Language {
    return (localStorage.getItem(KEYS.LANGUAGE) as Language) || 'pt';
  },

  setLanguage(lang: Language): void {
    localStorage.setItem(KEYS.LANGUAGE, lang);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getTheme(): ThemeMode {
    return (localStorage.getItem(KEYS.THEME) as ThemeMode) || 'dark';
  },

  setTheme(theme: ThemeMode): void {
    localStorage.setItem(KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('radbio_theme_changed', { detail: theme }));
  },

  getNotes(): string {
    return localStorage.getItem(KEYS.NOTES) || 'Atenção para o janelamento da Tomografia de Tórax: utilizar Window Width de 1500 HU e Window Level de -600 HU para visualização minuciosa de bronquiectasias e nódulos subpleurais.';
  },

  setNotes(notes: string): void {
    localStorage.setItem(KEYS.NOTES, notes);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getCursosLivres(): CursoLivre[] {
    const data = localStorage.getItem(KEYS.CURSOS_LIVRES);
    if (!data) {
      localStorage.setItem(KEYS.CURSOS_LIVRES, JSON.stringify(initialCursosLivres));
      return initialCursosLivres;
    }
    try {
      const cached: CursoLivre[] = JSON.parse(data);
      // Ensure any newly defined initial 40h courses exist
      const missing = initialCursosLivres.filter(icl => !cached.some(c => c.id === icl.id));
      if (missing.length > 0) {
        const merged = [...cached, ...missing];
        localStorage.setItem(KEYS.CURSOS_LIVRES, JSON.stringify(merged));
        return merged;
      }
      return cached;
    } catch {
      return initialCursosLivres;
    }
  },

  setCursosLivres(courses: CursoLivre[]): void {
    localStorage.setItem(KEYS.CURSOS_LIVRES, JSON.stringify(courses));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  addCursoLivre(course: CursoLivre): void {
    const list = this.getCursosLivres();
    list.unshift(course);
    this.setCursosLivres(list);
  },

  getPaymentTransactions(): PaymentTransaction[] {
    const data = localStorage.getItem(KEYS.PAYMENTS);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePaymentTransaction(tx: PaymentTransaction): void {
    const list = this.getPaymentTransactions();
    list.unshift(tx);
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(list));
    syncToSupabaseAsync('radbio_payments', tx.id, tx);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  enrollInCursoLivre(courseId: string, transaction: PaymentTransaction): void {
    // 1. Save transaction
    this.savePaymentTransaction(transaction);

    // 2. Mark course as enrolled
    const courses = this.getCursosLivres();
    const target = courses.find(c => c.id === courseId);
    if (target) {
      target.isEnrolled = true;
      target.progressPercent = target.progressPercent || 0;
      target.enrolledStudentsCount = (target.enrolledStudentsCount || 0) + 1;
      this.setCursosLivres(courses);
    }

    // 3. Add to student notification
    this.addNotification({
      id: `notif_${Date.now()}`,
      recipientEmail: transaction.studentEmail,
      subject: `[Matrícula Aprovada via ${transaction.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}] Curso Livre (40h): ${transaction.courseTitle}`,
      body: `Parabéns ${transaction.studentName}! Seu pagamento de R$ ${transaction.amount.toFixed(2).replace('.', ',')} no Curso Livre de 40 Horas foi confirmado pelo sistema financeiro (Transação: ${transaction.transactionCode}). As videoaulas, protocolos do Activion 16 e certificado de 40 horas foram liberados em sua conta acadêmica.`,
      type: 'payment_confirmed',
      timestamp: 'Agora mesmo',
      isRead: false,
      status: 'delivered'
    });

    // 4. Also register course in main courses list if not already there so it shows in general views
    const mainCourses = this.getCourses();
    if (target && !mainCourses.some(mc => mc.id === target.id)) {
      mainCourses.push({
        id: target.id,
        code: target.code,
        title: target.title,
        description: target.description,
        credits: 4, // 40h is equivalent to 4 credits
        instructor: target.instructor,
        instructorTitle: target.instructorTitle,
        instructorAvatar: target.instructorAvatar,
        category: 'Tomografia Computadorizada',
        progress: 0,
        currentModule: 1,
        totalModules: target.modules.length,
        grade: 10,
        status: 'active',
        nextDeadline: 'Livre acesso (40h)',
        nextDeliveryTitle: 'Avaliação de Certificação 40h',
        coverImage: target.coverImage,
        price: target.price
      });
      this.setCourses(mainCourses);
    }

    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  exportDatabaseBackup(): string {
    const backup: Record<string, unknown> = {};
    Object.values(KEYS).forEach(k => {
      const v = localStorage.getItem(k);
      if (v) {
        try {
          backup[k] = JSON.parse(v);
        } catch {
          backup[k] = v;
        }
      }
    });
    return JSON.stringify(backup, null, 2);
  },

  restoreDatabaseBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string') {
          localStorage.setItem(k, v);
        } else {
          localStorage.setItem(k, JSON.stringify(v));
        }
      });
      window.dispatchEvent(new CustomEvent('radbio_state_changed'));
      return true;
    } catch {
      return false;
    }
  },

  resetToDefaultData(): void {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getPixSettings(): { keyType: string; keyValue: string; merchantName: string; merchantCity: string } {
    const data = localStorage.getItem(KEYS.PIX_SETTINGS);
    if (!data) {
      const defaultSettings = {
        keyType: 'email',
        keyValue: 'benmoran29dev@gmail.com',
        merchantName: 'RADBIO EDUCACAO S/A',
        merchantCity: 'SAO PAULO'
      };
      localStorage.setItem(KEYS.PIX_SETTINGS, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    try {
      return JSON.parse(data);
    } catch {
      return {
        keyType: 'email',
        keyValue: 'benmoran29dev@gmail.com',
        merchantName: 'RADBIO EDUCACAO S/A',
        merchantCity: 'SAO PAULO'
      };
    }
  },

  savePixSettings(settings: { keyType: string; keyValue: string; merchantName: string; merchantCity: string }): void {
    localStorage.setItem(KEYS.PIX_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  }
};
