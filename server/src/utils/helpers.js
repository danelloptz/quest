function normalizeText(text) {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

module.exports = { normalizeText };