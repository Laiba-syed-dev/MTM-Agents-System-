export function cleanJsonResponse(rawOutput) {
  if (!rawOutput) return '';
  let str = rawOutput.trim();
  // Strip markdown ```json ... ``` codeblocks if present
  if (str.startsWith('```')) {
    str = str.replace(/^```(?:json)?\s*/i, '');
    str = str.replace(/\s*```$/, '');
  }
  return str.trim();
}

export function parseAndValidateAiJson(rawOutput) {
  const cleaned = cleanJsonResponse(rawOutput);
  try {
    return { success: true, data: JSON.parse(cleaned) };
  } catch (err) {
    return { success: false, error: err.message, raw: rawOutput };
  }
}
