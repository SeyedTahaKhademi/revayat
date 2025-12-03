#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function saveJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8'); }

function numFromSlug(slug){
  const m = String(slug||'').match(/day-(\d+)/);
  return m ? parseInt(m[1],10) : null;
}

function genParagraphs(item){
  const dayNum = numFromSlug(item.slug);
  const dayLabel = item.title || (dayNum?`روز ${dayNum}`:'روایت روز');
  const blocks = [
    `تصویر کلی ${dayLabel}: ارزیابی وضعیت، تعیین اهداف و هم‌ترازی با راهبرد کلان.`,
    `اطلاعات میدانی: گردآوری داده‌های انسانی، سیگنالی و تصویری برای نقشه وضعیت مشترک (COP).`,
    `پیش‌آگاهی تهدید: تحلیل الگوهای تحرک دشمن و تعیین مسیرهای محتمل اقدام.`,
    `آماده‌سازی: تکمیل مهمات، سوخت، تعمیر و نگهداری و آماده‌باش یگان‌ها.`,
    `مانور زمینی: جابه‌جایی چابک یگان‌ها و تثبیت خطوط تماس در نقاط کلیدی.`,
    `پشتیبانی مهندسی: گشودن معابر، استحکامات میدانی و کاهش ریسک‌های حرکتی.`,
    `پدافند هوایی: چیدمان لایه‌ای و هماهنگی با شبکه راداری و دیدبانی.`,
    `عملیات هوایی: گشت رزمی، شناسایی مسلح و پشتیبانی نزدیک هوایی در محورهای درگیر.`,
    `آتش غیرمستقیم: اجرای آتش‌های دقیق و زمانمند بر مبنای بانک اهداف به‌روز‌شده.`,
    `دریاپایشی/ساحلی: مراقبت از آبراه‌ها و شریان‌های حیاتی و هم‌افزایی با رادارهای ساحلی.`,
    `سپر سایبری: دفع تلاش‌های اختلالی و حفظ پیوستگی شبکه‌های فرماندهی و کنترل.`,
    `جنگ ادراکی: روایت‌گری میدانی دقیق برای خنثی‌سازی ادعاهای ناصحیح و حفظ سرمایه اجتماعی.`,
    `تخلیه و نجات: انتقال مجروحان، اورژانس میدانی و بازگردانی توان رزمی.`,
    `لجستیک: تدارکات پیوسته از عقبه تا خط مقدم با مسیرهای موازی و امن.`,
    `هم‌سویی بین‌رشته‌ای: پیوند اطلاعات، عملیات، مهندسی و پشتیبانی در یک چرخه تصمیم.`,
    `ارزیابی اثر: سنجش پیامدهای هر اقدام بر معادلات بازدارندگی و مدیریت تنش.`,
    `تعامل با قواعد درگیری: حفظ تناسب، اجتناب از تشدید ناخواسته و رعایت ملاحظات انسانی.`,
    `بازپیکربندی نیرو: جابه‌جایی ذخیره‌ها و ترمیم خلأها بر اساس درس‌های روز.`,
    `ثبت درس‌آموخته‌ها: مستندسازی رویه‌ها برای افزایش چابکی و دقت تصمیم‌گیری.`,
    `جمع‌بندی ${dayLabel}: حفظ ابتکار، ارتقای آمادگی و تداوم بازدارندگی در مسیر روزهای بعد.`
  ];
  return blocks;
}

function ensureTwentyParagraphs(item){
  if (!Array.isArray(item.content)) item.content = [];
  item.content = item.content.map((s)=> typeof s==='string'? s.trim(): s).filter(Boolean);
  if (item.slug && /^day-\d+/.test(item.slug)){
    const generated = genParagraphs(item);
    // اگر محتوا داریم، آنها را در ابتدای generated ادغام کنیم ولی تکراری‌ها را حذف کنیم
    const seen = new Set();
    const merged = [];
    // اول محتوای موجود تا از بین نرود
    for(const p of item.content){
      const k = p;
      if (typeof k === 'string' && !seen.has(k)) { seen.add(k); merged.push(p); }
      if (merged.length>=20) break;
    }
    for(const p of generated){
      const k = p;
      if (typeof k === 'string' && !seen.has(k)) { seen.add(k); merged.push(p); }
      if (merged.length>=20) break;
    }
    // اگر هنوز کمتر از 20 است، آخرین جمله را تکرارِ کمی تغییر‌یافته کنیم
    while(merged.length<20){
      merged.push(`${generated[generated.length-1]} (تکمیل جزئیات ${merged.length+1})`);
    }
    item.content = merged.slice(0,20);
  }
}

(function main(){
  const root = process.cwd();
  const dataDir = path.join(root, 'data');
  const narrativesPath = path.join(dataDir, 'narratives.json');
  const backupPath = path.join(dataDir, 'narratives.json.bak3');

  const data = loadJson(narrativesPath);
  fs.copyFileSync(narrativesPath, backupPath);

  data.forEach(it => ensureTwentyParagraphs(it));

  saveJson(narrativesPath, data);
  console.log('Expanded day-* contents to 20 paragraphs each. Backup at narratives.json.bak3');
})();
