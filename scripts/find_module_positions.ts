import fs from 'fs';

const fullText = fs.readFileSync('./scripts/raw_full_git_text.txt', 'utf8');

const regex = /Module\s+(\d+)\s*:\s*([^\n\r]+)/g;
let match;
const matches: { num: number; title: string; index: number }[] = [];

while ((match = regex.exec(fullText)) !== null) {
  matches.push({
    num: parseInt(match[1], 10),
    title: match[2].trim(),
    index: match.index,
  });
}

console.log('Found Module headings:');
matches.forEach((m, i) => {
  console.log(`[${i}] Module ${m.num}: "${m.title}" at char index ${m.index}`);
});
