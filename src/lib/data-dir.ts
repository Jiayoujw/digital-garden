import path from 'path';
import fs from 'fs/promises';

const isVercel = process.env.VERCEL === '1';

export const NOTES_DIR = isVercel
  ? '/tmp/data/notes'
  : path.join(process.cwd(), 'data', 'notes');

export const DAILY_DIR = isVercel
  ? '/tmp/data/daily'
  : path.join(process.cwd(), 'data', 'daily');

const SEED_NOTES_DIR = path.join(process.cwd(), 'data', 'notes');
const SEED_DAILY_DIR = path.join(process.cwd(), 'data', 'daily');

let initialized = false;

export async function ensureDirectories() {
  await fs.mkdir(NOTES_DIR, { recursive: true });
  await fs.mkdir(DAILY_DIR, { recursive: true });

  if (isVercel && !initialized) {
    initialized = true;
    try {
      const noteFiles = await fs.readdir(SEED_NOTES_DIR);
      for (const file of noteFiles) {
        if (file.endsWith('.md')) {
          const src = path.join(SEED_NOTES_DIR, file);
          const dest = path.join(NOTES_DIR, file);
          try {
            await fs.access(dest);
          } catch {
            await fs.copyFile(src, dest);
          }
        }
      }
    } catch { /* seed notes dir may not exist */ }

    try {
      const dailyFiles = await fs.readdir(SEED_DAILY_DIR);
      for (const file of dailyFiles) {
        if (file.endsWith('.md')) {
          const src = path.join(SEED_DAILY_DIR, file);
          const dest = path.join(DAILY_DIR, file);
          try {
            await fs.access(dest);
          } catch {
            await fs.copyFile(src, dest);
          }
        }
      }
    } catch { /* seed daily dir may not exist */ }
  }
}
