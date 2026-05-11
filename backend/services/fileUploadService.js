/**
 * services/fileUploadService.js
 * Handles file uploads to Firebase Storage.
 */

const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

/**
 * Local disk fallback when Firebase is not configured (dev / air-gapped).
 */
async function uploadLocal(file, folder = 'evidence') {
  const ext = path.extname(file.originalname);
  const baseDir = path.join(__dirname, '..', 'uploads', folder);
  await fs.mkdir(baseDir, { recursive: true });
  const filename = `${uuidv4()}${ext}`;
  const fullPath = path.join(baseDir, filename);
  await fs.writeFile(fullPath, file.buffer);
  const rel = `/uploads/${folder}/${filename}`;
  logger.info(`[FileUpload] Local save: ${fullPath}`);
  return {
    url: rel,
    filename: `${folder}/${filename}`,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    storage: 'local',
  };
}

/**
 * Uploads a file buffer to Firebase Storage and returns a signed public URL.
 */
const uploadFile = async (file, folder = 'evidence') => {
  if (!bucket) {
    return uploadLocal(file, folder);
  }

  const ext = path.extname(file.originalname);
  const filename = `${folder}/${uuidv4()}${ext}`;
  const fileRef = bucket.file(filename);

  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
      },
    },
  });

  // Make the file publicly readable
  await fileRef.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

  logger.info(`[FileUpload] Uploaded: ${filename}`);

  return {
    url: publicUrl,
    filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
  };
};

/**
 * Deletes a file from Firebase Storage by its storage path.
 */
const deleteFile = async (filename) => {
  if (!bucket) {
    throw new Error('Firebase Storage is not configured.');
  }

  await bucket.file(filename).delete();
  logger.info(`[FileUpload] Deleted: ${filename}`);
};

module.exports = { uploadFile, deleteFile };
