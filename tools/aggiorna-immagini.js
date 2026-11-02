// Rigenera js/immagini.js dalle immagini in assets/img.  Uso: node tools/aggiorna-immagini.js
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');
const files={"letters": "lettere-crich.png", "logo": "logo-crich.png", "crk": "pack-crackers.jpg", "bcr": "pack-bio-cracker.jpg", "bwf": "pack-bio-wafer.jpg", "wood": "legno-colore.jpg", "woodB": "legno-rilievo.jpg", "woodR": "legno-ruvidezza.jpg", "wpk": "pack-wafers-nocciola.webp", "gmp": "pack-gran-merenda-monoporzione.webp"};
const mime=f=>f.endsWith('.png')?'image/png':f.endsWith('.webp')?'image/webp':'image/jpeg';
let out='/* Generato da tools/aggiorna-immagini.js */\nwindow.CRICH_IMG={\n';
out+=Object.entries(files).map(([k,f])=>'  '+k+":'data:"+mime(f)+';base64,'+fs.readFileSync(path.join(root,'assets/img',f)).toString('base64')+"'").join(',\n');
fs.writeFileSync(path.join(root,'js/immagini.js'),out+'\n};\n');console.log('js/immagini.js aggiornato');
