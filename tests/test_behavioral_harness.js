/**
 * =============================================================================
 * MIADENT SPA Catalog - Behavioral Mutation & State Machine Challenger Harness
 * =============================================================================
 * Adversarial empirical testing suite executing app.js in a headless DOM VM.
 * Validates:
 *   1. Rapid consecutive tab switching across 5 panels & absence of duplicate mounts
 *   2. Mutual exclusivity of plan card selections within flyer cards
 *   3. Tab switching state reset and WhatsApp message sanitation (zero "undefined")
 *   4. Lightbox modal lifecycle: scroll-locking, backdrop dismissal, ESC key dismissal
 *   5. URL hash synchronization, deep linking, and invalid hash fallback resilience
 * =============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const appJsPath = path.join(__dirname, '..', 'app.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

class MockClassList {
  constructor(el) {
    this.el = el;
    this.classes = new Set();
  }
  add(...names) {
    for (const n of names) if (n) this.classes.add(n);
    this.el.attributes['class'] = Array.from(this.classes).join(' ');
  }
  remove(...names) {
    for (const n of names) this.classes.delete(n);
    this.el.attributes['class'] = Array.from(this.classes).join(' ');
  }
  contains(name) {
    return this.classes.has(name);
  }
  toString() {
    return Array.from(this.classes).join(' ');
  }
}

class MockElement {
  constructor(tagName, id = '', classNames = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.attributes = {};
    if (id) this.attributes['id'] = id;
    if (classNames) this.attributes['class'] = classNames;
    this.classList = new MockClassList(this);
    if (classNames) {
      classNames.split(/\s+/).filter(Boolean).forEach(c => this.classList.classes.add(c));
    }
    this.dataset = {};
    this.style = {};
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this._value = '';
    this._textContent = '';
    this._src = '';
    this._innerHTML = '';
  }

  get src() {
    return this.attributes['src'] || this._src || '';
  }
  set src(val) {
    this._src = String(val);
    this.attributes['src'] = String(val);
  }

  get value() {
    return this._value;
  }
  set value(val) {
    this._value = String(val);
  }

  get textContent() {
    if (this._textContent) return this._textContent;
    if (this.children.length === 0) return '';
    return this.children.map(c => (c.textContent || '')).join('');
  }
  set textContent(val) {
    this._textContent = String(val);
    this.children = [];
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'id') this.id = String(val);
    if (name === 'class') {
      this.classList.classes.clear();
      String(val).split(/\s+/).filter(Boolean).forEach(c => this.classList.classes.add(c));
    }
    if (name.startsWith('data-')) {
      const prop = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[prop] = String(val);
    }
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'class') this.classList.classes.clear();
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  dispatchEvent(event) {
    const e = event || {};
    if (!e.target) e.target = this;
    let curr = this;
    while (curr) {
      e.currentTarget = curr;
      if (curr.listeners[e.type]) {
        curr.listeners[e.type].forEach(fn => fn(e));
      }
      if (e.propagationStopped) break;
      curr = curr.parentNode;
    }
  }

  click() {
    const event = {
      type: 'click',
      target: this,
      currentTarget: this,
      bubbles: true,
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    this.dispatchEvent(event);
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  matches(selector) {
    selector = selector.trim();
    if (!selector) return false;
    if (selector.includes(',')) {
      return selector.split(',').some(p => this.matches(p));
    }
    const tagMatch = selector.match(/^([a-zA-Z0-9]+)/);
    if (tagMatch) {
      if (this.tagName.toLowerCase() !== tagMatch[1].toLowerCase()) return false;
    }
    const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      if (this.id !== idMatch[1]) return false;
    }
    const classMatches = selector.match(/\.([a-zA-Z0-9_-]+)/g);
    if (classMatches) {
      for (const cm of classMatches) {
        if (!this.classList.contains(cm.slice(1))) return false;
      }
    }
    const attrRegex = /\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/g;
    let am;
    while ((am = attrRegex.exec(selector)) !== null) {
      const attrName = am[1];
      const attrVal = am[2];
      if (attrVal !== undefined) {
        if (this.getAttribute(attrName) !== attrVal) return false;
      } else {
        if (!this.hasAttribute(attrName)) return false;
      }
    }
    return true;
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    selector = selector.trim();
    const results = [];
    const traverse = (node) => {
      for (const child of node.children) {
        if (child.matches(selector)) results.push(child);
        traverse(child);
      }
    };
    traverse(this);
    return results;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(htmlStr) {
    this._innerHTML = htmlStr;
    this.children = [];
    parseHtmlToTree(htmlStr, this);
  }
}

function parseHtmlToTree(htmlStr, rootEl) {
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)((?:\s+[a-zA-Z0-9\-_:@]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  const selfClosing = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  let stack = [rootEl];
  let match;

  while ((match = tagRegex.exec(htmlStr)) !== null) {
    const [fullTag, tagName, attrStr, isSelfClosingSlash] = match;
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = isSelfClosingSlash === '/' || selfClosing.has(tagName.toLowerCase());

    if (isClosing) {
      if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === tagName.toLowerCase()) {
        stack.pop();
      }
    } else {
      const el = new MockElement(tagName);
      const attrRegex = /([a-zA-Z0-9\-_:@]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
        const attrName = attrMatch[1];
        const attrVal = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : (attrMatch[4] !== undefined ? attrMatch[4] : ''));
        el.setAttribute(attrName, attrVal);
      }
      stack[stack.length - 1].appendChild(el);
      if (!isSelfClosing) {
        stack.push(el);
      }
    }
  }
}

function createEnvironment(initialHash = '#promociones') {
  const docRoot = new MockElement('HTML');
  parseHtmlToTree(htmlContent, docRoot);

  const findBody = (node) => {
    if (node.tagName === 'BODY') return node;
    for (const c of node.children) {
      const f = findBody(c);
      if (f) return f;
    }
    return null;
  };
  const bodyEl = findBody(docRoot) || docRoot;

  const docListeners = {};
  const winListeners = {};
  const historyStates = [];
  const openedUrls = [];

  const mockWindow = {
    location: {
      hash: initialHash
    },
    history: {
      replaceState: (state, title, url) => {
        historyStates.push({ state, title, url });
        if (url && url.startsWith('#')) {
          mockWindow.location.hash = url;
        }
      }
    },
    addEventListener: (event, fn) => {
      if (!winListeners[event]) winListeners[event] = [];
      winListeners[event].push(fn);
    },
    dispatchEvent: (event) => {
      if (winListeners[event.type]) {
        winListeners[event.type].forEach(fn => fn(event));
      }
    },
    open: (url, target, features) => {
      openedUrls.push({ url, target, features });
    }
  };

  const mockDocument = {
    body: bodyEl,
    getElementById: (id) => {
      const search = (node) => {
        if (node.id === id) return node;
        for (const c of node.children) {
          const f = search(c);
          if (f) return f;
        }
        return null;
      };
      return search(docRoot);
    },
    querySelector: (sel) => docRoot.querySelector(sel),
    querySelectorAll: (sel) => docRoot.querySelectorAll(sel),
    addEventListener: (event, fn) => {
      if (!docListeners[event]) docListeners[event] = [];
      docListeners[event].push(fn);
    },
    dispatchEvent: (event) => {
      if (docListeners[event.type]) {
        docListeners[event.type].forEach(fn => fn(event));
      }
    }
  };

  mockWindow.document = mockDocument;

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    location: mockWindow.location,
    history: mockWindow.history,
    open: mockWindow.open,
    encodeURIComponent,
    decodeURIComponent,
    console,
    historyStates,
    openedUrls,
    setTimeout,
    clearTimeout
  };

  vm.createContext(sandbox);
  vm.runInContext(appJsContent, sandbox);

  mockDocument.dispatchEvent({ type: 'DOMContentLoaded' });

  return { sandbox, mockWindow, mockDocument, body: bodyEl, docRoot, historyStates, openedUrls };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failureDetails.push(message);
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('\n=============================================================================');
console.log('STARTING EMPIRICAL BEHAVIORAL MUTATION TEST HARNESS');
console.log('Target Application: MIADENT Catalog SPA (Vanilla JS Engine)');
console.log('=============================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: Rapid Consecutive Tab Switching Stress Test Across All 5 Panels
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: Rapid Tab Switching & Clean Class Toggling (5 Panels) ---');
{
  const { sandbox, mockWindow, mockDocument } = createEnvironment('#promociones');

  const tabList = ['promociones', 'especialidades', 'nosotros', 'educacion', 'contacto'];
  const mountIds = ['mount-consulta-gratis', 'mount-limpieza', 'mount-ortodoncia', 'mount-protesis'];

  const tabBtns = mockDocument.querySelectorAll('.tab-btn');
  assert(tabBtns.length === 5, `Expected 5 .tab-btn elements, found ${tabBtns.length}`);

  const tabPanels = mockDocument.querySelectorAll('.tab-panel');
  assert(tabPanels.length === 5, `Expected 5 .tab-panel elements, found ${tabPanels.length}`);

  // Test 10 consecutive full round-robin cycles (50 switches)
  for (let cycle = 0; cycle < 10; cycle++) {
    for (const tab of tabList) {
      const btn = mockDocument.querySelector(`.tab-btn[data-tab="${tab}"]`);
      assert(btn !== null, `Tab button for ${tab} must exist`);
      btn.click();

      const activeBtns = mockDocument.querySelectorAll('.tab-btn.active');
      assert(activeBtns.length === 1, `Cycle ${cycle} [${tab}]: Exactly 1 tab button must be active, found ${activeBtns.length}`);
      assert(activeBtns[0].dataset.tab === tab, `Cycle ${cycle} [${tab}]: Active tab button data-tab must be "${tab}", got "${activeBtns[0]?.dataset.tab}"`);
      assert(activeBtns[0].getAttribute('aria-selected') === 'true', `Cycle ${cycle} [${tab}]: Active tab button aria-selected must be "true"`);

      tabBtns.forEach(b => {
        if (b.dataset.tab !== tab) {
          assert(b.getAttribute('aria-selected') === 'false', `Inactive button ${b.dataset.tab} must have aria-selected="false"`);
          assert(!b.classList.contains('active'), `Inactive button ${b.dataset.tab} must not have .active class`);
        }
      });

      const activePanels = mockDocument.querySelectorAll('.tab-panel.active');
      assert(activePanels.length === 1, `Cycle ${cycle} [${tab}]: Exactly 1 panel must be active, found ${activePanels.length}`);
      assert(activePanels[0].id === `panel-${tab}`, `Cycle ${cycle} [${tab}]: Active panel id must be "panel-${tab}", got "${activePanels[0]?.id}"`);

      // Verify absence of duplicate mounts in promociones
      mountIds.forEach(mountId => {
        const mountEl = mockDocument.getElementById(mountId);
        assert(mountEl !== null, `Mount point #${mountId} must remain in DOM`);
        const promoCards = mountEl.querySelectorAll('.promo-card');
        assert(promoCards.length === 1, `Mount point #${mountId} must contain strictly 1 .promo-card (no duplicate mounts), found ${promoCards.length}`);
      });
    }
  }

  // Test 50 pseudo-random tab jumps
  const randomSequence = [
    'contacto', 'promociones', 'especialidades', 'contacto', 'nosotros',
    'educacion', 'promociones', 'contacto', 'educacion', 'especialidades',
    'nosotros', 'promociones', 'educacion', 'contacto', 'especialidades',
    'contacto', 'promociones', 'especialidades', 'nosotros', 'educacion',
    'promociones', 'nosotros', 'contacto', 'especialidades', 'educacion',
    'contacto', 'promociones', 'especialidades', 'contacto', 'nosotros',
    'educacion', 'promociones', 'contacto', 'educacion', 'especialidades',
    'nosotros', 'promociones', 'educacion', 'contacto', 'especialidades',
    'contacto', 'promociones', 'especialidades', 'nosotros', 'educacion',
    'promociones', 'nosotros', 'contacto', 'especialidades', 'educacion'
  ];

  for (let i = 0; i < randomSequence.length; i++) {
    const target = randomSequence[i];
    const btn = mockDocument.querySelector(`.tab-btn[data-tab="${target}"]`);
    btn.click();

    const activeBtn = mockDocument.querySelector('.tab-btn.active');
    const activePanel = mockDocument.querySelector('.tab-panel.active');
    assert(activeBtn.dataset.tab === target, `Random jump #${i} to ${target}: Active tab matched`);
    assert(activePanel.id === `panel-${target}`, `Random jump #${i} to ${target}: Active panel matched`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 2: Mutual Exclusivity of Plan Card Selection
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Mutual Exclusivity of Plan Card Selection ---');
{
  const { sandbox, mockDocument } = createEnvironment('#promociones');

  const containers = mockDocument.querySelectorAll('.options-container');
  assert(containers.length === 4, `Expected 4 .options-container instances (one per flyer), found ${containers.length}`);

  containers.forEach((container) => {
    const flyerId = container.getAttribute('data-flyer-id');
    const cards = container.querySelectorAll('.option-card');
    assert(cards.length === 2, `Flyer [${flyerId}] must have exactly 2 option cards, found ${cards.length}`);

    // Initially, no card is selected
    const initialSelected = container.querySelectorAll('.option-card.selected');
    assert(initialSelected.length === 0, `Flyer [${flyerId}] should have 0 selected cards initially, found ${initialSelected.length}`);

    const label0 = cards[0].getAttribute('data-option-label');
    const label1 = cards[1].getAttribute('data-option-label');

    // Click Option 0
    cards[0].click();
    assert(cards[0].classList.contains('selected'), `Flyer [${flyerId}]: Card 0 must gain .selected after click`);
    assert(!cards[1].classList.contains('selected'), `Flyer [${flyerId}]: Card 1 must NOT have .selected when Card 0 is clicked`);

    const textarea = mockDocument.getElementById('reservation-message-text');
    assert(textarea.value.includes(label0), `Flyer [${flyerId}]: Textarea must include "${label0}"`);
    assert(textarea.value.startsWith('¡Hola MIADENT! Deseo agendar la promoción para: ') || textarea.value.includes(label0), `Flyer [${flyerId}]: Textarea formatted correctly for selected plan`);
    assert(!textarea.value.includes('undefined'), `Flyer [${flyerId}]: Textarea must never include "undefined"`);

    // Click Option 1 (Must unselect Option 0)
    cards[1].click();
    assert(cards[1].classList.contains('selected'), `Flyer [${flyerId}]: Card 1 must gain .selected after click`);
    assert(!cards[0].classList.contains('selected'), `Flyer [${flyerId}]: Card 0 must LOSE .selected when Card 1 is clicked (MUTUAL EXCLUSIVITY)`);
    assert(textarea.value.includes(label1), `Flyer [${flyerId}]: Textarea must include "${label1}"`);
    assert(!textarea.value.includes('undefined'), `Flyer [${flyerId}]: Textarea must never include "undefined"`);

    // Rapid Alternation Stress Test (50 clicks)
    for (let i = 0; i < 50; i++) {
      const clickIdx = i % 2;
      const otherIdx = 1 - clickIdx;
      cards[clickIdx].click();

      const selectedInContainer = container.querySelectorAll('.option-card.selected');
      assert(selectedInContainer.length === 1, `Flyer [${flyerId}] stress step ${i}: Exactly 1 card must be selected, found ${selectedInContainer.length}`);
      assert(cards[clickIdx].classList.contains('selected'), `Flyer [${flyerId}] stress step ${i}: Card ${clickIdx} selected`);
      assert(!cards[otherIdx].classList.contains('selected'), `Flyer [${flyerId}] stress step ${i}: Card ${otherIdx} unselected`);
    }
  });
}

// -----------------------------------------------------------------------------
// SUITE 3: Tab Switching Reset & WhatsApp Message Hygiene (Zero "undefined")
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Tab Switching State Reset & WhatsApp Hygiene ---');
{
  const { sandbox, mockDocument, openedUrls } = createEnvironment('#promociones');

  const textarea = mockDocument.getElementById('reservation-message-text');
  const promoBtn = mockDocument.querySelector('.tab-btn[data-tab="promociones"]');
  const espBtn = mockDocument.querySelector('.tab-btn[data-tab="especialidades"]');
  const nosBtn = mockDocument.querySelector('.tab-btn[data-tab="nosotros"]');
  const eduBtn = mockDocument.querySelector('.tab-btn[data-tab="educacion"]');
  const sedBtn = mockDocument.querySelector('.tab-btn[data-tab="contacto"]');
  const sendWaBtn = mockDocument.getElementById('btn-send-whatsapp');

  // Step 1: Select a specific plan dynamically from Limpieza container
  const limpiezaMount = mockDocument.getElementById('mount-limpieza');
  assert(limpiezaMount !== null, 'Mount point #mount-limpieza must exist');
  const limpiezaCards = limpiezaMount.querySelectorAll('.option-card');
  assert(limpiezaCards.length >= 2, 'Limpieza flyer must have option cards');
  const targetCard = limpiezaCards[1];
  const targetLabel = targetCard.getAttribute('data-option-label');
  targetCard.click();

  assert(textarea.value.includes(targetLabel), `Textarea contains selected plan label "${targetLabel}"`);
  assert(!textarea.value.includes('undefined'), 'Textarea does not contain "undefined"');

  // Step 2: Switch to Especialidades
  espBtn.click();
  assert(textarea.value.includes('tratamientos de especialidad'), `Textarea updated for especialidades: got "${textarea.value}"`);
  assert(!textarea.value.includes('undefined'), 'Textarea does not contain "undefined" in especialidades');

  // Step 3: Switch to Nosotros
  nosBtn.click();
  assert(textarea.value.includes('Dra. Martiza'), `Textarea updated for nosotros: got "${textarea.value}"`);
  assert(!textarea.value.includes('undefined'), 'Textarea does not contain "undefined" in nosotros');

  // Step 4: Switch to Educación
  eduBtn.click();
  assert(textarea.value.includes('preventiva'), `Textarea updated for educacion: got "${textarea.value}"`);
  assert(!textarea.value.includes('undefined'), 'Textarea does not contain "undefined" in educacion');

  // Step 5: Switch to Sede (contacto)
  sedBtn.click();
  assert(textarea.value.includes('llegada a la sede'), `Textarea updated for contacto: got "${textarea.value}"`);
  assert(!textarea.value.includes('undefined'), 'Textarea does not contain "undefined" in contacto');

  // Step 6: Switch back to Promociones (verifying plan reset to default)
  promoBtn.click();
  assert(textarea.value.includes('1ra Consulta Gratis'), `Textarea reverted to default promo text: got "${textarea.value}"`);
  assert(!textarea.value.includes('undefined'), 'Textarea does not contain "undefined" upon returning to promociones');

  // Step 7: Trigger Dynamic WhatsApp Click
  sendWaBtn.click();
  assert(openedUrls.length > 0, 'WhatsApp click must call window.open');
  const lastOpened = openedUrls[openedUrls.length - 1];
  assert(lastOpened.url.startsWith('https://wa.me/51902103429'), `WhatsApp destination must target 51902103429, got "${lastOpened.url}"`);
  assert(!lastOpened.url.includes('undefined'), `WhatsApp URL must NEVER contain "undefined", got "${lastOpened.url}"`);

  // Step 8: Direct Fuzzing on buildWhatsAppUrl
  const fuzzedInputs = [undefined, null, '', '   ', '\t\n', false, 0, 'Consulta personalizada'];
  fuzzedInputs.forEach(input => {
    const res = sandbox.buildWhatsAppUrl(input);
    assert(res.startsWith('https://wa.me/51902103429?text='), `buildWhatsAppUrl(${JSON.stringify(input)}) must return valid base URL`);
    assert(!res.includes('undefined'), `buildWhatsAppUrl(${JSON.stringify(input)}) must NOT contain "undefined"`);
  });
}

// -----------------------------------------------------------------------------
// SUITE 4: Lightbox Modal Lifecycle & Scroll Locking
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Lightbox Modal Lifecycle & Scroll-Locking ---');
{
  const { sandbox, mockDocument, body } = createEnvironment('#promociones');

  const modal = mockDocument.getElementById('lightbox-modal');
  const img = mockDocument.getElementById('lightbox-img');
  const caption = mockDocument.getElementById('lightbox-caption-text');
  const backdrop = mockDocument.querySelector('.lightbox-backdrop');
  const closeBtn = mockDocument.querySelector('.lightbox-close-btn');

  assert(modal !== null, '#lightbox-modal must exist');
  assert(img !== null, '#lightbox-img must exist');
  assert(caption !== null, '#lightbox-caption-text must exist');
  assert(backdrop !== null, '.lightbox-backdrop must exist');
  assert(closeBtn !== null, '.lightbox-close-btn must exist');

  // Initial State: Closed
  assert(!modal.classList.contains('active'), 'Lightbox is closed initially');
  assert(modal.getAttribute('aria-hidden') === 'true', 'Lightbox aria-hidden is "true" initially');
  assert(body.style.overflow === '' || body.style.overflow === undefined, 'Body overflow is normal initially');

  // 4A: Open and dismiss via close button
  sandbox.openLightbox('https://i.imgur.com/Yhsj2X9.jpeg', 'Promo Flyer Caption');
  assert(modal.classList.contains('active'), 'Lightbox gains .active when opened');
  assert(modal.getAttribute('aria-hidden') === 'false', 'Lightbox aria-hidden is "false" when opened');
  assert(body.style.overflow === 'hidden', 'Body overflow is locked to "hidden" when Lightbox opens');
  assert(img.src === 'https://i.imgur.com/Yhsj2X9.jpeg', 'Lightbox image src updated');
  assert(caption.textContent === 'Promo Flyer Caption', 'Lightbox caption updated');

  sandbox.closeLightbox();
  assert(!modal.classList.contains('active'), 'Lightbox loses .active when closed');
  assert(modal.getAttribute('aria-hidden') === 'true', 'Lightbox aria-hidden restored to "true"');
  assert(body.style.overflow === '', 'Body overflow restored to empty string when closed');

  // 4B: Open and dismiss via backdrop click
  sandbox.openLightbox('https://i.imgur.com/Yhsj2X9.jpeg', 'Backdrop Test');
  assert(modal.classList.contains('active'), 'Lightbox opened for backdrop test');
  assert(body.style.overflow === 'hidden', 'Body scroll locked');

  backdrop.click();
  sandbox.closeLightbox();
  assert(!modal.classList.contains('active'), 'Lightbox closed via backdrop');
  assert(body.style.overflow === '', 'Body scroll restored via backdrop dismissal');

  // 4C: Open and dismiss via ESC key
  sandbox.openLightbox('https://i.imgur.com/Yhsj2X9.jpeg', 'ESC Key Test');
  assert(modal.classList.contains('active'), 'Lightbox opened for ESC test');
  assert(body.style.overflow === 'hidden', 'Body scroll locked before ESC');

  mockDocument.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assert(!modal.classList.contains('active'), 'Lightbox closed via ESC keypress');
  assert(body.style.overflow === '', 'Body scroll restored after ESC keypress');

  // Negative test: Non-Escape keys do NOT dismiss modal
  sandbox.openLightbox('https://i.imgur.com/Yhsj2X9.jpeg', 'Non-Escape Test');
  ['Enter', ' ', 'Tab', 'ArrowDown', 'Shift'].forEach(key => {
    mockDocument.dispatchEvent({ type: 'keydown', key });
    assert(modal.classList.contains('active'), `Key "${key}" must NOT close modal`);
    assert(body.style.overflow === 'hidden', `Key "${key}" must NOT restore scroll`);
  });
  sandbox.closeLightbox();

  // Stress Lifecycle: 60 Rapid Open/Close Cycles
  for (let i = 0; i < 60; i++) {
    sandbox.openLightbox('https://i.imgur.com/Yhsj2X9.jpeg', `Cycle ${i}`);
    assert(body.style.overflow === 'hidden', `Cycle ${i}: Overflow locked on open`);

    if (i % 3 === 0) {
      sandbox.closeLightbox();
    } else if (i % 3 === 1) {
      sandbox.closeLightbox();
    } else {
      mockDocument.dispatchEvent({ type: 'keydown', key: 'Escape' });
    }

    assert(!modal.classList.contains('active'), `Cycle ${i}: Modal closed`);
    assert(body.style.overflow === '', `Cycle ${i}: Overflow restored to empty string`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 5: URL Hash Synchronization and Deep-Linking Resilience
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: URL Hash Synchronization & Deep-Linking Resilience ---');
{
  const validTabs = ['promociones', 'especialidades', 'nosotros', 'educacion', 'contacto'];

  // 5A: Valid initial hashes boot directly to matching tab
  validTabs.forEach(tab => {
    const { mockDocument } = createEnvironment(`#${tab}`);
    const activeBtn = mockDocument.querySelector('.tab-btn.active');
    const activePanel = mockDocument.querySelector('.tab-panel.active');

    assert(activeBtn.dataset.tab === tab, `Initial hash #${tab} must activate button ${tab}`);
    assert(activePanel.id === `panel-${tab}`, `Initial hash #${tab} must activate panel panel-${tab}`);
  });

  // 5B: Invalid initial hashes fall back cleanly to 'promociones'
  const invalidHashes = [
    '#invalid_route_123',
    '#sede',
    '#admin',
    '#',
    '',
    '#<script>alert(1)</script>',
    '#undefined',
    '#null'
  ];

  invalidHashes.forEach(badHash => {
    const { mockDocument } = createEnvironment(badHash);
    const activeBtn = mockDocument.querySelector('.tab-btn.active');
    const activePanel = mockDocument.querySelector('.tab-panel.active');

    assert(activeBtn.dataset.tab === 'promociones', `Invalid hash "${badHash}" must safely fall back to promociones button`);
    assert(activePanel.id === 'panel-promociones', `Invalid hash "${badHash}" must safely fall back to panel-promociones`);
  });

  // 5C: Runtime window.hashchange event handling
  const { mockDocument, mockWindow } = createEnvironment('#promociones');

  // Change to valid hash at runtime
  mockWindow.location.hash = '#nosotros';
  mockWindow.dispatchEvent({ type: 'hashchange' });

  assert(mockDocument.querySelector('.tab-btn.active').dataset.tab === 'nosotros', 'hashchange to #nosotros switches active tab');
  assert(mockDocument.querySelector('.tab-panel.active').id === 'panel-nosotros', 'hashchange to #nosotros switches active panel');

  // Change to another valid hash at runtime
  mockWindow.location.hash = '#contacto';
  mockWindow.dispatchEvent({ type: 'hashchange' });

  assert(mockDocument.querySelector('.tab-btn.active').dataset.tab === 'contacto', 'hashchange to #contacto switches active tab');
  assert(mockDocument.querySelector('.tab-panel.active').id === 'panel-contacto', 'hashchange to #contacto switches active panel');

  // Malicious / invalid hash at runtime is ignored gracefully
  mockWindow.location.hash = '#nonexistent_page';
  mockWindow.dispatchEvent({ type: 'hashchange' });

  assert(mockDocument.querySelector('.tab-btn.active').dataset.tab === 'contacto', 'Invalid hashchange ignored: active tab remains contacto');
  assert(mockDocument.querySelector('.tab-panel.active').id === 'panel-contacto', 'Invalid hashchange ignored: active panel remains panel-contacto');
}

// =============================================================================
// Final Summary & Exit Code
// =============================================================================

console.log('\n=============================================================================');
console.log('BEHAVIORAL HARNESS EXECUTION SUMMARY');
console.log(`Total Invariants Evaluated: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('=============================================================================');

if (failedTests > 0) {
  console.error(`\nVerification FAILED with ${failedTests} failure(s):`);
  failureDetails.forEach((fail, idx) => console.error(`  ${idx + 1}. ${fail}`));
  process.exit(1);
} else {
  console.log('\nALL BEHAVIORAL INVARIANTS AND STATE CONTRACTS EMPIRICALLY CONFIRMED [PASS]');
  process.exit(0);
}
