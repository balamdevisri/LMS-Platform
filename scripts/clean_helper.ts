import fs from 'fs';

// Helper to clean general PDF line-breaks while preserving structure
export function cleanRawPdfText(raw: string): string {
  // 1. Remove PDF Page markers
  let text = raw.replace(/===== PDF PAGE \d+ =====\n?/g, '');

  // 2. Remove excess spaces within lines (e.g. "Practical  Lab" -> "Practical Lab")
  // Replace multiple spaces with a single space, except leading indentation
  text = text.split('\n').map(line => {
    return line.replace(/[ \t]{2,}/g, ' ').trim();
  }).join('\n');

  // 3. Normalize multiple empty lines to at most 2
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
}
