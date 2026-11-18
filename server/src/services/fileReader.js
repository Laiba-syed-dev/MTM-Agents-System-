import fs from 'fs/promises';
import { calculateHash } from '../utils/hash.js';

export async function readMessageFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const contentHash = calculateHash(content);
  return {
    rawContent: content,
    contentHash,
  };
}
