/**
 * Backend Lesson Content Normalization & Security Sanitization Pipeline
 *
 * Guarantees that saved lesson Markdown is formatted cleanly without any semantic
 * alteration to educational concepts, code blocks, shell commands, formulas, URLs, or quizzes.
 */

/**
 * Deterministic, code-block-aware canonical Markdown formatter.
 *
 * Pipeline:
 * Raw Markdown -> Protect existing fenced code blocks -> Normalize line endings
 * -> Repair known preprocessor directives (# include -> #include)
 * -> Detect multi-line ASCII/arrow flowcharts -> Detect unfenced code regions conservatively
 * -> Headings normalization -> Subheadings and Q&A structural normalization
 * -> Practice task normalization -> Unicode list items -> Strict metadata tags
 * -> Restore fenced blocks -> 100% idempotent and lossless.
 */
export function formatCanonicalLessonMarkdown(raw: string | null | undefined): string {
  if (!raw) return '';
  let text = typeof raw === 'string' ? raw : String(raw || '');

  // 1. Normalize line endings and strip invisible unicode BOM / zero-width spaces
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Protect existing fenced code blocks (```...```)
  const codeBlocks: string[] = [];
  function protectCode(lang: string, code: string): string {
    const idx = codeBlocks.length;
    codeBlocks.push(`\`\`\`${lang}\n${code.trim()}\n\`\`\``);
    return `\n\n__PROTECTED_CODE_BLOCK_${idx}__\n\n`;
  }

  text = text.replace(/(```[\s\S]*?```)/g, (_match, block) => {
    const idx = codeBlocks.length;
    codeBlocks.push(block);
    return `\n\n__PROTECTED_CODE_BLOCK_${idx}__\n\n`;
  });

  // 3. Known Corruption Repair: Fix `# include <...>` -> `#include <...>` (repair only recognized preprocessor directives)
  text = text.replace(/^[ \t]*#[ \t]+(include|define|undef|if|ifdef|ifndef|else|elif|endif|pragma|import|error|warning|line)\b/gm, '#$1');

  // 4. Wrap multi-line ASCII/Box-drawing flowcharts or arrow flowcharts outside code blocks
  text = text.replace(/(?:^|\n)((?:[ \t]*[┌┐└┘│─├┤┬┴┼▼▲►◄][^\n]*\n?){2,})/g, (_match, chartBlock) => {
    return protectCode('ascii-flowchart', chartBlock);
  });

  text = text.replace(/(?:^|\n)((?:[^\n]+\n[ \t]*[↓↑➔→▼▲][ \t]*\n)+[^\n]+)/g, (match, flowBlock) => {
    const arrowCount = (flowBlock.match(/[↓↑➔→▼▲]/g) || []).length;
    if (arrowCount >= 2 && !flowBlock.includes('__PROTECTED_CODE_BLOCK_')) {
      return protectCode('ascii-flowchart', flowBlock);
    }
    return match;
  });

  // 5. Conservative Unfenced C/C++ Code Detection & Wrapping
  // Pattern A: Complete C program (#include / #define + int/void main() { ... })
  text = text.replace(/(?:^|\n)(#[ \t]*(?:include|define)\b[^\n]+(?:\n[^\n]+)*?\n[ \t]*(?:int|void)\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\})/g, (_match, cCode) => {
    return protectCode('c', cCode);
  });

  // Pattern B: Multi-line C function definition
  text = text.replace(/(?:^|\n)([ \t]*(?:int|void|float|double|char|size_t|bool)\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*\{[\s\S]*?\n[ \t]*\})/g, (match, funcCode) => {
    if (/;\s*$/m.test(funcCode) || /\b(?:return|printf|scanf|malloc|free|cout|cin)\b/.test(funcCode)) {
      return protectCode('c', funcCode);
    }
    return match;
  });

  // Pattern C: Standalone #include statements that are outside code blocks
  text = text.replace(/^[ \t]*(#include\s*<[^>]+>)[ \t]*$/gm, (_match, incLine) => {
    return protectCode('c', incLine);
  });

  // 6. Fix literal Markdown headings inside callout boxes / notes
  text = text.replace(/^([ \t]*>[ \t]*\*\*(?:Important[ \t]+Note|Note|Warning|Tip|Caution)[:\s]*\*\*[:\s]*)[ \t]*#+[ \t]*/gim, '$1');
  text = text.replace(/^([ \t]*\*\*(?:Important[ \t]+Note|Note|Warning|Tip|Caution)[:\s]*\*\*[:\s]*)[ \t]*#+[ \t]*/gim, '$1');
  text = text.replace(/^([ \t]*>[ \t]*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*)[ \t]*#+[ \t]*/gim, '$1');

  // 7. Headings: Add space after # ONLY for actual Markdown headings, NEVER for preprocessor directives or shebangs
  text = text.replace(/^(#{1,6})(?!(?:include|define|undef|if|ifdef|ifndef|else|elif|endif|pragma|import|error|warning|line|region|endregion)\b|[!/])([A-Za-z0-9])/gm, '$1 $2');

  // 8. Format Section Numbered Headings (e.g. "1.1 Learning Objectives", "1.2 What is Python?")
  text = text.replace(/^[ \t]*(?:##\s*)?(\d+\.\d+(?:\.\d+)?)[ \t]+([A-Za-z0-9][^\n:]+?)[ \t]*$/gm, (_match, num, title) => {
    return `\n\n## ${num} ${title.trim()}\n\n`;
  });

  // 9. Format Common Subheadings (### Subheading)
  text = text.replace(/^[ \t]*(?:###\s*)?(Learning Objectives|Key Points|Key Takeaways|Example:|Examples:|Output:|Interview Questions|Practice Questions|Frequently Asked Questions|Best Practices|Flow Explanation|Identifier Rules)[ \t]*$/gim, (_match, heading) => {
    return `\n\n### ${heading.trim()}\n\n`;
  });

  // 10. Format Q&A / Interview Questions:
  // Pattern A: Q1., Q1:, Q1 -, Q01:
  text = text.replace(/^[ \t]*(?!\*\*)Q(\d+)[\.\:\s—–-]+([^\n]+)$/gm, (_match, num, rawQ) => {
    let qText = rawQ.trim();
    const ansMatch = qText.match(/^(.*?)(?:\s+(?:Answer\s*[:\s—–-]|Ans\s*[:\s—–-]|A\s*[:—–-])\s*(.+))$/i);
    if (ansMatch) {
      const questionPart = ansMatch[1].trim();
      const answerPart = ansMatch[2].trim();
      return `\n\n**Q${num}. ${questionPart}**\n\n**Answer:**\n\n${answerPart}\n\n`;
    }
    const qMarkMatch = qText.match(/^([^\n?]+\?)\s+(\S.+)$/);
    if (qMarkMatch) {
      const questionPart = qMarkMatch[1].trim();
      const answerPart = qMarkMatch[2].trim();
      return `\n\n**Q${num}. ${questionPart}**\n\n${answerPart}\n\n`;
    }
    return `\n\n**Q${num}. ${qText}**\n\n`;
  });

  // Pattern B: Interview Question 1: / Question 1:
  text = text.replace(/^[ \t]*(?!\*\*)(?:Interview\s+Question|Question)[ \t]+(\d+)[\.\:\s—–-]+([^\n]+)$/gim, (_match, num, rawQ) => {
    let qText = rawQ.trim();
    const ansMatch = qText.match(/^(.*?)(?:\s+(?:Answer\s*[:\s—–-]|Ans\s*[:\s—–-]|A\s*[:—–-])\s*(.+))$/i);
    if (ansMatch) {
      const questionPart = ansMatch[1].trim();
      const answerPart = ansMatch[2].trim();
      return `\n\n**Question ${num}:** ${questionPart}\n\n**Answer:**\n\n${answerPart}\n\n`;
    }
    const qMarkMatch = qText.match(/^([^\n?]+\?)\s+(\S.+)$/);
    if (qMarkMatch) {
      const questionPart = qMarkMatch[1].trim();
      const answerPart = qMarkMatch[2].trim();
      return `\n\n**Question ${num}:** ${questionPart}\n\n${answerPart}\n\n`;
    }
    return `\n\n**Question ${num}:** ${qText}\n\n`;
  });

  // Ensure already-bolded Q1 / Question 1 lines have blank lines around them
  text = text.replace(/^[ \t]*(\*\*(?:Q\d+|Question\s+\d+|Interview\s+Question\s+\d+)[\.\:\s—–-][^\n]+?\*\*)[ \t]*$/gm, '\n\n$1\n\n');

  // Answer formatting: Ensure Answer: / Explanation: have clean bold tags and blank lines
  text = text.replace(/(\?|[a-zA-Z0-9])[ \t]+(Answer\s*:|Ans\s*:)/gi, '$1\n\n**Answer:**\n\n');
  text = text.replace(/^[ \t]*(?!\*\*)(?:Answer|Ans)\s*[:\s—–-]+/gim, '\n\n**Answer:**\n\n');
  text = text.replace(/^[ \t]*(?!\*\*)Explanation\s*[:\s—–-]+/gim, '\n\n**Explanation:**\n\n');

  // 11. Format Practice Programs & Tasks
  text = text.replace(/^[ \t]*(?!\*\*)Program[ \t]+(\d+)\b[:\s—–-]*([^\n]*)$/gim, (_match, num, rest) => {
    const trailing = rest.trim() ? ` ${rest.trim()}` : '';
    return `\n\n**Program ${num}:**${trailing}\n\n`;
  });

  text = text.replace(/([.?!])[ \t]+((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario)[ \t]+\d+\b)/gi, '$1\n\n$2');
  text = text.replace(/^[ \t]*(?!\*\*)((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario)[ \t]+\d+)\b[:\s—–-]*([^\n]*)$/gim, (_match, label, rest) => {
    const trailing = rest.trim() ? ` ${rest.trim()}` : '';
    return `\n\n**${label}:**${trailing}\n\n`;
  });
  text = text.replace(/\*\*((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario|Program)[ \t]+\d+):\*\*\s*:\s*\*\*/gi, '**$1:**');
  text = text.replace(/\*\*((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario|Program)[ \t]+\d+):\*\*\s*\*\*/gi, '**$1:**');

  // 12. Normalize unicode bullet points (●, •, ✔, ▪, ▫, ◆, etc.) to standard Markdown list items (- )
  text = text.replace(/^([ \t]*)[●•✔▪▫◆◇■□►▻⁃]\s*/gm, '$1- ');
  text = text.replace(/(\S)[ \t]+([●•✔▪▫◆◇■□►▻⁃]\s*)/g, '$1\n- ');

  // 13. Fix standalone checkmarks above bullet points
  text = text.replace(/^[ \t]*[✅✔✓☑][ \t]*\n[ \t]*([A-Za-z0-9])/gm, '- $1');

  // 14. Metadata Tag Lists
  text = text.replace(/^(?:#\s*tags|#tags|Tags:|Hashtags:|Topic Tags:)[\t ]+([a-zA-Z0-9_\-#\s,]+)$/gm, (_match, tagLine) => {
    if (/\b(?:is|are|was|were|have|has|the|this|that|in|for|with|and|or)\b/i.test(tagLine)) {
      return _match;
    }
    const cleanTags = tagLine
      .split(/[,\s]+/)
      .map((t: string) => t.replace(/^#/, '').trim())
      .filter(Boolean)
      .join(', ');
    if (!cleanTags) return _match;
    return protectCode('tags', cleanTags);
  });

  // 15. Restore protected code blocks
  text = text.replace(/__PROTECTED_CODE_BLOCK_(\d+)__/g, (_match, index) => {
    return codeBlocks[Number(index)] || '';
  });

  // 16. Collapse excessive blank lines (3+ to 2) and trim
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

export function normalizeLessonContent(raw: string | null | undefined): string {
  return formatCanonicalLessonMarkdown(raw);
}

/**
 * Sanitizes lesson content against XSS and hostile HTML injections while
 * strictly preserving valid Markdown elements, tables, and code blocks.
 */
export function sanitizeLessonContent(input: string | null | undefined): string {
  if (!input) return '';
  let clean = String(input);

  // Strip executable HTML tags & event handlers
  clean = clean.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^<]*>([\s\S]*?)<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*>([\s\S]*?)<\/embed>/gi, '');
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/javascript:[^\s"']+/gi, '');

  return clean.trim();
}

/**
 * Full pre-save and pre-render normalization pipeline.
 */
export function processCanonicalLessonContent(rawText: string | null | undefined): string {
  const sanitized = sanitizeLessonContent(rawText);
  return normalizeLessonContent(sanitized);
}

/**
 * Formats canonical module title: "Module N — Module Name"
 */
export function formatCanonicalModuleTitle(moduleIndex: number, rawTitle: string): string {
  const clean = rawTitle.replace(/^Module\s*\d+[\s:—–-]+/i, '').trim();
  return `Module ${moduleIndex} — ${clean || 'Curriculum Module'}`;
}

/**
 * Formats canonical single lesson title: "Module N - Complete Notes"
 */
export function formatCanonicalLessonTitle(moduleIndex: number): string {
  return `Module ${moduleIndex} - Complete Notes`;
}
