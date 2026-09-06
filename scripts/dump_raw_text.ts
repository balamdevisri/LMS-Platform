import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('./github_lms_content.json', 'utf8'));

// Concatenate all module contents in order
const fullText = rawData.modules.map((m: any) => m.content).join('\n');

// Write out raw full text to inspect
fs.writeFileSync('./scripts/raw_full_git_text.txt', fullText, 'utf8');
console.log('Saved raw_full_git_text.txt, total chars:', fullText.length);
