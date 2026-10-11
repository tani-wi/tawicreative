/* TaWi Creative Art – lädt die Inhalte aus /content/*.json und füllt die Seite.
   Inhalte werden nur als Text eingesetzt (kein HTML), Bilder nur aus dem Ordner assets/images. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function load(name) {
    return fetch('content/' + name + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return null; });
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
      if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function imgSrc(v) { return v ? String(v).replace(/^\/+/, '') : ''; }
  function tpl(str, site) {
    var out = str.replace(/\{(\w+)\}/g, function (_, k) {
      var v = site[k] == null ? '' : String(site[k]);
      if (k === 'telefon_tel') v = String(site.telefon || '').replace(/[^\d+]/g, '');
      return v.replace(/\s+/g, '');
    });
    return /^(https?:|mailto:|tel:)/i.test(out) ? out : '#';
  }
  function fillSlot(slot, value, alt) {
    var src = imgSrc(value);
    if (!src) return;
    slot.textContent = '';
    var img = el('img', { src: src, alt: alt || '', loading: 'lazy', decoding: 'async' });
    slot.appendChild(img);
  }

  /* ---------- Allgemeine Angaben ---------- */
  function bindSite(site) {
    $$('[data-site]').forEach(function (n) {
      var v = site[n.getAttribute('data-site')];
      if (v !== undefined && v !== null && v !== '') n.textContent = v;
    });
    $$('[data-href]').forEach(function (n) {
      var raw = n.getAttribute('data-href');
      var skip = /\{(\w+)\}/.exec(raw);
      if (skip && !site[skip[1]] && skip[1] !== 'telefon_tel') return; /* Angabe fehlt: Link bleibt wie im Entwurf */
      n.setAttribute('href', tpl(raw, site));
    });
    $$('[data-img]').forEach(function (n) { fillSlot(n, site[n.getAttribute('data-img')], n.getAttribute('data-alt')); });
    $$('[data-if]').forEach(function (n) { if (!site[n.getAttribute('data-if')]) n.hidden = true; });
    $$('[data-ifnot]').forEach(function (n) { if (site[n.getAttribute('data-ifnot')]) n.hidden = true; });
    $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
    var lb = $('#label-img');
    if (lb && site.gewaehrleistung_bild) {
      var box = $('#label-box');
      lb.src = imgSrc(site.gewaehrleistung_bild);
      lb.hidden = false;
      if (box) { box.classList.add('has-img'); var t = $('#label-text', box); if (t) t.hidden = true; }
    }
  }

  /* ---------- Kollektion ---------- */
  function renderKollektion(k, site) {
    var host = $('#produkte');
    if (!host || !k) return;
    $$('[data-kollektion]').forEach(function (n) {
      var v = k[n.getAttribute('data-kollektion')];
      if (v) n.textContent = v;
    });
    (k.produkte || []).forEach(function (p) {
      if (p.sichtbar === false) return;
      var slot = el('div', { 'class': 'imgslot', role: 'img', 'aria-label': p.bild_alt || p.name || 'Produktfoto' }, []);
      slot.appendChild(document.createTextNode('[Produktfoto]'));
      fillSlot(slot, p.bild, p.bild_alt || p.name);
      if (p.bild) slot.removeAttribute('role');
      if (p.abzeichen) slot.insertBefore(el('span', { 'class': 'badge' + (/neu/i.test(p.abzeichen) ? ' neu' : ''), text: p.abzeichen }), slot.firstChild);
      var msg = 'Hallo Tanja, ich möchte gerne bestellen: ' + (p.name || '');
      var card = el('article', { 'class': 'card' }, [
        slot,
        el('h3', { text: p.name || '' }),
        p.beschreibung ? el('p', { 'class': 'b', text: p.beschreibung }) : null,
        p.details ? el('p', { 'class': 'd', text: p.details }) : null,
        p.sicherheitshinweis ? el('p', { 'class': 's', text: 'Sicherheitshinweis: ' + p.sicherheitshinweis }) : null,
        p.preis ? el('p', { 'class': 'p', text: p.preis }) : null,
        el('a', { 'class': 'btn btn--dark', href: 'https://wa.me/' + encodeURIComponent(site.whatsapp || '') + '?text=' + encodeURIComponent(msg), text: 'Per WhatsApp bestellen' })
      ]);
      host.appendChild(card);
    });
  }

  /* ---------- Galerie-Vorschau auf der Startseite ---------- */
  function renderTeaser(g) {
    var host = $('#teaser');
    if (!host || !g) return;
    (g.bilder || []).filter(function (b) { return b.sichtbar !== false; }).slice(0, 4).forEach(function (b) {
      var slot = el('div', { 'class': 'imgslot', style: 'aspect-ratio:1/1;border-radius:24px' }, []);
      slot.appendChild(document.createTextNode('[Foto' + (b.kategorie ? ' · ' + b.kategorie : '') + ']'));
      fillSlot(slot, b.bild, b.beschreibung || 'Arbeitsprobe');
      host.appendChild(el('div', { 'class': 'card' }, [slot]));
    });
  }

  /* ---------- Fragen & Antworten ---------- */
  function renderFaq(f) {
    var host = $('#faq-list');
    if (!host || !f) return;
    (f.fragen || []).forEach(function (q) {
      if (q.sichtbar === false) return;
      var antwort = el('p', { text: q.antwort || '' });
      host.appendChild(el('details', {}, [el('summary', { text: q.frage || '' }), antwort]));
    });
  }

  /* ---------- Galerie ---------- */
  function renderGalerie(g) {
    var host = $('#galerie');
    if (!host || !g) return;
    var items = (g.bilder || []).filter(function (b) { return b.sichtbar !== false; });
    var cats = [];
    items.forEach(function (b) { if (b.kategorie && cats.indexOf(b.kategorie) < 0) cats.push(b.kategorie); });
    var chips = $('#chips');
    var active = 'Alle';
    var dlg = $('#lightbox');

    function draw() {
      host.textContent = '';
      items.forEach(function (b) {
        if (active !== 'Alle' && b.kategorie !== active) return;
        var fig = el('figure', {}, []);
        if (b.bild) {
          var img = el('img', { src: imgSrc(b.bild), alt: b.beschreibung || 'Arbeitsprobe', loading: 'lazy', decoding: 'async' });
          var btn = el('button', { type: 'button', 'aria-label': 'Bild vergrößern' }, [img]);
          btn.addEventListener('click', function () {
            $('img', dlg).src = img.src; $('img', dlg).alt = img.alt;
            $('p', dlg).textContent = b.beschreibung || '';
            if (dlg.showModal) dlg.showModal();
          });
          fig.appendChild(btn);
        } else {
          fig.appendChild(el('div', { 'class': 'ph', text: '[Foto' + (b.kategorie ? ' · ' + b.kategorie : '') + ']' }));
        }
        if (b.beschreibung) fig.appendChild(el('figcaption', { text: b.beschreibung }));
        host.appendChild(fig);
      });
      markTodos(host);
    }
    function chipBtn(label) {
      var c = el('button', { type: 'button', 'class': 'chip', 'aria-pressed': label === active ? 'true' : 'false', text: label });
      c.addEventListener('click', function () {
        active = label;
        $$('.chip', chips).forEach(function (x) { x.setAttribute('aria-pressed', x.textContent === active ? 'true' : 'false'); });
        draw();
      });
      return c;
    }
    if (chips) { chips.appendChild(chipBtn('Alle')); cats.forEach(function (c) { chips.appendChild(chipBtn(c)); }); }
    if (dlg) {
      $('button', dlg).addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    }
    draw();
  }

  /* ---------- Formulare (Formspree, sonst E-Mail-Programm) ---------- */
  function wireForms(site) {
    $$('form.f').forEach(function (form) {
      var msgEl = $('.form-msg', form);
      function say(t) { if (msgEl) msgEl.textContent = t; }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        if ($('.hp input', form) && $('.hp input', form).value) return;
        var data = new FormData(form);
        var betreff = form.getAttribute('data-subject') || 'Anfrage über die Website';
        if (site.formular_id) {
          say('Wird gesendet …');
          fetch('https://formspree.io/f/' + encodeURIComponent(site.formular_id), {
            method: 'POST', body: data, headers: { Accept: 'application/json' }
          }).then(function (r) {
            if (r.ok) { form.reset(); say('Danke! Deine Nachricht ist angekommen. Ich melde mich bei dir.'); }
            else say('Das hat leider nicht geklappt. Schreib mir bitte per WhatsApp oder E-Mail.');
          }).catch(function () { say('Das hat leider nicht geklappt. Schreib mir bitte per WhatsApp oder E-Mail.'); });
        } else {
          var lines = [];
          data.forEach(function (v, k) { if (k !== '_gotcha' && typeof v === 'string' && v) lines.push(k + ': ' + v); });
          window.location.href = 'mailto:' + (site.email || '') + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(lines.join('\n'));
          say('Dein E-Mail-Programm öffnet sich. Bitte sende die vorbereitete Nachricht dort ab.');
        }
      });
    });
  }

  /* ---------- [Platzhalter] sichtbar markieren ---------- */
  function markTodos(root) {
    var re = /\[[^\]\n]{1,90}\]/g;
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|NOSCRIPT)$/.test(p)) return NodeFilter.FILTER_REJECT;
        if (n.parentNode.classList && n.parentNode.classList.contains('todo')) return NodeFilter.FILTER_REJECT;
        return re.test(n.nodeValue) ? (re.lastIndex = 0, NodeFilter.FILTER_ACCEPT) : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment(), s = n.nodeValue, last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(s))) {
        frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        frag.appendChild(el('span', { 'class': 'todo', text: m[0] }));
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(s.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Promise.all([load('site'), load('kollektion'), load('galerie'), load('faq')]).then(function (r) {
      var site = r[0] || {};
      bindSite(site);
      renderKollektion(r[1], site);
      renderFaq(r[3]);
      renderTeaser(r[2]);
      renderGalerie(r[2]);
      wireForms(site);
      markTodos(document.body);
      document.documentElement.classList.add('ready');
    });
  });
})();
