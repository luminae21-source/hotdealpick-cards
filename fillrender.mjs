// Compatibility entry point. Uses the same validated 1080×1350 export pipeline.
import { renderCards } from './scripts/render.mjs';
try {
  const [name, ...extra] = process.argv.slice(2);
  if (!name || extra.length || !/^[A-Za-z0-9_-]+(?:\.json)?$/.test(name)) throw new Error('사용법: node fillrender.mjs 파일이름');
  await renderCards({ data: `data/${name.replace(/\.json$/, '')}.json` });
} catch (error) { console.error(error.message); process.exitCode = 1; }
