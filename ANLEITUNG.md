# TaWi Creative Art – Website: Schritt für Schritt

## 1. Einmalig einrichten (ca. 30 Min., am Computer)
1. Kostenloses Konto auf github.com anlegen.
2. Neues Repository erstellen (Name z. B. `tawicreative`, **Public**). Meines Wissens ist GitHub Pages im kostenlosen Tarif nur für öffentliche Repositories verfügbar – bitte bei GitHub prüfen.
3. Alle Dateien aus diesem ZIP (entpackt, inkl. versteckter Dateien `.pages.yml`, `.nojekyll`, `CNAME`) ins Repository hochladen ("Add file → Upload files").
4. Repository → Settings → Pages → "Deploy from a branch" → Branch `main`, Ordner `/ (root)` → Save.
5. Settings → Pages → Custom domain: `tawicreative.at` eintragen. Beim Registrar der Domain die DNS-Einträge setzen, die GitHub in der aktuellen Dokumentation nennt (A-Records für die Hauptdomain, ggf. CNAME für `www`). Danach "Enforce HTTPS" aktivieren.
6. Wichtig: Die Domain bleibt beim Jimdo-Ablauf evtl. noch auf Jimdo gesetzt – alte DNS-Einträge ersetzen.

## 2. Vor dem Livegang
- In **jeder** HTML-Datei die Zeile `<meta name="robots" content="noindex, nofollow">` löschen (sonst taucht die Seite nicht in Google auf).
- Alle **[Platzhalter]** (pink markiert auf der Seite) ausfüllen: Adresse, E-Mail, Lieferzeit, Zahlungsarten, Gewerbedaten, UID usw. → `content/site.json` bzw. in den Rechtstexten (Impressum, Datenschutz, Versand & Widerruf).
- Kontaktformular: Kostenloses Konto bei formspree.io, Formular-ID in `content/site.json` bei `formular_id` eintragen. Ohne ID öffnet sich das E-Mail-Programm (mailto).
- **Gewährleistungshinweis (EmpCo, ab 27.09.2026):** das offizielle EU-Label (Bild) von WKO/EU-Kommission herunterladen, nach `assets/images` hochladen und unter "Allgemein & Kontakt" → `gewaehrleistung_bild` eintragen. Der Text/das Label darf nicht verändert werden.
- Rechtstexte sind **Vorlagen**: bitte von WKO Steiermark / einer Anwältin prüfen lassen (GPSR-Herstellerangaben, Widerruf, Datenschutz).

## 3. Täglich vom Handy ändern (Pages CMS)
1. Auf pagescms.org mit GitHub anmelden, Repository auswählen.
2. Bereiche: **Kollektion (Produkte)**, **Galerie**, **Häufige Fragen**, **Allgemein & Kontakt**.
3. Produkt ändern: Eintrag öffnen → Name, Text, Preis, Foto ändern → Speichern. Nach ca. 1–2 Minuten ist es online.
4. Saisonprodukt ausblenden: Schalter `sichtbar` aus.
5. Fotos vorher am Handy verkleinern (ca. 1600 px Breite, unter 500 KB).
6. Teste das CMS einmal in Ruhe, bevor du dich darauf verlässt – die Konfiguration (`.pages.yml`) konnte ich nicht live testen.

## Hinweise
- Schriften: Es werden Systemschriften genutzt (Schrift-Downloads waren nicht möglich). Eigene Schriften können später lokal eingebunden werden.
- Stand Recht: Quellen waren WKO-Seiten und Kanzlei-Beiträge, keine Gesetzestexte.
