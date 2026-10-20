// ─────────────────────────────────────────────────────────────
//  CONTENIDO EDITABLE DE PRIMERA PAUSA
//  Textos, precios, modalidades, profesionales y FAQ viven acá.
//  Cambiar un valor, hacer commit → Vercel publica solo.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: 'Primera Pausa',
  url: 'https://primerapausa.com.ar', // TODO: dominio definitivo
  description:
    'Orientación psicológica puntual, online. Una conversación profesional para ordenar lo que te está pasando y pensar cómo seguir. Sin compromiso de continuidad.',
  email: 'hola@primerapausa.com.ar', // TODO: email real
  instagram: 'primerapausa',
  // Versiones de los documentos legales: se registran con cada solicitud.
  legalVersions: { condiciones: '1.0', privacidad: '1.0' },
};

export const hero = {
  eyebrow: 'Orientación psicológica de sesión única',
  title: 'Orientación psicológica puntual.',
  lead:
    'A veces necesitás hablar con una psicóloga, aunque no estés buscando hacer terapia. Una conversación profesional para entender mejor lo que te está pasando, ordenar la situación y pensar cómo abordarla. Sin compromiso de continuidad.',
  ctaNote: 'Turnos prioritarios sujetos a disponibilidad. No es un servicio de emergencia.',
};

export const insight = {
  eyebrow: 'El punto de partida',
  quote: 'Lo que le contarías a un amigo, hablalo con una profesional.',
  lead: 'Hay situaciones que no necesitan un tratamiento, sino una conversación a tiempo con alguien que sabe escuchar y ordenar.',
  phrases: [
    { text: 'Discutí con mi pareja y no sé qué hacer.', icon: 'favorite' },
    { text: 'Tengo que tomar una decisión importante y estoy trabadísima.', icon: 'alt_route' },
    { text: 'Pasó algo en el trabajo y no puedo dejar de pensarlo.', icon: 'work' },
    { text: 'Tengo que hablar con mi mamá y no sé cómo encararlo.', icon: 'forum' },
    { text: 'Me pasó algo ayer y necesito entender por qué me pegó tan fuerte.', icon: 'cloud' },
  ],
};

export const situaciones = [
  'Algo que pasó hoy y necesitás pensar.',
  'Una decisión que no sabés cómo abordar.',
  'Un conflicto de pareja o familiar.',
  'Un conflicto laboral.',
  'Preparar una conversación importante.',
  'Algo que te está generando preocupación, angustia o confusión.',
];

export const expectativas = [
  { title: 'Distinguir', text: 'Qué está influyendo en la situación que estás viviendo.' },
  { title: 'Clarificar', text: 'Qué necesitás en este momento.' },
  { title: 'Ordenar', text: 'Lo que te está pasando, para poder pensarlo con más calma.' },
  { title: 'Conocer opciones', text: 'Qué alternativas tenés frente a la situación.' },
  { title: 'Definir un próximo paso', text: 'Orientación para pensar cómo seguir.' },
];

export const pasos = [
  'Completás un formulario breve.',
  'Recibimos tu solicitud y revisamos si Primera Pausa es un espacio adecuado para lo que necesitás.',
  'Si el formato es adecuado, nos contactamos con vos.',
  'Elegís el tipo de consulta y la modalidad que preferís: audio o videollamada.',
  'Te enviamos los turnos disponibles.',
  'Elegís un horario y reservás tu turno realizando el pago.',
  'Una vez acreditado el pago, recibís la confirmación de la consulta.',
  'En el día y horario acordados, tenés tu Primera Pausa con una psicóloga.',
];

export const alcance = {
  intro:
    'Primera Pausa es una consulta psicológica puntual, centrada en la situación que necesitás abordar en este momento.',
  items: [
    'No es psicoterapia ni reemplaza un tratamiento psicológico.',
    'No implica iniciar un proceso semanal ni asumir un compromiso de continuidad.',
    'No es un servicio de urgencias o emergencias en salud mental.',
  ],
  outro:
    'Si durante el encuentro consideramos que podrías beneficiarte de psicoterapia o de otro tipo de atención, te orientaremos sobre posibles pasos a seguir.',
};

