/**
 * Metadata extraction — ExifTool (images), FFprobe (audio/video). Graceful fallback if binaries missing.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const logger = require('../utils/logger');

function writeTemp(buffer, ext) {
  const tmp = path.join(os.tmpdir(), `forensic_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(tmp, buffer);
  return tmp;
}

function extractExif(buffer, ext) {
  try {
    const tmp = writeTemp(buffer, ext || '.bin');
    const r = spawnSync('exiftool', ['-json', '-n', tmp], { encoding: 'utf8', timeout: 15000 });
    fs.unlinkSync(tmp);
    if (r.error || r.status !== 0) return { available: false, note: 'exiftool not available or failed' };
    const parsed = JSON.parse(r.stdout || '[]');
    return { available: true, exif: parsed[0] || {} };
  } catch (e) {
    logger.debug('[ExifTool] skipped', { message: e.message });
    return { available: false, note: e.message };
  }
}

function ffprobeSummary(buffer, ext) {
  try {
    const tmp = writeTemp(buffer, ext || '.bin');
    const r = spawnSync(
      'ffprobe',
      ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', tmp],
      { encoding: 'utf8', timeout: 20000 }
    );
    fs.unlinkSync(tmp);
    if (r.error || r.status !== 0) return { available: false, note: 'ffprobe not available or failed' };
    return { available: true, probe: JSON.parse(r.stdout || '{}') };
  } catch (e) {
    logger.debug('[FFprobe] skipped', { message: e.message });
    return { available: false, note: e.message };
  }
}

async function extractAll(buffer, mimetype, originalname) {
  const ext = path.extname(originalname || '') || '.bin';
  const base = {
    mimetype: mimetype || 'application/octet-stream',
    originalname: originalname || 'unknown',
    size: buffer.length,
  };

  let exif = null;
  let probe = null;

  if (mimetype && mimetype.startsWith('image/')) {
    exif = extractExif(buffer, ext);
  }
  if (mimetype && (mimetype.startsWith('video/') || mimetype.startsWith('audio/'))) {
    probe = ffprobeSummary(buffer, ext);
  }

  return { ...base, exif, media_probe: probe };
}

module.exports = { extractAll, extractExif, ffprobeSummary };
