# Bildschirm-Update – Umsetzungsplan und Zeitschätzung

## Annahmen

Diese Schätzung basiert auf folgenden Voraussetzungen:

- Die bestehende Webflow-Website und das bestehende Screen-System bleiben erhalten.
- ConnectSignage und die physischen Bildschirmgeräte bleiben ausserhalb des Projektumfangs.
- Pro physischem Bildschirm wird eine stabile URL unter `/screen/{screenId}` verwendet.
- `Screens` und `Screen Pages` werden als Webflow CMS Collections umgesetzt.
- `Screen Pages` sind konfigurierbare Playlist-Einträge für tatsächlich gestaltete Bildschirmseiten. Die visuellen Seiten werden als individuelle Webflow-Seiten umgesetzt.
- Die Mitarbeitenden bearbeiten die Inhalte weiterhin im Webflow CMS. Ein vollständig eigener Content-Editor ist nicht enthalten.
- Die vier neuen Bildschirmansichten werden von der Agentur gestaltet und umgesetzt.
- Die Schätzung enthält keine neuen Video-Produktionen, Hardwarebeschaffung oder Vor-Ort-Installationen.

Die Stunden sind als realistische Bandbreiten für Umsetzung, Tests und Korrekturen gedacht. Die untere Zahl entspricht einer gut vorbereiteten, geradlinigen Umsetzung; die obere Zahl enthält normalen Abstimmungs- und Korrekturaufwand.

## 1. Vorbereitung und Datenmodell

### 1.1 Bildschirm- und URL-Matrix definieren

**Arbeitsschritte**

- Physische Bildschirme, Gebäude und Etagen erfassen
- Stabile `screenId`-Werte und finale `/screen/*`-URLs festlegen
- Bestehende URLs den neuen Screen-Einträgen zuordnen
- Auflösungen, Ausrichtung und verfügbare Bildschirmtypen dokumentieren
- Meeting für Besprechung mit CMO

**Ergebnis:** Verbindliche Liste aller Screens, URLs und technischen Eckdaten.

**Aufwand:** 1–2 h

### 1.2 CMS-Datenmodell und Felddefinitionen festlegen

**Arbeitsschritte**

- Felder für `Screens` definieren
- Felder für `Screen Pages` definieren
- Beziehungen und Reihenfolge der Screen Pages festlegen
- Felder für Status, Seiten-URL, Navigation und Overlay-Zuordnung definieren

**Ergebnis:** Abgenommenes CMS-Feldmodell (in Textform) als Grundlage für Webflow und Code.

**Aufwand:** 30min

## 2. Webflow-CMS-Struktur und Datenmigration

### 2.1 `Screens` Collection erstellen

**Arbeitsschritte**

- Collection `Screens` anlegen
- Felder für `screenId`, Name, Gebäude und Etage anlegen
- Geordnete Multi-Reference zu `Screen Pages` einrichten
- Bestehende und neue physische Bildschirme als Items erfassen

**Ergebnis:** Jeder physische Bildschirm ist im CMS eindeutig registriert.

**Aufwand:** 1–1.5 h

### 2.2 `Screen Pages` Collection erstellen

**Arbeitsschritte**

- Collection `Screen Pages` anlegen
- Felder für `pageId`, internen Namen, Seiten-URL, Navigationsbezeichnung und Status anlegen
- Felder für Aktivierung und Navigationsbezeichnung anlegen
- Screen Pages den Screens zuordnen und Reihenfolge definieren

**Ergebnis:** Die Navigation eines Screens kann über CMS-Daten zusammengestellt werden.

**Aufwand:** 1–1.5 h

### 2.3 Overlay-Zuordnung refaktorieren

**Arbeitsschritte**

- Bestehende Screen-/Gebäude-Booleans in `Overlays` ersetzen
- Multi-Reference-Feld von `Overlays` zu `Screens` anlegen
- Bestehende Overlay-Items auf die neuen Screens migrieren
- Alte Felder erst nach erfolgreicher Prüfung entfernen

**Ergebnis:** Ein Overlay kann beliebigen einzelnen oder mehreren Screens zugeordnet werden.

**Aufwand:** 1–2 h

