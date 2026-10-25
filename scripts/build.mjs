import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['favicon.ico','index.html','styles.css','mobile.css','app.js','motion.js','navigation.js','content.json','style-tile.html']) await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true,filter:src=>!src.includes('/source')});
console.log('Static site built in dist/');