// id = valor que viaja en el formulario (?modalidad=...)
export const modalidades = [
  {
    id: 'breve',
    name: 'Pausa Breve',
    duration: '30 minutos',
    price: 45000,
    description:
      'Un espacio breve para conversar sobre una situación puntual, ordenar lo que te está pasando y pensar cómo seguir.',
    featured: false,
    priority: false,
  },
  {
    id: 'estandar',
    name: 'Pausa Estándar',
    duration: '60 minutos',
    price: 70000,
    description:
      'Un espacio para desarrollar con mayor amplitud lo que estás viviendo, ordenar la situación y explorar las opciones disponibles.',
    featured: true,
    priority: false,
  },
  {
    id: 'extendida',
    name: 'Pausa Extendida',
    duration: '90 minutos',
    price: 90000,
    description:
      'Una consulta con más tiempo para abordar situaciones que requieren mayor desarrollo y profundización durante el encuentro.',
    featured: false,
    priority: false,
  },
  {
    id: 'prioritaria',
    name: 'Pausa Prioritaria',
    duration: '60 minutos',
    price: 95000,
    description:
      'Para cuando necesitás conversar una situación sin esperar a la disponibilidad habitual. Acceso prioritario a los turnos disponibles dentro de las próximas 24 horas.',
    note: 'Sujeto a disponibilidad. No es un servicio de emergencias ni una guardia psicológica.',
    featured: false,
    priority: true,
  },
];

// Para sumar una profesional: copiar un bloque. foto = ruta en /public/equipo/
export const profesionales = [
  {
    nombre: 'Lic. Nombre Apellido',
    titulo: 'Licenciada en Psicología',
    matricula: 'M.P. pendiente',
    foto: '',
    bio: 'Breve presentación y formación. (Texto pendiente)',
    enfoque: ['Área de experiencia', 'Enfoque'],
  },
  {
    nombre: 'Lic. Nombre Apellido',
    titulo: 'Licenciada en Psicología',
    matricula: 'M.P. pendiente',
    foto: '',
    bio: 'Breve presentación y formación. (Texto pendiente)',
    enfoque: ['Área de experiencia', 'Enfoque'],
  },
];

export const faq = [
  {
    q: '¿Qué es Primera Pausa?',
    a: 'Primera Pausa es un espacio de orientación psicológica puntual para conversar con una psicóloga sobre una situación que necesitás abordar en este momento. No implica iniciar un proceso terapéutico ni asumir un compromiso de continuidad.',
  },
  {
    q: '¿Primera Pausa es una sesión de terapia?',
    a: 'No. Es una consulta psicológica puntual y no reemplaza una psicoterapia. Su objetivo es ofrecerte escucha profesional, ayudarte a ordenar la situación y orientarte sobre posibles próximos pasos.',
  },
  {
    q: '¿Tengo que estar haciendo terapia para solicitar una consulta?',
    a: 'No. Podés solicitar una Primera Pausa aunque no estés haciendo terapia ni tengas intención de comenzar un tratamiento.',
  },
  {
    q: '¿Qué tipo de situaciones puedo consultar?',
    a: 'Podés consultar por una situación personal, vincular, familiar o laboral que te esté generando preocupación, angustia o confusión; una decisión que no sabés cómo abordar; un conflicto reciente o una conversación importante que necesitás preparar. Primera Pausa no está pensada para realizar evaluaciones diagnósticas ni para abordar emergencias de salud mental.',
  },
  {
    q: '¿Qué diferencia hay entre una consulta programada y una prioritaria?',
    a: 'La consulta programada se coordina entre los próximos turnos disponibles y tiene un valor menor. La consulta prioritaria está pensada para quienes necesitan hablar lo antes posible: estas solicitudes se revisan antes y tienen preferencia en la asignación de los horarios más próximos. La prioridad está sujeta a la disponibilidad de las profesionales y no garantiza atención inmediata.',
  },
  {
    q: '¿La consulta prioritaria garantiza que me atenderán inmediatamente?',
    a: 'No. Seleccionar una consulta prioritaria nos permite identificar que necesitás hablar lo antes posible, pero no garantiza atención inmediata ni en un horario específico. Revisaremos la disponibilidad y te ofreceremos el turno más próximo posible. Primera Pausa no es un servicio de urgencias o emergencias.',
  },
  {
    q: '¿Cómo sé qué duración elegir?',
    a: 'La opción de 30 minutos está pensada para abordar una situación concreta. La de 60 minutos permite desarrollar el tema con mayor amplitud. La de 90 minutos ofrece más tiempo para situaciones que requieren mayor elaboración. Si tenés dudas, podemos orientarte antes de coordinar el turno.',
  },
  {
    q: '¿La consulta puede ser por audio o por videollamada?',
    a: 'Sí. Al momento de coordinar, podés elegir si preferís realizarla por audio o por videollamada.',
  },
  {
    q: '¿Qué sucede después de completar el formulario?',
    a: 'Revisamos tu solicitud para evaluar si Primera Pausa es un espacio adecuado para lo que necesitás. Si el formato resulta apropiado, nos comunicamos con vos para que elijas el tipo de consulta, la modalidad y uno de los turnos disponibles. Completar el formulario no significa que la consulta esté confirmada.',
  },
  {
    q: '¿Cuándo queda confirmado el turno?',
    a: 'El turno queda confirmado después de que revisamos la solicitud, coordinamos el horario y se acredita el pago correspondiente.',
  },
  {
    q: '¿Puedo solicitar otra consulta más adelante?',
    a: 'Sí. Podés volver a solicitar una consulta puntual si lo necesitás. Tener más de un encuentro no implica automáticamente iniciar una psicoterapia ni establece un seguimiento continuo.',
  },
  {
    q: '¿La consulta es confidencial?',
    a: 'Sí. La información compartida durante el encuentro se encuentra alcanzada por el deber de confidencialidad profesional, dentro de los límites éticos y legales correspondientes.',
  },
  {
    q: '¿Qué pasa si Primera Pausa no es el espacio adecuado para mi situación?',
    a: 'Te informaremos que este formato no resulta adecuado para lo que necesitás una vez que hayas completado el formulario.',
  },
  {
    q: '¿Qué hago si estoy atravesando una emergencia?',
    a: 'Primera Pausa no brinda atención de urgencias o emergencias. Si existe riesgo inmediato para vos o para otra persona, comunicate con el servicio de emergencias de tu localidad o acercate a la guardia de salud más cercana.',
  },
];

