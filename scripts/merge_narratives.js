#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dataDir = path.join(root, 'data');
const baseFile = path.join(dataDir, 'narratives.json');
const daysFile = path.join(dataDir, 'narratives_days.json');
const backupFile = path.join(dataDir, 'narratives.json.bak');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function uniqueBySlugPreserveFirst(arr) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const slug = item && item.slug;
    if (!slug) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(item);
  }
  return out;
}

(function main() {
  const base = readJson(baseFile);
  const days = readJson(daysFile);
  if (!Array.isArray(base) || !Array.isArray(days)) {
    console.error('Both JSON files must be arrays');
    process.exit(1);
  }
  // Backup
  fs.copyFileSync(baseFile, backupFile);
  // Merge with days first, then base, then dedupe by slug keeping first
  const merged = uniqueBySlugPreserveFirst([...days, ...base]);
  writeJson(baseFile, merged);
  console.log(`Merged ${days.length} day items into narratives.json (total: ${merged.length}). Backup at narratives.json.bak`);
})();
