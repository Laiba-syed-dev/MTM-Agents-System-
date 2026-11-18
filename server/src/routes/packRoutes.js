import express from 'express';
import multer from 'multer';
import path from 'path';
import { calculateHash } from '../utils/hash.js';
import { globalStore } from '../models/store.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ success: false, error: 'No file or text content provided' });
    }

    const originalContent = req.file ? req.file.buffer.toString('utf-8') : req.body.text;
    const fileName = req.file ? req.file.originalname : 'direct_text_input.txt';
    const contentHash = calculateHash(originalContent);
    const sessionId = `session_${Date.now()}`;
    const packId = `pack_${contentHash.substring(0, 8)}`;

    const pack = {
      _id: packId,
      originalFileName: fileName,
      originalContent,
      contentHash,
      sessionId,
      uploadedAt: new Date(),
      processingStatus: 'uploaded',
    };

    await globalStore.addMessagePack(pack);

    res.json({
      success: true,
      sessionId,
      packId,
      fileName,
      status: 'uploaded',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
