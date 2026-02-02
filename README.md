# QZH XML Vorschau

Diese minimale Web-App rendert XML clientseitig im Stil der QZH-Anwendung. Du kannst XML-Dateien per Drag & Drop oder über den Dateiauswahldialog laden. Der Renderer mappt zentrale TEI/XML-Tags auf die gleichen CSS-Klassen wie im QZH-Projekt.

## Start

Option 1: Datei direkt öffnen

1. `index.html` im Browser öffnen.
2. XML-Datei in die Drop-Zone ziehen oder über den Button auswählen.

Option 2: Lokalen Server starten (empfohlen)

```bash
python -m http.server 8000
```

Dann im Browser `http://localhost:8000` öffnen.

## Nutzung

- **Datei laden:** Drag & Drop oder Klick auf die Drop-Zone.
- **Fehleranzeige:** Ungültiges XML wird mit einer Fehlermeldung quittiert.
- **Leerer Zustand:** Ohne Datei erscheint der Hinweis „XML hier ablegen“.

## Styling

Die Styles für XML-Elemente sind direkt aus dem QZH-Repository übernommen (`resources/css/theme.css`, `resources/css/theme-qzh.css`, `resources/css/epub.css`). Diese Klassen werden im Renderer über ein Tag-zu-Style-Mapping angewendet, damit die Darstellung der QZH-Version entspricht.
