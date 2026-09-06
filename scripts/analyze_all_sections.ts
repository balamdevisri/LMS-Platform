import fs from 'fs';

for (let i = 1; i <= 15; i++) {
  const content = fs.readFileSync(`./scripts/raw_mod_${i}.txt`, 'utf8');
  console.log(`\n================ MODULE ${i} RAW ANALYSIS ================`);
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find numbered sections like 1.1, 2.1, etc.
  const sections = lines.filter(l => /^\d+\.\d+\s+/.test(l));
  console.log('Numbered sections:', sections);
  
  // Find interview questions
  const interviewQs = lines.filter(l => /^Q\d+\.|^\d+\.\s+What|^\d+\.\s+Why|^\d+\.\s+How|^\d+\.\s+Explain|^\d+\.\s+When|^\d+\.\s+Differentiate/i.test(l));
  console.log('Sample Interview Qs count:', interviewQs.length);

  // Find tasks
  const tasks = lines.filter(l => /^Task\s+\d+/i.test(l));
  console.log('Tasks found:', tasks);
}