### 2.4 Bestehende Screen- und Seitendaten migrieren

**Arbeitsschritte**

- Bestehende Screen-Inhalte den neuen Screen Pages zuordnen
- Bestehende Seiten-URLs und CMS-Referenzen übertragen
- Testdaten und veraltete Einträge bereinigen
- Live- und Vorschau-Daten vergleichen

**Ergebnis:** Die bestehende Bildschirmfunktion bleibt nach der Umstellung erhalten.

**Aufwand:** 2–4 h

## 3. Screen Player und Navigation

### 3.1 Navigationsleiste implementieren

**Arbeitsschritte**

- Gemeinsame Navigationsleiste am unteren Bildschirmrand umsetzen
- Navigationspunkte aus den zugeordneten Screen Pages erzeugen
- Aktive Seite visuell hervorheben
- Navigationsleiste auf allen Bildschirmseiten konsistent anzeigen
- Touch-/Klickbedienung auf den Zielgeräten testen

**Ergebnis:** Benutzende können direkt zwischen den Seiten eines physischen Screens wechseln.

**Aufwand:** 8–12 h

### 3.2 Seitenwechsel innerhalb des Players implementieren

**Arbeitsschritte**

- Klick auf Navigationspunkt mit dem passenden `pageId` verbinden
- Seitenwechsel ohne ConnectSignage-Navigation durchführen
- Navigationszustand bei Seitenwechsel korrekt aktualisieren
- Optional einfache Klickanimation ergänzen, ohne automatische Seitenwechsel einzuführen

**Ergebnis:** Navigation und Seitenwechsel werden vollständig von der Sanavita-Anwendung kontrolliert.

**Aufwand:** 5–8 h

### 3.3 Screen-Page-Registry und URL-Validierung implementieren

**Arbeitsschritte**

- `pageId` und Seiten-URL aus dem CMS einlesen
- Nur erlaubte Bildschirmseiten laden
- Fehlende oder ungültige URLs behandeln
- Screen Pages für die Navigation eindeutig identifizieren

**Ergebnis:** Der Player kann die im CMS konfigurierten Bildschirmseiten sicher laden und navigieren.

**Aufwand:** 1–2 h

## 4. Neue Designs

### 4.1 Vier neue Wohnungs-Bildschirmansichten gestalten und umsetzen

**Arbeitsschritte**

- Vier Bildschirmansichten auf Basis der gelieferten Anforderungen gestalten
- Layouts in Webflow umsetzen
- CMS-Felder und Screen-Komponenten anbinden
- Darstellung auf den tatsächlichen Bildschirmformaten prüfen

**Ergebnis:** Vier produktionsbereite neue Bildschirmansichten.

**Designaufwand:** 16–24 h
**Entwicklungsaufwand**: 12–16 h

### 4.2 Bestehende Bildschirmansichten anpassen

**Arbeitsschritte**

- Bestehende Ansichten gemäss Sanierungs-Kommunikation aktualisieren
- Bestehende Inhalte und Overlays auf den neuen Aufbau prüfen

**Ergebnis:** Bestehende Screen Pages entsprechen dem neuen Kommunikationskonzept.

**Aufwand:** 4–8 h

## 5. Overlays und Aktualisierung

### 5.1 Overlays als React-Komponente neu implementieren

**Arbeitsschritte**

- Overlay-Daten aus dem neuen Multi-Reference-Modell lesen
- Overlays anhand des aktuellen `screenId` filtern
- Zeitliche Aktivierung und Prioritäten übernehmen
- Overlay über der aktuell ausgewählten Screen Page anzeigen
- Overlay wieder entfernen, ohne die aktuelle Seite zu verlieren

**Ergebnis:** Overlays funktionieren unabhängig von der aktuell ausgewählten Bildschirmseite.

**Aufwand:** 4–6 h

### 5.2 Automatische CMS-Aktualisierung implementieren

**Arbeitsschritte**

- Screen-Konfiguration regelmässig neu laden
- Screen Pages und Overlay-Daten regelmässig neu laden
- Neue CMS-Items ohne vollständigen Browser-Reload übernehmen
- Letzten funktionierenden Zustand bei einem temporären Ladefehler beibehalten

