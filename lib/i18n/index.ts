export type Language = 'en' | 'es' | 'ar';

export interface TranslationDictionary {
  dir: 'ltr' | 'rtl';
  nav: {
    home: string;
    guide: string;
    explain: string;
    how: string;
    orgs: string;
    trust: string;
  };
  brand: {
    tagline1: string;
    tagline2: string;
    equation: string;
  };
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
    whyTitle: string;
    whySubtitle: string;
    notChatbotTitle: string;
    notChatbotDesc: string;
    licensedTitle: string;
    licensedDesc: string;
    equationTitle: string;
  };
  guide: {
    title: string;
    subtitle: string;
    step: string;
    prev: string;
    next: string;
    submit: string;
    restart: string;
    whyWeAsk: string;
    
    // Form questions
    qState: string;
    qStatePlaceholder: string;
    qNewcomer: string;
    qNewcomerDesc: string;
    qNewcomerTooltip: string;
    qLanguage: string;
    qHousehold: string;
    qHouseholdDesc: string;
    qHouseholdTooltip: string;
    qIncome: string;
    qIncomeDesc: string;
    qIncomeTooltip: string;
    incomeLow: string;
    incomeMid: string;
    incomeHigh: string;
    qEmployer: string;
    qEmployerDesc: string;
    qNeeds: string;
    needLowCost: string;
    needChronic: string;
    needKids: string;
    needDoctor: string;
    qAge: string;
    qAgeDesc: string;

    // Results
    resultsTitle: string;
    deadlineTitle: string;
    subsidyTitle: string;
    plansTitle: string;
    riskTitle: string;
    actionTitle: string;
    sourcesTitle: string;
    disclaimerTitle: string;
    disclaimerText: string;
    costPerMonth: string;
    network: string;
    covers: string;
    excludes: string;
    traceReference: string;
  };
  explain: {
    title: string;
    subtitle: string;
    pasteLabel: string;
    pastePlaceholder: string;
    uploadLabel: string;
    submitButton: string;
    loading: string;
    resultTitle: string;
    alertWarning: string;
    alertWarningText: string;
    summary: string;
    coverage: string;
    exclusions: string;
    deadlines: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    brainTitle: string;
    brainDesc: string;
    explanationTitle: string;
    explanationDesc: string;
    humanTitle: string;
    humanDesc: string;
  };
  orgs: {
    title: string;
    subtitle: string;
    formTitle: string;
    nameLabel: string;
    orgLabel: string;
    emailLabel: string;
    sizeLabel: string;
    messageLabel: string;
    submitButton: string;
    successMessage: string;
  };
  trust: {
    title: string;
    subtitle: string;
    principleTitle: string;
    principleDesc: string;
    dataTitle: string;
    dataDesc: string;
    traceTitle: string;
    traceDesc: string;
    humanTitle: string;
    humanDesc: string;
  };
  escalation: {
    text: string;
    cta: string;
    disclaimer: string;
  };
  footer: {
    disclaimer: string;
    rights: string;
    privacy: string;
    terms: string;
    contact: string;
  };
}

