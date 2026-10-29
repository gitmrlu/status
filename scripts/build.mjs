#!/usr/bin/env node
/**
 * One-command build for GitHub Pages.
 * Copies the static site into dist/ with base path /status/.
 * Does NOT bundle planner content (that lives in Supabase private_docs).
 */
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// Root encrypted landing (unchanged)
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
// App SPA + JSON assets
mkdirSync(join(dist, 'app'), { recursive: true });
cpSync(join(root, 'app'), join(dist, 'app'), { recursive: true });

// Sanity: required files
for (const f of ['index.html', 'app/index.html', 'app/bot-avatars.json', 'app/bot-departments.json']) {
  if (!existsSync(join(dist, f))) {
    console.error('build missing', f);
    process.exit(1);
  }
}

// Privacy gate on dist + working app tree
const check = spawnSync(process.execPath, [join(root, 'scripts/check-privacy.mjs'), 'dist', 'app'], {
  stdio: 'inherit',
});
if (check.status !== 0) process.exit(check.status || 1);

const app = readFileSync(join(dist, 'app/index.html'), 'utf8');
if (!app.includes('private_docs') || !app.includes('viewNav')) {
  console.error('build: app/index.html missing planner nav wiring');
  process.exit(1);
}

writeFileSync(join(dist, '.nojekyll'), '');
console.log('Built dist/ for Pages base /status/');
console.log('  app → /status/app/');
console.log('  root → /status/');