**Ergebnis:** Veröffentlichte Änderungen werden automatisch auf laufenden Bildschirmseiten verfügbar.

**Aufwand:** 3–5 h

## 6. Admin-Vorschau

### 6.1 Direkte Screen-Auswahl ergänzen

**Arbeitsschritte**

- Screen-Auswahl aus den `Screens`-Daten erzeugen
- Vorschau des gewählten physischen Screens laden
- Aktive Screen Pages und Overlays korrekt anzeigen

**Ergebnis:** Mitarbeitende können einen konkreten Bildschirm direkt auswählen.

**Aufwand:** 3–5 h

### 6.2 Button für manuelle Aktualisierung ergänzen

**Arbeitsschritte**

- Button `Inhalte aktualisieren` ergänzen
- Vorschau-Player ohne vollständigen Seiten-Reload neu laden
- Ladezustand und Fehlerzustand anzeigen
- Aktualisierungszeitpunkt sichtbar machen

**Ergebnis:** CMS-Änderungen können in der Vorschau unmittelbar geprüft werden.

**Aufwand:** 0.5 h

## 7. Migration, Tests und Übergabe

### 7.1 Bestehende Screen-URLs auf die neue Struktur migrieren

**Arbeitsschritte**

- Bestehende URLs auf die neuen Screen-Items abbilden
- URL-Konflikte mit der bestehenden `/screen`-Struktur prüfen
- Bestehende ConnectSignage-URLs während der Umstellung funktionsfähig halten
- Finale URLs nach der Umstellung verifizieren

**Ergebnis:** Der Signage-Verantwortliche erhält stabile, getestete URLs.

**Aufwand:** 3–5 h

### 7.2 Funktionale Tests und ConnectSignage-Abnahme

**Arbeitsschritte**

- Jeden neuen Screen direkt im Browser testen
- Navigation und Touchbedienung prüfen
- Overlay-Zuordnung für Gebäude und Etagen testen
- CMS-Aktualisierung ohne vollständigen Reload testen
- Darstellung innerhalb von ConnectSignage prüfen
- Test auf realer Bildschirmhardware durchführen

**Ergebnis:** Abnahmefähiger Screen-Player für die neuen und bestehenden Displays.

**Aufwand:** 6–10 h

### 7.3 Übergabe und kurze Bedienungsdokumentation

**Arbeitsschritte**

- Screen-Liste und URL-Liste übergeben
- Kurze Anleitung für Screen Pages und Overlays erstellen
- Vorgehen für neue Screens und neue Bildschirmseiten dokumentieren
- Kurze Einweisung durchführen

**Ergebnis:** Der Kunde kann Inhalte und Zuordnungen im vorgesehenen Workflow pflegen.

**Aufwand:** 2–3 h

## Zusammenfassung

| Bereich | Aufwand |
|---|---:|
| Vorbereitung und Datenmodell | 1,5–2,5 h |
| CMS-Struktur und Datenmigration | 5–9 h |
| Screen Player und Navigation | 14–22 h |
| Neue Designs | 32–48 h |
| Overlays und Aktualisierung | 7–11 h |
| Admin-Vorschau | 3,5–5,5 h |
| Migration, Tests und Übergabe | 11–18 h |
| **Gesamtschätzung** | **74–116 h** |

Für eine Offerte würde ich mit einem Planwert von **ca. 95 Arbeitsstunden** rechnen und zusätzlich einen Projektpuffer von **15–20 %** vorsehen. Das entspricht insgesamt ungefähr **110–115 Stunden**, sofern keine zusätzlichen Bildschirmseiten, individuellen Editor-Funktionen oder ConnectSignage-Anpassungen dazukommen.

## Nicht enthalten

- Verwaltung oder Neustart physischer Bildschirme
- ConnectSignage-Entwicklung oder ConnectSignage-Support
- Hardwarebeschaffung und Vor-Ort-Installation
- Vollständiger eigener Content-Editor ausserhalb von Webflow
- Benutzerverwaltung und komplexes RBAC
- Neue Video- oder Foto-Produktionen
- Zusätzliche Bildschirmseiten ausserhalb der vier geplanten Ansichten
