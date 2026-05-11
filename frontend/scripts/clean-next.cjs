/* Remove stale webpack chunks (fixes ChunkLoadError: app/layout.js missing). */
const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), '.next');
try {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('[clean-next] removed .next');
} catch (e) {
  if (e && e.code !== 'ENOENT') console.warn('[clean-next]', e.message);
}
