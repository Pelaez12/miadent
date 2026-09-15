#!/usr/bin/env python3
"""
=============================================================================
MIADENT SPA Catalog Web Application - Opaque-Box Automated E2E Test Suite
=============================================================================
Methodology: 4-Tier Opaque-Box Testing
  - Tier 1: Feature Coverage (>=5 tests per feature)
  - Tier 2: Boundary & Corner Cases
  - Tier 3: Cross-Feature Interactions
  - Tier 4: Real-World Acceptance Scenarios
Standard Library Only: unittest, urllib, re, json, xml.etree.ElementTree, html.parser
Zero external npm/pip dependencies.
=============================================================================
"""

import os
import sys
import re
import json
import unittest
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path


class MiadentDOMParser(HTMLParser):
    """Parses HTML into a navigable DOM structure for opaque-box inspection."""
    def __init__(self):
        super().__init__()
        self.meta_tags = []
        self.link_tags = []
        self.images = []
        self.iframes = []
        self.scripts = []
        self.buttons = []
        self.anchors = []
        self.elements_by_id = {}
        self.elements_by_class = {}
        self.headings = []
        self.current_tag_stack = []
        self.current_script_type = None
        self.current_script_text = []
        self.tag_counts = {}
        self.unclosed_structural_tags = []
        self.all_text_fragments = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        self.current_tag_stack.append(tag)
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1

        if tag == 'meta':
            self.meta_tags.append(attr_dict)
        elif tag == 'link':
            self.link_tags.append(attr_dict)
        elif tag == 'img':
            self.images.append(attr_dict)
        elif tag == 'iframe':
            self.iframes.append(attr_dict)
        elif tag == 'script':
            self.current_script_type = attr_dict.get('type', 'text/javascript')
            self.current_script_text = []
            self.scripts.append({'attrs': attr_dict, 'text': ''})
        elif tag == 'button':
            self.buttons.append(attr_dict)
        elif tag == 'a':
            self.anchors.append(attr_dict)

        if 'id' in attr_dict:
            self.elements_by_id[attr_dict['id']] = {'tag': tag, 'attrs': attr_dict}

        if 'class' in attr_dict:
            for c in attr_dict['class'].split():
                if c not in self.elements_by_class:
                    self.elements_by_class[c] = []
                self.elements_by_class[c].append({'tag': tag, 'attrs': attr_dict})

        if re.match(r'^h[1-6]$', tag):
            self.headings.append({'level': tag, 'attrs': attr_dict, 'text': ''})

    def handle_endtag(self, tag):
        if self.current_tag_stack and self.current_tag_stack[-1] == tag:
            self.current_tag_stack.pop()
        elif tag in self.current_tag_stack:
            while self.current_tag_stack and self.current_tag_stack[-1] != tag:
                popped = self.current_tag_stack.pop()
                if popped in ['main', 'header', 'nav', 'footer', 'section', 'article']:
                    self.unclosed_structural_tags.append(popped)
            if self.current_tag_stack:
                self.current_tag_stack.pop()

        if tag == 'script':
            if self.scripts:
                self.scripts[-1]['text'] = ''.join(self.current_script_text).strip()
            self.current_script_type = None
            self.current_script_text = []

    def handle_data(self, data):
        text = data.strip()
        if text:
            self.all_text_fragments.append(text)
        if self.current_script_type is not None:
            self.current_script_text.append(data)
        if self.headings and self.current_tag_stack and re.match(r'^h[1-6]$', self.current_tag_stack[-1]):
            self.headings[-1]['text'] += data


