import fs from 'fs';

const contentJson = JSON.parse(fs.readFileSync('./github_lms_content.json', 'utf8'));

console.log('=== CHECKING PAGE CONTINUITY ===');
let allPages: number[] = [];
contentJson.modules.forEach((mod: any) => {
  const matches = mod.content.match(/===== PDF PAGE (\d+) =====/g) || [];
  const pageNums = matches.map((m: string) => parseInt(m.match(/\d+/)![0], 10));
  console.log(`Module ${mod.module_number} (${mod.title}): pages ${pageNums[0]} to ${pageNums[pageNums.length - 1]} (count: ${pageNums.length})`);
  allPages = allPages.concat(pageNums);
});

console.log('Total pages found:', allPages.length);
console.log('Min page:', Math.min(...allPages), 'Max page:', Math.max(...allPages));

// Check missing pages
const pageSet = new Set(allPages);
for (let p = 4; p <= 157; p++) {
  if (!pageSet.has(p)) {
    console.log('MISSING PAGE:', p);
  }
}
