# MIADENT — Centro Odontológico (Jesús María)
> Aplicación Web Catálogo SPA (Single Page Application) Mobile-First de Alta Conversión.

Esta plataforma digital fusiona la velocidad y el diseño responsivo orientado a conversión de **Gym Flyer App Template** con el estándar de autoridad médica y confianza clínica de **Multident**.

## 🌟 Características Principales
- **Top Bar Clínico:** Información de horarios de atención (L-V 9am–7pm / Sáb 9am–1pm), teléfono directo (902 103 429) y badge de atención inmediata.
- **Navegación SPA por Pestañas:** Transición instantánea sin recarga de página entre:
  - **Promociones:** 1ra Consulta Gratis, Limpieza 40% OFF, Ortodoncia 15% OFF y Prótesis 20% OFF con cálculo dinámico de mensajes.
  - **Especialidades:** Limpieza, Restauraciones, Blanqueamiento, Extracciones, Ortodoncia y Odontología Preventiva.
  - **Nosotros:** Presentación de la Dra. Martiza y los 4 pilares de confianza clínica.
  - **Educación & Sonrisas:** Tips preventivos y desmentido de mitos con @DIENTITO y @DRA.MARTIZA.
  - **Sede & Contacto:** Av. Horacio Urteaga 1392, Jesús María con iframe interactivo oficial de Google Maps.
- **Visor Lightbox en Pantalla Completa:** Permite ampliar el flyer publicitario oficial en alta resolución.
- **Botón Flotante Permanente de WhatsApp:** Con animación de disponibilidad y enrutamiento con texto contextual pre-rellenado y codificado.
- **Cero Dependencias Pesadas:** Construido con Vanilla HTML5, CSS3 modular (:root) y Vanilla JavaScript ES6+. Carga en <300ms.
- **SEO Local Completo:** Marcado estructurado Schema.org JSON-LD (Dentist / LocalBusiness), Open Graph, Twitter Cards, obots.txt y sitemap.xml.

## 📁 Estructura del Repositorio
`
miadent/
├── index.html              # Documento principal semántico y accesible
├── styles.css              # Sistema de diseño violeta profundo, lavanda y marfil
├── app.js                  # Lógica SPA, dataset de promociones, lightbox y WhatsApp
├── robots.txt              # Directivas para rastreadores de motores de búsqueda
├── sitemap.xml             # Mapa del sitio para Google Search Console
├── README.md               # Documentación del proyecto
├── .gitignore              # Exclusiones de control de versiones
└── tests/
    └── test_miadent_spa.py # Suite E2E de 68 pruebas automatizadas
`

## 🧪 Pruebas Automatizadas
Para ejecutar la suite de verificación automatizada:
`ash
python tests/test_miadent_spa.py
`

## 🚀 Despliegue Local
Para previsualizar la web localmente:
`ash
python -m http.server 8080
`
Y abrir http://localhost:8080 en cualquier navegador.