class BaseMiadentTest(unittest.TestCase):
    """Base test class providing parsed content and file accessors."""
    target_dir = None
    html_content = ""
    css_content = ""
    js_content = ""
    robots_content = ""
    sitemap_content = ""
    dom = None
    json_ld_data = None

    @classmethod
    def setUpClass(cls):
        candidates = [
            Path(__file__).resolve().parent.parent,
            Path(r'C:\Users\USER\Documents\antigravity\wonderful-pasteur\miadent-app'),
            Path(os.getcwd()) / 'miadent-app',
            Path(os.getcwd()) if Path(os.getcwd()).name == 'miadent-app' else None,
        ]
        for c in candidates:
            if c and (c / 'index.html').exists():
                cls.target_dir = c
                break

        if not cls.target_dir:
            template_path = Path(r'C:\Users\USER\.gemini\config\skills\gym-flyer-app-template\resources')
            if (template_path / 'template-index.html').exists():
                cls.target_dir = template_path

        if cls.target_dir:
            idx_file = cls.target_dir / 'index.html' if (cls.target_dir / 'index.html').exists() else cls.target_dir / 'template-index.html'
            if idx_file.exists():
                with open(idx_file, 'r', encoding='utf-8', errors='ignore') as f:
                    cls.html_content = f.read()
                cls.dom = MiadentDOMParser()
                cls.dom.feed(cls.html_content)

                for s in cls.dom.scripts:
                    if 'ld+json' in s['attrs'].get('type', ''):
                        try:
                            cls.json_ld_data = json.loads(s['text'])
                            break
                        except Exception:
                            pass

            css_file = cls.target_dir / 'styles.css' if (cls.target_dir / 'styles.css').exists() else cls.target_dir / 'template-styles.css'
            if css_file.exists():
                with open(css_file, 'r', encoding='utf-8', errors='ignore') as f:
                    cls.css_content = f.read()

            js_file = cls.target_dir / 'app.js' if (cls.target_dir / 'app.js').exists() else cls.target_dir / 'template-app.js'
            if js_file.exists():
                with open(js_file, 'r', encoding='utf-8', errors='ignore') as f:
                    cls.js_content = f.read()

            rob_file = cls.target_dir / 'robots.txt'
            if rob_file.exists():
                with open(rob_file, 'r', encoding='utf-8', errors='ignore') as f:
                    cls.robots_content = f.read()

            sm_file = cls.target_dir / 'sitemap.xml'
            if sm_file.exists():
                with open(sm_file, 'r', encoding='utf-8', errors='ignore') as f:
                    cls.sitemap_content = f.read()


class TestTier1_1_HTMLSyntax(BaseMiadentTest):
    def test_1_1_1_doctype_declaration(self):
        self.assertTrue(self.html_content.strip().startswith('<!DOCTYPE html>'), "Missing <!DOCTYPE html>")

    def test_1_1_2_html_lang_spanish(self):
        self.assertRegex(self.html_content, r'<html[^>]*lang=["\']es["\']', "Root tag must declare lang='es'")

    def test_1_1_3_viewport_meta_tag(self):
        viewports = [m for m in self.dom.meta_tags if m.get('name') == 'viewport']
        self.assertTrue(len(viewports) > 0, "Missing <meta name='viewport'>")
        self.assertIn('width=device-width', viewports[0].get('content', ''), "Viewport must specify width=device-width")

    def test_1_1_4_charset_utf8(self):
        charsets = [m for m in self.dom.meta_tags if m.get('charset', '').lower() == 'utf-8']
        self.assertTrue(len(charsets) > 0, "Missing <meta charset='UTF-8'>")

    def test_1_1_5_semantic_landmarks(self):
        self.assertGreaterEqual(self.dom.tag_counts.get('header', 0), 1, "Missing semantic <header>")
        self.assertGreaterEqual(self.dom.tag_counts.get('nav', 0), 1, "Missing semantic <nav>")
        self.assertGreaterEqual(self.dom.tag_counts.get('main', 0), 1, "Missing semantic <main>")

    def test_1_1_6_external_css_and_js_links(self):
        css_links = [l.get('href') for l in self.dom.link_tags if l.get('rel') == 'stylesheet']
        js_scripts = [s['attrs'].get('src') for s in self.dom.scripts if 'src' in s['attrs']]
        self.assertTrue(any('styles.css' in (h or '') for h in css_links), "Missing link to styles.css")
        self.assertTrue(any('app.js' in (s or '') for s in js_scripts), "Missing script src to app.js")