export const lineasAyuda = [
  { num: '911', tel: '911', title: 'Emergencias', text: 'Para situaciones que requieren asistencia inmediata.' },
  {
    num: '0800-999-0091',
    tel: '08009990091',
    title: 'Urgencias de salud mental',
    text: 'Línea nacional, gratuita y confidencial, 24 horas, todos los días. Orientación y apoyo ante crisis emocionales, angustia intensa, ideación de muerte o autolesión y otras urgencias de salud mental.',
  },
  {
    num: '107',
    tel: '107',
    title: 'Emergencias médicas',
    text: 'Su disponibilidad depende de la jurisdicción: verificá el servicio de emergencias médicas de tu localidad.',
  },
  {
    num: '144',
    tel: '144',
    title: 'Violencia de género',
    text: 'Atención, contención y asesoramiento. No reemplaza al 911 ante un riesgo inmediato.',
  },
  {
    num: '102',
    tel: '102',
    title: 'Niñas, niños y adolescentes',
    text: 'Escucha, orientación y acompañamiento. No es un servicio de emergencias.',
  },
  { num: '141', tel: '141', title: 'Consumos problemáticos', text: 'Orientación y acompañamiento, 24 horas.' },
];

// Preguntas de seguridad del formulario. block:true → "Sí" o "No estoy seguro/a"
// envía a la pantalla de seguridad. La última se registra pero no bloquea.
export const triage = [
  { q: '¿Sentís que podrías lastimarte, quitarte la vida o poner en riesgo tu seguridad en este momento o en las próximas horas?', block: true },
  { q: '¿En los últimos días tuviste un intento de suicidio o realizaste alguna acción para lastimarte que pueda requerir atención médica?', block: true },
  { q: '¿Tenés en este momento un plan concreto o acceso a elementos con los que podrías hacerte daño?', block: true },
  { q: '¿Sentís que podrías lastimar a otra persona o que podrías perder el control sobre tus acciones?', block: true },
  { q: '¿Estás atravesando una situación de violencia, amenaza o peligro inmediato por parte de otra persona?', block: true },
  { q: '¿Te encontrás muy desorientado/a, confundido/a, desconectado/a de la realidad, o viendo o escuchando cosas que otras personas no perciben?', block: true },
  { q: '¿Consumiste alcohol, medicamentos u otras sustancias en una cantidad que dificulte mantener una conversación o tomar decisiones con claridad?', block: true },
  { q: '¿Tenés síntomas físicos intensos o una situación médica que pueda requerir atención inmediata?', block: true },
  { q: '¿Hay alguien de confianza cerca o disponible para acompañarte si llegaras a necesitar ayuda?', block: false },
];

export const formatPrice = (n: number) => '$' + n.toLocaleString('es-AR');
