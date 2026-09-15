/**
 * MIADENT Catalog SPA - Vanilla JS Engine
 * High-conversion mobile-first dental catalog fusing gym-flyer-app-template with Multident clinical trust.
 * Destination Phone: 51902103429 (Jesús María, Lima, Perú)
 */

'use strict';

/**
 * WhatsApp Integration Configuration
 */
const WHATSAPP_CONFIG = {
  countryCode: '51',
  phone: '902103429',
  cleanPhone: '51902103429',
  baseUrl: 'https://wa.me/'
};

/**
 * Sanitizes phone number removing any non-digit character.
 * @param {string} phone 
 * @returns {string} Clean numeric phone string
 */
function sanitizePhoneNumber(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/**
 * Builds a properly formatted, URI-encoded WhatsApp link.
 * Guards against empty values and encodes special characters.
 * @param {string} customMessage 
 * @returns {string} Fully qualified wa.me URL
 */
function buildWhatsAppUrl(customMessage) {
  const defaultMsg = '¡Hola MIADENT! Deseo información sobre citas y tratamientos odontológicos.';
  const text = (customMessage && customMessage.trim()) ? customMessage.trim() : defaultMsg;
  const targetPhone = sanitizePhoneNumber(WHATSAPP_CONFIG.cleanPhone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Opens WhatsApp link in a secure external tab.
 * @param {string} customMessage 
 */
function openWhatsApp(customMessage) {
  const url = buildWhatsAppUrl(customMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Authoritative Promotional Offers Dataset
 */
const PROMO_FLYERS_DATA = {
  consultaGratis: {
    id: 'consulta-gratis',
    brand: 'MIADENT',
    category: 'PROMOCIÓN DESTACADA',
    title: '1RA CONSULTA DENTAL GRATIS',
    subtitle: 'Evaluación integral + Diagnóstico digital sin costo',
    image: 'https://i.imgur.com/Yhsj2X9.jpeg',
    accentColor: '#D4AC0D',
    themeClass: 'featured-promo-theme',
    description: 'Inicia tu camino hacia una sonrisa perfecta con una evaluación completa realizada por especialistas en Jesús María. Incluye diagnóstico visual y plan de tratamiento personalizado.',
    priceOptions: [
      {
        label: 'CONSULTA CLÍNICA',
        price: 'GRATIS',
        normalPrice: 'S/ 30',
        featured: true,
        badge: '100% GRATIS (VALOR S/ 30)'
      },
      {
        label: 'DIAGNÓSTICO + PLAN INTEGRAL',
        price: 'GRATIS',
        normalPrice: 'S/ 50',
        featured: false,
        badge: 'INCLUIDO (VALOR S/ 50)'
      }
    ],
    schedule: [
      'Lunes a Sábado: 10:00 AM – 8:00 PM',
      'Domingos: Previa cita'
    ],
    includes: [
      'Evaluación clínica exhaustiva por la Dra. Martiza',
      'Detección temprana de caries y problemas gingivales',
      'Plan de tratamiento digitalizado a tu medida',
      'Presupuesto transparente sin compromiso'
    ],
    ctaText: 'AGENDAR MI CONSULTA GRATIS',
    ctaSubtext: 'Cupos limitados por orden de llegada en Jesús María',
    whatsappMessage: '¡Hola MIADENT! Deseo agendar mi 1ra Consulta Gratis.'
  },

  limpiezaDental: {
    id: 'limpieza-40-off',
    brand: 'MIADENT',
    category: 'PROFILAXIS & HIGIENE',
    title: 'LIMPIEZA DENTAL 40% OFF',
    subtitle: 'Destartraje ultrasónico y profilaxis profunda',
    image: 'https://i.imgur.com/Yhsj2X9.jpeg',
    accentColor: '#8E44AD',
    themeClass: 'lavender-promo-theme',
    description: 'Elimina sarro, manchas externas y placa bacteriana con tecnología ultrasónica avanzada. Protege tus encías y mantén un aliento fresco y saludable.',
    priceOptions: [
      {
        label: 'PROFILAXIS BÁSICA + PULIDO',
        price: 'S/ 59',
        normalPrice: 'S/ 100',
        featured: false,
        badge: 'AHORRA 40%'
      },
      {
        label: 'DESTARTRAJE ULTRASÓNICO + FLÚOR',
        price: 'S/ 89',
        normalPrice: 'S/ 150',
        featured: true,
        badge: '40% OFF TOP'
      }
    ],
    schedule: [
      'Lunes a Sábado: 10:00 AM – 8:00 PM',
      'Domingos: Previa cita'
    ],
    includes: [
      'Remoción de sarro con cavitador ultrasónico indoloro',
      'Pulido dental con pasta profiláctica diamantada',
      'Aplicación tópica de flúor protector anti-caries',
      'Instrucción personalizada de técnica de cepillado'
    ],
    ctaText: 'RESERVAR LIMPIEZA 40% OFF',
    ctaSubtext: 'Atención inmediata por WhatsApp',
    whatsappMessage: '¡Hola MIADENT! Me interesa la promoción de Limpieza con 40% de descuento.'
  },

  ortodoncia: {
    id: 'ortodoncia-15-off',
    brand: 'MIADENT',
    category: 'ORTODONCIA & ALINEACIÓN',
    title: 'ORTODONCIA 15% OFF',
    subtitle: 'Brackets Convencionales y Autoligables con 15% de Descuento',
    image: 'https://i.imgur.com/Yhsj2X9.jpeg',
    accentColor: '#5B2C6F',
    themeClass: 'deepviolet-promo-theme',
    description: 'Corrige la posición de tus dientes y mejora tu mordida con tecnología ortodóncica moderna. Aprovecha 15% de descuento en brackets convencionales y autoligables.',
    priceOptions: [
      {
        label: 'BRACKETS CONVENCIONALES',
        price: 'S/ 1,020',
        normalPrice: 'S/ 1,200',
        featured: false,
        badge: '15% OFF (AHORRA S/ 180)'
      },
      {
        label: 'BRACKETS AUTOLIGABLES',
        price: 'S/ 1,275',
        normalPrice: 'S/ 1,500',
        featured: true,
        badge: '15% OFF (AHORRA S/ 225)'
      }
    ],
    schedule: [
      'Lunes a Sábado: 10:00 AM – 8:00 PM',
      'Domingos: Previa cita'
    ],
    includes: [
      'Estudio fotográfico y diagnóstico cefalométrico',
      'Instalación completa de aparatología ortodóncica',
      'Kit inicial de cepillos especiales para ortodoncia',
      'Plan de financiamiento en cómodas cuotas mensuales'
    ],
    ctaText: 'CONSULTAR ORTODONCIA 15% OFF',
    ctaSubtext: 'Evaluación de mordida y sonrisa incluida',
    whatsappMessage: '¡Hola MIADENT! Deseo consultar por la promoción de Ortodoncia (15% OFF).'
  },

  protesisDental: {
    id: 'protesis-20-off',
    brand: 'MIADENT',
    category: 'REHABILITACIÓN ORAL',
    title: 'PRÓTESIS DENTAL 20% OFF',
    subtitle: 'Prótesis Total y Parcial Removible con 20% de Descuento',
    image: 'https://i.imgur.com/Yhsj2X9.jpeg',
    accentColor: '#4A154B',
    themeClass: 'primary-promo-theme',
    description: 'Recupera la seguridad al comer, hablar y sonreír con prótesis anatómicas de ajuste preciso y materiales bio-compatibles.',
    priceOptions: [
      {
        label: 'PRÓTESIS TOTAL',
        price: 'S/ 720',
        normalPrice: 'S/ 900',
        featured: false,
        badge: '20% OFF (AHORRA S/ 180)'
      },
      {
        label: 'PRÓTESIS PARCIAL REMOVIBLE',
        price: 'S/ 960',
        normalPrice: 'S/ 1,200',
        featured: true,
        badge: '20% OFF (AHORRA S/ 240)'
      }
    ],
    schedule: [
      'Lunes a Sábado: 10:00 AM – 8:00 PM',
      'Domingos: Previa cita'
    ],
    includes: [
      'Toma de impresiones anatómicas de alta precisión',
      'Prueba de estructura, oclusión y selección de tono natural',
      'Ajuste oclusal personalizado y pulido de alto brillo',
      'Controles de adaptación sin costo adicional'
    ],
    ctaText: 'SOLICITAR INFORMACIÓN PRÓTESIS',
    ctaSubtext: 'Materiales bio-compatibles de alta durabilidad',
    whatsappMessage: '¡Hola MIADENT! Deseo información sobre la promoción de prótesis dental.'
  }
};

/**
 * 6 Specialty Dental Treatments Dataset
 */
const SPECIALTY_SERVICES_DATA = [
  {
    key: 'limpieza',
    name: 'Limpieza Dental (Profilaxis y Ultrasonido)',
    category: 'Prevención & Salud Gingival',
    iconClass: 'fa-solid fa-tooth',
    shortDescription: 'Remoción profunda de sarro supra y subgingival, manchas externas y pulido con pasta diamantada.',
    fullDescription: 'La profilaxis con cavitador ultrasónico previene la gingivitis y periodontitis, dejando los dientes limpios sin desgastar el esmalte.',
    keyBenefits: ['Sin dolor ni vibraciones molestas', 'Encías sanas sin sangrado', 'Aliento fresco y pulido suave'],
    whatsappHook: '¡Hola MIADENT! Deseo agendar una cita para Limpieza Dental.'
  },
  {
    key: 'restauraciones',
    name: 'Restauraciones Dentales (Curaciones Estéticas)',
    category: 'Operatoria Dental & Estética',
    iconClass: 'fa-solid fa-wand-magic-sparkles',
    shortDescription: 'Curación de caries y reparación de fracturas con resinas compuestas de fotocurado del tono exacto de tus dientes.',
    fullDescription: 'Reemplaza amalgamas oscuras o cura caries activas mediante grabado ácido y resinas nanoparticuladas de alta resistencia.',
    keyBenefits: ['Acabado estético invisible', 'Adhesión micromecánica duradera', 'Recuperación anatómica funcional'],
    whatsappHook: '¡Hola MIADENT! Deseo agendar una cita para Restauraciones Dentales.'
  },
  {
    key: 'blanqueamiento',
    name: 'Blanqueamiento Dental Profesional',
    category: 'Estética de la Sonrisa',
    iconClass: 'fa-regular fa-face-smile-beam',
    shortDescription: 'Tratamiento estético de aclaramiento dental en consultorio fotoactivado por luz LED de última generación.',
    fullDescription: 'Reduce hasta 4 tonos de pigmentación dental en una sola sesión de 45 minutos bajo aislamiento gingival seguro.',
    keyBenefits: ['Resultados visibles desde la 1ra sesión', 'Protocolo anti-sensibilidad con nitrato de potasio', 'Sonrisa brillante y rejuvenecida'],
    whatsappHook: '¡Hola MIADENT! Deseo agendar una cita para Blanqueamiento Dental.'
  },
  {
    key: 'extracciones',
    name: 'Extracciones Dentales (Simples y Terceros Molares)',
    category: 'Cirugía Oral Menor',
    iconClass: 'fa-solid fa-shield-halved',
    shortDescription: 'Extracción segura e indolora de piezas no restaurables o muelas del juicio con anestesia local controlada.',
    fullDescription: 'Procedimientos mínimamente invasivos realizados bajo estrictos protocolos de asepsia y medicación postoperatoria preventiva.',
    keyBenefits: ['Anestesia local sin dolor', 'Recuperación rápida y monitoreada', 'Prevención de apiñamiento por muelas del juicio'],
    whatsappHook: '¡Hola MIADENT! Deseo agendar una cita para Extracciones Dentales.'
  },
  {
    key: 'ortodoncia',
    name: 'Ortodoncia y Alineación Dental',
    category: 'Corrección Oclusal',
    iconClass: 'fa-solid fa-arrows-split-up-and-left',
    shortDescription: 'Diagnóstico y alineación de dientes apiñados o mordida alterada con brackets convencionales o autoligables.',
    fullDescription: 'Planificación cefalométrica integral que restablece la armonía facial y la función masticatoria óptima.',
    keyBenefits: ['Alineación estética permanente', 'Mejora en la mordida y digestión', 'Brackets convencionales y autoligables'],
    whatsappHook: '¡Hola MIADENT! Deseo agendar una cita para Ortodoncia.'
  },
  {
    key: 'preventiva',
    name: 'Odontología Preventiva (Sellantes y Flúor)',
    category: 'Cuidado Familiar y Pediátrico',
    iconClass: 'fa-solid fa-heart-pulse',
    shortDescription: 'Aplicación de sellantes en fosas y fisuras, barniz de flúor de alta concentración y asesoría en higiene bucal.',
    fullDescription: 'Protege las piezas dentales de niños y adultos creando una barrera protectora impermeable contra bacterias cariogénicas.',
    keyBenefits: ['Prevención activa antes de la aparición de caries', 'Procedimiento 100% no invasivo', 'Cuidado para toda la familia'],
    whatsappHook: '¡Hola MIADENT! Deseo agendar una cita para Odontología Preventiva.'
  }
];

/**
 * State variable for the currently selected plan
 */
let selectedPlan = null;

/**
 * Updates the reservation message box based on active tab and selected plan
 * @param {string} tabId 
 */
function updateReservationTextarea(tabId) {
  const textarea = document.getElementById('reservation-message-text');
  if (!textarea) return;

  let msg = '¡Hola MIADENT! Deseo información sobre citas y tratamientos odontológicos.';
  if (tabId === 'promociones') {
    msg = selectedPlan ? `¡Hola MIADENT! Deseo agendar la promoción para: ${selectedPlan}.` : '¡Hola MIADENT! Deseo agendar mi 1ra Consulta Gratis.';
  } else if (tabId === 'especialidades') {
    msg = '¡Hola MIADENT! Deseo consultar sobre los tratamientos de especialidad.';
  } else if (tabId === 'nosotros') {
    msg = '¡Hola Dra. Martiza! Deseo hacer una consulta directa sobre mi caso.';
  } else if (tabId === 'educacion') {
    msg = '¡Hola MIADENT! Deseo consultar por una evaluación preventiva de mi sonrisa.';
  } else if (tabId === 'contacto') {
    msg = '¡Hola MIADENT! Deseo coordinar mi llegada a la sede de Jesús María.';
  }
  textarea.value = msg;
}

/**
 * Renders a promotional flyer card HTML
 * @param {object} flyer 
 * @returns {string} HTML markup
 */
function renderPromoFlyer(flyer) {
  if (!flyer) return '';

  const optionsHtml = (flyer.priceOptions || []).map((opt, idx) => {
    const isFeatured = opt.featured ? 'featured' : '';
    const badgeHtml = opt.badge ? `<span class="option-badge">${opt.badge}</span>` : '';
    return `
      <div class="option-card ${isFeatured}" data-flyer-id="${flyer.id}" data-option-index="${idx}" data-option-label="${opt.label}">
        ${badgeHtml}
        <div class="option-header">
          <span class="option-label">${opt.label}</span>
          <div class="option-pricing">
            <span class="option-price">${opt.price}</span>
            <span class="option-normal-price">${opt.normalPrice}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const includesHtml = (flyer.includes || []).map(inc => `
    <li><i class="fa-solid fa-circle-check text-purple"></i> <span>${inc}</span></li>
  `).join('');

  const scheduleHtml = (flyer.schedule || []).map(sch => `
    <li><i class="fa-regular fa-clock text-gold"></i> <span>${sch}</span></li>
  `).join('');

  return `
    <article class="promo-card ${flyer.themeClass || ''}" id="flyer-card-${flyer.id}">
      <div class="promo-card-header">
        <div class="promo-badge-row">
          <span class="promo-tag">${flyer.category}</span>
          <span class="promo-brand">${flyer.brand}</span>
        </div>
        <h3 class="promo-card-title">${flyer.title}</h3>
        <p class="promo-card-subtitle">${flyer.subtitle}</p>
      </div>

      <div class="promo-card-body">
        <p class="promo-description">${flyer.description}</p>
        
        <div class="options-container" data-flyer-id="${flyer.id}">
          ${optionsHtml}
        </div>

        <div class="promo-inclusions">
          <h4 class="inclusions-title">Inclusiones del Tratamiento:</h4>
          <ul class="inclusions-list">
            ${includesHtml}
          </ul>
        </div>

        <div class="promo-schedule">
          <h4 class="schedule-title">Horarios de Atención:</h4>
          <ul class="schedule-list">
            ${scheduleHtml}
          </ul>
        </div>

        <div class="promo-cta-box">
          <button class="btn-promo-wa" onclick="openWhatsApp('${flyer.whatsappMessage}')">
            <i class="fa-brands fa-whatsapp"></i> ${flyer.ctaText}
          </button>
          <span class="promo-cta-subtext">${flyer.ctaSubtext}</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Mounts all promotional flyer cards into their respective DOM containers
 */
function mountFlyers() {
  const mountMappings = [
    { containerId: 'mount-consulta-gratis', dataKey: 'consultaGratis' },
    { containerId: 'mount-limpieza', dataKey: 'limpiezaDental' },
    { containerId: 'mount-ortodoncia', dataKey: 'ortodoncia' },
    { containerId: 'mount-protesis', dataKey: 'protesisDental' }
  ];

  mountMappings.forEach(mapping => {
    const container = document.getElementById(mapping.containerId);
    if (container && PROMO_FLYERS_DATA[mapping.dataKey]) {
      container.innerHTML = renderPromoFlyer(PROMO_FLYERS_DATA[mapping.dataKey]);
    }
  });

  // Attach event delegation for option card selection
  document.querySelectorAll('.options-container').forEach(container => {
    container.addEventListener('click', (e) => {
      const optionCard = e.target.closest('.option-card');
      if (!optionCard) return;

      const flyerId = optionCard.getAttribute('data-flyer-id');
      const label = optionCard.getAttribute('data-option-label');

      // Clear selection in this container
      container.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
      optionCard.classList.add('selected');

      selectedPlan = label;
      updateReservationTextarea('promociones');
    });
  });
}

/**
 * Initializes Tab Switching and Deep-Linking Navigation
 */
function initTabs() {
  const navBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(tabId) {
    navBtns.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      if (isActive) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    tabPanels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    selectedPlan = null;
    updateReservationTextarea(tabId);

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${tabId}`);
    } else {
      window.location.hash = `#${tabId}`;
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      if (targetTab) {
        switchTab(targetTab);
      }
    });
  });

  const validTabs = ['promociones', 'especialidades', 'nosotros', 'educacion', 'contacto'];
  let initialHash = window.location.hash ? window.location.hash.replace('#', '') : 'promociones';
  if (validTabs.indexOf(initialHash) === -1) {
    initialHash = 'promociones';
  }
  switchTab(initialHash);

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (validTabs.indexOf(hash) !== -1) {
      switchTab(hash);
    }
  });
}

/**
 * Opens high-resolution modal Lightbox viewer
 * @param {string} imgSrc 
 * @param {string} [captionText] 
 */
function openLightbox(imgSrc, captionText = '') {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption-text');
  if (!modal || !img) return;

  img.src = imgSrc;
  if (captionEl) {
    captionEl.textContent = captionText || 'Flyer Promocional Oficial MIADENT';
  }
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes high-resolution modal Lightbox viewer
 */
function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Global Keyboard & DOM Initialization
 */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  mountFlyers();
  initTabs();

  const dynamicWaBtn = document.getElementById('btn-send-whatsapp');
  if (dynamicWaBtn) {
    dynamicWaBtn.addEventListener('click', () => {
      const textarea = document.getElementById('reservation-message-text');
      const msg = textarea ? textarea.value : '';
      openWhatsApp(msg);
    });
  }
});