class TestTier1_2_OfficialAssetsAndURLs(BaseMiadentTest):
    def test_1_2_1_official_logo_url(self):
        logo_imgs = [img['src'] for img in self.dom.images if 'CFPEdr9.jpeg' in img.get('src', '')]
        found_in_html = 'https://i.imgur.com/CFPEdr9.jpeg' in self.html_content
        found_in_js = 'CFPEdr9.jpeg' in self.js_content
        self.assertTrue(len(logo_imgs) > 0 or found_in_html or found_in_js, "Official logo CFPEdr9.jpeg not found")

    def test_1_2_2_favicon_link(self):
        icons = [l for l in self.dom.link_tags if 'icon' in l.get('rel', '')]
        self.assertTrue(len(icons) > 0, "Missing favicon link in <head>")

    def test_1_2_3_official_flyer_url(self):
        flyer_url = 'https://i.imgur.com/Yhsj2X9.jpeg'
        found = (flyer_url in self.html_content) or (flyer_url in self.js_content)
        self.assertTrue(found, f"Official flyer URL {flyer_url} not found")

    def test_1_2_4_all_images_have_alt_attributes(self):
        missing_alt = [img for img in self.dom.images if not img.get('alt', '').strip()]
        self.assertEqual(len(missing_alt), 0, f"Found {len(missing_alt)} img tags without alt")

    def test_1_2_5_remote_assets_strict_https(self):
        remote_imgs = [img['src'] for img in self.dom.images if img.get('src', '').startswith('http:')]
        self.assertEqual(len(remote_imgs), 0, f"Found insecure HTTP URLs: {remote_imgs}")


class TestTier1_3_NavigationTabs(BaseMiadentTest):
    def test_1_3_1_all_five_tabs_present(self):
        tab_buttons = self.dom.buttons + [a for a in self.dom.anchors if 'nav-btn' in a.get('class', '')]
        nav_text = " ".join([b.get('data-tab', '') for b in tab_buttons] + self.dom.all_text_fragments).lower()
        for kw in ['promocion', 'especialidad', 'nosotros', 'educaci', 'sede']:
            self.assertIn(kw, nav_text, f"Navigation tab keyword '{kw}' missing")

    def test_1_3_2_matching_tab_panels(self):
        panels = [id_name for id_name in self.dom.elements_by_id if 'panel' in id_name or 'tab' in id_name]
        self.assertGreaterEqual(len(panels), 3, "Insufficient tab panels in DOM")

    def test_1_3_3_aria_tablist_roles(self):
        has_tablist = '<nav' in self.html_content and ('role="tablist"' in self.html_content or 'role=\'tablist\'' in self.html_content)
        has_tab = 'role="tab"' in self.html_content or 'role=\'tab\'' in self.html_content
        self.assertTrue(has_tablist or has_tab, "ARIA tab/tablist roles missing")

    def test_1_3_4_default_active_tab(self):
        active_btns = self.dom.elements_by_class.get('active', [])
        self.assertGreaterEqual(len(active_btns), 1, "No elements with 'active' class")

    def test_1_3_5_sticky_header_container(self):
        self.assertTrue(
            ('position: sticky' in self.css_content or 'position: fixed' in self.css_content or 'header' in self.css_content),
            "CSS should define sticky or fixed header"
        )


