# Bildschirm Update

## Neue Seiten und Designs

- Vier neue Bildschirmansichten für die Wohnungsbildschirme gestalten und umsetzen
- Bestehende Bildschirmansichten an das neue Kommunikationskonzept anpassen
- Wiederkehrende Elemente der bestehenden Ansichten in gemeinsame Komponenten überführen

## Neue Architektur

- Neue CMS Collection `Screens` für physische Bildschirme erstellen
- Neue CMS Collection `Screen Pages` für konfigurierbare Bildschirmansichten erstellen
- Geordnete Zuordnung von Screen Pages zu Screens implementieren
- CMS-basierten Player unter `/screen/{screenId}` implementieren
- Gemeinsame Navigationsleiste am unteren Bildschirmrand implementieren
- Navigation zwischen den Screen Pages innerhalb des Players implementieren
- Registry für die verfügbaren Screen Pages und deren URLs implementieren
- Bestehende statische Screen-URLs auf die neue Struktur migrieren
- Bestehende Screen- und Overlay-Daten migrieren
- Overlays als React-Komponente neu implementieren
- Automatische Aktualisierung von Screen-Konfiguration, Seiten und Overlays implementieren

## Neue Funktionen

- Overlays mehreren physischen Screens zuordnen
- Screen Pages pro Screen auswählen, sortieren und aktivieren/deaktivieren
- Navigationspunkte pro Screen konfigurieren und in der gewünschten Reihenfolge anzeigen
- Navigation durch Klick auf der physischen Bildschirmoberfläche ermöglichen
- Admin-Vorschau um direkte Screen-Auswahl erweitern
- Admin-Vorschau um Gebäude- und Etagen-Auswahl erweitern
- Button zur sofortigen Aktualisierung der Vorschau ergänzen
- Navigationsleiste und Seitenwechsel vollständig innerhalb des Screen-Players steuern
