export function detectLanguage(text) {
  if (!text) return 'english';
  const lower = text.toLowerCase();
  const romanUrduKeywords = ['salam', 'bhai', 'hoga', 'hai', 'wala', 'ab', 'shukriya', 'karo', 'karein', 'nahi', 'pe', 'mein'];
  const isRomanUrdu = romanUrduKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
  return isRomanUrdu ? 'roman_urdu' : 'english';
}

export function parseMessagePack(rawText, packId = 'pack_001', sessionId = 'session_001') {
  if (!rawText || !rawText.trim()) return [];

  // Split on triple-dash dividers or consecutive blank lines separating distinct messages
  let blocks = [];
  if (rawText.includes('---')) {
    blocks = rawText.split(/\r?\n---\r?\n/);
  } else if (/\n\s*#\s*\d+/g.test(rawText)) {
    blocks = rawText.split(/(?=\n\s*#\s*\d+)/);
  } else if (/\n\s*(?:From:|Sender:)/i.test(rawText)) {
    blocks = rawText.split(/(?=\n\s*(?:From:|Sender:))/i);
  } else {
    blocks = rawText.split(/\r?\n\r?\n\r?\n+/);
  }

  const messages = [];
  let currentLine = 1;

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split(/\r?\n/);
    const lineStart = currentLine;
    const lineEnd = currentLine + lines.length - 1;
    currentLine = lineEnd + 2;

    let sender = 'Unknown';
    let messageDate = null;
    let rawContent = trimmed;

    // Check for header lines like "From: ..." and "Date: ..."
    const headerLines = [];
    const contentLines = [];
    let parsingHeaders = true;

    for (const line of lines) {
      if (parsingHeaders && /^\s*(?:From|Sender)\s*:\s*(.+)$/i.test(line)) {
        sender = line.match(/^\s*(?:From|Sender)\s*:\s*(.+)$/i)[1].trim();
        headerLines.push(line);
      } else if (parsingHeaders && /^\s*(?:Date|Time)\s*:\s*(.+)$/i.test(line)) {
        messageDate = line.match(/^\s*(?:Date|Time)\s*:\s*(.+)$/i)[1].trim();
        headerLines.push(line);
      } else {
        parsingHeaders = false;
        contentLines.push(line);
      }
    }

    const messageText = contentLines.length > 0 ? contentLines.join('\n').trim() : trimmed;

    messages.push({
      _id: `msg_${String(idx + 1).padStart(3, '0')}`,
      packId,
      sessionId,
      rawText: trimmed,
      messageText,
      sender,
      messageDate,
      sourceType: sender.toLowerCase().includes('email') ? 'email' : sender.toLowerCase().includes('whatsapp') ? 'whatsapp' : 'notice',
      language: detectLanguage(trimmed),
      lineStart,
      lineEnd,
    });
  });

  return messages;
}
