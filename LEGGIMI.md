# Crich 1870 — sito di progetto (versione realistica)

## Come aprirlo
Doppio clic su `index.html`. Funziona anche senza internet: font, librerie 3D e immagini sono nella cartella.

## Struttura
```
index.html                    la pagina
css/style.css                 stili (colori e caratteri in :root, in alto)
css/fonts.css                 font locali: Newsreader, Hanken Grotesk
js/main.js                    interazioni e scene 3D
js/immagini.js                texture del 3D incorporate (vedi sotto)
js/vendor/three.min.js        three.js r128 (licenza MIT)
js/vendor/RoomEnvironment.js  luce d'ambiente per i riflessi (three.js, MIT)
assets/img/                   logo, confezioni reali (Gran Merenda, Wafers alla nocciola, Crackers, Bio Cracker), legno
assets/fonts/                 file .woff2 (SIL Open Font License)
tools/aggiorna-immagini.js    rigenera js/immagini.js
```

## Le scene 3D (in js/main.js)
- `buildHero()`: la colazione (tavolo, piatto, tazza, frollini, confezioni sfocate).
- `buildFactory()`: la linea Gran Merenda nel capannone, in 5 stazioni. Il rullo stampatore forma i biscotti ovali a nido d'ape (`gmGeo()`, `buildGMMaps()`); dalla confezionatrice escono le monoporzioni reali da 3 biscotti (`pack-gran-merenda-monoporzione.webp`).
- `initSpins()`: lo studio fotografico delle schede prodotto (la scheda «Alimentazione particolare» mostra la confezione reale Wafers alla nocciola senza zuccheri aggiunti).

## Sostituire immagini
Sostituisci il file in `assets/img/` con lo stesso nome e lancia `node tools/aggiorna-immagini.js`.
Le foto originali ricevute sono nella stessa cartella (`*-originale.png`).

## Fonti
Testi e dati da crich.it. Foto delle confezioni fornite da Crich. Texture del legno dal repository di three.js.

## Da completare con Crich
- Foto e video reali (colazione, stabilimento) e packshot ad alta risoluzione.
- Logo vettoriale.
- Date storiche (1890, 1903, 1931), quota export e mercati.
- Il modulo contatti è una demo: va collegato al CRM.
