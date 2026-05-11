'use strict';

const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../frontend/src/app/globals.css');
const b = fs.readFileSync(p);

let s;
if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
  s = b.slice(3).toString('utf8');
} else if (b[0] === 0xff && b[1] === 0xfe) {
  s = b.slice(2).toString('utf16le');
} else {
  s = b.toString('utf8');
}

const end =
  '@keyframes pulse-node {\n' +
  '  0% { r: 3; opacity: 0.6; fill: #06b6d4; }\n' +
  '  100% { r: 6; opacity: 1; fill: #22d3ee; }\n' +
  '}\n\n';

const i = s.indexOf(end);
if (i === -1) {
  console.error('Marker block not found');
  process.exit(1);
}

const tail = `
/* Sentinel/9 operational */
.correlation-cell {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
  min-width: 32px;
  min-height: 32px;
}
.correlation-cell:hover {
  transform: scale(1.15);
  z-index: 10;
  box-shadow: 0 0 8px rgba(34,211,238,0.4);
}
.cascade-branch {
  border-left: 2px solid rgba(34,211,238,0.2);
  margin-left: 20px;
  padding-left: 16px;
  position: relative;
}
.cascade-branch::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 20px;
  width: 16px;
  height: 2px;
  background: rgba(34,211,238,0.2);
}
.hash-text {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: #6b7280;
  word-break: break-all;
}
@keyframes waveBar {
  0%,100% { height: 8px; }
  50% { height: 24px; }
}
.wave-bar-1 { animation: waveBar 0.8s ease-in-out 0s infinite; }
.wave-bar-2 { animation: waveBar 0.8s ease-in-out 0.15s infinite; }
.wave-bar-3 { animation: waveBar 0.8s ease-in-out 0.3s infinite; }
.sentiment-track {
  background: linear-gradient(90deg, #ef4444 0%, #6b7280 50%, #22c55e 100%);
  border-radius: 4px;
  height: 8px;
  position: relative;
}
.sentiment-marker {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 16px;
  background: white;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: left 0.5s ease;
}
.prob-high { background: rgba(239,68,68,0.2); color: #f87171; }
.prob-medium { background: rgba(245,158,11,0.2); color: #fbbf24; }
.prob-low { background: rgba(34,197,94,0.2); color: #4ade80; }
.sparkline-container { overflow: hidden; border-radius: 4px; }
@keyframes growBranch {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}
.cascade-animate { animation: growBranch 0.4s ease-out forwards; transform-origin: top; }
.contradiction-card { border-left-width: 3px; }
.contradiction-critical { border-left-color: #ef4444; }
.contradiction-high { border-left-color: #f97316; }
.contradiction-medium { border-left-color: #f59e0b; }
.contradiction-low { border-left-color: #22c55e; }
@keyframes realtimePing {
  0% { transform: scale(1); opacity: 1; }
  75%,100% { transform: scale(2); opacity: 0; }
}
.realtime-ping { animation: realtimePing 1.5s cubic-bezier(0,0,0.2,1) infinite; }
.metadata-section { border-top: 1px solid rgba(255,255,255,0.05); }
.metadata-section:first-child { border-top: none; }
`;

fs.writeFileSync(p, s.slice(0, i + end.length) + tail, 'utf8');
console.log('globals.css repaired, bytes:', fs.statSync(p).size);