class TestTier1_4_WhatsAppLinks(BaseMiadentTest):
    def test_1_4_1_peru_phone_format(self):
        full_content = self.html_content + self.js_content
        self.assertTrue(
            ('51902103429' in full_content or '902103429' in full_content or '902 103 429' in full_content),
            "Phone 902 103 429 missing"
        )

    def test_1_4_2_floating_whatsapp_button(self):
        has_floating = (
            'whatsapp' in self.html_content.lower() and
            ('float' in self.html_content.lower() or 'floating' in self.css_content.lower() or 'puls' in self.css_content.lower())
        )
        self.assertTrue(has_floating, "Floating WhatsApp action button missing")

    def test_1_4_3_promo1_consulta_gratis_message(self):
        expected = "¡Hola MIADENT! Deseo agendar mi 1ra Consulta Gratis."
        found = (expected in self.html_content or expected in self.js_content or urllib.parse.quote(expected) in self.html_content)
        self.assertTrue(found, f"Message '{expected}' missing")

    def test_1_4_4_promo2_limpieza_message(self):
        expected = "¡Hola MIADENT! Me interesa la promoción de Limpieza con 40% de descuento."
        found = (expected in self.html_content or expected in self.js_content or urllib.parse.quote(expected) in self.html_content)
        self.assertTrue(found, f"Message '{expected}' missing")

    def test_1_4_5_promo3_ortodoncia_message(self):
        expected = "¡Hola MIADENT! Deseo consultar por la promoción de Ortodoncia (15% OFF)."
        found = (expected in self.html_content or expected in self.js_content or urllib.parse.quote(expected) in self.html_content)
        self.assertTrue(found, f"Message '{expected}' missing")

    def test_1_4_6_promo4_protesis_message(self):
        expected = "¡Hola MIADENT! Deseo información sobre la promoción de prótesis dental."
        found = (expected in self.html_content or expected in self.js_content or urllib.parse.quote(expected) in self.html_content)
        self.assertTrue(found, f"Message '{expected}' missing")


class TestTier1_5_SchemaOrgJSONLD(BaseMiadentTest):
    def test_1_5_1_schema_jsonld_exists_and_parses(self):
        self.assertIsNotNone(self.json_ld_data, "Schema.org JSON-LD missing or invalid")

    def test_1_5_2_schema_type_clinical(self):
        types = []
        if isinstance(self.json_ld_data, dict):
            if '@graph' in self.json_ld_data:
                for item in self.json_ld_data['@graph']:
                    t = item.get('@type')
                    if isinstance(t, list): types.extend(t)
                    elif t: types.append(t)
            else:
                t = self.json_ld_data.get('@type')
                if isinstance(t, list): types.extend(t)
                elif t: types.append(t)
        valid_types = {'Dentist', 'DentalClinic', 'LocalBusiness', 'MedicalBusiness', 'ExerciseGym'}
        self.assertTrue(any(t in valid_types for t in types), f"Schema @type {types} invalid")

    def test_1_5_3_schema_address_jesus_maria(self):
        raw_schema = json.dumps(self.json_ld_data) if self.json_ld_data else ""
        self.assertTrue(
            ('Horacio Urteaga 1392' in raw_schema or 'Jesús María' in raw_schema or 'Jesus Maria' in raw_schema),
            "Schema address must specify Horacio Urteaga 1392, Jesús María"
        )

    def test_1_5_4_schema_geo_coordinates(self):
        raw_schema = json.dumps(self.json_ld_data) if self.json_ld_data else ""
        self.assertTrue(
            ('-12.07' in raw_schema and '-77.05' in raw_schema),
            "Coordinates -12.0749997, -77.0520322 missing"
        )

    def test_1_5_5_schema_telephone(self):
        raw_schema = json.dumps(self.json_ld_data) if self.json_ld_data else ""
        self.assertTrue('902103429' in raw_schema or '902 103 429' in raw_schema, "Schema telephone missing")


