import fs from 'fs';
import path from 'path';

const dir = './scripts/formatted_modules';
console.log('=== VERIFYING FORMATTED MODULES ===');

for (let i = 1; i <= 15; i++) {
  const filePath = path.join(dir, `mod_${i}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: mod_${i}.md`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const h1 = lines.filter(l => l.startsWith('# '));
  const h2 = lines.filter(l => l.startsWith('## '));
  const codeBlocks = (content.match(/```/g) || []).length / 2;
  const interviewQs = (content.match(/### \d+\.|### Q\d+\./g) || []).length;
  const tasks = (content.match(/### Task \d+/g) || []).length;

  console.log(`Module ${i}: ${h1[0]} | ${lines.length} lines, ${content.length} chars | H2 sections: ${h2.length}, Code blocks: ${codeBlocks}, Tasks: ${tasks}`);
}
