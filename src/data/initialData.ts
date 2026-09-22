import { User, Course, Lesson, TaskPendency, StudentGradeRecord, RecentGradeItem, Certificate, EmailNotification, PaymentPlan, SupabaseConfig } from '../types';

export const initialCurrentUser: User = {
  id: 'usr_student_01',
  name: 'Lucas Mendonça',
  email: 'lucas.mendonca@radbio.edu.br',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  enrollmentId: '2025-RAD-8841',
  specialty: 'Tecnólogo em Radiologia & Tomografia Computadorizada',
  gpa: 3.92,
  completedHours: 142,
  totalRequiredHours: 180,
  attendanceRate: 94,
  status: 'regular'
};

export const initialCourses: Course[] = [
  {
    id: 'course_tc_701',
    code: 'RAD-701',
    title: 'Tomografia Computadorizada Avançada & Protocolos Multislice',
    description: 'Aquisição helicoidal multidetectores (64 a 320 canais), janelamento (Hounsfield Units), angiotomografia e contraste iodado não iônico.',
    credits: 4,
    instructor: 'Prof. Dr. Aris Thorne',
    instructorTitle: 'Médico Radiologista & Físico das Radiações (CBR/CRTR)',
    instructorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    category: 'Tomografia Computadorizada',
    progress: 78,
    currentModule: 6,
    totalModules: 8,
    grade: 9.2,
    status: 'active',
    nextDeadline: '28/Fev',
    nextDeliveryTitle: 'Trabalho de TC de Tórax: Detecção de Nódulos e Enfisema',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    price: 489.00
  },
  {
    id: 'course_rm_802',
    code: 'RAD-802',
    title: 'Ressonância Magnética & Neuroimagem Estrutural',
    description: 'Sequências T1, T2, FLAIR, DWI difusão e espectroscopia. Identificação de isquemia precoce, patologias da substância branca e artefatos de suscetibilidade.',
    credits: 3,
    instructor: 'Prof. Dr. Carlos Vane',
    instructorTitle: 'Especialista em Neuro-Radiologia Diagnóstica',
    instructorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=250&q=80',
    category: 'Ressonância Magnética',
    progress: 66,
    currentModule: 8,
    totalModules: 12,
    grade: 8.7,
    status: 'active',
    nextDeadline: '04/Mar',
    nextDeliveryTitle: 'Apresentação: Protocolos de Difusão em AVC Isquêmico',
    coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    price: 520.00
  },
  {
    id: 'course_rx_304',
    code: 'RAD-304',
    title: 'Radiologia Digital, Posicionamento e Física das Radiações',
    description: 'Física da produção de raios-X, geometria de projeção, radioproteção ocupacional e controle de qualidade de detectores digitais DR/CR.',
    credits: 4,
    instructor: 'Dra. Sofia Albarracín',
    instructorTitle: 'Doutora em Engenharia Biomédica e Dosimetria',
    instructorAvatar: 'https://images.unsplash.com/photo-1594824813581-2292f7b88937?auto=format&fit=crop&w=250&q=80',
    category: 'Radiologia Geral',
    progress: 91,
    currentModule: 10,
    totalModules: 11,
    grade: 8.9,
    status: 'active',
    nextDeadline: '09/Mar',
    nextDeliveryTitle: 'Relatório Técnico: Curva de Resposta e Ruído em Detectores DR',
    coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    price: 360.00
  },
  {
    id: 'course_prot_510',
    code: 'RAD-510',
    title: 'Radioproteção Hospitalar & Legislação Sanitária (RDC 330)',
    description: 'Normas CNEN e Anvisa RDC 330/2019, princípio ALARA, cálculo de blindagem de barita e monitoramento dosimétrico individual.',
    credits: 3,
    instructor: 'Prof. Cláudio Silveira',
    instructorTitle: 'Supervisor de Radioproteção Qualificado CNEN-RT',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    category: 'Radioproteção',
    progress: 100,
    currentModule: 6,
    totalModules: 6,
    grade: 9.6,
    status: 'completed',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    price: 399.00
  }
];

