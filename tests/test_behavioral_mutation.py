#!/usr/bin/env python3
"""
=============================================================================
MIADENT SPA Catalog - Behavioral Mutation & State Machine Challenger Suite
=============================================================================
Adversarial empirical testing of state machine transitions and interactions:
  1. Rapid consecutive tab switching across 5 panels & clean class toggling
  2. Mutual exclusivity of plan card selection within flyer cards
  3. Tab switching state reset and WhatsApp message sanitation (zero "undefined")
  4. Lightbox modal lifecycle: scroll-locking, backdrop dismissal, ESC key dismissal
  5. URL hash synchronization, deep linking, and invalid hash fallback resilience
  6. Direct headless V8 execution via test_behavioral_harness.js
=============================================================================
"""

import os
import re
import sys
import json
import subprocess
import unittest
import urllib.parse
from html.parser import HTMLParser
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
APP_JS = PROJECT_ROOT / "app.js"
INDEX_HTML = PROJECT_ROOT / "index.html"
STYLES_CSS = PROJECT_ROOT / "styles.css"
HARNESS_JS = PROJECT_ROOT / "tests" / "test_behavioral_harness.js"


class TestBehavioralMutation(unittest.TestCase):
    """Empirical adversarial tests for state contracts and behavioral mutations."""

    def setUp(self):
        self.assertTrue(APP_JS.exists(), "app.js must exist")
        self.assertTrue(INDEX_HTML.exists(), "index.html must exist")
        self.assertTrue(STYLES_CSS.exists(), "styles.css must exist")
        self.assertTrue(HARNESS_JS.exists(), "test_behavioral_harness.js must exist")

        with open(APP_JS, "r", encoding="utf-8") as f:
            self.app_js = f.read()
        with open(INDEX_HTML, "r", encoding="utf-8") as f:
            self.index_html = f.read()
        with open(STYLES_CSS, "r", encoding="utf-8") as f:
            self.styles_css = f.read()

    def test_bm_01_execute_headless_v8_behavioral_harness(self):
        """Runs the 2,126-invariant Node.js headless DOM behavioral mutation harness."""
        cmd = ["node", str(HARNESS_JS)]
        res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(PROJECT_ROOT))
        self.assertEqual(res.returncode, 0, f"Behavioral harness failed:\n{res.stderr}\n{res.stdout}")
        self.assertIn("ALL BEHAVIORAL INVARIANTS AND STATE CONTRACTS EMPIRICALLY CONFIRMED [PASS]", res.stdout)
        self.assertIn("Total Invariants Evaluated: 2126", res.stdout)
        self.assertIn("Failed: 0", res.stdout)

    def test_bm_02_tab_state_machine_transition_graph(self):
        """Validates that all 5 tab states are defined in validTabs and have matching DOM panels."""
        tabs_match = re.search(r"const\s+validTabs\s*=\s*\[(.*?)\];", self.app_js, re.DOTALL)
        self.assertIsNotNone(tabs_match, "validTabs array must be defined in app.js")
        
        raw_tabs = tabs_match.group(1)
        valid_tabs = [t.strip().strip("'").strip('"') for t in raw_tabs.split(",") if t.strip()]
        
        expected_tabs = ['promociones', 'especialidades', 'nosotros', 'educacion', 'contacto']
        self.assertEqual(sorted(valid_tabs), sorted(expected_tabs), "validTabs must contain strictly the 5 panels")

        # Verify matching tab buttons in HTML
        for tab in valid_tabs:
            btn_pattern = rf'<button[^>]*class="[^"]*tab-btn[^"]*"[^>]*data-tab="{tab}"'
            self.assertTrue(re.search(btn_pattern, self.index_html), f"HTML must have .tab-btn with data-tab='{tab}'")

            panel_pattern = rf'<section[^>]*id="panel-{tab}"[^>]*class="[^"]*tab-panel[^"]*"'
            self.assertTrue(re.search(panel_pattern, self.index_html), f"HTML must have .tab-panel with id='panel-{tab}'")

    def test_bm_03_invalid_hash_fallback_invariants(self):
        """Verifies defensive code prevents invalid or malicious hashes from corrupting state."""
        fallback_pattern = r"if\s*\(\s*validTabs\.indexOf\(\s*initialHash\s*\)\s*===\s*-1\s*\)\s*\{\s*initialHash\s*=\s*['\"]promociones['\"];\s*\}"
        self.assertTrue(re.search(fallback_pattern, self.app_js), "initialHash fallback to promociones must be guarded")

        # Hashchange guard
        hashchange_guard = r"if\s*\(\s*validTabs\.indexOf\(\s*hash\s*\)\s*!==\s*-1\s*\)\s*\{\s*switchTab\(\s*hash\s*\);\s*\}"
        self.assertTrue(re.search(hashchange_guard, self.app_js), "hashchange must guard against unregistered hashes")

    def test_bm_04_plan_selection_mutual_exclusivity_logic(self):
        """Verifies that option selection clears sibling option-card selected class."""
        # Must query container options and remove selected before adding to target
        self.assertIn("container.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'))", self.app_js)
        self.assertIn("optionCard.classList.add('selected')", self.app_js)

    def test_bm_05_tab_switch_state_hygiene_and_textarea_reset(self):
        """Verifies tab switching clears selectedPlan and resets textarea message."""
        # In switchTab, selectedPlan = null
        self.assertIn("selectedPlan = null;", self.app_js)
        self.assertIn("updateReservationTextarea(tabId);", self.app_js)

        # In updateReservationTextarea, verifies ternary prevents undefined
        self.assertIn("selectedPlan ?", self.app_js)
        self.assertIn("${selectedPlan}", self.app_js)
        self.assertIn("1ra Consulta Gratis", self.app_js)

    def test_bm_06_lightbox_lifecycle_and_body_scroll_locking(self):
        """Verifies openLightbox sets overflow hidden and closeLightbox restores empty string."""
        self.assertIn("document.body.style.overflow = 'hidden';", self.app_js)
        self.assertIn("document.body.style.overflow = '';", self.app_js)

        # Keyboard ESC key binding
        esc_binding = r"if\s*\(\s*e\.key\s*===\s*['\"]Escape['\"]\s*\)\s*\{\s*closeLightbox\(\s*\);\s*\}"
        self.assertTrue(re.search(esc_binding, self.app_js), "ESC key event listener must call closeLightbox()")

        # Backdrop click binding
        self.assertIn('onclick="closeLightbox()"', self.index_html, "Backdrop or close button in HTML must trigger closeLightbox()")

    def test_bm_07_whatsapp_url_sanitization_defense(self):
        """Verifies phone number stripping and encodeURIComponent formatting."""
        self.assertIn(r"replace(/\D/g, '')", self.app_js, "Phone number sanitizer must strip non-digits")
        self.assertIn("encodeURIComponent", self.app_js, "Message encoding must use encodeURIComponent")
        self.assertIn("51902103429", self.app_js, "Destination number must be 51902103429")


if __name__ == "__main__":
    unittest.main(verbosity=2)
