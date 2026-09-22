export type UserRole = 'student' | 'professor' | 'admin';

export type Language = 'pt' | 'en' | 'es';

export type ThemeMode = 'dark' | 'light';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  enrollmentId: string;
  specialty: string;
  gpa: number;
  completedHours: number;
  totalRequiredHours: number;
  attendanceRate: number;
  status: 'regular' | 'warning' | 'honor';
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructor: string;
  instructorTitle: string;
  instructorAvatar?: string;
  category: 'Tomografia Computadorizada' | 'Ressonância Magnética' | 'Radiologia Geral' | 'Radioproteção' | 'Medicina Nuclear';
  progress: number;
  currentModule: number;
  totalModules: number;
  grade: number;
  status: 'active' | 'completed' | 'upcoming';
  nextDeadline?: string;
  nextDeliveryTitle?: string;
  coverImage?: string;
  price?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  chapterNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string;
  isCompleted: boolean;
  testScore?: number;
  currentPlaybackPercent?: number;
  markers: { timeSeconds: number; label: string }[];
  ctWindowType?: 'pulmonary' | 'bone' | 'mediastinum' | 'brain';
}

export interface TaskPendency {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  type: 'relatorio' | 'laudo_tc' | 'slides' | 'prova' | 'estagio';
  deadlineDate: string;
  daysRemaining: number;
  format: string;
  status: 'pending' | 'submitted' | 'reviewed';
  score?: number;
  submittedFile?: string;
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  enrollmentId: string;
  attendance: number;
  gradeN1: number;
  gradeN2: number;
  gradePractice: number;
  calculatedAverage: number;
  feedback?: string;
  status: 'approved' | 'review' | 'risk';
}

export interface RecentGradeItem {
  id: string;
  title: string;
  course: string;
  instructor: string;
  grade: number;
  statusText: string;
  date: string;
}

export interface Certificate {
  id: string;
  code: string;
  studentName: string;
  studentDocument: string;
  courseName: string;
  workloadHours: number;
  completionDate: string;
  instructorName: string;
  instructorRole: string;
  finalScore: number;
  sha256Hash: string;
  qrValidationUrl: string;
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  type: 'grade_published' | 'deadline_warning' | 'certificate_issued' | 'payment_confirmed';
  timestamp: string;
  isRead: boolean;
  status: 'sent' | 'delivered';
}

export interface PaymentPlan {
  id: string;
  courseId: string;
  title: string;
  price: number;
  installments: number;
  features: string[];
  isPopular?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}