export const initialLessons: Lesson[] = [
  {
    id: 'les_01',
    courseId: 'course_tc_701',
    chapterNumber: 1,
    title: 'Fundamentos de Tomografia: Aquisição Axial vs. Helicoidal Multislice',
    description: 'Princípios matemáticos de reconstrução Radon, matriz 512x512, pitch e formação do vóxel isotrópico.',
    durationMinutes: 45,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    isCompleted: true,
    testScore: 98,
    markers: [
      { timeSeconds: 120, label: 'Tubo de Raios-X e Detector em Arco' },
      { timeSeconds: 600, label: 'Cálculo de Pitch e Espessura de Corte' },
      { timeSeconds: 1500, label: 'Reconstrução Iterativa e Redução de Dose' }
    ],
    ctWindowType: 'bone'
  },
  {
    id: 'les_02',
    courseId: 'course_tc_701',
    chapterNumber: 2,
    title: 'Escala Hounsfield (HU) e Janelamento Ósseo, Pulmonar e de Partes Moles',
    description: 'Controle de Window Width (WW) e Window Level (WL). Calibração e diferenciação entre ar (-1000 HU), água (0 HU) e osso cortical (+1000 HU).',
    durationMinutes: 52,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    isCompleted: true,
    testScore: 95,
    markers: [
      { timeSeconds: 180, label: 'Definição Matemática do Coeficiente de Atenuação' },
      { timeSeconds: 840, label: 'Janela de Parênquima Pulmonar (WW 1500 / WL -600)' },
      { timeSeconds: 1800, label: 'Janela de Mediastino e Diferenciação Vascular' }
    ],
    ctWindowType: 'pulmonary'
  },
  {
    id: 'les_03',
    courseId: 'course_tc_701',
    chapterNumber: 3,
    title: 'Protocolos de Injeção de Contraste Iodado e Reações Adversas',
    description: 'Cálculo de vazão de bomba injetora (3 a 5 mL/s), tempos de fase arterial, portal e equilíbrio tardio.',
    durationMinutes: 48,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    isCompleted: true,
    testScore: 92,
    markers: [
      { timeSeconds: 240, label: 'Osmolaridade de Contrastes Não Iônicos' },
      { timeSeconds: 960, label: 'Bolus Tracking e SmartPrep na Aorta Abdominal' },
      { timeSeconds: 1920, label: 'Conduta de Emergência em Reações Anafilactoides' }
    ],
    ctWindowType: 'mediastinum'
  },
  {
    id: 'les_04',
    courseId: 'course_tc_701',
    chapterNumber: 4,
    title: 'Angiotomografia Coronariana & Reconstrução 3D MPR / VR',
    description: 'Sincronização com ECG (gating prospectivo/retrospectivo), escore de cálcio Agatston e pós-processamento multiplanar.',
    durationMinutes: 58,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    isCompleted: false,
    currentPlaybackPercent: 42,
    markers: [
      { timeSeconds: 200, label: 'Aquisição com Batimento Controlado (<65 bpm)' },
      { timeSeconds: 850, label: 'Reconstrução Curva das Artérias Coronárias' },
      { timeSeconds: 1458, label: 'Volume Rendering (VR) e Detecção de Estenoses' },
      { timeSeconds: 2600, label: 'Exportação e Arquivamento de Exames de TC' }
    ],
    ctWindowType: 'brain'
  }
];

export const initialTasks: TaskPendency[] = [
  {
    id: 'task_01',
    courseId: 'course_tc_701',
    courseTitle: 'Tomografia Computadorizada Avançada',
    title: 'Trabalho Prático: TC de Tórax em Alta Resolução (HRCT)',
    description: 'Análise de opacidades em vidro fosco, consolidações e espessamento septal interlobular em paciente pós-infeccioso.',
    type: 'relatorio',
    deadlineDate: '28/02/2026',
    daysRemaining: 3,
    format: 'Relatório em PDF + Análise de Cortes',
    status: 'pending'
  },
  {
    id: 'task_02',
    courseId: 'course_rm_802',
    courseTitle: 'Ressonância Magnética & Neuroimagem',
    title: 'Apresentação Oral: Vetores e Gradientes em Imagens por Difusão (DWI)',
    description: 'Seminário em grupo de 15 minutos com estudo de caso de acidente vascular encefálico isquêmico hiperagudo.',
    type: 'slides',
    deadlineDate: '04/03/2026',
    daysRemaining: 7,
    format: 'Slides PPTX / PDF',
    status: 'pending'
  },
  {
    id: 'task_03',
    courseId: 'course_rx_304',
    courseTitle: 'Radiologia Digital e Posicionamento',
    title: 'Relatório Prático: Análise de Dosimetria e Ruído SNR em Detectores DR',
    description: 'Processamento de matrizes de imagens radiológicas brutas e cálculo da relação sinal-ruído (SNR) e contraste-ruído (CNR).',
    type: 'relatorio',
    deadlineDate: '09/03/2026',
    daysRemaining: 12,
    format: 'Jupyter Notebook / PDF',
    status: 'pending'
  },
  {
    id: 'task_04',
    courseId: 'course_tc_701',
    courseTitle: 'Tomografia Computadorizada Avançada',
    title: 'Checklist de Biossegurança e Cateterização para Injetora de TC',
    description: 'Verificação dos calibres de Jelco 18G/20G, teste de fluxo com soro fisiológico e termo de consentimento livre e esclarecido.',
    type: 'estagio',
    deadlineDate: '15/03/2026',
    daysRemaining: 18,
    format: 'Ficha de Estágio Assinada',
    status: 'pending'
  }
];