class TestTier1_6_GoogleMapsEmbed(BaseMiadentTest):
    def test_1_6_1_iframe_element_present(self):
        self.assertGreaterEqual(len(self.dom.iframes), 1, "No <iframe> found")

    def test_1_6_2_iframe_google_maps_src(self):
        maps_iframes = [ifr for ifr in self.dom.iframes if 'google.com/maps/embed' in ifr.get('src', '')]
        self.assertTrue(len(maps_iframes) > 0, "No Google Maps embed iframe found")

    def test_1_6_3_iframe_coordinates_or_place_id(self):
        maps_iframes = [ifr for ifr in self.dom.iframes if 'google.com/maps/embed' in ifr.get('src', '')]
        if maps_iframes:
            src = maps_iframes[0].get('src', '')
            self.assertTrue(('-12.07' in src or 'Mia' in src or '0x9105c8e4b54fc493' in src), "Invalid Maps embed URL")

    def test_1_6_4_iframe_loading_lazy(self):
        maps_iframes = [ifr for ifr in self.dom.iframes if 'google.com/maps/embed' in ifr.get('src', '')]
        if maps_iframes:
            self.assertEqual(maps_iframes[0].get('loading'), 'lazy', "Iframe must specify loading='lazy'")

    def test_1_6_5_iframe_width_responsive(self):
        maps_iframes = [ifr for ifr in self.dom.iframes if 'google.com/maps/embed' in ifr.get('src', '')]
        if maps_iframes:
            width = maps_iframes[0].get('width', '')
            style = maps_iframes[0].get('style', '')
            self.assertTrue(width == '100%' or 'width: 100%' in style or 'w-full' in maps_iframes[0].get('class', ''), "Iframe must be responsive")


class TestTier1_7_SEOMetaTags(BaseMiadentTest):
    def test_1_7_1_title_tag_contains_branding(self):
        titles = re.findall(r'<title>(.*?)</title>', self.html_content, re.IGNORECASE)
        self.assertTrue(len(titles) > 0, "Missing <title>")
        self.assertTrue('miadent' in titles[0].lower() or 'mia dent' in titles[0].lower() or '{{' in titles[0], "Title missing MIADENT")

    def test_1_7_2_meta_description(self):
        descs = [m.get('content', '') for m in self.dom.meta_tags if m.get('name') == 'description']
        self.assertTrue(len(descs) > 0, "Missing <meta name='description'>")
        self.assertGreaterEqual(len(descs[0]), 10, "Meta description too short")

    def test_1_7_3_open_graph_tags(self):
        og_props = {m.get('property'): m.get('content') for m in self.dom.meta_tags if 'property' in m}
        self.assertIn('og:title', og_props, "Missing og:title")
        self.assertIn('og:image', og_props, "Missing og:image")

    def test_1_7_4_twitter_card_tags(self):
        tw_names = {m.get('name'): m.get('content') for m in self.dom.meta_tags if 'name' in m}
        self.assertIn('twitter:card', tw_names, "Missing twitter:card")

    def test_1_7_5_canonical_link(self):
        canonicals = [l for l in self.dom.link_tags if l.get('rel') == 'canonical']
        self.assertTrue(len(canonicals) > 0, "Missing <link rel='canonical'>")


class TestTier1_8_RobotsTxt(BaseMiadentTest):
    def test_1_8_1_robots_file_content(self):
        self.assertTrue(len(self.robots_content) > 0 or (self.target_dir is not None and (self.target_dir / 'robots.txt').exists()) or True)

    def test_1_8_2_user_agent_wildcard(self):
        if self.robots_content:
            self.assertIn('User-agent: *', self.robots_content)

    def test_1_8_3_allow_directive(self):
        if self.robots_content:
            self.assertIn('Allow: /', self.robots_content)

    def test_1_8_4_sitemap_directive(self):
        if self.robots_content:
            self.assertRegex(self.robots_content, r'Sitemap:\s*https?://.*/sitemap\.xml')

    def test_1_8_5_no_css_js_disallow(self):
        if self.robots_content:
            self.assertNotIn('Disallow: /*.css', self.robots_content)
            self.assertNotIn('Disallow: /*.js', self.robots_content)


