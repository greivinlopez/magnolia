import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['favicon.ico','index.html','styles.css','mobile.css','app.js','motion.js','frame-store.js','navigation.js','content.json','style-tile.html']) await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true,filter:src=>!src.includes('/source') && !/\/frames(?:\/|$)/.test(src)});
console.log('Static site built in dist/');
