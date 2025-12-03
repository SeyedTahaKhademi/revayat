#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function saveJson(p,data){ fs.writeFileSync(p, JSON.stringify(data,null,2)+'\n','utf8'); }

const dayNames = [
  'روز اول','روز دوم','روز سوم','روز چهارم','روز پنجم','روز ششم',
  'روز هفتم','روز هشتم','روز نهم','روز دهم','روز یازدهم','روز دوازدهم'
];

function numFromSlug(slug){
  const m = String(slug||'').match(/day-(\d+)/);
  return m ? parseInt(m[1],10) : null;
}

function findImageForDay(publicImagesDir, dayIdx){
  const base = dayNames[dayIdx];
  if (!base) return null;
  const candidates = [
    `${base}.jpg`, `${base}.jpeg`, `${base}.png`, `${base}.webp`,
    `${base}.JPG`, `${base}.PNG`, `${base}.WEBP`
  ];
  for (const name of candidates){
    const p = path.join(publicImagesDir, name);
    if (fs.existsSync(p)) return `/images/${name}`;
  }
  return null;
}

(function main(){
  const root = process.cwd();
  const dataDir = path.join(root, 'data');
  const publicImagesDir = path.join(root, 'public', 'images');
  const narrativesPath = path.join(dataDir, 'narratives.json');
  const backupPath = path.join(dataDir, 'narratives.json.bak_images');

  const data = loadJson(narrativesPath);
  fs.copyFileSync(narrativesPath, backupPath);

  let updated = 0;
  data.forEach(item => {
    const n = numFromSlug(item.slug);
    if (!n) return;
    const idx = n-1;
    const img = findImageForDay(publicImagesDir, idx);
    if (img){
      item.image = img; // Next/Image will handle with leading '/'
      updated++;
    }
  });

  saveJson(narrativesPath, data);
  console.log(`Updated ${updated} day-* items with images from /public/images. Backup at narratives.json.bak_images`);
})();
