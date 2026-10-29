#!/usr/bin/env node
/**
 * Fail if planner payload markers appear under a built tree.
 * Needles are stored as base64 so private wording is not plaintext in this public repo.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = process.argv.slice(2);
const targets = roots.length ? roots : ['.'];
// base64 of distinctive planner markers (decoded only in memory at check time)
const DENY_B64 = [
  'X19IQVNRRUxMX1NFRURfXw==',
  'X19KT1ZJQV9TRUVEX18=',
  'c3RhdHVzLWFwcC1wbGFubmVy',
  'Y29tbW9uX19lbmdhZ2U=',
  'a2xnYWRtaW5Aa2VsbHlsZWdhbGdyb3VwLmNvbQ==',
  'S2VsbHkgTGVnYWwgaW52b2ljZSAxNDU4NQ==',
  'Zm9yZWNsb3N1cmVOb3Rl',
];
const DENY = DENY_B64.map((b) => Buffer.from(b, 'base64').toString('utf8'));
const SKIP_DIR = new Set(['.git', 'node_modules', 'dist', '.vite']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(html?|js|mjs|cjs|css|json|md|txt|map)$/i.test(name)) out.push(p);
  }
  return out;
}

let failed = false;
for (const root of targets) {
  const files = walk(root);
  for (const f of files) {
    const rel = relative(process.cwd(), f);
    if (rel === 'scripts/check-privacy.mjs') continue;
    if (rel === 'README.md') continue;
    let text;
    try {
      text = readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    for (const needle of DENY) {
      if (text.includes(needle)) {
        console.error(`PRIVACY FAIL: ${rel} contains forbidden planner marker`);
        failed = true;
      }
    }
  }
}
if (failed) {
  console.error('Privacy check failed.');
  process.exit(1);
}
console.log('Privacy check OK for', targets.join(', '));