export const initialStudentGrades: StudentGradeRecord[] = [
  {
    id: 'rec_01',
    studentId: 'std_01',
    studentName: 'Clara Mendonça',
    studentEmail: 'clara.m@radbio.edu.br',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    enrollmentId: 'BIO-88201',
    attendance: 96,
    gradeN1: 8.0,
    gradeN2: 8.5,
    gradePractice: 9.0,
    calculatedAverage: 8.5,
    feedback: 'Excelente domínio em reconstruções curvas de angiotomografia e precisão no cálculo de Hounsfield Units.',
    status: 'approved'
  },
  {
    id: 'rec_02',
    studentId: 'std_02',
    studentName: 'Lucas Vane',
    studentEmail: 'lucas.v@radbio.edu.br',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    enrollmentId: 'BIO-88204',
    attendance: 74,
    gradeN1: 5.0,
    gradeN2: 5.5,
    gradePractice: 6.0,
    calculatedAverage: 5.5,
    feedback: 'Dificuldade na identificação de artefatos de endurecimento de feixe metálico em quadril e dosimetria.',
    status: 'risk'
  },
  {
    id: 'rec_03',
    studentId: 'std_03',
    studentName: 'Beatriz Lima',
    studentEmail: 'beatriz.l@radbio.edu.br',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    enrollmentId: 'BIO-88219',
    attendance: 92,
    gradeN1: 7.5,
    gradeN2: 7.8,
    gradePractice: 8.0,
    calculatedAverage: 7.8,
    feedback: 'Boa execução dos protocolos de abdômen total com três fases contrastadas e tempo de delay correto.',
    status: 'approved'
  },
  {
    id: 'rec_04',
    studentId: 'std_04',
    studentName: 'Gabriel Sato',
    studentEmail: 'gabriel.s@radbio.edu.br',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    enrollmentId: 'BIO-88222',
    attendance: 100,
    gradeN1: 9.5,
    gradeN2: 9.8,
    gradePractice: 10.0,
    calculatedAverage: 9.8,
    feedback: 'Desempenho de excelência internacional. Protocolo de perfusão cerebral em TC realizado de forma impecável.',
    status: 'approved'
  },
  {
    id: 'rec_05',
    studentId: 'std_05',
    studentName: 'Sofia Alencar',
    studentEmail: 'sofia.a@radbio.edu.br',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    enrollmentId: 'BIO-88235',
    attendance: 78,
    gradeN1: 5.8,
    gradeN2: 5.9,
    gradePractice: 6.0,
    calculatedAverage: 5.9,
    feedback: 'Abaixo da média na prova teórica sobre efeito Compton e atenuação fotoelétrica. Monitoria recomendada.',
    status: 'risk'
  }
];

export const initialRecentGrades: RecentGradeItem[] = [
  {
    id: 'rg_01',
    title: 'Relatório #04: Reconstrução MPR e Angiotomografia',
    course: 'Tomografia Computadorizada Avançada',
    instructor: 'Prof. Dr. Aris Thorne',
    grade: 9.8,
    statusText: 'Aprovado A+',
    date: 'Hoje'
  },
  {
    id: 'rg_02',
    title: 'Artigo Crítico: Ressonância com Difusão em Neuroimagem',
    course: 'Ressonância Magnética Estrutural',
    instructor: 'Prof. Dr. Carlos Vane',
    grade: 9.0,
    statusText: 'Aprovado A',
    date: 'Ontem'
  },
  {
    id: 'rg_03',
    title: 'Auditoria de Dosimetria e Controle de Qualidade DR',
    course: 'Radiologia Digital e Posicionamento',
    instructor: 'Dra. Sofia Albarracín',
    grade: 8.2,
    statusText: 'Aprovado B+',
    date: 'Há 3 dias'
  }
];