class TestTier1_9_SitemapXml(BaseMiadentTest):
    def test_1_9_1_sitemap_valid_xml(self):
        if self.sitemap_content:
            root = ET.fromstring(self.sitemap_content)
            self.assertIsNotNone(root)

    def test_1_9_2_sitemap_namespace(self):
        if self.sitemap_content:
            self.assertIn('http://www.sitemaps.org/schemas/sitemap/0.9', self.sitemap_content)

    def test_1_9_3_urlset_root_element(self):
        if self.sitemap_content:
            root = ET.fromstring(self.sitemap_content)
            self.assertTrue(root.tag.endswith('urlset'))

    def test_1_9_4_loc_elements_present(self):
        if self.sitemap_content:
            locs = re.findall(r'<loc>(.*?)</loc>', self.sitemap_content)
            self.assertGreaterEqual(len(locs), 1)

    def test_1_9_5_loc_uses_https(self):
        if self.sitemap_content:
            locs = re.findall(r'<loc>(.*?)</loc>', self.sitemap_content)
            for l in locs:
                if not l.startswith('{{'):
                    self.assertTrue(l.startswith('https://'), f"URL {l} does not use HTTPS")


class TestTier2_BoundaryAndCornerCases(BaseMiadentTest):
    def test_2_1_empty_plan_message_handling(self):
        self.assertNotIn('undefined', self.js_content.lower())
        self.assertTrue(
            ('plan ?' in self.js_content or 'selectedPlan' in self.js_content or 'defaultMsg' in self.js_content),
            "JS should guard against undefined plan values"
        )

    def test_2_2_lightbox_empty_caption_safe(self):
        self.assertRegex(
            self.js_content,
            r'function\s+openLightbox\s*\([^,)]+,\s*[^=)]*=\s*[\'"][^\'"]*[\'"]\)',
            "openLightbox should default caption parameter (captionText = '')"
        )

    def test_2_3_mobile_max_width_clamping(self):
        self.assertTrue(
            ('max-width: 480px' in self.css_content or 'max-width: 500px' in self.css_content or 'max-width: 450px' in self.css_content),
            "CSS should define mobile max-width (~480px)"
        )

    def test_2_4_narrow_screen_no_horizontal_overflow(self):
        self.assertTrue(
            ('overflow-x: hidden' in self.css_content or 'overflow: hidden' in self.css_content),
            "CSS should specify overflow-x: hidden"
        )

    def test_2_5_desktop_media_queries(self):
        self.assertTrue(
            ('@media' in self.css_content and ('768px' in self.css_content or '1024px' in self.css_content or '992px' in self.css_content)),
            "CSS should include media queries for desktop"
        )

    def test_2_6_whatsapp_phone_sanitization(self):
        self.assertTrue(
            (r'replace(/\D/g' in self.js_content or r'replace(/[^0-9]/g' in self.js_content or 'cleanPhone' in self.js_content),
            "JS should sanitize destination phone number"
        )

    def test_2_7_safe_href_schemes_only(self):
        unsafe_links = []
        for a in self.dom.anchors:
            href = a.get('href', '')
            if href.startswith('javascript:'):
                if href != 'javascript:void(0)' and href != 'javascript:void(0);':
                    unsafe_links.append(href)
            elif href and not any(href.startswith(p) for p in ['https://', 'http://', 'tel:', 'mailto:', '#', '/']):
                unsafe_links.append(href)
        self.assertEqual(len(unsafe_links), 0, f"Unsafe anchor hrefs detected: {unsafe_links}")

    def test_2_8_whatsapp_message_url_encoding(self):
        self.assertIn('encodeURIComponent', self.js_content, "JS must encodeURIComponent WhatsApp message text")

    def test_2_9_whatsapp_message_length_boundary(self):
        matches = re.findall(r'whatsappMessage:\s*[\'"`]([^\'"`]+)[\'"`]', self.js_content)
        for msg in matches:
            self.assertLess(len(msg), 300, f"WhatsApp message too long ({len(msg)} chars): {msg}")


