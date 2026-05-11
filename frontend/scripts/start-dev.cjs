/**
 * Free TCP listeners on port 3000, wait briefly, then run `next dev -p 3000`.
 * Windows: netstat -ano + taskkill (reliable with LISTENING rows).
 */
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const root = path.join(__dirname, '..');
const PORT = 3000;

function freePortSync(port) {
  if (process.platform === 'win32') {
    try {
      const out = execSync('netstat -ano', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        const upper = line.toUpperCase();
        if (!upper.includes('LISTENING')) continue;
        if (!line.includes(`:${port}`)) continue;
        const trimmed = line.trim();
        const parts = trimmed.split(/\s+/);
        const last = parts[parts.length - 1];
        if (/^\d+$/.test(last) && last !== String(process.pid)) {
          pids.add(last);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[dev] killed PID ${pid} on port ${port}`);
        } catch {
          /* ignore — may need admin or already exited */
        }
      }
    } catch {
      /* netstat failed */
    }
    return;
  }

  try {
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
    for (const pid of out.split(/\n/).map((s) => s.trim()).filter(Boolean)) {
      if (pid === String(process.pid)) continue;
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`[dev] killed PID ${pid} on port ${port}`);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* nothing listening or lsof missing */
  }
}

freePortSync(PORT);

setTimeout(() => {
  const isWin = process.platform === 'win32';
  const nextBin = path.join(root, 'node_modules', '.bin', isWin ? 'next.cmd' : 'next');
  const useLocal = fs.existsSync(nextBin);
  const cmd = useLocal ? nextBin : isWin ? 'npx.cmd' : 'npx';
  const args = useLocal ? ['dev', '-p', String(PORT)] : ['--no-install', 'next', 'dev', '-p', String(PORT)];

  const child = spawn(cmd, args, {
    stdio: 'inherit',
    cwd: root,
    shell: isWin,
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code == null ? 0 : code);
  });
}, 1200);
