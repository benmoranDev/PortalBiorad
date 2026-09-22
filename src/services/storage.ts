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
  ThemeMode
} from '../types';
import {
  initialCurrentUser,
  initialCourses,
  initialLessons,
  initialTasks,
  initialStudentGrades,
  initialCertificates,
  initialEmailNotifications,
  defaultSupabaseConfig
} from '../data/initialData';

const KEYS = {
  USER: 'radbio_current_user',
  COURSES: 'radbio_courses',
  LESSONS: 'radbio_lessons',
  TASKS: 'radbio_tasks',
  GRADES: 'radbio_grades',
  CERTIFICATES: 'radbio_certificates',
  NOTIFICATIONS: 'radbio_notifications',
  SUPABASE: 'radbio_supabase_config',
  LANGUAGE: 'radbio_language',
  THEME: 'radbio_theme',
  NOTES: 'radbio_student_notes'
};

export const storageService = {
  getCurrentUser(): User {
    const data = localStorage.getItem(KEYS.USER);
    if (!data) {
      localStorage.setItem(KEYS.USER, JSON.stringify(initialCurrentUser));
      return initialCurrentUser;
    }
    return JSON.parse(data);
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getCourses(): Course[] {
    const data = localStorage.getItem(KEYS.COURSES);
    if (!data) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
      return initialCourses;
    }
    return JSON.parse(data);
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
    return JSON.parse(data);
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
  },

  addLesson(newLesson: Lesson): void {
    const list = this.getLessons();
    list.push(newLesson);
    this.setLessons(list);
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
    return JSON.parse(data);
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
    return JSON.parse(data);
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
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  },

  getNotes(): string {
    return localStorage.getItem(KEYS.NOTES) || 'Atenção para o janelamento da Tomografia de Tórax: utilizar Window Width de 1500 HU e Window Level de -600 HU para visualização minuciosa de bronquiectasias e nódulos subpleurais.';
  },

  setNotes(notes: string): void {
    localStorage.setItem(KEYS.NOTES, notes);
    window.dispatchEvent(new CustomEvent('radbio_state_changed'));
  }
};