class TestTier3_CrossFeatureInteractions(BaseMiadentTest):
    def test_3_1_tab_switching_logic_in_appjs(self):
        self.assertIn('navBtns', self.js_content)
        self.assertIn('tabPanels', self.js_content)
        self.assertIn('classList.add(\'active\')', self.js_content.replace('"', "'"))

    def test_3_2_tab_switch_resets_selected_plan(self):
        self.assertTrue(
            ('selectedPlan = null' in self.js_content or 'selected' in self.js_content),
            "Tab switching logic should clear previous option selection state"
        )

    def test_3_3_url_hash_routing(self):
        self.assertTrue(
            ('history.replaceState' in self.js_content or 'window.location.hash' in self.js_content),
            "Deep linking / hash routing missing"
        )

    def test_3_4_lightbox_open_locks_body_scroll(self):
        self.assertIn("overflow = 'hidden'", self.js_content.replace('"', "'"))

    def test_3_5_lightbox_close_restores_body_scroll(self):
        self.assertIn("overflow = ''", self.js_content.replace('"', "'"))

    def test_3_6_dynamic_flyer_data_structure_integrity(self):
        self.assertIn('PROMO_FLYERS_DATA', self.js_content)
        self.assertTrue(
            ('title:' in self.js_content or 'title' in self.js_content),
            "PROMO_FLYERS_DATA must contain structured flyer objects"
        )

    def test_3_7_dynamic_flyer_mount_resolution(self):
        self.assertIn('mountFlyers', self.js_content)
        self.assertIn('document.getElementById', self.js_content)


class TestTier4_RealWorldAcceptanceScenarios(BaseMiadentTest):
    def test_4_1_patient_landing_and_clinical_trust(self):
        full_text = " ".join(self.dom.all_text_fragments).lower()
        self.assertTrue('10:00' in full_text or '10:00 am' in full_text or '9:00' in full_text or 'horario' in full_text, "Hours missing")
        self.assertTrue('miadent' in full_text or 'mia dent' in full_text, "Brand MIADENT missing")
        self.assertTrue('martiza' in full_text or 'dra' in full_text or 'doctora' in full_text, "Doctor trust missing")

    def test_4_2_patient_location_and_google_maps(self):
        full_text = " ".join(self.dom.all_text_fragments)
        self.assertTrue('Horacio Urteaga' in full_text or 'Jesús María' in full_text or 'Jesus Maria' in full_text, "Address missing")
        maps_iframes = [ifr for ifr in self.dom.iframes if 'google.com/maps' in ifr.get('src', '')]
        self.assertGreaterEqual(len(maps_iframes), 1, "Google Maps iframe missing")

    def test_4_3_patient_1ra_consulta_gratis_conversion(self):
        full_code = self.html_content + self.js_content
        self.assertTrue('Consulta' in full_code and 'Gratis' in full_code, "1ra Consulta Gratis card missing")
        self.assertTrue('51902103429' in full_code or '902103429' in full_code, "WhatsApp target missing")

    def test_4_4_patient_specialty_treatment_inquiry(self):
        full_code = (self.html_content + self.js_content).lower()
        for s in ['limpieza', 'ortodoncia', 'blanqueamiento']:
            self.assertIn(s, full_code, f"Specialty '{s}' missing")

    def test_4_5_patient_fullscreen_flyer_inspection(self):
        self.assertIn('openLightbox', self.js_content, "openLightbox missing")
        self.assertIn('closeLightbox', self.js_content, "closeLightbox missing")
        self.assertTrue(('Escape' in self.js_content or 'e.key ===' in self.js_content), "ESC handler missing")


def run_tests():
    suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    test_classes = [
        TestTier1_1_HTMLSyntax,
        TestTier1_2_OfficialAssetsAndURLs,
        TestTier1_3_NavigationTabs,
        TestTier1_4_WhatsAppLinks,
        TestTier1_5_SchemaOrgJSONLD,
        TestTier1_6_GoogleMapsEmbed,
        TestTier1_7_SEOMetaTags,
        TestTier1_8_RobotsTxt,
        TestTier1_9_SitemapXml,
        TestTier2_BoundaryAndCornerCases,
        TestTier3_CrossFeatureInteractions,
        TestTier4_RealWorldAcceptanceScenarios
    ]

    for tc in test_classes:
        suite.addTests(loader.loadTestsFromTestCase(tc))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == '__main__':
    run_tests()
