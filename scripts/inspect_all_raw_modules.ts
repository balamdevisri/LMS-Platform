import fs from 'fs';

const contentJson = JSON.parse(fs.readFileSync('./github_lms_content.json', 'utf8'));

console.log('=== MODULE OUTLINES IN github_lms_content.json ===');
contentJson.modules.forEach((mod: any) => {
  console.log(`\n================ MODULE ${mod.module_number}: ${mod.title} ================`);
  console.log(`Pages: ${mod.pdf_start_page} to ${mod.pdf_end_page} | Length: ${mod.content.length} chars`);
  
  // Show page headers inside content
  const pageMatches = mod.content.match(/===== PDF PAGE \d+ =====/g) || [];
  console.log('Pages included:', pageMatches.join(', '));
  
  // Show first 600 chars
  console.log('--- Start snippet ---');
  console.log(mod.content.slice(0, 600));
  console.log('--- End snippet ---');
  console.log(mod.content.slice(-400));
});