export const initialCertificates: Certificate[] = [
  {
    id: 'cert_rad_01',
    code: 'RADBIO-CERT-2025-9941-TC',
    studentName: 'Lucas Mendonça',
    studentDocument: 'CPF 049.882.109-44 • Matrícula 2023-BIO-8841',
    courseName: 'Programa Avançado de Tomografia Computadorizada & Reconstruções 3D',
    workloadHours: 180,
    completionDate: '22 de Setembro de 2026',
    instructorName: 'Prof. Dr. Aris Thorne',
    instructorRole: 'Coordenador Acadêmico & Especialista CBR Titular',
    finalScore: 9.4,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    qrValidationUrl: 'https://radbio.edu.br/validar/RADBIO-CERT-2025-9941-TC'
  }
];

export const initialEmailNotifications: EmailNotification[] = [
  {
    id: 'notif_01',
    recipientEmail: 'lucas.mendonca@radbio.edu.br',
    subject: '[RadBio] Nova Nota Publicada: Reconstrução MPR e Angiotomografia (Nota: 9.8)',
    body: 'Prezado Lucas, a nota do seu relatório prático sobre Angiotomografia Coronariana foi publicada pelo Prof. Dr. Aris Thorne. O parecer já se encontra disponível no seu boletim.',
    type: 'grade_published',
    timestamp: 'Hoje às 14:32',
    isRead: false,
    status: 'delivered'
  },
  {
    id: 'notif_02',
    recipientEmail: 'lucas.mendonca@radbio.edu.br',
    subject: '[Alerta de Prazo] Submissão de Trabalho de TC de Tórax encerra em 3 dias',
    body: 'Lembrete automático: A data limite para entrega do trabalho prático de tomografia computadorizada de alta resolução é 28/Fev às 23h59.',
    type: 'deadline_warning',
    timestamp: 'Hoje às 09:15',
    isRead: false,
    status: 'delivered'
  },
  {
    id: 'notif_03',
    recipientEmail: 'lucas.mendonca@radbio.edu.br',
    subject: '[Certificado Pronto] Seu Diploma de Radioproteção Hospitalar está disponível para download',
    body: 'Parabéns! Você concluiu com louvor o módulo de Radioproteção com média 9.6. Seu documento assinado digitalmente já pode ser baixado em PDF.',
    type: 'certificate_issued',
    timestamp: 'Ontem às 18:40',
    isRead: true,
    status: 'delivered'
  }
];

export const initialPaymentPlans: PaymentPlan[] = [
  {
    id: 'plan_tc_starter',
    courseId: 'course_tc_701',
    title: 'Especialização em Tomografia Multislice',
    price: 489.00,
    installments: 12,
    features: [
      'Acesso completo aos 8 módulos gravados em 4K',
      'Simulador interativo de janelas Hounsfield (HU)',
      'Casos práticos em ambiente virtual de aprendizagem',
      'Certificado de conclusão com registro de 180 horas',
      'Aulas ao vivo semanais com Dr. Aris Thorne'
    ]
  },
  {
    id: 'plan_master_vip',
    courseId: 'all',
    title: 'Passaporte Radiologia & Neuroimagem Integral',
    price: 980.00,
    installments: 12,
    isPopular: true,
    features: [
      'Acesso a TODOS os cursos (TC, RM, Raio-X Digital e Radioproteção)',
      'Emissão ilimitada de diplomas e certificados em PDF assinado',
      'Suporte prioritário na bancada do simulador de TC',
      'Mentoria individual de elaboração de relatórios técnicos',
      'Liberação instantânea com confirmação de pagamento Pix/Cartão'
    ]
  }
];

export const defaultSupabaseConfig: SupabaseConfig = {
  url: 'https://radbio-tomography-db.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.radbio-academic-token-key-2026',
  isConnected: true,
  lastSync: 'Sincronizado há 2 minutos'
};
