import { CursoLivre } from '../types';

export const initialCursosLivres: CursoLivre[] = [
  {
    id: 'cl_tc_activion_40h',
    code: 'CL-TC-4001',
    title: 'Tomografia Computadorizada Clínica & Operação do Activion 16',
    subtitle: 'Formação Completa em Aquisições Helicoidais, Janelamento HU e Casos Clínicos',
    category: 'Tomografia Computadorizada',
    workloadHours: 40,
    price: 149.00,
    originalPrice: 299.00,
    installments: 12,
    rating: 4.95,
    reviewCount: 342,
    enrolledStudentsCount: 1280,
    instructor: 'Prof. Dr. Marcus Vinicius',
    instructorTitle: 'Especialista em Tomografia Computadorizada CBR & Físico Médico',
    instructorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    description: 'Curso livre de 40 horas voltado para técnicos, tecnólogos e biomédicos que buscam domínio prático da operação do tomógrafo multislice Canon Activion 16. O aluno aprenderá parâmetros físicos (kVp, mA, Pitch, Espessura), reconstrução em Hounsfield Units, varredura de crânio, tórax, abdome e manejo de emergências no console virtual.',
    targetAudience: 'Estudantes e profissionais de Radiologia, Biomedicina, Medicina e Enfermagem que atuam ou pretendem atuar em Centros de Diagnóstico por Imagem e Tomografia Computadorizada.',
    objectives: [
      'Dominar os princípios físicos da formação de imagem tomográfica multislice (16 canais)',
      'Configurar parâmetros de aquisição no console Canon Activion 16 (Scout, FOV, Pitch, AIDR 3D)',
      'Identificar anatomia seccional normal e patológica em crânio, tórax e abdome total',
      'Realizar janelamentos diagnósticos (WW e WL) de parênquima cerebral, osso, pulmão e mediastino',
      'Interpretar densitometria por Hounsfield Units (HU) em hematomas, cistos, calcificações e ar'
    ],
    legalCompliance: 'Curso Livre de Capacitação Profissional regulamentado pela Lei nº 9.394/1996 (LDB) Art. 42 e Decreto Presidencial nº 5.154/2004. Certificado de 40 horas válido em todo o Brasil para horas complementares (ACO), progressão de carreira e prova de títulos.',
    hasActivionSimulator: true,
    hasRealDicomCases: true,
    featured: true,
    isEnrolled: true, // Initially active for demonstration
    progressPercent: 45,
    modules: [
      {
        id: 'mod_tc_01',
        moduleNumber: 1,
        title: 'Módulo 1: Física da Tomografia Multislice & Hardware Canon Activion',
        workloadHours: 10,
        description: 'Tubo de raios-X Megacool de 4.0 MHU, gerador de alta frequência, colimação pré e pós-paciente, detectores de estado sólido cerâmicos e geometria de rotação de 0.5s.',
        topics: [
          'Geração de raios-X em tomógrafos de 16 canais',
          'Colimação, Pitch e velocidade de avanço da mesa',
          'Efeito Heel e filtração bowtie (filtro em gravata)',
          'Matriz de aquisição 512x512, voxel anisotrópico vs isotrópico',
          'Algoritmos de reconstrução: FBP (Filtered Back Projection) e AIDR 3D'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Configuração de Hardware & Calibração do Activion 16',
        hasDicomViewer: false
      },
      {
        id: 'mod_tc_02',
        moduleNumber: 2,
        title: 'Módulo 2: Protocolo de Crânio & Urgência Neurológica no Console Virtual',
        workloadHours: 10,
        description: 'Posicionamento da linha órbito-meatal (OM), scout digital 250mm, janelas de crânio (+35/+80 HU), osso (+400/+2500 HU) e hematoma subdural hiperdenso (+78 HU).',
        topics: [
          'Linha infra-órbito-meatal e inclinação do gantry (Gantry Tilt)',
          'Aquisição axial vs helicoidal em crânio de urgência',
          'Janelamento para detecção precoce de AVC isquêmico (Janela de AVC)',
          'Diferenciação de sangue hiperdenso, edema hipodenso e calcificações fisiológicas',
          'Prática no simulador: Varredura de 24 cortes axiais de crânio com sonda de HU'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Protocolo de Crânio Urgência (0.7 mm)',
        hasDicomViewer: true
      },
      {
        id: 'mod_tc_03',
        moduleNumber: 3,
        title: 'Módulo 3: TC de Tórax de Alta Resolução (HRCT) & Abdome Total',
        workloadHours: 10,
        description: 'Avaliação de parênquima pulmonar com espessura fina (1.0 mm), padrão de vidro fosco, consolidações e janelamento de partes moles com contraste iodado.',
        topics: [
          'Protocolo HRCT inspiratório e expiratório',
          'Janela pulmonar (WW 1500 / WL -600 HU) e mediastinal (WW 350 / WL 40 HU)',
          'Protocolo de abdome total: fases pré-contraste, arterial, portal e de equilíbrio',
          'Prevenção de reações adversas e extravasamento de contraste iodado',
          'Estudo de nódulos pulmonares e bronquiectasias no viewer DICOM'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'HRCT Pulmonar & Abdome Bifásico',
        hasDicomViewer: true
      },
      {
        id: 'mod_tc_04',
        moduleNumber: 4,
        title: 'Módulo 4: Pós-processamento MPR, 3D VR & Avaliação Final de 40 Horas',
        workloadHours: 10,
        description: 'Reconstruções nos planos coronal e sagital, projeção de intensidade máxima (MIP) para vasculatura e prova prática no simulador Canon Activion 16.',
        topics: [
          'Reconstrução Multiplanar (MPR) oblíqua e ortogonal',
          'Curved MPR para avaliação de estruturas tubulares e cólon',
          '3D Volume Rendering (VR) com opacidade e iluminação virtual',
          'Exportação de arquivos padrão DICOM 3.0 para PACS e laudos',
          'Avaliação teórica e prova de simulação prática para emissão do certificado de 40h'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Estação de Trabalho MPR / 3D VR & Prova de Certificação',
        hasDicomViewer: true
      }
    ]
  },
  {
    id: 'cl_tc_neuro_trauma_40h',
    code: 'CL-TC-4002',
    title: 'Tomografia em Urgência Neurológica & Politrauma',
    subtitle: 'Protocolo AVC Hiperagudo, Escala ASPECTS, TCE e Fraturas Faciais',
    category: 'Urgência & Trauma',
    workloadHours: 40,
    price: 189.00,
    originalPrice: 349.00,
    installments: 12,
    rating: 4.98,
    reviewCount: 218,
    enrolledStudentsCount: 840,
    instructor: 'Prof. Dr. Aris Thorne',
    instructorTitle: 'Médico Radiologista & Especialista CBR Titular',
    instructorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    description: 'Capacitação prática intensiva de 40 horas focada na atuação em salas vermelhas e prontos-socorros de trauma. Aborda aquisições ultrarrápidas de crânio sem contraste em suspeitas de AVC, janelamento fino para sangue hiperagudo, politrauma toracoabdominal de corpo inteiro (Pan-scan) e algoritmos de baixa dosimetria para pacientes críticos.',
    targetAudience: 'Profissionais e acadêmicos que atuam ou pretendem atuar em plantões hospitalares de emergência, SAMU e centros de trauma nível 1.',
    objectives: [
      'Executar o protocolo porta-tomografia em tempo inferior a 15 minutos em suspeita de AVC',
      'Classificar lesões isquêmicas agudas utilizando a pontuação tomográfica ASPECTS (0 a 10)',
      'Diferenciar hematoma epidural lenticular de hematoma subdural em crescente com sonda de HU',
      'Configurar o protocolo Pan-Scan (Crânio, Coluna Cervical, Tórax, Abdome e Pelve) em politrauma',
      'Realizar reconstruções 3D VR de esqueletos faciais para planejamento cirúrgico bucomaxilofacial'
    ],
    legalCompliance: 'Curso Livre de Capacitação Profissional regulamentado pela Lei nº 9.394/1996 e Decreto nº 5.154/2004. Carga horária de 40 horas certificadas para horas de estágio, extensão universitária e concursos.',
    hasActivionSimulator: true,
    hasRealDicomCases: true,
    featured: true,
    isEnrolled: false,
    modules: [
      {
        id: 'mod_neuro_01',
        moduleNumber: 1,
        title: 'Módulo 1: Protocolo de AVC Hiperagudo & Janela de Densidade Fina',
        workloadHours: 10,
        description: 'Algoritmo de aquisição em menos de 10 segundos, perda da diferenciação cortiço-subcortical, sinal da artéria cerebral média hiperdensa e cálculo ASPECTS.',
        topics: [
          'Tempo porta-agulha e o papel crítico do operador de TC',
          'Janelamento dedicado para AVC (WW 40 / WL 40 HU)',
          'Apagamento dos sulcos corticais e hipoatenuação lenticular',
          'Diferenciação com sangramento hemorrágico e desvio de linha média',
          'Simulação de caso no Activion 16: Análise de AVC isquêmico em tempo real'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'AVC Isquêmico Protocolo Rápido 16 Canais'
      },
      {
        id: 'mod_neuro_02',
        moduleNumber: 2,
        title: 'Módulo 2: Traumatismo Cranioencefálico (TCE) & Fraturas Ósseas',
        workloadHours: 10,
        description: 'Hematomas epidurais, subdurais, hemorragia subaracnóidea traumática, contusões cerebrais e fraturas do rochedo e base do crânio.',
        topics: [
          'Fisiopatologia dos hematomas intracranianos e seus valores de atenuação HU',
          'Janela óssea expandida (WW 3000 / WL 500 HU) para ossos temporais',
          'Hérnias cerebrais uncal e subfalcina na tomografia',
          'Fraturas do maciço facial: Le Fort I, II, III e complexo zigomático-maxilar',
          'Análise de 24 cortes axiais de TCE grave com sonda de atenuação tecidual'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'TC de Crânio em Politrauma & Fraturas Faciais'
      },
      {
        id: 'mod_neuro_03',
        moduleNumber: 3,
        title: 'Módulo 3: Pan-Scan em Politrauma Toracoabdominal',
        workloadHours: 10,
        description: 'Aquisição volumétrica contínua da base do crânio à sínfise púbica. Detecção de pneumotórax hipertensivo, lesão de aorta e lacerações de órgãos sólidos.',
        topics: [
          'Filosofia Pan-Scan: quando e como indicar no politraumatizado',
          'Injeção automatizada de contraste iodado em duplo bólus',
          'Graduação de trauma esplênico e hepático (escala AAST)',
          'Fraturas pélvicas instáveis e hematomas retroperitoneais',
          'Simulação de varredura com protocolo de alta velocidade no Activion 16'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Pan-Scan Politrauma Corporal Completo'
      },
      {
        id: 'mod_neuro_04',
        moduleNumber: 4,
        title: 'Módulo 4: Reconstruções 3D VR em Trauma & Simulado de Certificação',
        workloadHours: 10,
        description: 'Segmentação rápida de fragmentos ósseos no visualizador DICOM e avaliação prática de habilidades operacionais em 40 horas.',
        topics: [
          'Presets de 3D Volume Rendering para ortopedia e neurocirurgia',
          'MIP de alta definição para artérias carótidas e vertebrais no trauma cervical',
          'Relatório técnico de achados urgentes e comunicação com equipe cirúrgica',
          'Prova prática cronometrada no simulador Canon Activion 16',
          'Emissão e validação do certificado oficial de 40h com selo de urgência'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Segmentação 3D Cirúrgica de Fraturas Múltiplas'
      }
    ]
  },
  {
    id: 'cl_angio_tc_40h',
    code: 'CL-TC-4003',
    title: 'Angiotomografia & Meios de Contraste Iodado com Bolus Tracking',
    subtitle: 'Sincronização com Injetora, Test Bolus, TEP e Angio de Aorta',
    category: 'Angiotomografia',
    workloadHours: 40,
    price: 197.00,
    originalPrice: 380.00,
    installments: 12,
    rating: 4.97,
    reviewCount: 189,
    enrolledStudentsCount: 620,
    instructor: 'Dra. Sofia Albarracín',
    instructorTitle: 'Doutora em Engenharia Biomédica e Especialista em Imagem Vascular',
    instructorAvatar: 'https://images.unsplash.com/photo-1594824813581-2292f7b88937?auto=format&fit=crop&w=250&q=80',
    coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    description: 'Curso livre de 40 horas centrado nas técnicas de injeção dinâmica de contraste iodado não iônico, manuseio de injetoras de bomba dupla, posicionamento de ROI para monitoramento automático de atenuação (SureStart / Bolus Tracking) e diagnósticos de tromboembolismo pulmonar (TEP) e dissecção de aorta.',
    targetAudience: 'Tecnólogos, biomédicos e médicos que desejam se especializar em hemodinâmica diagnóstica, angiotomografia cardiovascular e neurovascular.',
    objectives: [
      'Configurar injetora de contraste de cabeça dupla com fluxo de 4.0 a 5.5 mL/s e flush de soro fisiológico',
      'Dominar o posicionamento de ROI de disparo (Bolus Tracking) no tronco da artéria pulmonar e aorta ascendente',
      'Otimizar o tempo de atraso (Scan Delay) para evitar contaminação venosa precoce',
      'Realizar reconstruções MIP e angiográficas 3D no visualizador DICOM médico',
      'Aplicar medidas preventivas contra Nefropatia Induzida por Contraste (NIC) e extravasamento'
    ],
    legalCompliance: 'Curso Livre de Formação Continuada (Lei nº 9.394/96 Art. 42 e Decreto Federal nº 5.154/04). 40 horas computadas para certificação profissional e prova de títulos.',
    hasActivionSimulator: true,
    hasRealDicomCases: true,
    featured: false,
    isEnrolled: false,
    modules: [
      {
        id: 'mod_angio_01',
        moduleNumber: 1,
        title: 'Módulo 1: Farmacologia dos Contrastes Iodados & Injetoras Automáticas',
        workloadHours: 10,
        description: 'Osmolaridade, viscosidade, aquecimento do contraste a 37°C, acessos venosos periféricos (gelco 18G/20G) e teste de permeabilidade com salina.',
        topics: [
          'Tipos de contrastes iodados: monoméricos não iônicos vs iso-osmolares',
          'Cálculo de volume baseado no peso corporal e duração da varredura helicoidal',
          'Manejo de reações alérgicas agudas leves, moderadas e graves (Kit de Parada)',
          'Efeito bólus: importância do flush de salina para lavar a veia subclávia e cava superior',
          'Simulação no console: Ajuste do fluxo e atraso da injeção'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Parametrização de Injetora & Cálculo de Fluxo Vascular'
      },
      {
        id: 'mod_angio_02',
        moduleNumber: 2,
        title: 'Módulo 2: Sincronização por Bolus Tracking & Angio-TC de Tórax (TEP)',
        workloadHours: 10,
        description: 'Monitoramento dinâmico em tempo real da chegada do bólus contrastado com disparo automático quando o tronco da artéria pulmonar atinge 150 HU.',
        topics: [
          'Diferença entre Test Bolus (curva tempo-densidade) e Bolus Tracking automático',
          'Angio-TC de tórax para exclusão de TEP: janela diagnóstica vascular',
          'Artefato de fluxo e técnica de apneia respiratória inspiratória suave',
          'Valores normais de atenuação do bólus vascular (250 a 350 HU)',
          'Estudo de caso no simulador: Varredura de TEP com falha de enchimento endoluminal'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Angio-TC de Tórax com Bolus Tracking (16 Cortes)'
      },
      {
        id: 'mod_angio_03',
        moduleNumber: 3,
        title: 'Módulo 3: Angiotomografia de Aorta Torácica & Abdominal',
        workloadHours: 10,
        description: 'Diagnóstico de Síndrome Aórtica Aguda, dissecção Stanford A e B, aneurisma roto e planejamento de endopróteses vasculares.',
        topics: [
          'Protocolo de aorta completa (da crossa até artérias femorais comuns)',
          'Fase sem contraste prévia para detecção de hematoma intramural hiperdenso',
          'Gatilho de disparo na aorta descendente',
          'Medições de diâmetro vascular, colo de aneurisma e tortuosidade arterial',
          'Prática com DICOM real: Medição de lúmen verdadeiro vs falso lúmen'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Angio-TC de Aorta Completa com Reconstrução MPR Curva'
      },
      {
        id: 'mod_angio_04',
        moduleNumber: 4,
        title: 'Módulo 4: Reconstruções Vasculares MIP, 3D VR & Prova de Conclusão',
        workloadHours: 10,
        description: 'Criação de angiografias rotacionais 3D, remoção de estruturas ósseas (Bone Removal) e exame final para titulação dos 40h de curso.',
        topics: [
          'Técnicas de MIP fino (Thin MIP) vs MIP espesso (Thick MIP)',
          'Subtração óssea digital manual e automática',
          'Exportação de filmes e vídeos 3D para cirurgiões vasculares e hemodinâmica',
          'Auditoria de dose em protocolos de angiotomografia',
          'Prova teórica e prática com certificação oficial de 40 horas'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Estação Angiográfica 3D & Certificação Final'
      }
    ]
  },
  {
    id: 'cl_radioprotecao_40h',
    code: 'CL-TC-4004',
    title: 'Radioproteção, Dosimetria & Normas Sanitárias RDC 330 em TC',
    subtitle: 'Princípio ALARA, CTDIvol, DLP, AIDR 3D e Controle de Qualidade',
    category: 'Radioproteção',
    workloadHours: 40,
    price: 129.00,
    originalPrice: 249.00,
    installments: 12,
    rating: 4.92,
    reviewCount: 154,
    enrolledStudentsCount: 510,
    instructor: 'Prof. Cláudio Silveira',
    instructorTitle: 'Físico Médico Especialista em Radiodiagnóstico e Normas CNEN',
    instructorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=250&q=80',
    coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    description: 'Curso livre de 40 horas indispensável para quem opera equipamentos emissores de radiação ionizante. Fornece conhecimento aprofundado das exigências da RDC 330/2019 da ANVISA, normas CNEN-NN-3.01, cálculo de dose absorvida e efetiva em exames pediátricos e adultos, e modulação de miliamperagem para redução de dose sem perda diagnóstica.',
    targetAudience: 'Operadores de tomografia, supervisores de radioproteção, biomédicos, tecnólogos, engenheiros clínicos e gestores de clínicas e hospitais.',
    objectives: [
      'Calcular e interpretar os índices dosimétricos exibidos no console: CTDIw, CTDIvol (mGy) e DLP (mGy.cm)',
      'Estimar a Dose Efetiva (mSv) utilizando os fatores de conversão k por região anatômica',
      'Configurar os algoritmos de reconstrução iterativa adaptativa (AIDR 3D Canon) para corte de até 75% da dose',
      'Aplicar o Programa de Garantia da Qualidade (PGQ) com testes periódicos de exatidão de números de CT e ruído',
      'Implementar o Programa de Proteção Radiológica conforme a Resolução RDC 330 da ANVISA'
    ],
    legalCompliance: 'Curso Livre de Aperfeiçoamento Profissional nos termos da Lei nº 9.394/96 e Decreto nº 5.154/04. Certificado de 40 horas válido nacionalmente para concursos, evolução funcional e auditorias hospitalares.',
    hasActivionSimulator: true,
    hasRealDicomCases: false,
    featured: false,
    isEnrolled: false,
    modules: [
      {
        id: 'mod_rad_01',
        moduleNumber: 1,
        title: 'Módulo 1: Grandezas Radiológicas & Efeitos Biológicos da Radiação em TC',
        workloadHours: 10,
        description: 'Dose absorvida (Gy), dose equivalente (Sv), efeitos estocásticos vs determinísticos e radiossensibilidade tecidual (tireoide, gônadas e cristalino).',
        topics: [
          'Mecanismos de interação da radiação com a matéria biológica',
          'Risco estocástico de carcinogênese induzida por radiação',
          'Histórico e evolução das doses em tomografia computadorizada multislice',
          'Justificativa clínica e níveis de referência para diagnóstico (NRDs)',
          'Simulação: Análise de relatórios dosimétricos gerados pelo Activion 16'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Auditoria de Índices Dosimétricos no Console'
      },
      {
        id: 'mod_rad_02',
        moduleNumber: 2,
        title: 'Módulo 2: Grandezas Específicas de TC: CTDI, DLP & Dose Efetiva',
        workloadHours: 10,
        description: 'Cálculo de CTDI com fantom de polimetilmetacrilato (PMMA) de 16cm e 32cm com câmara de ionização tipo lápis de 100mm.',
        topics: [
          'Conceito e medição física de CTDI100, CTDIw e CTDIvol',
          'Produto Dose-Comprimento (DLP) e sua relação com a extensão escaneada',
          'Fatores k de conversão ICRP para cálculo de dose efetiva em adultos e crianças',
          'Protocolos pediátricos dedicados e o movimento mundial Image Gently',
          'Exercícios práticos de cálculo de dose por paciente'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Calibração e Teste de PMMA Virtual'
      },
      {
        id: 'mod_rad_03',
        moduleNumber: 3,
        title: 'Módulo 3: Tecnologias de Otimização de Dose: AIDR 3D & Modulação mA',
        workloadHours: 10,
        description: 'Funcionamento de sistemas de modulação automática de corrente do tubo (SureExposure / Smart mA) nas três dimensões (x, y, z).',
        topics: [
          'Reconstrução filtrada clássica vs reconstrução iterativa estatística (AIDR 3D)',
          'Como reduzir o ruído quântico em exames com baixa dose de radiação',
          'Ajuste do Noise Index e desvio-padrão aceitável para cada protocolo',
          'Impacto da escolha do Pitch na dose e tempo de varredura',
          'Prática no console: Comparação de protocolo convencional vs protocolo AIDR 3D'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Simulação AIDR 3D Canon com Redução de Ruído Quântico'
      },
      {
        id: 'mod_rad_04',
        moduleNumber: 4,
        title: 'Módulo 4: Legislação RDC 330/2019 ANVISA & Gestão de Qualidade',
        workloadHours: 10,
        description: 'Documentação obrigatória, memorial descritivo de proteção radiológica, blindagens de barita e auditoria para certificação de 40 horas.',
        topics: [
          'Diretrizes da Instrução Normativa IN nº 93 da ANVISA',
          'Testes diários, semanais, mensais e anuais de controle de qualidade (CQ)',
          'Fantons de teste: uniformidade, espessura de corte e resolução de alto contraste',
          'Uso e guarda correta de dosímetros individuais termoluminescentes (TLD)',
          'Prova teórica final e emissão do certificado com registro oficial de 40 horas'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Simulação de Auditoria Sanitária & Teste de CQ'
      }
    ]
  },
  {
    id: 'cl_reconstrucao_dicom_40h',
    code: 'CL-TC-4005',
    title: 'Reconstruções 3D Avançadas, MPR, MIP e Estações DICOM Médicas',
    subtitle: 'Manipulação de Matrizes Volumétricas, Segmentação e Exportação 3D',
    category: 'Reconstrução 3D & DICOM',
    workloadHours: 40,
    price: 169.00,
    originalPrice: 320.00,
    installments: 12,
    rating: 4.96,
    reviewCount: 167,
    enrolledStudentsCount: 480,
    instructor: 'Dra. Helena Vasconcelos',
    instructorTitle: 'Doutora em Radiologia Computacional & Diretora Acadêmica',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Curso livre de 40 horas direcionado ao pós-processamento digital de ponta em imagens médicas. O estudante aprenderá a estrutura do padrão DICOM 3.0, manipulação de arquivos .dcm de 16 bits brutos, interpolação espacial de voxels, reconstruções MPR curvas para colunas e arcadas dentárias, e projeção tridimensional colorida com volume rendering para pré-operatório.',
    targetAudience: 'Estudantes e graduados em Radiologia, Biomedicina, Medicina e Engenharia Biomédica que desejam dominar estações de trabalho e softwares como RadiAnt, Horos, Weasis e OsiriX.',
    objectives: [
      'Compreender os metadados do cabeçalho DICOM (Tags 0028,0010 Rows, 0028,1052 Rescale Intercept/Slope)',
      'Executar reconstruções MPR de alta fidelidade em planos coronal, sagital e oblíquo curvilíneo',
      'Gerar projeções de intensidade máxima (MIP) e mínima (MinIP) para vias aéreas e enfisema pulmonar',
      'Aplicar máscaras de segmentação tecidual e exclusão de leito de mesa e artefatos de metal',
      'Exportar exames compatíveis com impressoras 3D cirúrgicas e visualizadores PACS web'
    ],
    legalCompliance: 'Curso Livre de Formação Profissional regido pela Lei nº 9.394/96 Art. 42 e Decreto nº 5.154/04. Certificado de 40 horas válido para créditos acadêmicos e titulação.',
    hasActivionSimulator: true,
    hasRealDicomCases: true,
    featured: false,
    isEnrolled: false,
    modules: [
      {
        id: 'mod_dicom_01',
        moduleNumber: 1,
        title: 'Módulo 1: Padrão DICOM 3.0 & Arquitetura de Imagens Médicas',
        workloadHours: 10,
        description: 'Estrutura de dados DICOM, Service-Object Pairs (SOP), transferência de imagens por PACS/DICOM Query-Retrieve e cálculos matemáticos de HU.',
        topics: [
          'História e normas internacionais do comitê DICOM (NEMA/ACR)',
          'Matriz de pixels, profundidade de bits (12 a 16 bits) e níveis de cinza (4096 tons)',
          'Rescale Slope e Intercept: conversão matemática de valor bruto de pixel para escala Hounsfield',
          'Segurança e anonimização de dados de pacientes (LGPD em saúde)',
          'Prática: Análise do cabeçalho DICOM de arquivos de teste no navegador'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Inspeção de Tags DICOM & Anonimização Digital'
      },
      {
        id: 'mod_dicom_02',
        moduleNumber: 2,
        title: 'Módulo 2: Reconstrução Multiplanar (MPR) Ortogonal & Curvilínea',
        workloadHours: 10,
        description: 'Navegação volumétrica tridimensional sincrônica entre planos axial, sagital e coronal com espessura variável (Slab Thickness).',
        topics: [
          'Interpolação trilinear e preservação de resolução espacial em voxels isotrópicos',
          'MPR curvo para estudo de canal vertebral e raízes nervosas',
          'Reconstrução para implantes odontológicos (Dental CT / Panorâmica tomográfica)',
          'Eliminação de artefatos de endurecimento de feixe (Beam Hardening)',
          'Simulação de MPR em cortes de 24 fatias com medição milimétrica'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Estação de Trabalho MPR Curvilínea'
      },
      {
        id: 'mod_dicom_03',
        moduleNumber: 3,
        title: 'Módulo 3: Projeções MIP, MinIP & Média de Atenuação (Average IP)',
        workloadHours: 10,
        description: 'Técnicas de raio projetor para realçar estruturas de alto contraste (vasos e contraste iodado) ou baixo contraste (vias aéreas e cistos).',
        topics: [
          'MIP para rastreamento de nódulos pulmonares menores que 5mm',
          'MinIP para diagnóstico de bronquiolite obliterante e enfisema centrolobular',
          'Ajuste fino de espessura de corte no modo MIP para evitar sobreposição óssea',
          'Combinação com janelas Hounsfield customizadas',
          'Prática com casos clínicos reais pulmonares e vasculares'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'MIP Vascular & MinIP das Vias Aéreas'
      },
      {
        id: 'mod_dicom_04',
        moduleNumber: 4,
        title: 'Módulo 4: 3D Volume Rendering, Segmentação & Projeto Final de 40h',
        workloadHours: 10,
        description: 'Mapas de transferência de cor (Color Look-Up Tables), sombreamento fotorealista (Shading) e submissão do trabalho para certificação de 40 horas.',
        topics: [
          'Volume Rendering vs Surface Shading (SSD)',
          'Criação de paletas de cor para músculo, contraste vascular e osso denso',
          'Ferramenta de bisturi virtual (Cut Tool) para limpeza de campo anatômico',
          'Geração de arquivos STL para impressão 3D médica pré-cirúrgica',
          'Avaliação final de 40h e emissão do certificado com registro'
        ],
        hasSimulatorPractice: true,
        simulatorProtocolName: 'Renderização Volumétrica 3D & Exportação Cirúrgica'
      }
    ]
  }
];
