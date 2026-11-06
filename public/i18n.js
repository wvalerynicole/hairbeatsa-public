// Hair Beat by Valery — English / Spanish switch.
// English lives in the HTML (so the page works without this file). Spanish (Latin American, "tú") lives below, keyed by data-i18n.
//   data-i18n="key"                 → swaps the element's content
//   data-i18n-attr="alt:key;title:key2" → swaps attributes
// The choice is remembered on this device, and ?lang=es in a link opens the page in Spanish.
(() => {
  const ES = {
    "meta.title": "Hair Beat by Valery | Especialista en balayage y color en San Antonio, TX",
    "meta.description": "Hair Beat by Valery: estilista formada en Miami con más de 13 años de experiencia. Balayage, color dimensional, highlights, cortes de precisión, blowouts, Brazilian Blowout y extensiones en San Antonio, TX. Atención en español e inglés.",
    "skip": "Saltar al contenido",
    "brand.label": "Hair Beat by Valery, volver al inicio",

    "nav.label": "Principal",
    "nav.about": "Sobre mí",
    "nav.services": "Servicios",
    "nav.reviews": "Reseñas",
    "nav.work": "Galería",
    "nav.info": "Info útil",
    "nav.visit": "Visítanos",
    "menu.label": "Menú",
    "menu.sections": "Secciones",
    "menu.call": "Llamar",

    "cta.bookNow": "Reservar",
    "cta.bookAppointment": "Reserva tu cita",
    "cta.call": "Llamar a Hair Beat",

    "hero.eyebrow": "Especialista en balayage y color · San Antonio, TX",
    "hero.title": "Cabello que se mueve a <em>tu</em> ritmo.",
    "hero.lede": "Valery, estilista formada en Miami, pone más de 13 años de experiencia en cada cita: desde balayage natural y color dimensional hasta cortes de precisión y blowouts que duran días.",
    "hero.explore": "Ver servicios",
    "hero.tagsLabel": "Lo más destacado",
    "hero.rating": "5.0 · más de 98 reseñas",
    "hero.spanish": "Atención bilingüe",
    "hero.parking": "Estacionamiento gratis",
    "hero.who": "Mujeres · Hombres · Niños",
    "hero.photoAlt": "Valery, dueña y estilista de Hair Beat, sonriendo con los brazos cruzados",
    "hero.years": "años de<br>experiencia",
    "hero.role": "Dueña y estilista",
    "hero.badgeLabel": "Reserva en línea en Vagaro",
    "hero.badge": "Reserva ya · Hair Beat · San Antonio ·",

    "stats.label": "En resumen",
    "stats.years": "Años de experiencia profesional",
    "stats.since": "Con orgullo en San Antonio desde",
    "stats.miami": "Formación profesional y raíces en blow-dry bar",
    "stats.lang": "Atención bilingüe, inglés y español",

    "about.eyebrow": "Conoce a tu estilista",
    "about.title": "Hola, soy <em>Valery.</em>",
    "about.quote": "“Mi meta es ofrecer servicios de cabello personalizados y de alta calidad en un ambiente acogedor y relajante, donde cada persona se sienta segura, renovada y bien atendida.”",
    "about.p1": "Soy estilista formada en Miami, con 13 años de experiencia, y desde 2017 atiendo con orgullo en San Antonio. Me especializo en balayage, color dimensional, highlights, retoque de raíz y cortes de precisión para mujeres, hombres y niños.",
    "about.p2": "Gracias a mi experiencia en blow-dry bar, crear blowouts hermosos y duraderos es una de mis partes favoritas de cada cita.",
    "about.credentials": "Certificaciones",
    "about.c1": "Certificada en tratamientos alisadores Brazilian Blowout",
    "about.c2": "Certificada en extensiones de cabello",
    "about.c3": "Formada en Miami · más de 13 años de experiencia",
    "about.c4": "Bilingüe: inglés y español",

    "services.eyebrow": "Servicios",
    "services.title": "Color, cortes y blowouts <em>de autor</em>",
    "services.intro": "Cada servicio empieza con una conversación sobre tu cabello, tu rutina y tus metas, para que el resultado se adapte a tu vida y no solo a la foto.",
    "services.s1": "Color pintado a mano, natural y con un crecimiento suave, sin líneas marcadas. Dimensión con efecto de sol que se ve natural desde el primer día y sigue hermosa meses después.",
    "services.s1Tag": "Especialidad de la casa",
    "services.s2Title": "Color dimensional y highlights",
    "services.s2": "Highlights y lowlights colocados con intención para dar profundidad, luminosidad y movimiento.",
    "services.s3Title": "Retoque de raíz",
    "services.s3": "Cobertura uniforme entre citas más grandes para mantener tu color fresco y pulido.",
    "services.s4Title": "Cortes de precisión",
    "services.s4": "Cortes a la medida para mujeres, hombres y niños, según tu textura y tu estilo de vida.",
    "services.s5Title": "Blowouts y peinados",
    "services.s5": "La experiencia en blow-dry bar se nota: blowouts lisos y con volumen que duran días.",
    "services.s6": "Tratamiento alisador certificado que controla el frizz y reduce el tiempo de peinado, y deja el cabello suave y con movimiento.",
    "services.s7Title": "Extensiones de cabello",
    "services.s7": "Instalación certificada para dar largo, volumen y cuerpo, integrada de forma natural con tu propio cabello.",
    "services.menu": "Menú",
    "services.menuTitle": "Ver menú completo y precios",
    "services.menuText": "Los precios, la duración de cada servicio y la disponibilidad en vivo están en Vagaro.",
    "services.menuLink": "Abrir Vagaro",
    "services.fine": "Los precios varían según el largo, la densidad del cabello y tus metas. Las transformaciones de color grandes pueden requerir más de una sesión.",

    "reviews.eyebrow": "Reseñas de clientes",
    "reviews.title": "Lo que dicen en <em>San Antonio</em>",
    "reviews.stars": "5 de 5 estrellas",
    "reviews.count": "Más de 98 reseñas verificadas en Vagaro",
    "reviews.oct2026": "Verificada · Vagaro · oct 2026",
    "reviews.aug2025": "Verificada · Vagaro · ago 2025",
    "reviews.mar2026": "Verificada · Vagaro · mar 2026",
    "reviews.jun2025": "Verificada · Vagaro · jun 2025",
    "reviews.allVagaro": "Leer todas las reseñas en Vagaro",
    "reviews.google": "Ver reseñas en Google",

    "work.eyebrow": "El trabajo",
    "work.title": "Mira las transformaciones",
    "work.intro": "Looks recientes desde la silla. Sigue a <a href=\"https://www.instagram.com/hair.beat/\" target=\"_blank\" rel=\"noopener\">@hair.beat</a> para ver nuevas transformaciones.",
    "work.alt1": "Cabello largo castaño con balayage caramelo suave, peinado en ondas sueltas",
    "work.alt2": "Antes y después: cabello rubio transformado a un cobrizo intenso",
    "work.alt3": "Color rubio dorado con capas suaves que enmarcan el rostro",
    "work.alt4": "Blowout en capas con highlights dimensionales",
    "work.alt5": "Castaño brillante con ondas suaves y con movimiento, visto desde cuatro ángulos",
    "work.alt6": "Rizos castaños con un peekaboo turquesa por debajo",
    "work.tag1": "Balayage caramelo",
    "work.tag2": "Antes y después · cobrizo",
    "work.tag3": "Rubio dorado y capas",
    "work.tag4": "Highlights dimensionales",
    "work.tag5": "Castaño brillante",
    "work.tag6": "Peekaboo turquesa",
    "work.photoAlt": "Trabajo reciente de Valery en Hair Beat",

    "social.igText": "Sígueme para ver color, cortes y blowouts recientes.",
    "social.igLink": "Seguir",
    "social.googleTitle": "Reseñas de clientes",
    "social.googleText": "Lee lo que dicen mis clientes y deja tu reseña después de tu visita.",
    "social.googleLink": "Leer reseñas",
    "social.vagaroTitle": "Reserva en línea 24/7",
    "social.vagaroText": "Elige tu servicio y el horario que mejor te quede.",

    "info.eyebrow": "Info útil",
    "info.title": "Antes de tu <em>cita</em>",
    "info.intro": "Algunos detalles para que cada cita sea relajada y a tiempo.",
    "info.q1": "¿Cómo reservo?",
    "info.a1": "Reserva en línea cuando quieras en <a href=\"https://www.vagaro.com/hairbeat\" target=\"_blank\" rel=\"noopener\">Vagaro</a>, o llama al <a href=\"tel:+17262316067\">(726) 231-6067</a>. Se requiere una tarjeta de crédito válida para reservar tu cita.",
    "info.q2": "¿Cómo me preparo?",
    "info.a2": "<li>Llega de 5 a 10 minutos antes.</li><li>Ven con el cabello limpio y seco, a menos que tu servicio incluya lavado.</li><li>Avísame si tienes tinte de caja, extensiones o algún servicio químico reciente.</li><li>¡Las fotos de inspiración siempre son bienvenidas!</li><li>Para mantener un ambiente relajado, solo deben asistir las personas que recibirán un servicio.</li>",
    "info.q3": "¿Cuál es la política de cancelación?",
    "info.a3": "Avisa con al menos 24 horas de anticipación para cancelar o reprogramar. Las cancelaciones tardías se cobran al 50% del servicio programado; si cancelas el mismo día o no te presentas, se cobra el 100%. Si llegas 15 minutos tarde o más, es posible que tengas que reprogramar. Los depósitos no son reembolsables, pero se pueden transferir si avisas con tiempo.",
    "info.q4": "¿Cortas el cabello a hombres y niños?",
    "info.a4": "Sí: cortes de precisión para mujeres, hombres y niños.",
    "info.q5": "¿Atiendes en inglés y en español?",
    "info.a5": "¡Sí! Todos los servicios se ofrecen en inglés y en español.",
    "info.q6": "¿Qué formas de pago aceptas?",
    "info.a6": "Visa, MasterCard y Discover.",

    "visit.eyebrow": "Visita el estudio",
    "visit.address": "Dirección",
    "visit.phone": "Teléfono",
    "visit.email": "Correo",
    "visit.hours": "Horario",
    "visit.hoursText": "Con cita previa: consulta la disponibilidad en vivo en <a href=\"https://www.vagaro.com/hairbeat\" target=\"_blank\" rel=\"noopener\">Vagaro</a>",
    "visit.parking": "Estacionamiento",
    "visit.parkingText": "Estacionamiento gratis en el lugar",
    "visit.directions": "Cómo llegar",
    "visit.mapTitle": "Mapa a Hair Beat, 2106 E Sonterra Blvd Suite 4, San Antonio, TX",

    "final.title": "¿Todo listo para <em>tu mejor look?</em>",
    "footer.label": "Redes y reservas",

    "404.title": "Esta página tuvo un <em>mal día de cabello.</em>",
    "404.lede": "La página que buscas no existe, pero tu próximo gran look está a un clic.",
    "404.home": "Volver al inicio",
    "404.book": "Reservar en Vagaro",
  };

  const STORAGE_KEY = "hb-lang";
  const root = document.documentElement;
  const english = new WeakMap(); // element → its original English content and attributes

  function remember(el) {
    let saved = english.get(el);
    if (!saved) english.set(el, (saved = { html: null, attrs: {} }));
    return saved;
  }

  function apply(lang) {
    const es = lang === "es";
    for (const el of document.querySelectorAll("[data-i18n]")) {
      const saved = remember(el);
      saved.html ??= el.innerHTML;
      const value = es ? ES[el.dataset.i18n] : undefined;
      const next = value ?? saved.html;
      if (el.innerHTML !== next) el.innerHTML = next;
    }
    for (const el of document.querySelectorAll("[data-i18n-attr]")) {
      const saved = remember(el);
      for (const pair of el.dataset.i18nAttr.split(";")) {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (!(attr in saved.attrs)) saved.attrs[attr] = el.getAttribute(attr);
        const value = (es ? ES[key] : undefined) ?? saved.attrs[attr];
        if (value != null) el.setAttribute(attr, value);
      }
    }
    root.lang = es ? "es" : "en";
    for (const group of document.querySelectorAll("[data-lang-toggle]")) {
      group.dataset.active = root.lang;
      for (const btn of group.querySelectorAll("[data-lang]")) {
        btn.setAttribute("aria-pressed", String(btn.dataset.lang === root.lang));
      }
    }
  }

  function stored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }
  function store(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* private mode: the choice just isn't remembered */ }
  }

  const fromLink = new URLSearchParams(location.search).get("lang");
  const initial = fromLink === "es" || fromLink === "en" ? fromLink : stored() === "es" ? "es" : "en";
  if (fromLink === initial) store(initial);
  if (initial !== "en") apply(initial);

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lang]");
    if (!btn || btn.dataset.lang === root.lang) return;
    apply(btn.dataset.lang);
    store(btn.dataset.lang);
  });

  // For main.js: text that is created after the page loads.
  window.hbText = (key, fallback) => (root.lang === "es" && ES[key]) || fallback;
})();
