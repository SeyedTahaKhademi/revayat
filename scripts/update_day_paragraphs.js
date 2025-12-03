#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function saveJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8'); }

function ensureThreeParagraphs(item) {
  if (!Array.isArray(item.content)) item.content = [];
  // Trim strings
  item.content = item.content.map((s) => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
  const dayTitle = item.title || 'روایت روز';
  const base = `جمع‌بندی عملیاتی ${dayTitle}: هماهنگی یگان‌ها، حفظ بازدارندگی و مدیریت میدانی به‌صورت پیوسته دنبال شد.`;
  const add1 = `پیوست‌های پشتیبانی (اطلاعاتی، مهندسی رزمی، درمان میدانی) کارایی عملیات را بالا برد و ریسک‌ها را کاهش داد.`;
  const add2 = `درس‌آموخته‌های این روز، برای بهبود چابکی و دقت تصمیم‌گیری در روزهای بعدی مستندسازی شد.`;
  while (item.content.length < 3) {
    const toAdd = item.content.length === 0 ? base : (item.content.length === 1 ? add1 : add2);
    item.content.push(toAdd);
  }
  if (item.content.length > 3) item.content = item.content.slice(0, 3);
}

(function main() {
  const root = process.cwd();
  const dataDir = path.join(root, 'data');

  const narrativesPath = path.join(dataDir, 'narratives.json');
  const narrativesBak = path.join(dataDir, 'narratives.json.bak2');
  const daysPath = path.join(dataDir, 'narratives_days.json');
  const daysBak = path.join(dataDir, 'narratives_days.json.bak');

  // Update narratives.json day-* items
  const narratives = loadJson(narrativesPath);
  fs.copyFileSync(narrativesPath, narrativesBak);
  narratives.forEach((item) => {
    if (item && typeof item.slug === 'string' && item.slug.startsWith('day-')) {
      ensureThreeParagraphs(item);
    }
  });
  saveJson(narrativesPath, narratives);

  // Update narratives_days.json for consistency (if exists)
  if (fs.existsSync(daysPath)) {
    const days = loadJson(daysPath);
    fs.copyFileSync(daysPath, daysBak);
    days.forEach((item) => ensureThreeParagraphs(item));
    saveJson(daysPath, days);
  }

  console.log('Updated day-* narratives to exactly 3 content paragraphs. Backups created.');
})();
