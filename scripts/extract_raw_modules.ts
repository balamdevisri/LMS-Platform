import fs from 'fs';

const fullText = fs.readFileSync('./scripts/raw_full_git_text.txt', 'utf8');

const slices = [
  { mod: 1, start: 607, end: 10514 },
  { mod: 2, start: 10514, end: 17611 },
  { mod: 3, start: 17611, end: 26243 },
  { mod: 4, start: 26243, end: 33053 },
  { mod: 5, start: 33053, end: 41105 },
  { mod: 6, start: 41105, end: 48719 },
  { mod: 7, start: 48719, end: 56100 },
  { mod: 8, start: 56100, end: 64606 },
  { mod: 9, start: 64606, end: 72305 },
  { mod: 10, start: 72305, end: 80232 },
  { mod: 11, start: 80232, end: 88621 },
  { mod: 12, start: 88621, end: 97150 },
  { mod: 13, start: 97150, end: 105824 },
  { mod: 14, start: 105824, end: 114525 },
  { mod: 15, start: 114525, end: fullText.length },
];

slices.forEach(s => {
  const chunk = fullText.slice(s.start, s.end);
  fs.writeFileSync(`./scripts/raw_mod_${s.mod}.txt`, chunk, 'utf8');
  console.log(`Saved raw_mod_${s.mod}.txt (${chunk.length} chars)`);
});