export const DICTIONARIES: Record<Language, TranslationDictionary> = {
  en: {
    dir: 'ltr',
    nav: {
      home: 'Home',
      guide: 'The Guide',
      explain: 'Explain Policy',
      how: 'How it Works',
      orgs: 'For Organizations',
      trust: 'Trust & Governance',
    },
    brand: {
      tagline1: 'A new equation in insurance',
      tagline2: 'Insurance from Newton — momentum on your side.',
      equation: 'Clean Data + Proactive Agents + Human Judgment + Trust Governance = AI-Native Insurance Service',
    },
    landing: {
      heroTitle: 'US Health Insurance, Guided Proactively.',
      heroSubtitle: 'Navigating US healthcare is overwhelming for newcomers. askNewton helps you the moment before you need it, explaining options clearly in your language with clear, plain-language explanations.',
      ctaButton: 'Start Your Guide',
      whyTitle: 'Why askNewton is Different',
      whySubtitle: 'A health insurance guide built on transparency, determinism, and trust.',
      notChatbotTitle: 'Not a Chatbot',
      notChatbotDesc: 'We don\'t wait for you to ask the right questions. We proactively guide you based on your location, deadlines, and profile parameters.',
      licensedTitle: 'Backed by Newton',
      licensedDesc: 'askNewton is part of the Newton Insurance plc family. Our guidance runs on a deterministic engine for consistent, transparent explanations — we inform, we don’t sell or bind insurance.',
      equationTitle: 'The AI-Native Insurance Equation',
    },
    guide: {
      title: 'Your Proactive Insurance Guide',
      subtitle: 'Answer a few simple questions to compute your deadlines, review eligible plans, and flag common pitfalls. No personal identifiers required.',
      step: 'Step',
      prev: 'Previous',
      next: 'Next',
      submit: 'Generate Guide',
      restart: 'Start Over',
      whyWeAsk: 'Why we ask',
      qState: 'US State of Residence',
      qStatePlaceholder: 'Select your state',
      qNewcomer: 'Are you a newcomer to the US healthcare system?',
      qNewcomerDesc: 'New arrivals often qualify for special enrollment timelines.',
      qNewcomerTooltip: 'We ask this to determine if you qualify for a Special Enrollment Period (SEP), which grants you a 60-day window to sign up for coverage outside of the standard period.',
      qLanguage: 'Preferred Explanation Language',
      qHousehold: 'Household Size',
      qHouseholdDesc: 'Number of tax dependents in your household.',
      qHouseholdTooltip: 'Household size directly affects Federal Poverty Level (FPL) thresholds, which determine your eligibility for financial subsidies and Medicaid.',
      qIncome: 'Estimated Annual Income Range',
      qIncomeDesc: 'Rough estimate to calculate tax credit eligibility.',
      qIncomeTooltip: 'We use coarse bands (Low/Mid/High) to check if you fall below standard ACA subsidy brackets, keeping your financial details private.',
      incomeLow: 'Low (Below $30,000 / Individual)',
      incomeMid: 'Moderate ($30,000 - $80,000 / Individual)',
      incomeHigh: 'High (Above $80,000 / Individual)',
      qEmployer: 'Do you currently have employer-provided health insurance?',
      qEmployerDesc: 'Having job-based coverage limits marketplace subsidy eligibility.',
      qNeeds: 'Select any specific healthcare needs:',
      needLowCost: 'Prioritize low monthly premiums',
      needChronic: 'Manage a chronic illness / frequent doctor visits',
      needKids: 'Pediatric care / children coverage',
      needDoctor: 'Keep my existing specific doctors (broad network)',
      qAge: 'Your Age',
      qAgeDesc: 'Insurance companies adjust premiums based on age.',
      resultsTitle: 'Your Deterministic Insurance Profile',
      deadlineTitle: 'Enrollment Deadline Alert',
      subsidyTitle: 'Financial Subsidy Check',
      plansTitle: 'Recommended Plan Options',
      riskTitle: 'The One Risk You Must Avoid',
      actionTitle: 'Your Next Step This Week',
      sourcesTitle: 'Traceability & Sources',
      disclaimerTitle: 'Informational Only',
      disclaimerText: 'This guide is for informational purposes. Plan rankings and costs are illustrative based on seed data. Final plan selection requires review with a licensed advisor.',
      costPerMonth: '/ month (est.)',
      network: 'Network',
      covers: 'What\'s Covered',
      excludes: 'Exclusions (What\'s Not Covered)',
      traceReference: 'Based on rule:',
    },
    explain: {
      title: 'Document & Policy Explainer',
      subtitle: 'Paste an insurance letter, explanation of benefits, or policy document. We will translate the fine print into plain language.',
      pasteLabel: 'Paste document text below:',
      pastePlaceholder: 'Paste coverage details or notices here...',
      uploadLabel: 'Or upload policy document (PDF/Text):',
      submitButton: 'Analyze Document',
      loading: 'Analyzing document structure and translating terms...',
      resultTitle: 'Document Summary & Key Terms',
      alertWarning: 'Important Regulatory Notice',
      alertWarningText: 'This summary is informational. Decisions that alter your coverage must be verified with a licensed advisor.',
      summary: 'Executive Summary',
      coverage: 'Identified Coverage Benefits',
      exclusions: 'Key Limitations & Exclusions',
      deadlines: 'Actionable Deadlines Found',
    },
    howItWorks: {
      title: 'How askNewton Works',
      subtitle: 'A strict separation of calculations and communication ensures regulatory accuracy.',
      brainTitle: '1. The Insurance Brain',
      brainDesc: 'A 100% deterministic TypeScript rules engine computes all calculations, rankings, deadlines, and eligibility flags. No AI hallucinations are possible in calculations.',
      explanationTitle: '2. The Explanation Layer',
      explanationDesc: 'Our AI layer (Claude 3.5 Sonnet) translates the Brain\'s structured output into plain language or another language. It is constrained to only use verified facts.',
      humanTitle: '3. Human Advisor Safeguard',
      humanDesc: 'We require a human licensed advisor in the loop before you make any binding plan choices, submit applications, or file appeals.',
    },
    orgs: {
      title: 'For Organizations',
      subtitle: 'Help your expats, students, and newly arrived employees navigate US healthcare stress-free.',
      formTitle: 'Request a Group Partnership',
      nameLabel: 'Contact Name',
      orgLabel: 'Organization Name',
      emailLabel: 'Work Email Address',
      sizeLabel: 'Expected Annual Newcomers',
      messageLabel: 'Tell us about your organization\'s needs',
      submitButton: 'Submit Interest Form',
      successMessage: 'Thank you. A Newton Insurance corporate specialist will reach out within 1 business day.',
    },
    trust: {
      title: 'Trust, Ethics & Responsible AI',
      subtitle: 'Built on rigorous compliance guidelines to safeguard expatriates and newcomers.',
      principleTitle: 'The t-1 Principle',
      principleDesc: 'We proactively notify you of crucial dates and risks *before* they impact you. We never wait for you to ask the wrong question.',
      dataTitle: 'Data Minimization',
      dataDesc: 'We do not collect or store precise medical histories, immigration numbers, or exact financial figures. We use rough bands.',
      traceTitle: 'Full Traceability',
      traceDesc: 'Every decision and cost estimate includes references back to source databases and federal code regulations.',
      humanTitle: 'No Autonomous Adverse Decisions',
      humanDesc: 'Our AI never denies coverage, rejects claims, or makes binding underwriting choices on its own. All actions are advisory.',
    },
    escalation: {
      text: 'Want to learn more or stay informed?',
      cta: 'Join the Waitlist',
      disclaimer: 'Sign up and we will reach out when new guidance is available.',
    },
    footer: {
      disclaimer: 'askNewton is a proactive insurance-guidance and education service of askNewton, Inc., part of the Newton Insurance plc family. askNewton is not a licensed insurance producer and does not sell, solicit, recommend, or bind insurance. All figures shown are illustrative estimates, not quotes.',
      rights: '© 2026 askNewton, Inc. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Support & Contact',
    },
  },
  es: {
    dir: 'ltr',
    nav: {
      home: 'Inicio',
      guide: 'La Guía',
      explain: 'Explicar Póliza',
      how: 'Cómo Funciona',
      orgs: 'Para Organizaciones',
      trust: 'Confianza y Regulación',
    },
    brand: {
      tagline1: 'Una nueva ecuación en seguros',
      tagline2: 'Seguros de Newton: el impulso de su lado.',
      equation: 'Datos Limpios + Agentes Proactivos + Juicio Humano + Gobernanza de Confianza = Servicio de Seguros Nativo de IA',
    },
    landing: {
      heroTitle: 'Seguro de Salud de EE.UU., Guiado Proactivamente.',
      heroSubtitle: 'Navegar por el sistema de salud estadounidense es abrumador para los recién llegados. askNewton le ayuda justo antes de que lo necesite, explicando las opciones en su idioma con precisión determinista.',
      ctaButton: 'Iniciar la Guía',
      whyTitle: 'Por Qué askNewton es Diferente',
      whySubtitle: 'Una guía de seguros construida sobre la transparencia, el determinismo y la confianza.',
      notChatbotTitle: 'No es un Chatbot',
      notChatbotDesc: 'No esperamos a que haga la pregunta correcta. Le guiamos de manera proactiva según su ubicación, plazos y perfil.',
      licensedTitle: 'Respaldado por Newton',
      licensedDesc: 'askNewton es parte de la familia Newton Insurance plc. Nuestra guía se basa en un motor determinista para explicaciones consistentes y transparentes: informamos, no vendemos ni vinculamos seguros.',
      equationTitle: 'La Ecuación del Seguro Nativo de IA',
    },
    guide: {
      title: 'Su Guía Proactiva de Seguros',
      subtitle: 'Responda unas preguntas sencillas para calcular sus plazos, revisar planes elegibles y alertar sobre riesgos comunes. Sin revelar datos personales.',
      step: 'Paso',
      prev: 'Anterior',
      next: 'Siguiente',
      submit: 'Generar Guía',
      restart: 'Reiniciar',
      whyWeAsk: 'Por qué preguntamos',
      qState: 'Estado de Residencia en EE.UU.',
      qStatePlaceholder: 'Seleccione su estado',
      qNewcomer: '¿Es un recién llegado al sistema de salud de EE.UU.?',
      qNewcomerDesc: 'Los recién llegados a menudo califican para plazos de inscripción especiales.',
      qNewcomerTooltip: 'Preguntamos esto para determinar si califica para un Período Especial de Inscripción (SEP), que le otorga 60 días para registrarse fuera del período anual estándar.',
      qLanguage: 'Idioma de Explicación Preferido',
      qHousehold: 'Tamaño del Hogar',
      qHouseholdDesc: 'Número de dependientes fiscales en su hogar.',
      qHouseholdTooltip: 'El tamaño de su hogar afecta directamente los límites del Nivel Federal de Pobreza (FPL), que determinan su elegibilidad para subsidios.',
      qIncome: 'Rango Estimado de Ingresos Anuales',
      qIncomeDesc: 'Estimación aproximada para calcular subsidios.',
      qIncomeTooltip: 'Utilizamos bandas amplias (Bajo/Medio/Alto) para verificar si califica para subsidios, manteniendo la privacidad de sus detalles financieros.',
      incomeLow: 'Bajo (Menos de $30,000 / Individual)',
      incomeMid: 'Moderado ($30,000 - $80,000 / Individual)',
      incomeHigh: 'Alto (Más de $80,000 / Individual)',
      qEmployer: '¿Tiene actualmente seguro de salud a través de su empleador?',
      qEmployerDesc: 'Tener cobertura laboral limita su elegibilidad para subsidios del mercado público.',
      qNeeds: 'Seleccione necesidades específicas de salud:',
      needLowCost: 'Priorizar primas mensuales bajas',
      needChronic: 'Manejar una enfermedad crónica / visitas médicas frecuentes',
      needKids: 'Cuidado pediátrico / cobertura para niños',
      needDoctor: 'Mantener mis médicos específicos (red amplia)',
      qAge: 'Su Edad',
      qAgeDesc: 'Las compañías de seguros ajustan las primas según la edad.',
      resultsTitle: 'Su Perfil de Seguro Determinista',
      deadlineTitle: 'Alerta de Plazo de Inscripción',
      subsidyTitle: 'Verificación de Subsidio Financiero',
      plansTitle: 'Opciones de Planes Recomendados',
      riskTitle: 'El Único Riesgo que Debe Evitar',
      actionTitle: 'Su Siguiente Paso Esta Semana',
      sourcesTitle: 'Trazabilidad y Fuentes',
      disclaimerTitle: 'Solo Informativo',
      disclaimerText: 'Esta guía es únicamente informativa. Los rangos de planes y costos son ilustrativos basados en datos iniciales. askNewton no es un productor o corredor de seguros con licencia.',
      costPerMonth: '/ mes (est.)',
      network: 'Red',
      covers: 'Qué Cubre',
      excludes: 'Exclusiones (Lo Que No Cubre)',
      traceReference: 'Basado en regla:',
    },
    explain: {
      title: 'Explicador de Documentos y Pólizas',
      subtitle: 'Pegue una carta de seguro, explicación de beneficios o póliza. Traduciremos la letra pequeña a un lenguaje claro.',
      pasteLabel: 'Pegue el texto del documento a continuación:',
      pastePlaceholder: 'Pegue detalles de cobertura o notificaciones aquí...',
      uploadLabel: 'O suba el documento de la póliza (PDF/Texto):',
      submitButton: 'Analizar Documento',
      loading: 'Analizando estructura del documento y traduciendo términos...',
      resultTitle: 'Resumen del Documento y Términos Clave',
      alertWarning: 'Aviso Regulado Importante',
      alertWarningText: 'Este resumen es informativo. askNewton no es un productor de seguros con licencia y no vende ni vincula seguros.',
      summary: 'Resumen Ejecutivo',
      coverage: 'Beneficios de Cobertura Identificados',
      exclusions: 'Limitaciones y Exclusiones Clave',
      deadlines: 'Plazos de Acción Encontrados',
    },
    howItWorks: {
      title: 'Cómo Funciona askNewton',
      subtitle: 'Una estricta separación de cálculos y explicaciones garantiza la precisión regulatoria.',
      brainTitle: '1. El Cerebro del Seguro',
      brainDesc: 'Un motor de reglas 100% determinista en TypeScript calcula todos los plazos, subsidios y planes. Sin alucinaciones de IA.',
      explanationTitle: '2. Capa de Explicación',
      explanationDesc: 'Nuestra IA (Claude 3.5 Sonnet) traduce el resultado estructurado del Cerebro a lenguaje claro y al idioma preferido, limitada a hechos verificados.',
      humanTitle: '3. Salvaguarda de Asesor Humano',
      humanDesc: 'Recomendamos consultar con un profesional con licencia o coveredca.gov antes de tomar decisiones finales sobre planes o presentar solicitudes.',
    },
    orgs: {
      title: 'Para Organizaciones',
      subtitle: 'Ayude a sus expatriados, estudiantes y nuevos empleados a navegar el sistema de salud sin estrés.',
      formTitle: 'Solicitar Asociación Corporativa',
      nameLabel: 'Nombre de Contacto',
      orgLabel: 'Nombre de la Organización',
      emailLabel: 'Correo Electrónico de Trabajo',
      sizeLabel: 'Recién Llegados Anuales Estimados',
      messageLabel: 'Describa las necesidades de su organización',
      submitButton: 'Enviar Formulario',
      successMessage: 'Gracias. Un especialista corporativo de Newton Insurance se comunicará en menos de 24 horas.',
    },
    trust: {
      title: 'Confianza y Ética de la IA',
      subtitle: 'Construido bajo pautas rigurosas para salvaguardar a los recién llegados a EE.UU.',
      principleTitle: 'El Principio t-1',
      principleDesc: 'Le notificamos proactivamente antes de que ocurran los vencimientos y riesgos, no después. Nunca esperamos que haga la pregunta errónea.',
      dataTitle: 'Minimización de Datos',
      dataDesc: 'No almacenamos historiales médicos detallados ni registros de inmigración. Usamos aproximaciones generales.',
      traceTitle: 'Trazabilidad Total',
      traceDesc: 'Cada cálculo y recomendación incluye referencias directas a las leyes federales y bases de datos del plan.',
      humanTitle: 'Sin Decisiones Adversas Autónomas',
      humanDesc: 'Nuestra IA nunca rechaza coberturas o reclamos. Su rol es puramente explicativo y de asesoría no vinculante.',
    },
    escalation: {
      text: '¿Necesita contratar cobertura, elegir un plan o hacer una pregunta vinculante?',
      cta: 'Únase a la lista de espera',
      disclaimer: 'Regístrese y nos pondremos en contacto cuando haya nueva guía disponible.',
    },
    footer: {
      disclaimer: 'askNewton es un servicio de educación y orientación sobre seguros de salud de askNewton, Inc., parte de la familia Newton Insurance plc. askNewton no es un productor de seguros con licencia y no vende, solicita, recomienda ni vincula seguros. Todas las cifras mostradas son estimaciones ilustrativas, no cotizaciones.',
      rights: '© 2026 askNewton, Inc. Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
      contact: 'Soporte y Contacto',
    },
  },
  ar: {
    dir: 'rtl',
    nav: {
      home: 'الرئيسية',
      guide: 'الدليل التفاعلي',
      explain: 'شرح الوثيقة',
      how: 'كيف نعمل',
      orgs: 'للمؤسسات',
      trust: 'الأمان والخصوصية',
    },
    brand: {
      tagline1: 'معادلة جديدة في عالم التأمين',
      tagline2: 'تأمين نيوتن — الزخم بجانبك دائمًا.',
      equation: 'بيانات نظيفة + وكلاء استباقيون + تقييم بشري + إدارة موثوقة = خدمة تأمين ذكية بالكامل',
    },
    landing: {
      heroTitle: 'تأمينك الصحي في أمريكا، بدليل استباقي.',
      heroSubtitle: 'فهم نظام الرعاية الصحية الأمريكي يمثل عقبة للمهاجرين والوافدين الجدد. يساعدك askNewton في اللحظة التي تسبق حاجتك للمعلومة، لشرح الخيارات بوضوح وبلغتك بدقة حسابية تامة.',
      ctaButton: 'ابدأ دليلك الخاص',
      whyTitle: 'لماذا يختلف دليل askNewton؟',
      whySubtitle: 'دليل تأمين صحي مبني على الشفافية والدقة المطلقة والأمان.',
      notChatbotTitle: 'ليس مجرد روبوت محادثة',
      notChatbotDesc: 'نحن لا ننتظر منك طرح الأسئلة الصحيحة. بل نوجهك استباقياً بناءً على موقعك، المواعيد النهائية، وبياناتك الشخصية.',
      licensedTitle: 'بدعم من نيوتن',
      licensedDesc: 'askNewton هو جزء من عائلة Newton Insurance plc. تعتمد إرشاداتنا على محرك حسابي ثابت لتقديم تفسيرات متسقة وواضحة — نحن نقدم إرشادات، ولا نبيع أو نبرم عقود تأمين.',
      equationTitle: 'معادلة التأمين الذكي للوافدين الجدد',
    },
    guide: {
      title: 'دليلك التأميني الاستباقي',
      subtitle: 'أجب عن بضعة أسئلة بسيطة لحساب المواعيد النهائية الخاصة بك، مراجعة الخطط المتاحة، وتجنب الأخطاء الشائعة. لا نطلب معلومات الهوية الشخصية.',
      step: 'الخطوة',
      prev: 'السابق',
      next: 'التالي',
      submit: 'عرض الدليل الحسابي',
      restart: 'البدء من جديد',
      whyWeAsk: 'لماذا نسأل عن هذا؟',
      qState: 'الولاية الأمريكية التي تقيم فيها',
      qStatePlaceholder: 'اختر الولاية',
      qNewcomer: 'هل أنت وافد جديد إلى الولايات المتحدة؟',
      qNewcomerDesc: 'غالباً ما يتأهل القادمون الجدد لفترات تسجيل استثنائية.',
      qNewcomerTooltip: 'نطلب هذا لتحديد ما إذا كنت مؤهلاً لفترة التسجيل الخاصة (SEP)، والتي تمنحك نافذة مدتها 60 يوماً للتسجيل خارج الفترة السنوية العامة.',
      qLanguage: 'اللغة المفضلة للشرح والتوضيح',
      qHousehold: 'عدد أفراد الأسرة',
      qHouseholdDesc: 'عدد المعالين قانونياً في إقرارك الضريبي.',
      qHouseholdTooltip: 'يؤثر حجم الأسرة مباشرة على حساب مستوى الفقر الفيدرالي (FPL)، والذي يحدد بدوره أهليتك للحصول على الدعم الحكومي.',
      qIncome: 'نطاق الدخل السنوي المتوقع للأسرة',
      qIncomeDesc: 'تقدير تقريبي لحساب الدعم الضريبي.',
      qIncomeTooltip: 'نستخدم نطاقات عريضة (منخفض/متوسط/مرتفع) للتحقق من أهليتك للحصول على الدعم دون الحاجة لمشاركة تفاصيل دخلك الدقيقة.',
      incomeLow: 'منخفض (أقل من 30,000 دولار للفرد)',
      incomeMid: 'متوسط (30,000 - 80,000 دولار للفرد)',
      incomeHigh: 'مرتفع (أكثر من 80,000 دولار للفرد)',
      qEmployer: 'هل لديك حالياً تأمين صحي مقدم من جهة العمل؟',
      qEmployerDesc: 'وجود تأمين عبر العمل يمنعك غالباً من الحصول على دعم السوق العام.',
      qNeeds: 'حدد احتياجاتك الطبية الخاصة:',
      needLowCost: 'أعطِ الأولوية للأقساط الشهرية المنخفضة',
      needChronic: 'إدارة مرض مزمن / زيارات متكررة للطبيب',
      needKids: 'رعاية الأطفال والأسرة',
      needDoctor: 'الاحتفاظ بأطبائي الحاليين (شبكة واسعة)',
      qAge: 'العمر الحالي',
      qAgeDesc: 'تعدل شركات التأمين أسعارها بناءً على الفئات العمرية.',
      resultsTitle: 'ملفك التأميني الرقمي المؤكد',
      deadlineTitle: 'تنبيه الموعد النهائي للتسجيل',
      subsidyTitle: 'فحص الدعم المالي الحكومي',
      plansTitle: 'خطط التأمين المقترحة لك',
      riskTitle: 'الخطر الأكبر الذي يجب تجنبه',
      actionTitle: 'خطوتك التالية هذا الأسبوع',
      sourcesTitle: 'الشفافية ومصادر البيانات',
      disclaimerTitle: 'تنبيه إخلاء مسؤولية',
      disclaimerText: 'هذا الدليل لأغراض إرشادية وتوضيحية فقط بناءً على البيانات الأولية. إن askNewton ليس منتج أو وسيط تأمين مرخص.',
      costPerMonth: '/ شهرياً (تقديري)',
      network: 'الشبكة',
      covers: 'ما تغطيه الخطة',
      excludes: 'الاستثناءات (ما لا تغطيه الخطة)',
      traceReference: 'بناءً على القاعدة القانونية:',
    },
    explain: {
      title: 'مفسر وثائق ومراسلات التأمين الصحي',
      subtitle: 'انسخ نص خطاب التأمين، أو وثيقة الفوائد، أو تفاصيل التغطية. وسنقوم بترجمتها وشرح مصطلحاتها المعقدة بلغة واضحة.',
      pasteLabel: 'انسخ نص الوثيقة هنا:',
      pastePlaceholder: 'انسخ تفاصيل التغطية أو إشعارات المواعيد هنا...',
      uploadLabel: 'أو قم برفع ملف الوثيقة (PDF أو نص):',
      submitButton: 'تحليل وشرح الوثيقة',
      loading: 'جاري فحص هيكل الوثيقة وترجمة المصطلحات الطبية والمالية...',
      resultTitle: 'شرح وتفسير بنود الوثيقة',
      alertWarning: 'إشعار تنظيمي هام',
      alertWarningText: 'هذا التلخيص إرشادي وتوضيحي فقط. إن askNewton ليس منتج تأمين مرخص ولا يقوم ببيع أو ربط التأمين.',
      summary: 'الملخص التنفيذي المبسط',
      coverage: 'المزايا والتغطيات المكتشفة في النص',
      exclusions: 'الاستثناءات والقيود الهامة',
      deadlines: 'المواعيد والإجراءات العاجلة المطلوبة',
    },
    howItWorks: {
      title: 'كيف يعمل دليل askNewton؟',
      subtitle: 'نفصل بدقة متناهية بين الحسابات الفنية والشرح اللغوي لضمان الدقة والامتثال.',
      brainTitle: '1. محرك التأمين الحسابي (The Insurance Brain)',
      brainDesc: 'برنامج بلغة TypeScript يعمل بقواعد ثابتة ومحددة بنسبة 100% لحساب التواريخ والأهلية وتصنيف الخطط. خالٍ تماماً من التخمينات أو الأخطاء الذكائية.',
      explanationTitle: '2. طبقة التوضيح اللغوي الذكي',
      explanationDesc: 'نستخدم الذكاء الاصطناعي (Claude 3.5 Sonnet) لترجمة وشرح نتائج المحرك الحسابي بلغة مبسطة وواضحة، مقيداً فقط بالحقائق الحسابية الصادرة من المحرك.',
      humanTitle: '3. صمام الأمان البشري',
      humanDesc: 'ننصح باستشارة متخصص مرخص أو زيارة موقع coveredca.gov قبل اتخاذ أي قرارات نهائية بشأن الخطط أو تقديم الطلبات.',
    },
    orgs: {
      title: 'للشركات والمؤسسات',
      subtitle: 'ساعد موظفيك القادمين من الخارج، طلابك، وأفراد مؤسستك في بدء رعاية صحية أمريكية آمنة بلا توتر.',
      formTitle: 'طلب شراكة وتأمين جماعي',
      nameLabel: 'اسم جهة الاتصال',
      orgLabel: 'اسم المؤسسة / الشركة',
      emailLabel: 'بريد العمل الإلكتروني',
      sizeLabel: 'عدد الوافدين السنوي المتوقع',
      messageLabel: 'أخبرنا عن متطلبات واحتياجات مؤسستك',
      submitButton: 'إرسال طلب الاهتمام',
      successMessage: 'شكراً لك. سيتواصل معك أخصائي الشراكات من شركة Newton Insurance خلال يوم عمل واحد.',
    },
    trust: {
      title: 'الأمان، الخصوصية وحوكمة الذكاء الاصطناعي',
      subtitle: 'بنينا النظام وفق أشد معايير الامتثال لحماية المهاجرين والوافدين الجدد.',
      principleTitle: 'مبدأ اللحظة السابقة (t-1)',
      principleDesc: 'نقوم بتنبيهك استباقياً بالتواريخ الحرجة والمخاطر قبل وقوعها. لا ننتظر منك ارتكاب خطأ في السؤال.',
      dataTitle: 'تقليل جمع البيانات',
      dataDesc: 'لا نحتفظ ببيانات تاريخك المرضي التفصيلي أو أرقام الهجرة أو أرقام الدخل الدقيقة. نستخدم تصنيفات عامة لضمان الخصوصية.',
      traceTitle: 'الشفافية الكاملة',
      traceDesc: 'كل نتيجة أو سعر مقترح يتضمن مرجعاً واضحاً لقوانين الرعاية الفيدرالية ومصادر قواعد البيانات الرسمية للخطط.',
      humanTitle: 'لا قرارات سلبية تلقائية',
      humanDesc: 'لا يقوم نظامنا الآلي برفض تغطية تأمينية أو المطالبة بها بمفرده. عملنا استشاري وتوضيحي غير ملزم قانوناً.',
    },
    escalation: {
      text: 'هل ترغب في تفعيل تغطية، شراء خطة، أو طرح سؤال رسمي ملزم؟',
      cta: 'انضم إلى قائمة الانتظار',
      disclaimer: 'سجل وسنتواصل معك عندما تتوفر إرشادات جديدة.',
    },
    footer: {
      disclaimer: 'إن askNewton هي خدمة إرشاد وتثقيف استباقية للتأمين تابعة لشركة askNewton, Inc.، وهي جزء من عائلة Newton Insurance plc. إن askNewton ليس منتج تأمين مرخص ولا يبيع أو يروج أو يوصي أو يربط التأمين. جميع الأرقام المعروضة هي تقديرات توضيحية وليست عروض أسعار.',
      rights: 'جميع الحقوق محفوظة © 2026 لشركة askNewton, Inc.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      contact: 'الدعم والتواصل',
    },
  },
};
